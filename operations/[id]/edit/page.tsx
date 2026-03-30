import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OperationForm from "@/components/OperationForm";

export const dynamic = "force-dynamic";

export default async function EditOperationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: operation } = await supabase
    .from("operations")
    .select("id, operation_date, place_id, operation_type_id, patient_name, notes")
    .eq("id", id)
    .maybeSingle();

  if (!operation) {
    notFound();
  }

  const { data: places } = await supabase
    .from("places")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  const { data: operationTypes } = await supabase
    .from("operation_types")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-2xl">
        <OperationForm
          mode="edit"
          initialOperation={operation}
          places={places || []}
          operationTypes={operationTypes || []}
        />
      </div>
    </main>
  );
}