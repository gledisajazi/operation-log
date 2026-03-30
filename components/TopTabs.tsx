import Link from "next/link";

type Props = {
  active: "add" | "records";
};

export default function TopTabs({ active }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-100 p-1">
      <div className="grid grid-cols-2 gap-1">
        <Link
          href="/"
          className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${
            active === "add"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Shto operacion
        </Link>

        <Link
          href="/records"
          className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${
            active === "records"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Shih operacionet
        </Link>
      </div>
    </div>
  );
}