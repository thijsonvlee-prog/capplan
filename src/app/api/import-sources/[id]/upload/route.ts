import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PREVIEW_ROWS = 5;

/**
 * Simple CSV parser that handles:
 * - Comma-separated values
 * - Quoted fields (with commas, newlines inside quotes)
 * - Escaped quotes ("" inside quoted fields)
 * - BOM removal
 * - Different line endings (CRLF, LF, CR)
 */
function parseCSV(text: string): string[][] {
  // Remove BOM if present
  const content = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"' && current.length === 0) {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\r") {
        // Handle CRLF or CR
        row.push(current.trim());
        current = "";
        if (row.some((cell) => cell.length > 0)) {
          rows.push(row);
        }
        row = [];
        if (next === "\n") i++;
      } else if (char === "\n") {
        row.push(current.trim());
        current = "";
        if (row.some((cell) => cell.length > 0)) {
          rows.push(row);
        }
        row = [];
      } else {
        current += char;
      }
    }
  }

  // Handle last field/row
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function detectSeparator(firstLine: string): string {
  // Check if semicolon is more common than comma (common in Dutch CSV exports)
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;

  if (tabs > commas && tabs > semicolons) return "\t";
  if (semicolons > commas) return ";";
  return ",";
}

function parseCSVWithSeparator(text: string, separator: string): string[][] {
  if (separator === ",") return parseCSV(text);

  // For other separators, replace them with commas before parsing
  // But only outside quoted fields
  const content = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  let normalized = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      normalized += char;
    } else if (char === separator && !inQuotes) {
      normalized += ",";
    } else {
      normalized += char;
    }
  }

  return parseCSV(normalized);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify import source exists
    const source = await prisma.importSource.findUnique({ where: { id } });
    if (!source) {
      return NextResponse.json(
        { error: "Importbron niet gevonden" },
        { status: 404 }
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Bestand is te groot. Maximaal ${MAX_FILE_SIZE / 1024 / 1024} MB toegestaan.`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name || "";
    if (
      !fileName.toLowerCase().endsWith(".csv") &&
      !fileName.toLowerCase().endsWith(".txt")
    ) {
      return NextResponse.json(
        { error: "Ongeldig bestandstype. Upload een CSV-bestand (.csv of .txt)." },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Het bestand is leeg." },
        { status: 400 }
      );
    }

    // Detect separator from first line
    const firstLine = text.split(/\r?\n/)[0];
    const separator = detectSeparator(firstLine);

    // Parse CSV
    const allRows = parseCSVWithSeparator(text, separator);

    if (allRows.length === 0) {
      return NextResponse.json(
        { error: "Kan geen gegevens in het bestand lezen." },
        { status: 400 }
      );
    }

    const headers = allRows[0];
    const dataRows = allRows.slice(1);

    if (headers.length === 0 || headers.every((h) => !h)) {
      return NextResponse.json(
        { error: "Kan geen kolomnamen detecteren in de eerste rij." },
        { status: 400 }
      );
    }

    // Build preview rows (first N data rows)
    const previewRows = dataRows.slice(0, MAX_PREVIEW_ROWS).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        if (header) {
          obj[header] = row[i] || "";
        }
      });
      return obj;
    });

    // Check which configured mappings match detected columns
    const fieldMappings = source.fieldMappings as Record<string, string>;
    const mappingValidation = Object.entries(fieldMappings).map(
      ([sourceColumn, targetField]) => ({
        sourceColumn,
        targetField,
        detected: headers.includes(sourceColumn),
      })
    );

    const unmappedColumns = headers.filter(
      (h) => h && !Object.keys(fieldMappings).includes(h)
    );

    return NextResponse.json({
      data: {
        fileName: file.name,
        fileSize: file.size,
        separator,
        detectedColumns: headers.filter((h) => h),
        totalRows: dataRows.length,
        previewRows,
        mappingValidation,
        unmappedColumns,
      },
    });
  } catch (error) {
    console.error(
      "Error processing CSV upload:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Kan het bestand niet verwerken. Controleer het CSV-formaat." },
      { status: 500 }
    );
  }
}
