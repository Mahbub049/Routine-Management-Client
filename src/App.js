import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [filters, setFilters] = useState({
    day: "",
    faculty: "",
    batch: "",
    time: ""
  });

  function convertTo12HourRange(range) {
    const [start, end] = range.split("-");
    return `${to12Hour(start)} - ${to12Hour(end)}`;
  }
  
  function to12Hour(time) {
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    const minutes = minuteStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  }  

  const timeOptions = [
    "08:30-10:00",
    "10:15-11:45",
    "12:00-13:30",
    "14:00-15:30",
    "15:45-17:15"
  ];  

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
  
  const groupedRoutines = routines.reduce((acc, routine) => {
    if (!acc[routine.day]) {
      acc[routine.day] = [];
    }
    acc[routine.day].push(routine);
    return acc;
  }, {});
  
  const batchColorMap = {
    "MICE-2024": "bg-indigo-100",
    "BICE-2021": "bg-red-100",
    "BICE-2022": "bg-orange-100",
    "BICE-2023": "bg-amber-100",
    "BICE-2024": "bg-green-100",
    "BICE-2025": "bg-blue-100"
  };
  
  return (
    <div className="container mx-auto mont">
      <div className="navbar bg-blue-300 rounded-b-lg shadow-sm justify-center">
  <a className="btn btn-ghost lg:text-2xl font-bold"> <p className="">Class Routine Management System</p></a>
</div>

      {/* Filter Inputs */}
      <div className="mx-6 mt-8 grid grid-cols-1 lg:grid-cols-5 lg:gap-4 lg:ml-8 mb-8 align-center" >
        <label className="flex items-center gap-2">
          Day:
          <select value={filters.day} className="p-2 shadow w-full menu dropdown-content z-[1] bg-base-100 mt-4 lg:mt-0" onChange={(e) => setFilters({ ...filters, day: e.target.value })}>
            <option value="">All</option>
            <option>Sunday</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
          </select>
        </label>

        <label className="flex items-center gap-2 mt-4 lg:mt-0">
          Faculty:
          <input
            className="input w-full input-bordered border-gray-200"
            placeholder="e.g., Kabir"
            onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2">
  Batch:
  <select value={filters.batch} className="p-2 shadow menu w-full dropdown-content z-[1] bg-base-100 mt-4 lg:mt-0" onChange={(e) => setFilters({ ...filters, batch: e.target.value })}>
    <option value="">All</option>
    <option>BICE-2021</option>
    <option>BICE-2022</option>
    <option>BICE-2023</option>
    <option>BICE-2024</option>
    <option>BICE-2025</option>
    <option>MICE-2024</option>
  </select>
</label>


<label className="flex items-center gap-2" >
  Time:
  <select value={filters.time} className="p-2 shadow menu w-full dropdown-content z-[1] bg-base-100 mt-4 lg:mt-0" onChange={(e) => setFilters({ ...filters, time: e.target.value })}>
    <option value="">All</option>
    <option className="bg-green-500" value="08:30-10:00">08:30AM-10:00AM</option>
    <option  className="bg-green-500" value="12:00-13:30">12:00PM-01:30PM</option>
    <option  className="bg-green-500" value="10:15-11:45">10:15AM-11:45AM</option>
    <option  className="bg-green-500" value="14:00-15:30">02:00PM-03:30PM</option>
    <option className="bg-green-500" value="15:45-17:15">03:45PM-05:15PM</option>
    <option className="bg-indigo-300" value="08:00-10:00">08:00AM-10:00AM</option>
    <option className="bg-indigo-300" value="08:00-11:00">08:00AM-11:00AM</option>
    <option className="bg-indigo-300" value="08:30-11:30">08:30AM-11:30AM</option>
    <option className="bg-indigo-300" value="10:00-13:00">10:00AM-01:00PM</option>
    <option className="bg-indigo-300" value="10:10-13:00">10:10AM-01:00PM</option>
    {/* <option className="bg-indigo-300" value="10:10-13:45">10:10AM-01:45PM</option> */}
    <option className="bg-indigo-300" value="11:00-14:00">11:00AM-02:00PM</option>
    <option className="bg-indigo-300" value="12:00-14:00">12:00PM-02:00PM</option>
    <option className="bg-indigo-300" value="12:00-15:00">12:00PM-03:00PM</option>
    <option className="bg-indigo-300" value="12:30-15:30">12:30PM-03:30PM</option>
    <option className="bg-indigo-300" value="13:00-15:50">01:00PM-03:50PM</option>
    <option className="bg-indigo-300" value="14:00-16:00">02:00PM-04:00PM</option>
    <option className="bg-indigo-300" value="14:00-17:00">02:00PM-05:00PM</option>
    <option className="bg-indigo-300" value="14:30-16:00">02:30PM-04:00PM</option>
    <option className="bg-indigo-300" value="14:30-17:30">02:30PM-05:30PM</option>
    <option className="bg-indigo-300" value="15:30-17:30">03:30PM-04:30PM</option>
    <option className="bg-green-500" value="16:00-17:30">04:00PM-05:30PM</option>
  </select>
</label>

        <button className="btn bg-blue-400"
  onClick={() =>
    setFilters({ day: "", faculty: "", batch: "", time: "" })
  }
>
  Reset Filters
</button>

      </div>

      {/* Table Display */}
<div className="mx-6 lg:mx-0" style={{ overflowX: "auto" }}>
{loading && <div className="flex justify-center"><p className="loading loading-spinner loading-lg"></p></div>}

{!loading && <table className="table font-medium" border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Room</th>
            <th>Section</th>
            <th>Course</th>
            <th>Faculty</th>
            <th>Batch</th>
          </tr>
        </thead>
        <tbody>
  {Object.entries(groupedRoutines).map(([day, dayRoutines]) =>
    dayRoutines.map((routine, index) => (
      <tr key={routine._id || index} className="border-b-2 border-blue-300">
        {/* Show day only for the first row in the group */}
        {index === 0 && (
          <td rowSpan={dayRoutines.length}>{day}</td>
        )}
        {/* Skip day cell for the rest */}
        <td className={batchColorMap[routine.batch] || ""}>{convertTo12HourRange(routine.time_range)}</td>
        <td className={batchColorMap[routine.batch] || ""}>{routine.room}</td>
        <td className={batchColorMap[routine.batch] || ""}>{routine.section}</td>
        <td className={batchColorMap[routine.batch] || ""}>{routine.course_code} - {routine.course_title}</td>
        <td className={batchColorMap[routine.batch] || ""}>{routine.faculty_name}</td>
        <td className={batchColorMap[routine.batch] || ""}>{routine.batch}</td>
      </tr>
    ))
  )}
</tbody>

      </table>}
</div>
    </div>
  );
}

export default App;
