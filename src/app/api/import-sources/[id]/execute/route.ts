import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSVToRows } from "@/lib/csv-parser";
import { requireRole } from "@/lib/api-route-utils";
import type { ImportRowError } from "@/domain/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROW_COUNT = 10_000;

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

type ImportMode = "create" | "upsert";

/**
 * POST /api/import-sources/[id]/execute
 * Execute a CSV import: parse the file, apply field mappings, validate rows,
 * and insert/upsert data into the target entity table.
 *
 * Accepts an optional "mode" form field: "create" (default) or "upsert".
 * In upsert mode, existing records are matched by unique key (code for
 * stamtabellen, employeeNumber for drivers) and updated.
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
    const modeParam = formData.get("mode");

    // Validate mode
    const mode: ImportMode = modeParam === "upsert" ? "upsert" : "create";

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

    if (rows.length > MAX_ROW_COUNT) {
      return NextResponse.json(
        { error: `Het bestand bevat ${rows.length} rijen. Maximaal ${MAX_ROW_COUNT.toLocaleString("nl-NL")} rijen per import toegestaan.` },
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

    // Execute the import
    let importedCount = 0;
    let updatedCount = 0;
    const insertErrors: ImportRowError[] = [];

    if (validRows.length > 0) {
      if (source.targetEntity === "drivers") {
        const result = await importDrivers(validRows, targetToSource, insertErrors, mode);
        importedCount = result.created;
        updatedCount = result.updated;
      } else {
        const result = await importStamtabel(
          source.targetEntity,
          validRows,
          targetToSource,
          insertErrors,
          mode
        );
        importedCount = result.created;
        updatedCount = result.updated;
      }
    }

    const allErrors = [...errors, ...insertErrors];
    const skippedRows = rows.length - importedCount - updatedCount;

    // Log the import
    await prisma.importLog.create({
      data: {
        importSourceId: id,
        fileName: file.name,
        totalRows: rows.length,
        importedRows: importedCount,
        updatedRows: updatedCount,
        skippedRows,
        errors: allErrors.length > 0 ? allErrors : undefined,
      },
    });

    return NextResponse.json({
      data: {
        totalRows: rows.length,
        importedRows: importedCount,
        updatedRows: updatedCount,
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

type ImportResult = { created: number; updated: number };

const CHUNK_SIZE = 500;

/**
 * Import driver records from CSV rows.
 * In create mode: creates new drivers.
 * In upsert mode: matches on employeeNumber — updates if found, creates if not.
 * Drivers without employeeNumber are always created (no unique key for matching).
 *
 * Processes rows in chunks of CHUNK_SIZE within separate transactions to prevent
 * connection timeouts on Neon serverless with large imports.
 */
async function importDrivers(
  rows: Record<string, string>[],
  targetToSource: Map<string, string>,
  errors: ImportRowError[],
  mode: ImportMode
): Promise<ImportResult> {
  const driverData = rows.map((row, i) => {
    const rowNum = i + 2;
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

  let created = 0;
  let updated = 0;

  for (let offset = 0; offset < driverData.length; offset += CHUNK_SIZE) {
    const chunk = driverData.slice(offset, offset + CHUNK_SIZE);
    const chunkIndex = Math.floor(offset / CHUNK_SIZE) + 1;

    try {
      await prisma.$transaction(async (tx) => {
        // Batch lookup: collect all employee numbers in this chunk for a single findMany
        const chunkEmployeeNumbers = chunk
          .map((d) => d.employeeNumber)
          .filter((n): n is string => n !== null && mode === "upsert");

        const existingDriverMap = new Map<string, { id: string }>();
        if (chunkEmployeeNumbers.length > 0) {
          const existingDrivers = await tx.driver.findMany({
            where: { employeeNumber: { in: chunkEmployeeNumbers } },
            select: { id: true, employeeNumber: true },
          });
          for (const d of existingDrivers) {
            if (d.employeeNumber) {
              existingDriverMap.set(d.employeeNumber, { id: d.id });
            }
          }
        }

        // Separate into updates and creates
        const toCreate: typeof chunk = [];
        const toUpdate: { driver: typeof chunk[0]; existingId: string }[] = [];

        for (const d of chunk) {
          if (mode === "upsert" && d.employeeNumber) {
            const existing = existingDriverMap.get(d.employeeNumber);
            if (existing) {
              toUpdate.push({ driver: d, existingId: existing.id });
              continue;
            }
          }
          toCreate.push(d);
        }

        // Batch update existing drivers (individual updates needed for per-row data)
        for (const { driver: d, existingId } of toUpdate) {
          try {
            const updateData: Record<string, unknown> = {};
            if (targetToSource.has("firstName")) updateData.firstName = d.firstName;
            if (targetToSource.has("lastName")) updateData.lastName = d.lastName;
            if (targetToSource.has("licenseTypes")) updateData.licenseTypes = d.licenseTypes;

            await tx.driver.update({
              where: { id: existingId },
              data: updateData,
            });
            updated++;
          } catch (err) {
            errors.push({
              row: d.rowNum,
              message: `Kan chauffeur "${d.firstName} ${d.lastName}" niet bijwerken/aanmaken: ${err instanceof Error ? err.message : "onbekende fout"}`,
            });
          }
        }

        // Batch create new drivers
        if (toCreate.length > 0) {
          try {
            const result = await tx.driver.createMany({
              data: toCreate.map((d) => ({
                firstName: d.firstName,
                lastName: d.lastName,
                employeeNumber: d.employeeNumber,
                licenseTypes: d.licenseTypes,
              })),
            });
            created += result.count;
          } catch {
            // Batch create failed — fall back to individual creates for per-row error reporting
            for (const d of toCreate) {
              try {
                await tx.driver.create({
                  data: {
                    firstName: d.firstName,
                    lastName: d.lastName,
                    employeeNumber: d.employeeNumber,
                    licenseTypes: d.licenseTypes,
                  },
                });
                created++;
              } catch (err) {
                errors.push({
                  row: d.rowNum,
                  message: `Kan chauffeur "${d.firstName} ${d.lastName}" niet aanmaken: ${err instanceof Error ? err.message : "onbekende fout"}`,
                });
              }
            }
          }
        }
      });
    } catch (err) {
      errors.push({
        row: 0,
        message: `Chunk ${chunkIndex} (rijen ${offset + 2}-${offset + chunk.length + 1}) mislukt: ${err instanceof Error ? err.message : "onbekende fout"}`,
      });
    }
  }

  return { created, updated };
}

/**
 * Import stamtabel records (employers, departments, locations) from CSV rows.
 * In create mode: uses createMany with skipDuplicates.
 * In upsert mode: uses Prisma upsert to update existing records matched by code.
 */
async function importStamtabel(
  targetEntity: string,
  rows: Record<string, string>[],
  targetToSource: Map<string, string>,
  errors: ImportRowError[],
  mode: ImportMode
): Promise<ImportResult> {
  const modelMap: Record<string, string> = {
    employers: "employer",
    departments: "department",
    locations: "location",
  };

  const modelName = modelMap[targetEntity];
  if (!modelName) return { created: 0, updated: 0 };

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

  if (uniqueData.length === 0) return { created: 0, updated: 0 };

  if (mode === "upsert") {
    let created = 0;
    let updated = 0;

    for (let offset = 0; offset < uniqueData.length; offset += CHUNK_SIZE) {
      const chunk = uniqueData.slice(offset, offset + CHUNK_SIZE);
      const chunkIndex = Math.floor(offset / CHUNK_SIZE) + 1;

      try {
        await prisma.$transaction(async (tx) => {
          const txModel = (tx as any)[modelName];
          for (const item of chunk) {
            try {
              const existing = await txModel.findUnique({
                where: { code: item.code },
                select: { id: true, description: true },
              });

              if (existing) {
                if (existing.description !== item.description) {
                  await txModel.update({
                    where: { code: item.code },
                    data: { description: item.description },
                  });
                  updated++;
                }
              } else {
                await txModel.create({ data: item });
                created++;
              }
            } catch (err) {
              errors.push({
                row: 0,
                message: `Kan "${item.code}" niet bijwerken/aanmaken: ${err instanceof Error ? err.message : "onbekende fout"}`,
              });
            }
          }
        });
      } catch (err) {
        errors.push({
          row: 0,
          message: `Chunk ${chunkIndex} mislukt: ${err instanceof Error ? err.message : "onbekende fout"}`,
        });
      }
    }

    return { created, updated };
  }

  // Create mode: use createMany with skipDuplicates
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

  return { created: result.count, updated: 0 };
}
