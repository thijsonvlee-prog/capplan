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

export function detectSeparator(firstLine: string): string {
  // Check if semicolon is more common than comma (common in Dutch CSV exports)
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;

  if (tabs > commas && tabs > semicolons) return "\t";
  if (semicolons > commas) return ";";
  return ",";
}

export function parseCSVWithSeparator(text: string, separator: string): string[][] {
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

/**
 * Parse CSV text into an array of row objects using header names as keys.
 * Returns { headers, rows } where rows is Record<string, string>[].
 */
export function parseCSVToRows(text: string): {
  headers: string[];
  rows: Record<string, string>[];
  separator: string;
} {
  const firstLine = text.split(/\r?\n/)[0];
  const separator = detectSeparator(firstLine);
  const allRows = parseCSVWithSeparator(text, separator);

  if (allRows.length === 0) {
    return { headers: [], rows: [], separator };
  }

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  const rows = dataRows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (header) {
        obj[header] = row[i] || "";
      }
    });
    return obj;
  });

  return { headers: headers.filter((h) => h), rows, separator };
}
