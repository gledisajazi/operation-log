import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/LogoutButton";
import CatalogManager from "@/components/CatalogManager";
import UsersManager from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Nuk ke akses</h1>
        </div>
      </main>
    );
  }

  const { data: places } = await adminClient
    .from("places")
    .select("id, name, sort_order, is_active")
    .order("sort_order", { ascending: true });

  const { data: operationTypes } = await adminClient
    .from("operation_types")
    .select("id, name, sort_order, is_active")
    .order("sort_order", { ascending: true });

  const { data: operations } = await adminClient
    .from("operations")
    .select(
      "id, operation_date, place_id, operation_type_id, patient_name, notes, created_by, updated_by, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: authUsers, error: usersError } =
    await adminClient.auth.admin.listUsers();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, role, created_at");

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const users =
    authUsers?.users?.map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: p?.full_name ?? "",
        role: (p?.role ?? "operator") as "admin" | "operator",
        created_at: u.created_at,
      };
    }) ?? [];

  const placeMap = new Map((places ?? []).map((p) => [p.id, p.name]));
  const typeMap = new Map(
    (operationTypes ?? []).map((t) => [t.id, t.name])
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
              Admin Panel
            </h1>
            <p className="text-sm text-slate-500">Menaxhim i plotë</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/api/admin/operations/export"
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Export CSV
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              App
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className="grid gap-4">
          <CatalogManager
            title="Vendet"
            apiPath="/api/admin/places"
            items={places ?? []}
          />

          <CatalogManager
            title="Llojet e operacioneve"
            apiPath="/api/admin/operation-types"
            items={operationTypes ?? []}
          />

          <UsersManager users={users} />

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Të gjitha operacionet
                </h2>
                <p className="text-sm text-slate-500">
                  {operations?.length ?? 0} rreshta
                </p>
              </div>
              <Link
                href="/api/admin/operations/export"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                CSV
              </Link>
            </div>

            <div className="space-y-3">
              {(operations ?? []).map((operation) => (
                <article
                  key={operation.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {operation.patient_name || "Pa emër pacienti"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {operation.operation_date} •{" "}
                        {placeMap.get(operation.place_id)} •{" "}
                        {typeMap.get(operation.operation_type_id)}
                      </p>
                      {operation.notes ? (
                        <p className="mt-2 text-sm text-slate-700">
                          {operation.notes}
                        </p>
                      ) : null}
                    </div>

                    <Link
                      href={`/operations/${operation.id}/edit`}
                      className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}