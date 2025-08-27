import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";

function PrintHeader() {
  const [settings, setSettings] = useState({
    university_name: "",
    department_name: "",
    term_type: "",
    logo_url: "",
    semester: null,
    batches: [],
  });

  useEffect(() => {
    axios.get("/public-settings").then((res) => {
      const d = res.data || {};
      setSettings({
        university_name: d.university_name || "",
        department_name: d.department_name || "",
        term_type: d.term_type || "",
        logo_url: d.logo_url || "",
        semester: d.semester || null,
        batches: d.batches || [],
      });
    });
  }, []);

  // same palette family you use on cards
  const bg = [
    "bg-red-200","bg-orange-200","bg-amber-200","bg-lime-200","bg-green-200",
    "bg-emerald-200","bg-teal-200","bg-cyan-200","bg-sky-200","bg-blue-200",
    "bg-indigo-200","bg-violet-200","bg-purple-200","bg-fuchsia-200","bg-pink-200",
  ];
  const bd = [
    "border-red-300","border-orange-300","border-amber-300","border-lime-300","border-green-300",
    "border-emerald-300","border-teal-300","border-cyan-300","border-sky-300","border-blue-300",
    "border-indigo-300","border-violet-300","border-purple-300","border-fuchsia-300","border-pink-300",
  ];
  const txt = [
    "text-red-900","text-orange-900","text-amber-900","text-lime-900","text-green-900",
    "text-emerald-900","text-teal-900","text-cyan-900","text-sky-900","text-blue-900",
    "text-indigo-900","text-violet-900","text-purple-900","text-fuchsia-900","text-pink-900",
  ];

  const legend = useMemo(() => {
    const m = {};
    (settings.batches || []).forEach((b, i) => {
      const k = i % bg.length;
      m[b] = { bg: bg[k], bd: bd[k], txt: txt[k] };
    });
    return m;
  }, [settings.batches]);

  const period = settings.semester
    ? `${settings.semester.start_month || ""} ${settings.semester.start_year || ""} – ${settings.semester.end_month || ""} ${settings.semester.end_year || ""}`
    : "";

  const printedOn = new Date().toLocaleString();

  return (
    <div className="hidden print:block px-6 pt-2 pb-3 break-inside-avoid">
      {/* header */}
      <div className="flex items-center justify-center gap-4">
        {settings.logo_url ? (
          <img src={settings.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
        ) : null}
        <div className="text-center">
          <h1 className="text-[18px] leading-5 font-extrabold uppercase tracking-wide">
            {settings.university_name || "University Name"}
          </h1>
          <h2 className="text-[15px] leading-5 font-semibold uppercase tracking-wide">
            {settings.department_name || "Department Name"}
          </h2>
          <h3 className="text-[13px] leading-5 font-medium uppercase tracking-wide">
            Class Routine{settings.term_type ? ` — ${settings.term_type}` : ""}{period ? `: ${period}` : ""}
          </h3>
        </div>
      </div>

      {/* timestamp */}
      <div className="text-right text-[10px] text-slate-600 mt-1">
        Printed on: {printedOn}
      </div>

      {/* batch legend */}
      {(settings.batches || []).length > 0 && (
        <div className="mt-2 border border-black/20 rounded-md overflow-hidden">
          <div
            className="grid text-[11px] font-semibold"
            style={{ gridTemplateColumns: `repeat(${settings.batches.length}, minmax(0, 1fr))` }}
          >
            {settings.batches.map((b) => {
              const c = legend[b] || { bg: "bg-slate-100", bd: "border-slate-300", txt: "text-slate-800" };
              return (
                <div key={b} className={`py-1 text-center ${c.bg} ${c.txt} border-l first:border-l-0 ${c.bd}`}>
                  {b}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PrintHeader;
