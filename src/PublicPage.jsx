import React, { useEffect, useState } from "react";
import axios from "./api/axiosInstance";
import PrintHeader from "./components/PrintHeader"; // adjust path if needed
import Footer from "./components/Footer";


function PublicPage() {
  const [filters, setFilters] = useState({ day: "", faculty: "", batch: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState([]);

  const timeOptions = [
    "08:30-10:00",
    "10:15-11:45",
    "12:00-13:30",
    "14:00-15:30",
    "15:45-17:15"
  ];

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

  //   const PrintHeader = () => (
  //   <div className="print-header print:block hidden text-center mb-4">
  //     <div style={{ fontSize: "16px", fontWeight: "bold" }}>BANGLADESH UNIVERSITY OF PROFESSIONALS (BUP)</div>
  //     <div style={{ fontSize: "14px" }}>DEPARTMENT OF ICT</div>
  //     <div style={{ fontSize: "13px" }}>CLASS ROUTINE (JULY–DECEMBER 2025)</div>
  //   </div>
  // );


  const batchColorMap = {
    "MICE-2024": "bg-indigo-100",
    "BICE-2021": "bg-red-100",
    "BICE-2022": "bg-orange-100",
    "BICE-2023": "bg-amber-100",
    "BICE-2024": "bg-green-100",
    "BICE-2025": "bg-blue-100"
  };

  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];


  return (
    <div className="container mx-auto mont">
      {/* Navbar */}
      <div className="navbar bg-indigo-600 rounded-b-lg shadow-md justify-center print:hidden px-4 py-3">
        <a className="text-white text-2xl font-semibold tracking-wide">Class Routine Management System</a>
      </div>

      {/* Filters + Print Button in Same Row */}
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
              <option>BICE-2021</option>
              <option>BICE-2022</option>
              <option>BICE-2023</option>
              <option>BICE-2024</option>
              <option>BICE-2025</option>
              <option>MICE-2024</option>
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

                  {/* Rows per room */}
                  {Object.entries(rooms)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([room, slots]) => (
                      <React.Fragment key={room}>
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
                      </React.Fragment>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>
      <Footer />
    </div>
  );
}

export default PublicPage;
