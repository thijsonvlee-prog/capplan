import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-route-utils";

/**
 * GET /api/audit-log
 * Paginated, filterable audit log endpoint. ADMIN only.
 *
 * Query params:
 *   page      - page number (1-based, default 1)
 *   pageSize  - items per page (default 50, max 200)
 *   tableName - filter by table name (exact match)
 *   from      - filter entries created on or after this date (YYYY-MM-DD)
 *   to        - filter entries created on or before this date (YYYY-MM-DD, inclusive end-of-day)
 *   action    - filter by action (CREATE, UPDATE, DELETE)
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { searchParams } = request.nextUrl;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const rawPageSize = parseInt(searchParams.get("pageSize") || "50", 10) || 50;
    const pageSize = Math.min(Math.max(1, rawPageSize), 200);

    // Filters
    const tableName = searchParams.get("tableName") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const action = searchParams.get("action") || undefined;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (tableName) {
      where.tableName = tableName;
    }

    if (action) {
      const validActions = ["CREATE", "UPDATE", "DELETE"];
      if (!validActions.includes(action)) {
        return NextResponse.json(
          { error: `Ongeldige actie: "${action}". Geldige acties: ${validActions.join(", ")}` },
          { status: 400 }
        );
      }
      where.action = action;
    }

    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) {
        const fromDate = new Date(from + "T00:00:00Z");
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: `Ongeldige 'from' datum: "${from}". Gebruik het formaat JJJJ-MM-DD.` },
            { status: 400 }
          );
        }
        createdAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to + "T23:59:59.999Z");
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: `Ongeldige 'to' datum: "${to}". Gebruik het formaat JJJJ-MM-DD.` },
            { status: 400 }
          );
        }
        createdAt.lte = toDate;
      }
      where.createdAt = createdAt;
    }

    // Execute count + query in parallel
    const [total, entries] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          tableName: true,
          recordId: true,
          action: true,
          oldValues: true,
          newValues: true,
          userId: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const data = entries.map((entry) => ({
      id: entry.id,
      tableName: entry.tableName,
      recordId: entry.recordId,
      action: entry.action,
      oldValues: entry.oldValues,
      newValues: entry.newValues,
      userId: entry.userId,
      userName: entry.user?.name || null,
      userEmail: entry.user?.email || null,
      createdAt: entry.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching audit log:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan auditlogboek niet ophalen" },
      { status: 500 }
    );
  }
}
