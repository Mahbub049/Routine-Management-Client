import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function PrintHeader() {
  const [settings, setSettings] = useState({});
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    axios.get("/public-settings").then(res => {
      setSettings(res.data || {});
      setBatches(res.data.batches || []);
    });
  }, []);

  const bgColorClasses = [
    "bg-indigo-100",
    "bg-red-100",
    "bg-orange-100",
    "bg-amber-100",
    "bg-green-100",
    "bg-blue-100",
  ];

  return (
    <div className="hidden print:block text-center mb-6 px-6">
      {settings.logo_url && (
        <img src={settings.logo_url} alt="University Logo" className="mx-auto mb-3 w-16 h-16" />
      )}
      <h1 className="text-xl font-bold uppercase tracking-wide mb-1">
        {settings.university_name || "University Name"}
      </h1>
      <h2 className="text-lg font-semibold uppercase mb-1">
        {settings.department_name || "Department Name"}
      </h2>
      <h3 className="text-md font-medium uppercase mb-3">
        Class Routine ({settings.term_type || "Semester"}: {settings.semester?.start_month} {settings.semester?.start_year} - {settings.semester?.end_month} {settings.semester?.end_year})
      </h3>

      {/* ✅ Colored Batch Row */}
      <div
        className={`grid border border-black text-black text-sm font-semibold`}
        style={{ gridTemplateColumns: `repeat(${batches.length}, minmax(0, 1fr))` }}
      >
        {batches.map((batch, idx) => (
          <div
            key={idx}
            className={`py-1 border-r border-black text-center ${bgColorClasses[idx % bgColorClasses.length]}`}
          >
            {batch}
          </div>
        ))}
      </div>


    </div>
  );
}

const getBgColor = (index) => {
  const colors = ["indigo", "red", "orange", "amber", "green", "blue"];
  return colors[index % colors.length];
};

export default PrintHeader;
