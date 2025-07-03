// src/components/PrintHeader.jsx
import React from "react";
import logo from "../assets/bup-logo.jpg"; // ✅ adjust path if needed

function PrintHeader() {
  return (
    <div className="hidden print:block text-center mb-6 px-6">
      {/* BUP Logo */}
      <img src={logo} alt="BUP Logo" className="mx-auto mb-3 w-16 h-16" />

      {/* University Titles */}
      <h1 className="text-xl font-bold uppercase tracking-wide mb-1">
        Bangladesh University of Professionals (BUP)
      </h1>
      <h2 className="text-lg font-semibold uppercase mb-1">
        Department of Information and Communication Technology
      </h2>
      <h3 className="text-md font-medium uppercase mb-3">
        Class Routine (Semester: July - Dec 2025)
      </h3>

      {/* Colored Batch Labels Row */}
      <div className="grid grid-cols-6 border border-black text-black text-sm font-semibold">
        <div className="bg-indigo-100 py-1 border-r border-black">MICE-2024</div>
        <div className="bg-red-100 py-1 border-r border-black">BICE-2021</div>
        <div className="bg-orange-100 py-1 border-r border-black">BICE-2022</div>
        <div className="bg-amber-100 py-1 border-r border-black">BICE-2023</div>
        <div className="bg-green-100 text-black py-1">BICE-2024</div>
        <div className="bg-blue-100 text-black py-1">BICE-2025</div>
      </div>
    </div>
  );
}

export default PrintHeader;