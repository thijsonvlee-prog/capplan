import { NextRequest, NextResponse } from "next/server";
import { requireRole, parseJsonBody } from "@/lib/api-route-utils";
import {
  buildApiHeaders,
  extractDataArray,
  resolveJsonPath,
  discoverPaths,
} from "@/lib/api-import-helpers";

const API_TEST_TIMEOUT_MS = 15_000;

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
