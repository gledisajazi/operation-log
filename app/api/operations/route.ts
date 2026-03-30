import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nuk je i loguar." }, { status: 401 });
    }

    const body = await req.json();

    const operationDate = body.operationDate as string;
    const placeId = body.placeId as string;
    const operationTypeId = body.operationTypeId as string;
    const patientName =
      typeof body.patientName === "string" ? body.patientName.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!operationDate || !placeId || !operationTypeId) {
      return NextResponse.json(
        { error: "Plotëso datën, vendin dhe llojin e operacionit." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("operations").insert({
      operation_date: operationDate,
      place_id: placeId,
      operation_type_id: operationTypeId,
      patient_name: patientName || null,
      notes: notes || null,
      created_by: user.id,
      updated_by: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Ndodhi një gabim i papritur." },
      { status: 500 }
    );
  }
}