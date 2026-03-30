import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSVToRows } from "@/lib/csv-parser";
import { requireRole } from "@/lib/api-route-utils";
import type { ImportRowError } from "@/domain/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const VALID_TARGET_ENTITIES = ["drivers", "employers", "departments", "locations"];

const REQUIRED_FIELDS: Record<string, string[]> = {
  drivers: ["firstName", "lastName"],
  employers: ["code"],
  departments: ["code"],
  locations: ["code"],
};

const REQUIRED_FIELD_LABELS: Record<string, string> = {
  firstName: "Voornaam",
  lastName: "Achternaam",
  code: "Code",
};

/**
 * POST /api/import-sources/[id]/execute
 * Execute a CSV import: parse the file, apply field mappings, validate rows,
 * and insert data into the target entity table within a transaction.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

    // Load import source with its configuration
    const source = await prisma.importSource.findUnique({ where: { id } });
    if (!source) {
      return NextResponse.json(
        { error: "Importbron niet gevonden" },
        { status: 404 }
      );
    }

    if (!VALID_TARGET_ENTITIES.includes(source.targetEntity)) {
      return NextResponse.json(
        { error: "Ongeldige doelentiteit in importbronconfiguratie" },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Geen bestand ontvangen. Upload een CSV-bestand." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Bestand is te groot. Maximaal ${MAX_FILE_SIZE / 1024 / 1024} MB toegestaan.` },
        { status: 400 }
      );
    }

    const fileName = file.name || "";
    if (!fileName.toLowerCase().endsWith(".csv") && !fileName.toLowerCase().endsWith(".txt")) {
      return NextResponse.json(
        { error: "Ongeldig bestandstype. Upload een CSV-bestand (.csv of .txt)." },
        { status: 400 }
      );
    }

    const text = await file.text();
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Het bestand is leeg." },
        { status: 400 }
      );
    }

    // Parse CSV
    const { headers, rows } = parseCSVToRows(text);

    if (headers.length === 0) {
      return NextResponse.json(
        { error: "Kan geen kolomnamen detecteren in de eerste rij." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Het bestand bevat geen gegevensrijen." },
        { status: 400 }
      );
    }

    const fieldMappings = source.fieldMappings as Record<string, string>;

    // Verify that all required target fields have a mapping with a detected column
    const requiredFields = REQUIRED_FIELDS[source.targetEntity] || [];
    const mappedTargetFields = new Map<string, string>(); // targetField -> sourceColumn
    for (const [sourceCol, targetField] of Object.entries(fieldMappings)) {
      if (headers.includes(sourceCol)) {
        mappedTargetFields.set(targetField, sourceCol);
      }
    }

    const missingRequired = requiredFields.filter((f) => !mappedTargetFields.has(f));
    if (missingRequired.length > 0) {
      const labels = missingRequired.map((f) => REQUIRED_FIELD_LABELS[f] || f).join(", ");
      return NextResponse.json(
        { error: `Verplichte velden niet gekoppeld of kolomnamen niet gevonden in CSV: ${labels}` },
        { status: 400 }
      );
    }

    // Build a reverse map: targetField -> sourceColumn (for all mapped + detected columns)
    const targetToSource = new Map<string, string>();
    for (const [sourceCol, targetField] of Object.entries(fieldMappings)) {
      if (headers.includes(sourceCol)) {
        targetToSource.set(targetField, sourceCol);
      }
    }

    // Validate all rows first, then insert
    const errors: ImportRowError[] = [];
    const validRows: Record<string, string>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // +2 because row 1 is headers, data starts at row 2
      const row = rows[i];
      const rowErrors: ImportRowError[] = [];

      // Check required fields
      for (const reqField of requiredFields) {
        const sourceCol = targetToSource.get(reqField);
        if (!sourceCol) continue; // Already validated above
        const value = row[sourceCol]?.trim();
        if (!value) {
          rowErrors.push({
            row: rowNum,
            field: REQUIRED_FIELD_LABELS[reqField] || reqField,
            message: `${REQUIRED_FIELD_LABELS[reqField] || reqField} is leeg`,
          });
        }
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validRows.push(row);
      }
    }

    // Execute the import in a transaction
    let importedCount = 0;
    const insertErrors: ImportRowError[] = [];

    if (validRows.length > 0) {
      if (source.targetEntity === "drivers") {
        const result = await importDrivers(validRows, targetToSource, insertErrors);
        importedCount = result;
      } else {
        const result = await importStamtabel(
          source.targetEntity,
          validRows,
          targetToSource,
          insertErrors
        );
        importedCount = result;
      }
    }

    const allErrors = [...errors, ...insertErrors];
    const skippedRows = rows.length - importedCount;

    // Log the import
    await prisma.importLog.create({
      data: {
        importSourceId: id,
        fileName: file.name,
        totalRows: rows.length,
        importedRows: importedCount,
        skippedRows,
        errors: allErrors.length > 0 ? allErrors : undefined,
      },
    });

    return NextResponse.json({
      data: {
        totalRows: rows.length,
        importedRows: importedCount,
        skippedRows,
        errors: allErrors,
      },
    });
  } catch (error) {
    console.error(
      "Error executing import:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Import mislukt. Controleer het bestand en de configuratie." },
      { status: 500 }
    );
  }
}

/**
 * Import driver records from CSV rows.
 * Uses a transaction with individual creates (drivers have array fields).
 * Returns number of successfully imported rows.
 */
async function importDrivers(
  rows: Record<string, string>[],
  targetToSource: Map<string, string>,
  errors: ImportRowError[]
): Promise<number> {
  const driverData = rows.map((row, i) => {
    const rowNum = i + 2; // offset for error reporting
    const firstName = row[targetToSource.get("firstName")!]?.trim() || "";
    const lastName = row[targetToSource.get("lastName")!]?.trim() || "";
    const employeeNumberCol = targetToSource.get("employeeNumber");
    const licenseTypesCol = targetToSource.get("licenseTypes");

    return {
      rowNum,
      firstName,
      lastName,
      employeeNumber: employeeNumberCol ? row[employeeNumberCol]?.trim() || null : null,
      licenseTypes: licenseTypesCol
        ? (row[licenseTypesCol]?.trim() || "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [],
    };
  });

  let imported = 0;

  await prisma.$transaction(async (tx) => {
    for (const d of driverData) {
      try {
        await tx.driver.create({
          data: {
            firstName: d.firstName,
            lastName: d.lastName,
            employeeNumber: d.employeeNumber,
            licenseTypes: d.licenseTypes,
          },
        });
        imported++;
      } catch (err) {
        errors.push({
          row: d.rowNum,
          message: `Kan chauffeur "${d.firstName} ${d.lastName}" niet aanmaken: ${err instanceof Error ? err.message : "onbekende fout"}`,
        });
      }
    }
  });

  return imported;
}

/**
 * Import stamtabel records (employers, departments, locations) from CSV rows.
 * Uses createMany with skipDuplicates to handle existing codes gracefully.
 * Returns number of successfully imported rows.
 */
async function importStamtabel(
  targetEntity: string,
  rows: Record<string, string>[],
  targetToSource: Map<string, string>,
  errors: ImportRowError[]
): Promise<number> {
  const modelMap: Record<string, string> = {
    employers: "employer",
    departments: "department",
    locations: "location",
  };

  const modelName = modelMap[targetEntity];
  if (!modelName) return 0;

  const model = (prisma as any)[modelName];
  const codeCol = targetToSource.get("code")!;
  const descCol = targetToSource.get("description");

  // Check for duplicate codes within the CSV itself
  const seenCodes = new Set<string>();
  const uniqueData: { code: string; description: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = row[codeCol]?.trim() || "";
    const description = descCol ? row[descCol]?.trim() || "" : "";

    if (code.length > 100) {
      errors.push({
        row: i + 2,
        field: "Code",
        message: `Code "${code}" is langer dan 100 tekens`,
      });
      continue;
    }

    if (seenCodes.has(code.toLowerCase())) {
      errors.push({
        row: i + 2,
        field: "Code",
        message: `Dubbele code "${code}" in CSV — overgeslagen`,
      });
      continue;
    }

    seenCodes.add(code.toLowerCase());
    uniqueData.push({ code, description });
  }

  if (uniqueData.length === 0) return 0;

  // Use createMany with skipDuplicates to handle existing codes
  const result = await model.createMany({
    data: uniqueData,
    skipDuplicates: true,
  });

  const skippedDuplicates = uniqueData.length - result.count;
  if (skippedDuplicates > 0) {
    errors.push({
      row: 0,
      message: `${skippedDuplicates} rij(en) overgeslagen vanwege bestaande codes in de database`,
    });
  }

  return result.count;
}
