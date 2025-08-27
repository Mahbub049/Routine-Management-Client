import React, { useState } from "react";
import AdminForm from "../components/AdminForm";
import RoutineTable from "../components/RoutineTable";
import AdminFacultyPage from "./AdminFacultyPage";
import SettingsPage from "./SettingsPage";
import Sidebar from "../components/Sidebar";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";
import AdminCoursePage from "./AdminCoursePage";
import AdminDashboard from "./AdminDashboard";

function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard"); // ⬅️ start on dashboard
  const [editingRoutine, setEditingRoutine] = useState(null);

  const handleEdit = (routine) => {
    setEditingRoutine(routine);
    setActiveTab("add");
  };

  const clearEditing = () => setEditingRoutine(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  const handleSemesterEnd = async () => {
    const result = await Swal.fire({
      title: "End Semester?",
      text: "All routine data will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete("/routines", {
          headers: { Authorization: `Bearer ${token}` },
        });

        await Swal.fire({
          title: "Cleared!",
          text: "All routines have been deleted.",
          icon: "success",
        });

        window.location.reload();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Error",
          text: "Failed to end semester. Try again.",
          icon: "error",
        });
      }
    }
  };

  const handleFormSuccess = () => {
    // optional: refresh routines silently if you keep some cache
  };

  const title =
    activeTab === "dashboard"
      ? "Dashboard"
      : activeTab === "add"
      ? editingRoutine
        ? "Edit Routine"
        : "Add New Routine"
      : activeTab === "view"
      ? "All Routines"
      : activeTab === "faculties"
      ? "Faculty Management"
      : activeTab === "courses"
      ? "Course Management"
      : "Settings";

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSemesterEnd={handleSemesterEnd}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-700">{title}</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSemesterEnd}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              End Semester
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-600 text-white rounded-md hover:bg-slate-700 text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            {activeTab === "dashboard" && (
              <AdminDashboard setActiveTab={setActiveTab} />
            )}

            {activeTab === "add" && (
              <AdminForm
                onSuccess={handleFormSuccess}
                editingData={editingRoutine}
                clearEdit={clearEditing}
              />
            )}

            {activeTab === "view" && (
              <RoutineTable
                onEdit={handleEdit}
                refreshKey={editingRoutine ? editingRoutine._id : "new"}
              />
            )}

            {activeTab === "faculties" && <AdminFacultyPage />}
            {activeTab === "courses" && <AdminCoursePage />}
            {activeTab === "settings" && <SettingsPage />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
