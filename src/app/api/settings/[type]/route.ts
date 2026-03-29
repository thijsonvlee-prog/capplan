import { NextRequest, NextResponse } from "next/server";
import { getSettingsModel } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const model = getSettingsModel(type);

    if (!model) {
      return NextResponse.json(
        { error: "Onbekend instellingentype" },
        { status: 400 }
      );
    }

    const records = await model.findMany({
      select: { id: true, code: true, description: true },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching settings:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan instellingen niet ophalen" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const model = getSettingsModel(type);

    if (!model) {
      return NextResponse.json(
        { error: "Onbekend instellingentype" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { code, description } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Code is verplicht" },
        { status: 400 }
      );
    }

    if (code.length > 100) {
      return NextResponse.json(
        { error: "Code mag maximaal 100 tekens bevatten" },
        { status: 400 }
      );
    }

    const record = await model.create({
      data: { code, description },
      select: { id: true, code: true, description: true },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating settings record:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Kan instellingenrecord niet aanmaken" },
      { status: 500 }
    );
  }
}
