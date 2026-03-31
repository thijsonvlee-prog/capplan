import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, validateRequired, parseJsonBody } from "@/lib/api-route-utils";
import { logAudit, getAuditUserId } from "@/lib/audit";

/**
 * GET /api/user-groups/[id]
 * Get a single user group with departments and members.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

    const group = await prisma.userGroup.findUnique({
      where: { id },
      include: {
        departments: { select: { departmentId: true } },
        users: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Gebruikersgroep niet gevonden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: group.id,
        name: group.name,
        departmentIds: group.departments.map((d) => d.departmentId),
        members: group.users,
        memberCount: group.users.length,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching user group:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruikersgroep niet ophalen" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user-groups/[id]
 * Update a user group's name and/or department assignments.
 * Replaces the full department list (set semantics, not additive).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

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

    // Verify group exists and fetch old values for audit
    const existing = await prisma.userGroup.findUnique({
      where: { id },
      select: { id: true, name: true, departments: { select: { departmentId: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Gebruikersgroep niet gevonden" },
        { status: 404 }
      );
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

    // Update group name and replace department assignments in a transaction
    const group = await prisma.$transaction(async (tx) => {
      // Delete existing department links
      await tx.userGroupDepartment.deleteMany({
        where: { userGroupId: id },
      });

      // Update group and create new department links
      return tx.userGroup.update({
        where: { id },
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
    });

    const userId = await getAuditUserId();
    logAudit("UserGroup", id, "UPDATE", { name: existing.name, departmentIds: existing.departments.map((d) => d.departmentId) }, { name: body.name.trim(), departmentIds }, userId);

    return NextResponse.json({
      data: {
        id: group.id,
        name: group.name,
        departmentIds: group.departments.map((d) => d.departmentId),
        memberCount: group._count.users,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating user group:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruikersgroep niet bijwerken" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user-groups/[id]
 * Delete a user group. Users in the group become ungrouped (userGroupId → null via onDelete: SetNull).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const { id } = await params;

    // Verify group exists and fetch old values for audit
    const existingDel = await prisma.userGroup.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existingDel) {
      return NextResponse.json(
        { error: "Gebruikersgroep niet gevonden" },
        { status: 404 }
      );
    }

    await prisma.userGroup.delete({
      where: { id },
    });

    const userId = await getAuditUserId();
    logAudit("UserGroup", id, "DELETE", { name: existingDel.name }, null, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Gebruikersgroep niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Error deleting user group:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruikersgroep niet verwijderen" },
      { status: 500 }
    );
  }
}
