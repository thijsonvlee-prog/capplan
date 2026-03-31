/**
 * Shared helpers for API import source routes (test + execute).
 *
 * Used by:
 *   - /api/import-sources/test/route.ts
 *   - /api/import-sources/[id]/execute/route.ts
 */

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
