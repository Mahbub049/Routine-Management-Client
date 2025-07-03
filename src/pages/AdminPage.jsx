import React, { useState } from "react";
import AdminForm from "../components/AdminForm";
import RoutineTable from "../components/RoutineTable";
import AdminFacultyPage from "./AdminFacultyPage";
import SettingsPage from "./SettingsPage";
import Sidebar from "../components/Sidebar";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";

function AdminPage() {
    const [activeTab, setActiveTab] = useState("add");
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
            title: "Are you sure?",
            text: "You won't be able to revert this! All routine data will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, end semester!"
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("adminToken");
                await axios.delete("/routines", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                await Swal.fire({
                    title: "Deleted!",
                    text: "All routines have been deleted. Semester ended.",
                    icon: "success",
                });

                window.location.reload();
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to end semester.",
                    icon: "error",
                });
            }
        }
    };

    return (
        <div className="flex bg-slate-100 min-h-screen">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                onSemesterEnd={handleSemesterEnd}
            />

            <main className="flex-1 p-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {activeTab === "add" && (
                        <>
                            <h2 className="text-2xl font-semibold text-slate-700 mb-4">
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
                            <h2 className="text-2xl font-semibold text-slate-700 mb-4">All Routines</h2>
                            <RoutineTable onEdit={handleEdit} refreshKey={editingRoutine ? editingRoutine._id : "new"} />
                        </>
                    )}

                    {activeTab === "faculties" && <AdminFacultyPage />}

                    {activeTab === "settings" && <SettingsPage />}
                </div>
            </main>
        </div>
    );
}

export default AdminPage;
