import React from "react";
import { FaPlus, FaList, FaChalkboardTeacher, FaCog, FaPowerOff, FaGraduationCap } from "react-icons/fa";
import PublicPage from "../PublicPage";
import { Link } from "react-router-dom";

function Sidebar({ activeTab, setActiveTab, onLogout, onSemesterEnd }) {
    const tabClass = (tab) =>
        `flex items-center px-4 py-3 cursor-pointer rounded-lg transition ${activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
        }`;

    return (
        <div className="w-64 min-h-screen bg-white shadow-md p-4 space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Admin Panel</h2>

            <div onClick={() => setActiveTab("add")} className={tabClass("add")}>
                <FaPlus className="mr-2" /> Add Routine
            </div>
            <div onClick={() => setActiveTab("view")} className={tabClass("view")}>
                <FaList className="mr-2" /> View All Routines
            </div>
            <div onClick={() => setActiveTab("faculties")} className={tabClass("faculties")}>
                <FaChalkboardTeacher className="mr-2" /> Manage Faculties
            </div>
            <div onClick={() => setActiveTab("settings")} className={tabClass("settings")}>
                <FaCog className="mr-2" /> General Info
            </div>
            <Link
                to="/" // Make sure this path matches your route
                className="flex items-center px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-200"
            >
                <FaGraduationCap className="mr-2" />
                View Class Routine
            </Link>
            <div onClick={onSemesterEnd} className="flex items-center px-4 py-3 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer">
                <FaGraduationCap className="mr-2" /> Semester End
            </div>
            <div onClick={onLogout} className="flex items-center px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer mt-8">
                <FaPowerOff className="mr-2" /> Logout
            </div>
        </div>
    );
}

export default Sidebar;
