import React, { useState } from "react";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("add"); // 'add' or 'view'

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-slate-700 mb-6">
        Admin Panel
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-6 py-2 rounded-md text-white font-medium transition ${
            activeTab === "add" ? "bg-indigo-600" : "bg-slate-500"
          }`}
        >
          ➕ Add Routine
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`px-6 py-2 rounded-md text-white font-medium transition ${
            activeTab === "view" ? "bg-indigo-600" : "bg-slate-500"
          }`}
        >
          📋 View All Routines
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 rounded-md shadow-md max-w-5xl mx-auto">
        {activeTab === "add" ? (
          <div className="text-center text-slate-700">
            <p className="text-lg">Routine Form will appear here.</p>
          </div>
        ) : (
          <div className="text-center text-slate-700">
            <p className="text-lg">Routine Table will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
