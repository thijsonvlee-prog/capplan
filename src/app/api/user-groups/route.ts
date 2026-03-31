import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, validateRequired, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

/**
 * GET /api/user-groups
 * List all user groups with department list and member count.
 */
export async function GET() {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const groups = await prisma.userGroup.findMany({
      include: {
        departments: {
          select: { departmentId: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = groups.map((g) => ({
      id: g.id,
      name: g.name,
      departmentIds: g.departments.map((d) => d.departmentId),
      memberCount: g._count.users,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching user groups:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruikersgroepen niet ophalen" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-groups
 * Create a new user group with optional department assignments.
 */
export async function POST(request: NextRequest) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const parsed = await parseJsonBody(request);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const validationError = validateRequired(body, [
      { field: "name", label: "Naam" },
    ]);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (typeof body.name === "string" && body.name.length > 200) {
      return NextResponse.json({ error: "Naam mag maximaal 200 tekens bevatten" }, { status: 400 });
    }

    const departmentIds: string[] = Array.isArray(body.departmentIds) ? body.departmentIds : [];

    // Validate that all department IDs exist
    if (departmentIds.length > 0) {
      const count = await prisma.department.count({
        where: { id: { in: departmentIds } },
      });
      if (count !== departmentIds.length) {
        return NextResponse.json(
          { error: "Eén of meer opgegeven afdelingen bestaan niet" },
          { status: 400 }
        );
      }
    }

    const group = await prisma.userGroup.create({
      data: {
        name: body.name.trim(),
        departments: departmentIds.length > 0
          ? {
              createMany: {
                data: departmentIds.map((dId: string) => ({ departmentId: dId })),
              },
            }
          : undefined,
      },
      include: {
        departments: { select: { departmentId: true } },
        _count: { select: { users: true } },
      },
    });

    const userId = await getAuditUserId();
    logAudit("UserGroup", group.id, "CREATE", null, { name: body.name.trim(), departmentIds }, userId);

    return NextResponse.json({
      data: {
        id: group.id,
        name: group.name,
        departmentIds: group.departments.map((d) => d.departmentId),
        memberCount: group._count.users,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user group:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruikersgroep niet aanmaken" },
      { status: 500 }
    );
  }
}
