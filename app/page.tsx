import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OperationForm from "@/components/OperationForm";
import LogoutButton from "@/components/LogoutButton";
import TopTabs from "@/components/TopTabs";

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

  const current = getMonthRange(0);
  const last = getMonthRange(-1);

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
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Operation Log
              </h1>
              <p className="text-sm text-slate-600">
                Minimal mobile dashboard
              </p>
            </div>
            <LogoutButton />
          </div>

          <TopTabs active="add" />
        </header>

        <OperationForm places={places || []} operationTypes={types || []} />

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Muaji aktual
            </h2>

            {Object.keys(currentGrouped).length === 0 ? (
              <p className="text-sm text-slate-600">
                Nuk ka operacione këtë muaj
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(currentGrouped).map(([place, ops]) => (
                  <div key={place} className="rounded-2xl bg-slate-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-900">
                      {place}
                    </p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {Object.entries(ops).map(([type, count]) => (
                        <li key={type} className="flex items-center justify-between gap-3">
                          <span>{type}</span>
                          <span className="font-semibold text-slate-900">
                            {count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Muaji i kaluar
            </h2>

            {Object.keys(lastGrouped).length === 0 ? (
              <p className="text-sm text-slate-600">
                Nuk ka operacione muajin e kaluar
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(lastGrouped).map(([place, ops]) => (
                  <div key={place} className="rounded-2xl bg-slate-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-900">
                      {place}
                    </p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {Object.entries(ops).map(([type, count]) => (
                        <li key={type} className="flex items-center justify-between gap-3">
                          <span>{type}</span>
                          <span className="font-semibold text-slate-900">
                            {count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}