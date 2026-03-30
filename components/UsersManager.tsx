"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "operator";
  created_at: string;
};

type Props = {
  users: UserRow[];
};

export default function UsersManager({ users }: Props) {
  const router = useRouter();
  const initial = useMemo(() => {
    const map = new Map<string, { full_name: string; role: "admin" | "operator" }>();
    users.forEach((u) => {
      map.set(u.id, {
        full_name: u.full_name ?? "",
        role: u.role,
      });
    });
    return map;
  }, [users]);

  const [drafts, setDrafts] = useState(
    Object.fromEntries(
      users.map((u) => [
        u.id,
        {
          full_name: initial.get(u.id)?.full_name ?? "",
          role: initial.get(u.id)?.role ?? "operator",
        },
      ])
    )
  );

  async function saveUser(id: string) {
    const row = drafts[id];
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        full_name: row.full_name,
        role: row.role,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Gabim");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Users</h2>
        <p className="text-sm text-slate-500">Emri dhe roli.</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="space-y-3">
              <div>
                <p className="font-medium text-slate-900">{user.email}</p>
                <p className="text-xs text-slate-500">{user.id}</p>
              </div>

              <input
                value={drafts[user.id]?.full_name ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [user.id]: {
                      ...(prev[user.id] ?? { role: "operator" }),
                      full_name: e.target.value,
                    },
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none focus:border-slate-900"
                placeholder="Full name"
              />

              <select
                value={drafts[user.id]?.role ?? "operator"}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [user.id]: {
                      ...(prev[user.id] ?? { full_name: "" }),
                      role: e.target.value as "admin" | "operator",
                    },
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none focus:border-slate-900"
              >
                <option value="operator">operator</option>
                <option value="admin">admin</option>
              </select>

              <button
                onClick={() => saveUser(user.id)}
                className="h-12 w-full rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white"
              >
                Save user
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}