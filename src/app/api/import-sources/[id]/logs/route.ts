import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/import-sources/[id]/logs
 * List import logs for a specific import source, ordered by most recent first.
 */
export async function GET(
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

    const logs = await prisma.importLog.findMany({
      where: { importSourceId: id },
      orderBy: { executedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      data: logs.map((log) => ({
        id: log.id,
        importSourceId: log.importSourceId,
        fileName: log.fileName,
        totalRows: log.totalRows,
        importedRows: log.importedRows,
        skippedRows: log.skippedRows,
        errors: log.errors || [],
        executedAt: log.executedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(
      "Error fetching import logs:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Kan importlogboek niet ophalen" },
      { status: 500 }
    );
  }
}
