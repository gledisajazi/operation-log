import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { name, sort_order } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { error } = await auth.adminClient.from("places").insert({
    name: name.trim(),
    sort_order: Number(sort_order) || 0,
    is_active: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id, name, sort_order, is_active } = await req.json();

  const payload: Record<string, unknown> = {};
  if (typeof name === "string") payload.name = name.trim();
  if (sort_order !== undefined) payload.sort_order = Number(sort_order) || 0;
  if (typeof is_active === "boolean") payload.is_active = is_active;

  const { error } = await auth.adminClient
    .from("places")
    .update(payload)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await req.json();

  const { error } = await auth.adminClient
    .from("places")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}