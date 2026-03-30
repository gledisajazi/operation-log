"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type Props = {
  title: string;
  apiPath: string;
  items: Item[];
};

export default function CatalogManager({ title, apiPath, items }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(String(items.length + 1));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("");

  async function request(method: string, body: unknown) {
    const res = await fetch(apiPath, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Gabim");
      return false;
    }

    router.refresh();
    return true;
  }

  async function addItem() {
    const ok = await request("POST", {
      name,
      sort_order: Number(sortOrder) || 0,
    });

    if (ok) {
      setName("");
      setSortOrder(String(items.length + 1));
    }
  }

  function beginEdit(item: Item) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditSortOrder(String(item.sort_order));
  }

  async function saveEdit(id: string) {
    const ok = await request("PATCH", {
      id,
      name: editName,
      sort_order: Number(editSortOrder) || 0,
    });

    if (ok) {
      setEditingId(null);
      setEditName("");
      setEditSortOrder("");
    }
  }

  async function toggleActive(item: Item) {
    await request("PATCH", {
      id: item.id,
      is_active: !item.is_active,
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">Shto, edito dhe çaktivizo.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Emri"
          className="h-12 rounded-2xl border border-slate-300 px-4 text-base outline-none focus:border-slate-900"
        />
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="Order"
          className="h-12 rounded-2xl border border-slate-300 px-4 text-base outline-none focus:border-slate-900"
        />
        <button
          onClick={addItem}
          className="h-12 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          Shto
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none focus:border-slate-900"
                  />
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none focus:border-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.is_active ? "active" : "inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Sort order: {item.sort_order}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => beginEdit(item)}
                      className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(item)}
                      className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {item.is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}