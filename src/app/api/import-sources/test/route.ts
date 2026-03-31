import { NextRequest, NextResponse } from "next/server";
import { requireRole, parseJsonBody } from "@/lib/api-route-utils";

const API_TEST_TIMEOUT_MS = 15_000;

function buildApiHeaders(
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

function extractDataArray(body: unknown): unknown[] | null {
  if (Array.isArray(body)) return body;
  if (body != null && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["data", "results", "items", "rows", "records"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return null;
}

function resolveJsonPath(obj: unknown, path: string): string | undefined {
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

function discoverPaths(obj: unknown, prefix = ""): string[] {
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

/**
 * POST /api/import-sources/test
 *
 * Tests an API connection with the provided configuration (URL, method, headers,
 * auth). Returns success/failure status, and on success discovers the JSON
 * response structure (paths and sample data) for field mapping.
 */
export async function POST(request: NextRequest) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const { apiUrl, apiMethod, apiHeaders, apiAuthType, apiCredentials } = parsed.data;

    if (!apiUrl || typeof apiUrl !== "string" || !apiUrl.trim()) {
      return NextResponse.json({ error: "API-URL is verplicht" }, { status: 400 });
    }

    const headers = buildApiHeaders(
      apiHeaders as Record<string, string> | null,
      (apiAuthType as string) || null,
      apiCredentials as Record<string, unknown> | null
    );
    const method = (apiMethod as string) || "GET";

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TEST_TIMEOUT_MS);
      response = await fetch(apiUrl as string, { method, headers, signal: controller.signal });
      clearTimeout(timeout);
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "Verbinding duurde te lang (timeout na 15 seconden)."
          : `Kan geen verbinding maken: ${err instanceof Error ? err.message : "onbekende fout"}`;
      return NextResponse.json({
        data: { success: false, message },
      });
    }

    if (!response.ok) {
      return NextResponse.json({
        data: {
          success: false,
          statusCode: response.status,
          message: `Server gaf foutcode ${response.status}: ${response.statusText}`,
        },
      });
    }

    // Parse JSON and discover structure
    let discoveredPaths: string[] = [];
    let sampleData: Record<string, string> = {};
    let totalRecords = 0;

    try {
      const body = await response.json();
      const dataArray = extractDataArray(body);
      if (dataArray && dataArray.length > 0) {
        totalRecords = dataArray.length;
        const firstItem = dataArray[0];
        discoveredPaths = discoverPaths(firstItem);
        sampleData = {};
        for (const path of discoveredPaths) {
          const value = resolveJsonPath(firstItem, path);
          if (value !== undefined) sampleData[path] = value;
        }
      }
    } catch {
      // Response is not JSON — connection test still succeeded
    }

    return NextResponse.json({
      data: {
        success: true,
        statusCode: response.status,
        message: `Verbinding geslaagd (HTTP ${response.status})`,
        discoveredPaths,
        sampleData,
        totalRecords,
      },
    });
  } catch (error) {
    console.error(
      "Error testing API connection:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Verbindingstest mislukt" },
      { status: 500 }
    );
  }
}
