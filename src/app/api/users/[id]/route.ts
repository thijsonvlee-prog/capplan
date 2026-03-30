import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, parseJsonBody } from "@/lib/api-route-utils";

const VALID_ROLES = ["ADMIN", "PLANNER", "VIEWER"];

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
    const { role, userGroupId } = body;

    if (role !== undefined && (!role || !VALID_ROLES.includes(role))) {
      return NextResponse.json(
        { error: "Ongeldige rol. Kies een van: Admin, Planner, Kijker." },
        { status: 400 }
      );
    }

    // Validate userGroupId if provided (null means unassign)
    if (userGroupId !== undefined && userGroupId !== null) {
      const group = await prisma.userGroup.findUnique({
        where: { id: userGroupId },
        select: { id: true },
      });
      if (!group) {
        return NextResponse.json(
          { error: "Gebruikersgroep niet gevonden" },
          { status: 404 }
        );
      }
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (userGroupId !== undefined) updateData.userGroupId = userGroupId;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        userGroupId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        role: updated.role,
        userGroupId: updated.userGroupId,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating user:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruiker niet bijwerken" },
      { status: 500 }
    );
  }
}
