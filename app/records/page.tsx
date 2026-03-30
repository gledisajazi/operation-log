import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import TopTabs from "@/components/TopTabs";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

type SearchParams = {
  date?: string;
  placeId?: string;
  typeId?: string;
  q?: string;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = searchParams ? await searchParams : undefined;

  const date = getValue(params?.date);
  const placeId = getValue(params?.placeId);
  const typeId = getValue(params?.typeId);
  const q = getValue(params?.q).toLowerCase().trim();

  const { data: places } = await supabase
    .from("places")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  const { data: types } = await supabase
    .from("operation_types")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  let query = supabase
    .from("operations")
    .select("id, operation_date, place_id, operation_type_id, patient_name, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (date) query = query.eq("operation_date", date);
  if (placeId) query = query.eq("place_id", placeId);
  if (typeId) query = query.eq("operation_type_id", typeId);

  const { data: operations } = await query;

  const filtered = (operations || []).filter((op) => {
    const patient = (op.patient_name || "").toLowerCase();
    const notes = (op.notes || "").toLowerCase();

    if (q && !patient.includes(q) && !notes.includes(q)) return false;
    return true;
  });

  const placeMap = new Map((places || []).map((p) => [p.id, p.name]));
  const typeMap = new Map((types || []).map((t) => [t.id, t.name]));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Shih operacionet
              </h1>
              <p className="text-sm text-slate-600">
                Kërko, filtro dhe edito
              </p>
            </div>
            <LogoutButton />
          </div>

          <TopTabs active="records" />
        </header>

        <form className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none focus:border-slate-900"
          />

          <select
            name="placeId"
            defaultValue={placeId}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none focus:border-slate-900"
          >
            <option value="">Gjithë vendet</option>
            {(places || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            name="typeId"
            defaultValue={typeId}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none focus:border-slate-900"
          >
            <option value="">Gjithë operacionet</option>
            {(types || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search pacient / shënime"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900"
          />

          <button className="h-12 w-full rounded-2xl bg-slate-900 px-4 text-base font-semibold text-white transition hover:bg-slate-800">
            Kërko
          </button>
        </form>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-600">
              Nuk ka rezultate
            </p>
          ) : (
            filtered.map((op) => (
              <div
                key={op.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-slate-900">
                  {op.patient_name || "Pa emër"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {op.operation_date} •{" "}
                  {placeMap.get(op.place_id) || "Unknown"} •{" "}
                  {typeMap.get(op.operation_type_id) || "Unknown"}
                </p>

                {op.notes ? (
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {op.notes}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center gap-4">
                  <Link
                    href={`/operations/${op.id}/edit`}
                    className="text-sm font-medium text-slate-900 underline underline-offset-4"
                  >
                    Edit
                  </Link>

                  <DeleteButton id={op.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}