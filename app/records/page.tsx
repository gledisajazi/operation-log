import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const date = searchParams?.date || "";
  const placeId = searchParams?.placeId || "";
  const typeId = searchParams?.typeId || "";
  const q = (searchParams?.q || "").toLowerCase();

  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const { data: types } = await supabase
    .from("operation_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  let query = supabase
    .from("operations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

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
    <main className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="mx-auto max-w-3xl space-y-4">

        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
          <h1 className="font-bold text-lg">Regjistrimet</h1>

          <div className="flex gap-2">
            <Link href="/" className="text-sm underline">
              Home
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* FILTERS */}
        <form className="bg-white p-4 rounded-2xl shadow-sm space-y-3">

          <input
            type="date"
            name="date"
            defaultValue={date}
            className="w-full h-12 border rounded-xl px-3"
          />

          <select
            name="placeId"
            defaultValue={placeId}
            className="w-full h-12 border rounded-xl px-3"
          >
            <option value="">Gjithë vendet</option>
            {places?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            name="typeId"
            defaultValue={typeId}
            className="w-full h-12 border rounded-xl px-3"
          >
            <option value="">Gjithë operacionet</option>
            {types?.map((t) => (
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
            className="w-full h-12 border rounded-xl px-3"
          />

          <button className="w-full h-12 bg-black text-white rounded-xl">
            Kërko
          </button>
        </form>

        {/* LIST */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              Nuk ka rezultate
            </p>
          ) : (
            filtered.map((op) => (
              <div
                key={op.id}
                className="bg-white p-4 rounded-2xl shadow-sm"
              >
                <p className="font-medium">
                  {op.patient_name || "Pa emër"}
                </p>

                <p className="text-sm text-gray-500">
                  {op.operation_date} •{" "}
                  {placeMap.get(op.place_id)} •{" "}
                  {typeMap.get(op.operation_type_id)}
                </p>

                {op.notes && (
                  <p className="text-sm mt-1">{op.notes}</p>
                )}

                <Link
                  href={`/operations/${op.id}/edit`}
                  className="text-sm underline mt-2 inline-block"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}