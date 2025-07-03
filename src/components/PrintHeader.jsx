import React, { useEffect, useState } from "react";
import logo from "../assets/bup-logo.jpg";
import axios from "../api/axiosInstance";

function PrintHeader() {
  const [semester, setSemester] = useState({});
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    axios.get("/settings").then(res => {
      setSemester(res.data.semester || {});
      setBatches(res.data.batches || []);
    });
  }, []);

  return (
    <div className="hidden print:block text-center mb-6 px-6">
      <img src={logo} alt="BUP Logo" className="mx-auto mb-3 w-16 h-16" />
      <h1 className="text-xl font-bold uppercase tracking-wide mb-1">
        Bangladesh University of Professionals (BUP)
      </h1>
      <h2 className="text-lg font-semibold uppercase mb-1">
        Department of Information and Communication Technology
      </h2>
      <h3 className="text-md font-medium uppercase mb-3">
        Class Routine (Semester: {semester.start_month} {semester.start_year} - {semester.end_month} {semester.end_year})
      </h3>

      <div className="grid grid-cols-6 border border-black text-black text-sm font-semibold">
        {batches.map((batch, idx) => (
          <div key={idx} className={`py-1 border-r border-black bg-${getBgColor(idx)}-100`}>
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
