import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaBook,
  FaDoorOpen,
  FaUsers,
  FaLayerGroup,
  FaPlus,
  FaList,
  FaCog,
} from "react-icons/fa";

function StatCard({ title, value, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
    >
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
      </div>
      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-100">
        <Icon />
      </div>
    </button>
  );
}

export default function AdminDashboard({ setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [routines, setRoutines] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [settings, setSettings] = useState({
    classrooms: [],
    batches: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [rRes, fRes, cRes, sRes] = await Promise.all([
          axios.get("/routines"),
          axios.get("/faculties"),
          // use /courses/all so we can count easily
          axios.get("/courses/all"),
          axios.get("/public-settings"),
        ]);
        if (!mounted) return;
        setRoutines(Array.isArray(rRes.data) ? rRes.data : []);
        setFaculties(Array.isArray(fRes.data) ? fRes.data : []);
        setCourses(Array.isArray(cRes.data) ? cRes.data : []);
        setSettings({
          classrooms: sRes.data?.classrooms || [],
          batches: sRes.data?.batches || [],
        });
      } catch (e) {
        console.error(e);
        setErr("Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(
    () => ({
      totalRoutines: routines.length,
      totalFaculties: faculties.length,
      totalCourses: courses.length,
      totalRooms: settings.classrooms.length,
      totalBatches: settings.batches.length,
    }),
    [routines, faculties, courses, settings]
  );

  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const dayCounts = useMemo(() => {
    const m = Object.fromEntries(dayOrder.map((d) => [d, 0]));
    routines.forEach((r) => {
      if (m[r.day] !== undefined) m[r.day] += 1;
    });
    return m;
  }, [routines]);

  const maxPerDay = Math.max(1, ...Object.values(dayCounts));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 text-sm">
            Quick snapshot and shortcuts for your routine management.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("add")}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
          >
            <FaPlus /> Add Routine
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-white hover:bg-slate-800"
          >
            <FaList /> View Routines
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Routines"
          value={metrics.totalRoutines}
          icon={FaCalendarAlt}
          onClick={() => setActiveTab("view")}
        />
        <StatCard
          title="Faculties"
          value={metrics.totalFaculties}
          icon={FaChalkboardTeacher}
          onClick={() => setActiveTab("faculties")}
        />
        <StatCard
          title="Courses"
          value={metrics.totalCourses}
          icon={FaBook}
          onClick={() => setActiveTab("courses")}
        />
        <StatCard
          title="Classrooms"
          value={metrics.totalRooms}
          icon={FaDoorOpen}
          onClick={() => setActiveTab("settings")}
        />
        <StatCard
          title="Batches"
          value={metrics.totalBatches}
          icon={FaUsers}
          onClick={() => setActiveTab("settings")}
        />
      </div>

      {/* Two columns: distribution + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Load distribution by day */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Load by Day</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 rounded" />
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
            </div>
          ) : (
            <ul className="space-y-3">
              {dayOrder.map((d) => (
                <li key={d}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{d}</span>
                    <span className="text-slate-800 font-medium">{dayCounts[d]}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded bg-slate-100">
                    <div
                      className="h-2 rounded bg-indigo-500"
                      style={{
                        width: `${(dayCounts[d] / maxPerDay) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setActiveTab("add")}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-slate-50"
            >
              <span className="rounded-md bg-indigo-50 p-2 text-indigo-600">
                <FaPlus />
              </span>
              <div>
                <div className="font-medium text-slate-800">Add New Routine</div>
                <div className="text-sm text-slate-500">Create a class or lab schedule</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("view")}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-slate-50"
            >
              <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                <FaList />
              </span>
              <div>
                <div className="font-medium text-slate-800">View All Routines</div>
                <div className="text-sm text-slate-500">Edit or delete existing entries</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("courses")}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-slate-50"
            >
              <span className="rounded-md bg-blue-50 p-2 text-blue-600">
                <FaBook />
              </span>
              <div>
                <div className="font-medium text-slate-800">Manage Courses</div>
                <div className="text-sm text-slate-500">Theory & lab courses</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("faculties")}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-slate-50"
            >
              <span className="rounded-md bg-emerald-50 p-2 text-emerald-600">
                <FaChalkboardTeacher />
              </span>
              <div>
                <div className="font-medium text-slate-800">Manage Faculties</div>
                <div className="text-sm text-slate-500">Internal / External</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-slate-50"
            >
              <span className="rounded-md bg-slate-50 p-2 text-slate-700">
                <FaCog />
              </span>
              <div>
                <div className="font-medium text-slate-800">Settings</div>
                <div className="text-sm text-slate-500">Semester, batches, rooms & logo</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
          {err}
        </div>
      )}
    </div>
  );
}
