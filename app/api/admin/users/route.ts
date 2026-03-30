import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data: authUsers, error: authError } =
    await auth.adminClient.auth.admin.listUsers();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { data: profiles, error: profilesError } = await auth.adminClient
    .from("profiles")
    .select("id, full_name, role, created_at");

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 400 });
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );

  const users = (authUsers.users ?? []).map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      full_name: profile?.full_name ?? "",
      role: (profile?.role ?? "operator") as "admin" | "operator",
      created_at: u.created_at,
    };
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id, full_name, role } = await req.json();

  if (!id || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await auth.adminClient.from("profiles").upsert({
    id,
    full_name: typeof full_name === "string" ? full_name.trim() : null,
    role,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}