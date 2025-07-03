import React, { useState } from "react";
import AdminForm from "../components/AdminForm";
import RoutineTable from "../components/RoutineTable";
import { Link } from "react-router-dom";
import AdminFacultyPage from "./AdminFacultyPage"; // Adjust path if needed


function AdminPage() {
    const [activeTab, setActiveTab] = useState("add");
    const [editingRoutine, setEditingRoutine] = useState(null); // ← NEW

    const handleEdit = (routine) => {
        setEditingRoutine(routine);
        setActiveTab("add");
    };

    const clearEditing = () => setEditingRoutine(null);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-center text-slate-700 mb-6">Admin Panel</h1>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => { setActiveTab("add"); clearEditing(); }}
                    className={`px-6 py-2 rounded-md text-white font-medium transition ${activeTab === "add" ? "bg-indigo-600" : "bg-slate-500"}`}
                >
                    ➕ Add Routine
                </button>
                <button
                    onClick={() => setActiveTab("view")}
                    className={`px-6 py-2 rounded-md text-white font-medium transition ${activeTab === "view" ? "bg-indigo-600" : "bg-slate-500"}`}
                >
                    📋 View All Routines
                </button>
                <button
                    onClick={() => setActiveTab("faculties")}
                    className={`px-6 py-2 rounded-md text-white font-medium transition ${activeTab === "faculties" ? "bg-indigo-600" : "bg-slate-500"}`}
                >
                    🧑‍🏫 Manage Faculties
                </button>


            </div>

            {/* Content Area */}
            <div className="bg-white p-6 rounded-md shadow-md max-w-7xl mx-auto">
                {activeTab === "add" && (
                    <>
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">
                            {editingRoutine ? "Edit Routine" : "Add New Routine"}
                        </h2>
                        <AdminForm
                            onSuccess={() => setActiveTab("view")}
                            editingData={editingRoutine}
                            clearEdit={clearEditing}
                        />
                    </>
                )}

                {activeTab === "view" && (
                    <>
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">All Routines</h2>
                        <RoutineTable onEdit={handleEdit} refreshKey={editingRoutine ? editingRoutine._id : "new"} />
                    </>
                )}

                {activeTab === "faculties" && (
                    <>
                        {/* <h2 className="text-xl font-semibold text-slate-700 mb-4">Manage Faculties</h2> */}
                        <AdminFacultyPage />
                    </>
                )}

            </div>
        </div>
    );
}

export default AdminPage;
