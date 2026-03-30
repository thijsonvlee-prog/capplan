import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const authError = await requireRole("ADMIN");
    if (authError) return authError;

    const users = await prisma.user.findMany({
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
      orderBy: { name: "asc" },
    });

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      userGroupId: u.userGroupId,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching users:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan gebruikers niet ophalen" },
      { status: 500 }
    );
  }
}
