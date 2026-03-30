import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data: places } = await auth.adminClient
    .from("places")
    .select("id, name");

  const { data: types } = await auth.adminClient
    .from("operation_types")
    .select("id, name");

  const { data: operations, error } = await auth.adminClient
    .from("operations")
    .select(
      "id, operation_date, place_id, operation_type_id, patient_name, notes, created_by, updated_by, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const placeMap = new Map((places ?? []).map((p) => [p.id, p.name]));
  const typeMap = new Map((types ?? []).map((t) => [t.id, t.name]));

  const header = [
    "id",
    "operation_date",
    "place",
    "operation_type",
    "patient_name",
    "notes",
    "created_by",
    "updated_by",
    "created_at",
    "updated_at",
  ];

  const rows = [
    header.map(csvEscape).join(","),
    ...(operations ?? []).map((row) =>
      [
        row.id,
        row.operation_date,
        placeMap.get(row.place_id) ?? "",
        typeMap.get(row.operation_type_id) ?? "",
        row.patient_name ?? "",
        row.notes ?? "",
        row.created_by ?? "",
        row.updated_by ?? "",
        row.created_at ?? "",
        row.updated_at ?? "",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="operations.csv"',
    },
  });
}