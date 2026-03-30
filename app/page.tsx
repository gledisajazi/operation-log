import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OperationForm from "@/components/OperationForm";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

function groupOperations(operations: any[], places: any[], types: any[]) {
  const placeMap = new Map(places.map((p) => [p.id, p.name]));
  const typeMap = new Map(types.map((t) => [t.id, t.name]));

  const result: Record<string, Record<string, number>> = {};

  operations.forEach((op) => {
    const place = placeMap.get(op.place_id) || "Unknown";
    const type = typeMap.get(op.operation_type_id) || "Unknown";

    if (!result[place]) result[place] = {};
    if (!result[place][type]) result[place][type] = 0;

    result[place][type]++;
  });

  return result;
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const toISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

  return {
    start: toISO(start),
    end: toISO(end),
  };
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // fetch dropdown data
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

  // month ranges
  const current = getMonthRange(0);
  const last = getMonthRange(-1);

  // fetch operations
  const { data: currentOps } = await supabase
    .from("operations")
    .select("*")
    .gte("operation_date", current.start)
    .lte("operation_date", current.end);

  const { data: lastOps } = await supabase
    .from("operations")
    .select("*")
    .gte("operation_date", last.start)
    .lte("operation_date", last.end);

  const currentGrouped = groupOperations(currentOps || [], places || [], types || []);
  const lastGrouped = groupOperations(lastOps || [], places || [], types || []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="mx-auto max-w-2xl space-y-4">

        {/* HEADER */}
        <header className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <h1 className="text-lg font-bold">Operacion Log</h1>

          <div className="flex gap-2">
            <Link href="/records" className="text-sm underline">
              Regjistrimet
            </Link>
            <Link href="/admin" className="text-sm underline">
              Admin
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* FORM */}
        <OperationForm
          places={places || []}
          operationTypes={types || []}
        />

        {/* SUMMARY */}
        <section className="rounded-2xl bg-white p-4 shadow-sm space-y-6">

          {/* CURRENT MONTH */}
          <div>
            <h2 className="font-semibold mb-2">Muaji aktual</h2>

            {Object.keys(currentGrouped).length === 0 ? (
              <p className="text-sm text-gray-500">
                Nuk ka operacione këtë muaj
              </p>
            ) : (
              Object.entries(currentGrouped).map(([place, ops]) => (
                <div key={place} className="mb-3">
                  <p className="font-medium">{place}</p>
                  <ul className="text-sm ml-4">
                    {Object.entries(ops).map(([type, count]) => (
                      <li key={type}>
                        {type}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* LAST MONTH */}
          <div>
            <h2 className="font-semibold mb-2">Muaji i kaluar</h2>

            {Object.keys(lastGrouped).length === 0 ? (
              <p className="text-sm text-gray-500">
                Nuk ka operacione muajin e kaluar
              </p>
            ) : (
              Object.entries(lastGrouped).map(([place, ops]) => (
                <div key={place} className="mb-3">
                  <p className="font-medium">{place}</p>
                  <ul className="text-sm ml-4">
                    {Object.entries(ops).map(([type, count]) => (
                      <li key={type}>
                        {type}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

        </section>

      </div>
    </main>
  );
}