/**
 * Shared helpers for API import source routes.
 *
 * Used by:
 *   - /api/import-sources/route.ts
 *   - /api/import-sources/[id]/route.ts
 *   - /api/import-sources/test/route.ts
 *   - /api/import-sources/[id]/execute/route.ts
 */

// === API source validation constants ===

export const VALID_TARGET_ENTITIES = ["drivers", "employers", "departments", "locations"];
export const VALID_SOURCE_TYPES = ["CSV", "API"];
export const VALID_API_METHODS = ["GET", "POST"];
export const VALID_API_AUTH_TYPES = ["NONE", "BASIC", "BEARER", "API_KEY"];

/**
 * Validate API-specific fields on an import source body.
 * Returns a Dutch error message if invalid, or null if valid.
 */
export function validateApiFields(body: Record<string, unknown>): string | null {
  const { apiUrl, apiMethod, apiAuthType, apiHeaders, apiCredentials } = body;

  if (!apiUrl || typeof apiUrl !== "string" || apiUrl.trim() === "") {
    return "API-URL is verplicht voor API-bronnen";
  }
  if (apiUrl.length > 2000) {
    return "API-URL mag maximaal 2000 tekens bevatten";
  }

  if (apiMethod && !VALID_API_METHODS.includes(apiMethod as string)) {
    return `Ongeldige HTTP-methode. Kies uit: ${VALID_API_METHODS.join(", ")}`;
  }

  if (apiAuthType && !VALID_API_AUTH_TYPES.includes(apiAuthType as string)) {
    return `Ongeldig authenticatietype. Kies uit: ${VALID_API_AUTH_TYPES.join(", ")}`;
  }

  if (apiHeaders !== undefined && apiHeaders !== null) {
    if (typeof apiHeaders !== "object" || Array.isArray(apiHeaders)) {
      return "API-headers moeten een object zijn met sleutel-waarde paren";
    }
  }

  if (apiCredentials !== undefined && apiCredentials !== null) {
    if (typeof apiCredentials !== "object" || Array.isArray(apiCredentials)) {
      return "API-credentials moeten een object zijn";
    }
  }

  return null;
}

/**
 * Build request headers including authentication for an API source.
 */
export function buildApiHeaders(
  apiHeaders: Record<string, string> | null,
  apiAuthType: string | null,
  apiCredentials: Record<string, unknown> | null
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (apiHeaders && typeof apiHeaders === "object") {
    for (const [key, value] of Object.entries(apiHeaders)) {
      if (key.trim()) headers[key.trim()] = String(value);
    }
  }

  if (apiAuthType && apiCredentials) {
    switch (apiAuthType) {
      case "BASIC": {
        const username = String(apiCredentials.username || "");
        const password = String(apiCredentials.password || "");
        headers["Authorization"] = `Basic ${btoa(`${username}:${password}`)}`;
        break;
      }
      case "BEARER": {
        const token = String(apiCredentials.token || "");
        headers["Authorization"] = `Bearer ${token}`;
        break;
      }
      case "API_KEY": {
        const headerName = String(apiCredentials.headerName || "X-API-Key");
        const apiKey = String(apiCredentials.apiKey || "");
        headers[headerName] = apiKey;
        break;
      }
    }
  }

  if (!Object.keys(headers).some((k) => k.toLowerCase() === "accept")) {
    headers["Accept"] = "application/json";
  }

  return headers;
}

/**
 * Find the data array in a JSON API response. Tries common wrapper keys,
 * falls back to the root if it is already an array.
 */
export function extractDataArray(body: unknown): unknown[] | null {
  if (Array.isArray(body)) return body;
  if (body != null && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["data", "results", "items", "rows", "records"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return null;
}

/**
 * Resolve a dot-notation path (e.g. "employee.firstName") against a JSON object.
 * Returns the value as a string, or undefined if the path does not resolve.
 */
export function resolveJsonPath(obj: unknown, path: string): string | undefined {
  const segments = path.split(".");
  let current: unknown = obj;
  for (const seg of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[seg];
  }
  if (current == null) return undefined;
  if (Array.isArray(current)) return current.join(", ");
  return String(current);
}

/**
 * Discover all leaf-level dot-notation paths in a JSON object.
 * Used to present field options for mapping configuration.
 */
export function discoverPaths(obj: unknown, prefix = ""): string[] {
  const paths: string[] = [];
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return paths;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      paths.push(...discoverPaths(value, fullPath));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}
