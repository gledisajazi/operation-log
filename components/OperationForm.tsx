"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Place = {
  id: string;
  name: string;
};

type OperationType = {
  id: string;
  name: string;
};

type InitialOperation = {
  id: string;
  operation_date: string;
  place_id: string;
  operation_type_id: string;
  patient_name: string | null;
  notes: string | null;
};

type Props = {
  places: Place[];
  operationTypes: OperationType[];
  mode?: "create" | "edit";
  initialOperation?: InitialOperation;
};

function getLocalToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function OperationForm({
  places,
  operationTypes,
  mode = "create",
  initialOperation,
}: Props) {
  const router = useRouter();

  const defaultDate = initialOperation?.operation_date ?? getLocalToday();
  const defaultPlace = initialOperation?.place_id ?? places[0]?.id ?? "";
  const defaultType =
    initialOperation?.operation_type_id ?? operationTypes[0]?.id ?? "";

  const [operationDate, setOperationDate] = useState(defaultDate);
  const [placeId, setPlaceId] = useState(defaultPlace);
  const [operationTypeId, setOperationTypeId] = useState(defaultType);
  const [patientName, setPatientName] = useState(
    initialOperation?.patient_name ?? ""
  );
  const [notes, setNotes] = useState(initialOperation?.notes ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint =
      mode === "edit" && initialOperation
        ? `/api/operations/${initialOperation.id}`
        : "/api/operations";

    const response = await fetch(endpoint, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationDate,
        placeId,
        operationTypeId,
        patientName: patientName.trim() || null,
        notes: notes.trim() || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Ndodhi një gabim.");
      setLoading(false);
      return;
    }

    if (mode === "edit") {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage("Operacioni u ruajt me sukses.");
    setPatientName("");
    setNotes("");
    setOperationDate(getLocalToday());
    setPlaceId(places[0]?.id ?? "");
    setOperationTypeId(operationTypes[0]?.id ?? "");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-6 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {mode === "edit" ? "Edito operacionin" : "Shto operacion"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Mobile-first, pa gabime me datën.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            type="date"
            value={operationDate}
            onChange={(e) => setOperationDate(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-base outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-slate-700">
            Vendi
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {places.map((place) => (
              <label
                key={place.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  placeId === place.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="place"
                  value={place.id}
                  checked={placeId === place.id}
                  onChange={() => setPlaceId(place.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-800">
                  {place.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Lloji i operacionit
          </label>
          <select
            value={operationTypeId}
            onChange={(e) => setOperationTypeId(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-base outline-none focus:border-slate-900"
          >
            {operationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Emri i pacientit
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-base outline-none focus:border-slate-900"
            placeholder="Mund të lihet bosh"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Shënime
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-32 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-slate-900"
            placeholder="Shkruaj shënime shtesë..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-slate-900 px-4 text-base font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Duke ruajtur..." : mode === "edit" ? "Ruaj ndryshimet" : "Ruaj operacionin"}
        </button>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}