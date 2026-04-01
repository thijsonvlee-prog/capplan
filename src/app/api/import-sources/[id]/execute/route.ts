import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSVToRows } from "@/lib/csv-parser";
import { requireRole } from "@/lib/api-route-utils";
import {
  buildApiHeaders,
  extractDataArray,
  resolveJsonPath,
  VALID_TARGET_ENTITIES,
} from "@/lib/api-import-helpers";
import { cleanupOldAuditLogs } from "@/lib/audit";
import type { ImportRowError } from "@/domain/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROW_COUNT = 10_000;
const API_TIMEOUT_MS = 30_000; // 30 seconds

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
 *
 * For CSV sources: parse the uploaded file, apply field mappings, validate rows,
 * and insert/upsert data into the target entity table. Accepts multipart form data
 * with a "file" field and optional "mode" field.
 *
 * For API sources: execute a server-side HTTP request to the configured URL,
 * parse the JSON response, apply field mappings, and import the data.
 * Accepts a JSON body with an optional "mode" field.
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

    // Route to CSV or API handler based on source type
    const result = source.type === "API"
      ? await executeApiImport(request, id, source)
      : await executeCsvImport(request, id, source);

    // Fire-and-forget: clean up old audit log entries after import
    cleanupOldAuditLogs().catch(() => {});

    return result;
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

// Type for the source record from Prisma
type SourceRecord = {
  id: string;
  type: string;
  targetEntity: string;
  fieldMappings: unknown;
  apiUrl: string | null;
  apiMethod: string | null;
  apiHeaders: unknown;
  apiAuthType: string | null;
  apiCredentials: unknown;
};

/**
 * Execute an API import: fetch data from configured URL, parse JSON, apply
 * field mappings, and import into the target entity.
 */
async function executeApiImport(
  request: NextRequest,
  sourceId: string,
  source: SourceRecord
) {
  // Validate API configuration
  if (!source.apiUrl) {
    return NextResponse.json(
      { error: "API-URL is niet geconfigureerd voor deze bron." },
      { status: 400 }
    );
  }

  // Parse mode from JSON body
  let mode: ImportMode = "create";
  try {
    const body = await request.json();
    if (body.mode === "upsert") mode = "upsert";
  } catch {
    // No body or invalid JSON — use default mode
  }

  const fieldMappings = source.fieldMappings as Record<string, string>;
  const requiredFields = REQUIRED_FIELDS[source.targetEntity] || [];

  // Verify required target fields have mappings
  const mappedTargetFields = new Set(Object.values(fieldMappings));
  const missingRequired = requiredFields.filter((f) => !mappedTargetFields.has(f));
  if (missingRequired.length > 0) {
    const labels = missingRequired.map((f) => REQUIRED_FIELD_LABELS[f] || f).join(", ");
    return NextResponse.json(
      { error: `Verplichte velden niet gekoppeld in de bronconfiguratie: ${labels}` },
      { status: 400 }
    );
  }

  // Build request
  const headers = buildApiHeaders(
    source.apiHeaders as Record<string, string> | null,
    source.apiAuthType,
    source.apiCredentials as Record<string, unknown> | null
  );
  const method = source.apiMethod || "GET";

  // Execute HTTP request with timeout
  let response: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    response = await fetch(source.apiUrl, {
      method,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError"
      ? "API-verzoek duurde te lang (timeout na 30 seconden)."
      : `Kan geen verbinding maken met de API: ${err instanceof Error ? err.message : "onbekende fout"}`;
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `API gaf foutcode ${response.status}: ${response.statusText}` },
      { status: 502 }
    );
  }

  // Parse JSON response
  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    return NextResponse.json(
      { error: "API-response is geen geldig JSON." },
      { status: 502 }
    );
  }

  // Extract data array from response
  const dataArray = extractDataArray(responseBody);
  if (!dataArray || dataArray.length === 0) {
    // Log empty result
    await prisma.importLog.create({
      data: {
        importSourceId: sourceId,
        fileName: `API: ${source.apiUrl}`,
        totalRows: 0,
        importedRows: 0,
        updatedRows: 0,
        skippedRows: 0,
      },
    });
    return NextResponse.json({
      data: { totalRows: 0, importedRows: 0, updatedRows: 0, skippedRows: 0, errors: [] },
    });
  }

  if (dataArray.length > MAX_ROW_COUNT) {
    return NextResponse.json(
      { error: `API-response bevat ${dataArray.length} rijen. Maximaal ${MAX_ROW_COUNT.toLocaleString("nl-NL")} rijen per import toegestaan.` },
      { status: 400 }
    );
  }

  // Build targetField -> sourceJsonPath map and apply field mappings to each row
  const targetToSource = new Map<string, string>();
  for (const [sourcePath, targetField] of Object.entries(fieldMappings)) {
    if (sourcePath.trim()) {
      targetToSource.set(targetField, sourcePath.trim());
    }
  }

  // Convert JSON objects to flat string records using field mappings
  const errors: ImportRowError[] = [];
  const validRows: Record<string, string>[] = [];

  for (let i = 0; i < dataArray.length; i++) {
    const rowNum = i + 1;
    const item = dataArray[i];
    const row: Record<string, string> = {};
    const rowErrors: ImportRowError[] = [];

    // Resolve each mapped field
    targetToSource.forEach((sourcePath) => {
      const value = resolveJsonPath(item, sourcePath);
      row[sourcePath] = value !== undefined ? value : "";
    });

    // Check required fields
    for (const reqField of requiredFields) {
      const sourcePath = targetToSource.get(reqField);
      if (!sourcePath) continue;
      const value = row[sourcePath]?.trim();
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

  // Execute the import using the same import functions as CSV
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
  const skippedRows = dataArray.length - importedCount - updatedCount;

  // Log the import
  await prisma.importLog.create({
    data: {
      importSourceId: sourceId,
      fileName: `API: ${source.apiUrl}`,
      totalRows: dataArray.length,
      importedRows: importedCount,
      updatedRows: updatedCount,
      skippedRows,
      errors: allErrors.length > 0 ? allErrors : undefined,
    },
  });

  return NextResponse.json({
    data: {
      totalRows: dataArray.length,
      importedRows: importedCount,
      updatedRows: updatedCount,
      skippedRows,
      errors: allErrors,
    },
  });
}

/**
 * Execute a CSV import from an uploaded file.
 */
async function executeCsvImport(
  request: NextRequest,
  sourceId: string,
  source: SourceRecord
) {
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
      importSourceId: sourceId,
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

          // Batch lookup: single findMany instead of per-row findUnique
          const chunkCodes = chunk.map((item) => item.code);
          const existingRecords = await txModel.findMany({
            where: { code: { in: chunkCodes } },
            select: { id: true, code: true, description: true },
          });
          const existingMap = new Map<string, { id: string; description: string }>();
          for (const rec of existingRecords) {
            existingMap.set(rec.code, { id: rec.id, description: rec.description });
          }

          // Separate into creates and updates
          const toCreate: typeof chunk = [];
          const toUpdate: { code: string; description: string }[] = [];

          for (const item of chunk) {
            const existing = existingMap.get(item.code);
            if (existing) {
              if (existing.description !== item.description) {
                toUpdate.push(item);
              }
            } else {
              toCreate.push(item);
            }
          }

          // Batch create new records
          if (toCreate.length > 0) {
            try {
              const result = await txModel.createMany({ data: toCreate });
              created += result.count;
            } catch {
              // Batch create failed — fall back to individual creates for per-row error reporting
              for (const item of toCreate) {
                try {
                  await txModel.create({ data: item });
                  created++;
                } catch (err) {
                  errors.push({
                    row: 0,
                    message: `Kan "${item.code}" niet aanmaken: ${err instanceof Error ? err.message : "onbekende fout"}`,
                  });
                }
              }
            }
          }

          // Individual updates for changed descriptions (each row may have different data)
          for (const item of toUpdate) {
            try {
              await txModel.update({
                where: { code: item.code },
                data: { description: item.description },
              });
              updated++;
            } catch (err) {
              errors.push({
                row: 0,
                message: `Kan "${item.code}" niet bijwerken: ${err instanceof Error ? err.message : "onbekende fout"}`,
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
