import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [filters, setFilters] = useState({
    day: "",
    faculty: "",
    batch: "",
    time: ""
  });

  const [loading, setLoading] = useState(false);

  const [routines, setRoutines] = useState([]);

  // Fetch filtered data when filters change
  useEffect(() => {
    const query = Object.entries(filters)
      .filter(([_, val]) => val)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");
  
    setLoading(true);
    axios
      .get(`https://routine-management-server.onrender.com/routines?${query}`)
      .then((res) => setRoutines(res.data))
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
  }, [filters]);
  
  const sortedRoutines = [...routines].sort((a, b) =>
    a.time_range.localeCompare(b.time_range)
  );
  

  return (
    <div className="container mx-auto" style={{ padding: "20px", fontFamily: "Arial" }}>
      <div className="navbar bg-base-100 shadow-sm">
  <a className="btn btn-ghost text-2xl font-bold">📅 Routine Filter System</a>
</div>

      {/* Filter Inputs */}
      <div className="mt-8 grid grid-cols-5 gap-4 ml-8" style={{ marginBottom: "20px" }}>
        <label className="flex items-center gap-2">
          Day:
          <select className="p-2 shadow w-full max-w-xs menu dropdown-content z-[1] bg-base-100" onChange={(e) => setFilters({ ...filters, day: e.target.value })}>
            <option value="">All</option>
            <option>Sunday</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
          </select>
        </label>

        <label className="flex items-center gap-2" style={{ marginLeft: "10px" }}>
          Faculty:
          <input
            className="input w-full max-w-xs"
            placeholder="e.g., Kabir"
            onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2" style={{ marginLeft: "10px" }}>
  Batch:
  <select className="p-2 shadow menu w-full max-w-xs dropdown-content z-[1] bg-base-100" onChange={(e) => setFilters({ ...filters, batch: e.target.value })}>
    <option value="">All</option>
    <option>BICE-2021</option>
    <option>BICE-2022</option>
    <option>BICE-2023</option>
    <option>BICE-2024</option>
    <option>BICE-2025</option>
    <option>MICE-2024</option>
  </select>
</label>


<label className="flex items-center gap-2" style={{ marginLeft: "10px" }}>
  Time:
  <select className="p-2 shadow menu w-full max-w-xs dropdown-content z-[1] bg-base-100" onChange={(e) => setFilters({ ...filters, time: e.target.value })}>
    <option value="">All</option>
    <option>08:30-10:00</option>
    <option>10:15-11:45</option>
    <option>12:00-13:30</option>
    <option>14:00-15:30</option>
    <option>15:45-17:15</option>
  </select>
</label>

        <button
  style={{ marginLeft: "10px" }}
  onClick={() =>
    setFilters({ day: "", faculty: "", batch: "", time: "" })
  }
>
  Reset Filters
</button>

      </div>

      {/* Table Display */}
<div style={{ overflowX: "auto" }}>
{loading && <p className="loading loading-spinner loading-lg text-center"></p>}

<table className="table" border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Room</th>
            <th>Course</th>
            <th>Faculty</th>
            <th>Batch</th>
          </tr>
        </thead>
        <tbody>
  {sortedRoutines.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: "center" }}>
        No data found
      </td>
    </tr>
  ) : (
    sortedRoutines.map((r, i) => (
      <tr key={i}>
        <td>{r.day}</td>
        <td>{r.time_range}</td>
        <td>{r.room}</td>
        <td>{r.course_code} - {r.course_title}</td>
        <td>{r.faculty_name}</td>
        <td>{r.batch}</td>
      </tr>
    ))
  )}
</tbody>

      </table>
</div>
    </div>
  );
}

export default App;
