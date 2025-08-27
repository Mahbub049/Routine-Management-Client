import React, { useEffect, useMemo, useState } from "react";
import axios from "./api/axiosInstance";
import PrintHeader from "./components/PrintHeader";
import Footer from "./components/Footer";
import { FaFilter, FaSync, FaPrint, FaCompressAlt, FaExpandAlt, FaCircle } from "react-icons/fa";

function PublicPage() {
  const [filters, setFilters] = useState({ day: "", faculty: "", batch: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    time_ranges: [],
    batches: [],
    classrooms: [],
  });

  const [compact, setCompact] = useState(false);

  // Load public settings
  useEffect(() => {
    axios
      .get("/public-settings")
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Error fetching public settings:", err));
  }, []);

  // Sort times by start minute
  const timeOptions = useMemo(() => {
    const sorted = (settings.time_ranges || []).slice().sort((a, b) => {
      const getMinutes = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      return getMinutes(a.split("-")[0]) - getMinutes(b.split("-")[0]);
    });
    return sorted;
  }, [settings.time_ranges]);

  const to12Hour = (time) => {
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minuteStr} ${ampm}`;
  };

  const convertTo12HourRange = (range) => {
    if (!range) return "";
    const [start, end] = range.split("-");
    return `${to12Hour(start)} - ${to12Hour(end)}`;
  };

  // Fetch routines when filters change (with very light debounce)
  useEffect(() => {
    const handle = setTimeout(() => {
      const query = Object.entries(filters)
        .filter(([_, val]) => val)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join("&");

      setError("");
      setLoading(true);
      axios
        .get(`/routines?${query}`)
        .then((res) => setRoutines(res.data))
        .catch((err) => {
          console.error("API error:", err);
          setError("Failed to load routines. Please try again.");
        })
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(handle);
  }, [filters]);

  // Build grouping: day -> room -> time -> array of entries
  const groupedData = useMemo(() => {
    const g = {};
    for (const r of routines) {
      if (!g[r.day]) g[r.day] = {};
      if (!g[r.day][r.room]) g[r.day][r.room] = {};
      if (!g[r.day][r.room][r.time_range]) g[r.day][r.room][r.time_range] = [];
      g[r.day][r.room][r.time_range].push(r);
    }
    return g;
  }, [routines]);

  // was: bg-*-100, text-*-700
  const bgPalette = [
    "bg-red-200", "bg-orange-200", "bg-amber-200", "bg-lime-200", "bg-green-200",
    "bg-emerald-200", "bg-teal-200", "bg-cyan-200", "bg-sky-200", "bg-blue-200",
    "bg-indigo-200", "bg-violet-200", "bg-purple-200", "bg-fuchsia-200", "bg-pink-200",
  ];
  const borderPalette = [
    "border-red-300", "border-orange-300", "border-amber-300", "border-lime-300", "border-green-300",
    "border-emerald-300", "border-teal-300", "border-cyan-300", "border-sky-300", "border-blue-300",
    "border-indigo-300", "border-violet-300", "border-purple-300", "border-fuchsia-300", "border-pink-300",
  ];
  const textPalette = [
    "text-red-800", "text-orange-800", "text-amber-800", "text-lime-800", "text-green-800",
    "text-emerald-800", "text-teal-800", "text-cyan-800", "text-sky-800", "text-blue-800",
    "text-indigo-800", "text-violet-800", "text-purple-800", "text-fuchsia-800", "text-pink-800",
  ];

  const batchColorMap = useMemo(() => {
    const map = {};
    (settings.batches || []).forEach((b, i) => {
      const idx = i % bgPalette.length;
      map[b.trim()] = { bg: bgPalette[idx], border: borderPalette[idx], text: textPalette[idx] };
    });
    return map;
  }, [settings.batches]);


  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const gridColsStyle = useMemo(
    () => ({
      gridTemplateColumns: `120px repeat(${timeOptions.length}, minmax(200px, 1fr))`,
    }),
    [timeOptions.length]
  );

  const roomsSorted = useMemo(() => {
    const allRooms = settings.classrooms || [];
    // Only rooms that have entries for the current day will show (further filtered below)
    return allRooms.slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [settings.classrooms]);

  const cellBoxCls = compact
    ? "rounded p-1 shadow-sm hover:shadow bg-white"
    : "rounded p-2 shadow-sm hover:shadow-md bg-white";

  const titleCls = compact ? "font-semibold text-slate-800 text-xs" : "font-semibold text-slate-800";
  const subtitleCls = compact ? "text-[11px] text-gray-600" : "text-sm text-gray-600";
  const facultyCls = compact ? "text-[11px] text-slate-700" : "text-sm text-slate-700";

  // UI
  return (
    <div className="container mx-auto mont print:mx-0 print:max-w-none print:w-[100%] print-container">
      {/* Topbar */}
      <div className="bg-indigo-600 rounded-b-lg shadow-md print:hidden px-5 py-3 flex items-center justify-between">
        <span className="text-white text-xl font-semibold tracking-wide">
          Class Routine Management System
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompact((c) => !c)}
            className="px-3 py-2 text-white/90 hover:text-white rounded-md border border-white/20 hover:bg-white/10 transition"
            title={compact ? "Switch to Comfortable" : "Switch to Compact"}
          >
            {compact ? <FaExpandAlt /> : <FaCompressAlt />}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition flex items-center gap-2"
            title="Print"
          >
            <FaPrint /> <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-6 mt-6 mb-6 lg:ml-8 print:hidden">
        <div className="bg-white border rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-3">
            <FaFilter /> <span className="font-medium">Filters</span>
            <span className="text-slate-400 text-sm ml-auto">
              {loading ? "Loading…" : `${routines.length} result${routines.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
            <label className="flex flex-col text-sm font-medium text-slate-700">
              Day
              <select
                value={filters.day}
                className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
              >
                <option value="">All</option>
                {dayOrder.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-700">
              Faculty
              <input
                value={filters.faculty}
                className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Kabir"
                onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-700">
              Batch
              <select
                value={filters.batch}
                className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              >
                <option value="">All</option>
                {(settings.batches || []).map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-700">
              Time
              <select
                value={filters.time}
                className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFilters({ ...filters, time: e.target.value })}
              >
                <option value="">All</option>
                {timeOptions.map((slot) => (
                  <option key={slot} value={slot}>
                    {convertTo12HourRange(slot)}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-150 flex items-center justify-center gap-2"
              onClick={() => setFilters({ day: "", faculty: "", batch: "", time: "" })}
              title="Reset"
            >
              <FaSync /> Reset
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition duration-150"
            >
              🖨️ Print
            </button>
          </div>

          {/* Legend */}
          {(settings.batches || []).length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {settings.batches.map((b) => {
                const col = batchColorMap[b] || { bg: "bg-slate-100", text: "text-slate-700" };
                return (
                  <span
                    key={b}
                    className={`inline-flex items-center gap-2 px-2 py-1 rounded ${col.bg} ${col.text} border border-black/5`}
                  >
                    <FaCircle className="text-[10px]" /> {b}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PrintHeader />

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      )}

      {/* Routine Grid */}
      <div className="mx-6 print:mx-2">
        {loading ? (
          // Skeleton
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
            <div className="h-10 w-full bg-slate-200 rounded mb-2" />
            <div className="h-10 w-full bg-slate-200 rounded mb-2" />
            <div className="h-10 w-full bg-slate-200 rounded mb-2" />
          </div>
        ) : Object.keys(groupedData).length === 0 ? (
          // Empty state
          <div className="bg-white border rounded-xl shadow p-10 text-center text-slate-500">
            No routines found. Try adjusting filters above.
          </div>
        ) : (
          Object.entries(groupedData)
            .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
            .map(([day, rooms]) => (
              <div key={day} className="mb-12 break-after-page print:break-after-page">
                <h2 className="text-2xl font-semibold text-center text-slate-700 mb-5 border-b pb-2">
                  {day}
                </h2>

                <div className="overflow-x-auto print:overflow-visible rounded-xl border shadow-sm print-clean">
                  <div className="w-full grid text-sm print-text-xs routine-grid"
                    style={{ ...gridColsStyle, ["--slots"]: timeOptions.length }}
                  >
                    {/* Header Row */}
                    <div className="bg-slate-100 font-semibold text-center p-2 border-r border-b border-slate-300 sticky left-0 z-20 print-static">
                      Room
                    </div>
                    {timeOptions.map((slot) => (
                      <div
                        key={slot}
                        className="bg-slate-100 font-semibold text-center p-2 border-r border-b border-slate-300 sticky top-0 z-10 print-static"
                      >
                        {convertTo12HourRange(slot)}
                      </div>
                    ))}

                    {/* Rows per Room (only rooms with entries) */}
                    {roomsSorted
                      .filter((room) => {
                        const slots = rooms[room] || {};
                        return Object.values(slots).some((slotEntries) => slotEntries.length > 0);
                      })
                      .map((room) => {
                        const slots = rooms[room] || {};
                        return (
                          <div className="contents avoid-break" key={room}>
                            <div className="text-center border-t border-r border-slate-300 bg-slate-50 font-medium p-2 sticky left-0 z-10 print-static">
                              {room}
                            </div>

                            {timeOptions.map((slot) => (
                              <div
                                key={`${room}-${slot}`}
                                className="border-t border-r border-slate-300 p-1 align-top"
                              >
                                {(slots[slot] || []).map((r, i) => {
                                  const key = (r.batch || "").trim();
                                  const col =
                                    batchColorMap[key] || {
                                      bg: "bg-white",
                                      border: "border-slate-200",
                                      text: "text-slate-800",
                                    };

                                  return (
                                    <div
                                      key={i}
                                      className={`rounded p-1 shadow-sm transition duration-150 hover:shadow-md ${col.bg} border ${col.border}`}
                                    >
                                      <div className={`font-semibold ${col.text}`}>
                                        {r.course_code}-{r.section}
                                        {r.is_lab && r.lab_fixed_time_range ? (
                                          <span className="block text-xs text-gray-600 mt-0.5">
                                            ({r.lab_fixed_time_range})
                                          </span>
                                        ) : null}
                                      </div>

                                      <div className="text-gray-700 font-medium text-sm">{r.course_title}</div>

                                      <div className="text-slate-700 text-sm">
                                        {r.is_lab && r.faculty_name_2
                                          ? `${r.faculty_name} + ${r.faculty_name_2}`
                                          : r.faculty_name}
                                      </div>

                                      <div className="italic text-right text-xs text-slate-600">
                                        {r.batch}
                                      </div>
                                    </div>
                                  );
                                })}

                              </div>
                            ))}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default PublicPage;
