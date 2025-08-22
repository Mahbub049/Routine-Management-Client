import React, { useEffect, useState } from "react";
import axios from "./api/axiosInstance";
import PrintHeader from "./components/PrintHeader";
import Footer from "./components/Footer";

function PublicPage() {
  const [filters, setFilters] = useState({ day: "", faculty: "", batch: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState([]);

  const [settings, setSettings] = useState({
    time_ranges: [],
    batches: [],
    classrooms: []
  });

  useEffect(() => {
    axios.get("/public-settings")
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Error fetching public settings:", err));
  }, []);

  const timeOptions = (settings.time_ranges || []).sort((a, b) => {
    const getMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return getMinutes(a.split("-")[0]) - getMinutes(b.split("-")[0]);
  });


  const convertTo12HourRange = (range) => {
    const [start, end] = range.split("-");
    return `${to12Hour(start)} - ${to12Hour(end)}`;
  };

  const to12Hour = (time) => {
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minuteStr} ${ampm}`;
  };

  useEffect(() => {
    const query = Object.entries(filters)
      .filter(([_, val]) => val)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");

    setLoading(true);
    axios.get(`/routines?${query}`)
      .then((res) => setRoutines(res.data))
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, [filters]);

  const groupedData = {};
  for (const r of routines) {
    if (!groupedData[r.day]) groupedData[r.day] = {};
    if (!groupedData[r.day][r.room]) groupedData[r.day][r.room] = {};
    if (!groupedData[r.day][r.room][r.time_range]) groupedData[r.day][r.room][r.time_range] = [];
    groupedData[r.day][r.room][r.time_range].push(r);
  }

  // Define a fixed palette of Tailwind background classes
  const colors = [
    "bg-red-100",
    "bg-orange-100",
    "bg-amber-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-indigo-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-teal-100",
    "bg-lime-100"
  ];

  // Dynamically build color map from settings.batches
  const batchColorMap = {};
  (settings.batches || []).forEach((batch, index) => {
    batchColorMap[batch] = colors[index % colors.length]; // wrap around if more batches than colors
  });


  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  return (
    <div className="container mx-auto mont">
      {/* Navbar */}
      <div className="navbar bg-indigo-600 rounded-b-lg shadow-md justify-center print:hidden px-4 py-3">
        <a className="text-white text-2xl font-semibold tracking-wide">Class Routine Management System</a>
      </div>

      {/* Filters + Print */}
      <div className="mx-6 mt-8 mb-8 lg:ml-8 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Day:
            <select
              value={filters.day}
              className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setFilters({ ...filters, day: e.target.value })}
            >
              <option value="">All</option>
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700">
            Faculty:
            <input
              value={filters.faculty}
              className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Kabir"
              onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700">
            Batch:
            <select
              value={filters.batch}
              className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            >
              <option value="">All</option>
              {(settings.batches || []).map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700">
            Time:
            <select
              value={filters.time}
              className="mt-1 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setFilters({ ...filters, time: e.target.value })}
            >
              <option value="">All</option>
              {timeOptions.map((slot) => (
                <option key={slot} value={slot}>{convertTo12HourRange(slot)}</option>
              ))}
            </select>
          </label>

          <button
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-150"
            onClick={() => setFilters({ day: "", faculty: "", batch: "", time: "" })}
          >
            Reset Filters
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition duration-150"
          >
            🖨️ Print Routine
          </button>
        </div>
      </div>

      <PrintHeader />

      {/* Routine Table */}
      <div className="mx-6 print:mx-2">
        {Object.entries(groupedData)
          .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
          .map(([day, rooms]) => (
            <div key={day} className="mb-12 break-after-page print:break-after-page">
              <h2 className="text-2xl font-semibold text-center text-slate-700 mb-5 border-b pb-2">{day}</h2>
              <div className="overflow-x-auto print:overflow-visible">
                <div className="w-full grid grid-cols-[80px_repeat(5,1fr)] border border-slate-300 rounded-lg shadow-sm text-sm print:text-xs routine-grid">
                  {/* Time Headers */}
                  <div className="bg-slate-200 font-bold text-center p-2 border-r border-b border-slate-300">
                    Room
                  </div>
                  {timeOptions.map((slot) => (
                    <div
                      key={slot}
                      className="bg-slate-200 font-bold text-center p-2 border-r border-b border-slate-300"
                    >
                      {convertTo12HourRange(slot)}
                    </div>
                  ))}

                  {/* Rows per Room */}
                  {(settings.classrooms || [])
                    .filter((room) => {
                      const slots = rooms[room] || {};
                      return Object.values(slots).some(slotEntries => slotEntries.length > 0);
                    })
                    .map((room) => {
                      const slots = rooms[room] || {};
                      return (
                        <div className="avoid-break contents" key={room}>
                          <div className="text-center border-t border-r border-slate-300 bg-slate-100 font-medium p-2">
                            {room}
                          </div>
                          {timeOptions.map((slot) => (
                            <div
                              key={slot}
                              className="border-t border-r border-slate-300 p-1 space-y-1 align-top"
                            >
                              {(slots[slot] || []).map((r, i) => (
                                <div
                                  key={i}
                                  className={`rounded p-1 shadow-sm transition duration-150 hover:shadow-md ${batchColorMap[r.batch] || "bg-white"}`}
                                >
                                  <div className="font-semibold text-slate-800">
                                    {r.course_code}-{r.section}
                                    {r.is_lab && r.lab_fixed_time_range ? (
                                      <span className="block text-xs text-gray-600 mt-0.5">
                                        ({r.lab_fixed_time_range})
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="text-gray-500 font-bold text-sm">{r.course_title}</div>
                                  <div className="text-slate-700 text-sm">
                                    {r.is_lab && r.faculty_name_1 && r.faculty_name_2
                                      ? `${r.faculty_name_1} + ${r.faculty_name_2}`
                                      : r.faculty_name}
                                  </div>
                                  <div className="italic text-right text-xs text-slate-600">
                                    {r.batch}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })
                  }

                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default PublicPage;
