import React from "react";
import {
  FaPlus,
  FaList,
  FaChalkboardTeacher,
  FaCog,
  FaPowerOff,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Sidebar({ activeTab, setActiveTab, onLogout, onSemesterEnd }) {
  const baseItem =
    "flex items-center w-full px-4 py-3 rounded-lg transition text-sm";
  const activeItem = "bg-indigo-600 text-white shadow";
  const idleItem = "text-slate-700 hover:bg-slate-100";

  const TabButton = ({ tab, icon: Icon, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`${baseItem} ${activeTab === tab ? activeItem : idleItem}`}
      aria-current={activeTab === tab ? "page" : undefined}
    >
      <Icon className="mr-2 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col min-h-screen">
      {/* Brand */}
      <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
        Admin Panel
      </h2>

      {/* Nav group */}
      <div className="space-y-2">
        <TabButton tab="add" icon={FaPlus}>
          Add Routine
        </TabButton>
        <TabButton tab="view" icon={FaList}>
          View All Routines
        </TabButton>
        <TabButton tab="faculties" icon={FaChalkboardTeacher}>
          Manage Faculties
        </TabButton>
        <TabButton tab="courses" icon={FaBook}>
          Create Course
        </TabButton>
        <TabButton tab="settings" icon={FaCog}>
          General Info
        </TabButton>
      </div>

      {/* Public link */}
      <div className="mt-4">
        <Link
          to="/"
          className="flex items-center px-4 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition text-sm"
        >
          <FaGraduationCap className="mr-2" />
          View Class Routine
        </Link>
      </div>

      {/* Footer actions (global) */}
      <div className="mt-auto space-y-2 pt-6">
        <button
          type="button"
          onClick={onSemesterEnd}
          className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition text-sm"
        >
          <span className="inline-flex items-center">
            <FaGraduationCap className="mr-2" /> Semester End
          </span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm"
        >
          <span className="inline-flex items-center">
            <FaPowerOff className="mr-2" /> Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
