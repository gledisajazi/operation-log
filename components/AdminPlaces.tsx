"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPlaces({ places }: any) {
  const [name, setName] = useState("");
  const router = useRouter();

  async function addPlace() {
    await fetch("/api/admin/places", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    setName("");
    router.refresh();
  }

  async function deletePlace(id: string) {
    await fetch("/api/admin/places", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vend i ri"
          className="border px-3 py-2 rounded"
        />
        <button onClick={addPlace} className="bg-black text-white px-4 rounded">
          Shto
        </button>
      </div>

      {places.map((p: any) => (
        <div key={p.id} className="flex justify-between border p-3 rounded">
          <span>{p.name}</span>
          <button
            onClick={() => deletePlace(p.id)}
            className="text-red-600"
          >
            Fshi
          </button>
        </div>
      ))}
    </div>
  );
}