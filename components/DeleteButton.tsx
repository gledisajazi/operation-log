"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("Je i sigurt që do ta fshish këtë operacion?");
    if (!ok) return;

    const res = await fetch(`/api/operations/${id}/delete`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Gabim gjatë fshirjes");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm font-medium text-red-600"
    >
      Fshi
    </button>
  );
}