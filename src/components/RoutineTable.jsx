import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCalendarDay,
  FaClock,
  FaDoorClosed,
  FaUserTie,
  FaLayerGroup,
} from "react-icons/fa";

/**
 * RoutineTable
 * Props: { onEdit(routine), refreshKey }
 */
function RoutineTable({ onEdit, refreshKey }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI filters
  const [dayFilter, setDayFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [query, setQuery] = useState("");

  // toast helper
  const toast = (title, icon = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true,
    });

  useEffect(() => {
    fetchRoutines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/routines");
      setRoutines(res.data || []);
    } catch (err) {
      console.error("Failed to fetch routines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete this routine?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await axios.delete(`/routines/${id}`);
      toast("Routine deleted");
      fetchRoutines();
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Failed to delete routine.", "error");
    }
  };

  // --- Utils ---
  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const parseTimeStart = (range) => {
    // "08:30-10:00" -> minutes from midnight for first part
    if (!range) return Number.MAX_SAFE_INTEGER;
    const [start] = range.split("-");
    const [hh, mm] = start.split(":").map(Number);
    return hh * 60 + mm;
    // no AM/PM here because backend uses 24h strings
  };

  const to12h = (hhmm) => {
    // "08:30" -> "08:30 AM"
    if (!hhmm) return "";
    const [H, M] = hhmm.split(":").map(Number);
    const suffix = H >= 12 ? "PM" : "AM";
    const h = ((H + 11) % 12) + 1;
    return `${h.toString().padStart(2, "0")}:${M.toString().padStart(2, "0")} ${suffix}`;
  };
  const formatRange12h = (range) => {
    if (!range?.includes("-")) return range || "";
    const [a, b] = range.split("-");
    return `${to12h(a)} – ${to12h(b)}`;
  };

  const Badge = ({ children, tone = "slate" }) => {
    const tones = {
      slate: "bg-slate-100 text-slate-700 border-slate-200",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
      red: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${tones[tone]}`}>
        {children}
      </span>
    );
  };

  // --- Derived data for filters (from routines, no extra API) ---
  const allDays = useMemo(
    () => Array.from(new Set(routines.map((r) => r.day))).filter(Boolean),
    [routines]
  );
  const allBatches = useMemo(
    () => Array.from(new Set(routines.map((r) => r.batch))).filter(Boolean),
    [routines]
  );
  const allSections = useMemo(
    () => Array.from(new Set(routines.map((r) => r.section))).filter(Boolean),
    [routines]
  );

  // --- Filtering + sorting ---
  const filteredSorted = useMemo(() => {
    let list = [...routines];

    // Filters
    if (dayFilter !== "All") list = list.filter((r) => r.day === dayFilter);
    if (batchFilter !== "All") list = list.filter((r) => r.batch === batchFilter);
    if (sectionFilter !== "All") list = list.filter((r) => r.section === sectionFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        [
          r.course_code,
          r.course_title,
          r.room,
          r.section,
          r.faculty_name,
          r.faculty_name_2,
          r.batch,
          r.day,
          r.time_range,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    // Sort by day, then by start time
    list.sort((a, b) => {
      const d = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (d !== 0) return d;
      return parseTimeStart(a.time_range) - parseTimeStart(b.time_range);
    });

    return list;
  }, [routines, dayFilter, batchFilter, sectionFilter, query]);

  // Group by "day-time_range"
  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of filteredSorted) {
      const key = `${r.day}|||${r.time_range}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map; // Map(key -> array)
  }, [filteredSorted]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2">
              <span className="text-slate-600 text-sm inline-flex items-center gap-2">
                <FaFilter /> Filters:
              </span>
            </div>

            {/* Day */}
            <label className="inline-flex items-center gap-2 text-sm">
              <FaCalendarDay className="text-slate-400" />
              <select
                className="border rounded-md p-1.5"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <option value="All">All Days</option>
                {dayOrder
                  .filter((d) => allDays.includes(d))
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </label>

            {/* Batch */}
            <label className="inline-flex items-center gap-2 text-sm">
              <FaLayerGroup className="text-slate-400" />
              <select
                className="border rounded-md p-1.5"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <option value="All">All Batches</option>
                {allBatches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            {/* Section */}
            <label className="inline-flex items-center gap-2 text-sm">
              <FaDoorClosed className="text-slate-400" />
              <select
                className="border rounded-md p-1.5"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="All">All Sections</option>
                {allSections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="pl-9 pr-9 border rounded-md p-2 w-full"
              placeholder="Search course / faculty / room / batch…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left border-b">Day</th>
                <th className="px-3 py-2 text-left border-b">Time</th>
                <th className="px-3 py-2 text-left border-b">Room</th>
                <th className="px-3 py-2 text-left border-b">Section</th>
                <th className="px-3 py-2 text-left border-b">Course</th>
                <th className="px-3 py-2 text-left border-b">Faculty</th>
                <th className="px-3 py-2 text-left border-b">Batch</th>
                <th className="px-3 py-2 text-left border-b">Lab?</th>
                <th className="px-3 py-2 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No routines found.
                  </td>
                </tr>
              ) : (
                Array.from(grouped.entries()).map(([key, items]) => {
                  // key = "Day|||08:30-10:00"
                  const [day, range] = key.split("|||");
                  const prettyRange = formatRange12h(range);

                  return items.map((r, idx) => (
                    <tr key={r._id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      {idx === 0 && (
                        <td className="px-3 py-3 border-b align-top" rowSpan={items.length}>
                          <div className="font-semibold text-slate-800">{day}</div>
                        </td>
                      )}
                      {idx === 0 && (
                        <td className="px-3 py-3 border-b align-top" rowSpan={items.length}>
                          <div className="inline-flex items-center gap-2">
                            <FaClock className="text-slate-400" />
                            <span className="font-medium">{prettyRange}</span>
                          </div>
                        </td>
                      )}

                      <td className="px-3 py-2 border-b">{r.room}</td>
                      <td className="px-3 py-2 border-b">{r.section}</td>
                      <td className="px-3 py-2 border-b">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {r.course_code || "-"}
                          </span>
                          {r.course_title && (
                            <span className="text-slate-500 text-xs truncate">{r.course_title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b">
                        <div className="flex flex-wrap gap-1 items-center">
                          <Badge tone="indigo">
                            <FaUserTie className="mr-1" />
                            {r.faculty_name || "-"}
                          </Badge>
                          {r.is_lab && r.faculty_name_2 && (
                            <Badge tone="indigo">
                              <FaUserTie className="mr-1" />
                              {r.faculty_name_2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b">{r.batch}</td>
                      <td className="px-3 py-2 border-b">
                        <Badge tone={r.is_lab ? "emerald" : "slate"}>
                          {r.is_lab ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 border-b">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => onEdit(r)}
                            title="Edit"
                          >
                            <FaEdit /> <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            onClick={() => handleDelete(r._id)}
                            title="Delete"
                          >
                            <FaTrash /> <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoutineTable;
