import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/LogoutButton";
import TopTabs from "@/components/TopTabs";
import CatalogManager from "@/components/CatalogManager";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: "admin" | "operator";
  created_at: string;
};

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
      <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Nuk ke akses
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Kjo faqe është vetëm për admin.
          </p>
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

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const placeMap = new Map((places || []).map((p) => [p.id, p.name]));
  const typeMap = new Map((operationTypes || []).map((t) => [t.id, t.name]));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Admin Panel
              </h1>
              <p className="text-sm text-slate-600">
                Menaxho vendet, llojet, users dhe operacionet
              </p>
            </div>
            <LogoutButton />
          </div>

          <TopTabs active="records" />
        </header>

        <div className="grid gap-4">
          <CatalogManager
            title="Vendet"
            apiPath="/api/admin/places"
            items={places || []}
          />

          <CatalogManager
            title="Llojet e operacioneve"
            apiPath="/api/admin/operation-types"
            items={operationTypes || []}
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Users
                </h2>
                <p className="text-sm text-slate-600">
                  Roli dhe emri i profilit
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(profiles as ProfileRow[] | null | undefined)?.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {u.full_name || "Pa emër"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{u.id}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Të gjitha operacionet
                </h2>
                <p className="text-sm text-slate-600">
                  {operations?.length ?? 0} rreshta
                </p>
              </div>

              <Link
                href="/api/admin/operations/export"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Export CSV
              </Link>
            </div>

            <div className="space-y-3">
              {(operations || []).map((operation) => (
                <article
                  key={operation.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {operation.patient_name || "Pa emër pacienti"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {operation.operation_date} •{" "}
                        {placeMap.get(operation.place_id) || "Unknown"} •{" "}
                        {typeMap.get(operation.operation_type_id) || "Unknown"}
                      </p>
                      {operation.notes ? (
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {operation.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/operations/${operation.id}/edit`}
                        className="text-sm font-medium text-slate-900 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={operation.id} />
                    </div>
                  </div>
                </article>
              ))}

              {operations?.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-600">
                  Nuk ka operacione.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}