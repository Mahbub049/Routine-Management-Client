import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";
import {
  FaUsers,
  FaUserTie,
  FaUniversity,
  FaEnvelope,
  FaPhone,
  FaSearch,
  FaSave,
  FaUndo,
  FaTimes,
  FaEdit,
  FaTrash,
  FaFilter,
} from "react-icons/fa";

const initialForm = {
  name: "",
  designation: "",
  type: "Internal",
  email: "",
  phone: "",
  department: "",
};

function AdminFacultyPage() {
  const [form, setForm] = useState(initialForm);
  const [faculties, setFaculties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState("All"); // All | Internal | External
  const [search, setSearch] = useState("");

  // toast helper (top-right)
  const toast = (title, icon = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 1700,
      timerProgressBar: true,
    });

  const fetchFaculties = async () => {
    const res = await axios.get("/faculties");
    setFaculties(res.data || []);
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(initialForm);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.designation || !form.type) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Name, Designation, and Type are required.",
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/faculties/${editingId}`, form);
        toast("Faculty updated!");
      } else {
        await axios.post("/faculties", form);
        toast("Faculty added!");
      }
      resetForm();
      setEditingId(null);
      fetchFaculties();
    } catch (err) {
      console.error(err);
      toast("Operation failed", "error");
    }
  };

  const handleEdit = (faculty) => {
    const { _id, ...editable } = faculty;
    setForm(editable);
    setEditingId(faculty._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete this faculty?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await axios.delete(`/faculties/${id}`);
      toast("Deleted");
      fetchFaculties();
    } catch (err) {
      console.error(err);
      toast("Delete failed", "error");
    }
  };

  const counts = useMemo(() => {
    const internal = faculties.filter((f) => f.type === "Internal").length;
    const external = faculties.filter((f) => f.type === "External").length;
    return { internal, external, all: faculties.length };
  }, [faculties]);

  // filtered + searched list
  const filteredFaculties = useMemo(() => {
    let list = faculties;
    if (filterType !== "All") list = list.filter((f) => f.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.department?.toLowerCase().includes(q) ||
          f.designation?.toLowerCase().includes(q) ||
          f.email?.toLowerCase().includes(q) ||
          f.phone?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [faculties, filterType, search]);

  const SegButton = ({ val, label, count }) => {
    const active = filterType === val;
    return (
      <button
        type="button"
        onClick={() => setFilterType(val)}
        className={[
          "px-3 py-1.5 rounded-md text-sm border transition",
          active
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
        ].join(" ")}
        aria-pressed={active}
      >
        {label} <span className="ml-2 text-xs opacity-80">({count})</span>
      </button>
    );
  };

  const Badge = ({ children, tone = "indigo" }) => {
    const tones = {
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
      slate: "bg-slate-50 text-slate-700 border-slate-200",
      amber: "bg-amber-50 text-amber-800 border-amber-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${tones[tone]}`}
      >
        {children}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ===== Top summary cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <FaUsers />
          </div>
          <div>
            <div className="text-xs text-slate-500">All Faculties</div>
            <div className="text-xl font-semibold text-slate-800">{counts.all}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <FaUserTie />
          </div>
          <div>
            <div className="text-xs text-slate-500">Internal</div>
            <div className="text-xl font-semibold text-slate-800">{counts.internal}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <FaUniversity />
          </div>
          <div>
            <div className="text-xs text-slate-500">External</div>
            <div className="text-xl font-semibold text-slate-800">{counts.external}</div>
          </div>
        </div>
      </div>

      {/* ===== Form card ===== */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? "Edit Faculty" : "Add New Faculty"}
          </h2>
          {editingId && (
            <Badge tone="amber">Editing mode</Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Full Name *</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded-md p-2"
              placeholder="e.g., Dr. Jane Doe"
              required
            />
          </label>

          {/* Designation */}
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Designation *</span>
            <select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="border rounded-md p-2"
              required
            >
              <option value="">-- Select Designation --</option>
              <option>Lecturer</option>
              <option>Assistant Professor</option>
              <option>Associate Professor</option>
              <option>Professor</option>
              <option>Colonel</option>
            </select>
          </label>

          {/* Type */}
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Faculty Type *</span>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border rounded-md p-2"
              required
            >
              <option>Internal</option>
              <option>External</option>
            </select>
          </label>

          {/* Department */}
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Department</span>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              className="border rounded-md p-2"
              placeholder="e.g., ICE"
            />
          </label>

          {/* Email */}
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border rounded-md p-2"
              placeholder="name@example.com"
            />
          </label>

          {/* Phone */}
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Phone</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border rounded-md p-2"
              placeholder="+8801XXXXXXXXX"
            />
          </label>

          {/* Actions */}
          <div className="md:col-span-2 mt-2 flex items-center justify-between gap-3">
            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                <FaSave /> {editingId ? "Update Faculty" : "Add Faculty"}
              </button>
              {!editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300"
                >
                  <FaUndo /> Reset
                </button>
              )}
            </div>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                }}
                className="inline-flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600"
              >
                <FaTimes /> Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ===== Filters & search ===== */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Segmented filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm inline-flex items-center gap-2">
              <FaFilter /> Filter:
            </span>
            <div className="inline-flex items-center gap-2">
              <SegButton val="All" label="All" count={counts.all} />
              <SegButton val="Internal" label="Internal" count={counts.internal} />
              <SegButton val="External" label="External" count={counts.external} />
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="pl-9 pr-9 border rounded-md p-2 w-full"
              placeholder="Search name / department / email / phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left border-b">Name</th>
                <th className="px-3 py-2 text-left border-b">Designation</th>
                <th className="px-3 py-2 text-left border-b">Type</th>
                <th className="px-3 py-2 text-left border-b">Email</th>
                <th className="px-3 py-2 text-left border-b">Phone</th>
                <th className="px-3 py-2 text-left border-b">Dept.</th>
                <th className="px-3 py-2 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No faculties found.
                  </td>
                </tr>
              ) : (
                filteredFaculties.map((fac, idx) => (
                  <tr
                    key={fac._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-3 py-2 border-b">
                      <div className="font-medium text-slate-800">{fac.name}</div>
                    </td>
                    <td className="px-3 py-2 border-b">{fac.designation}</td>
                    <td className="px-3 py-2 border-b">
                      <Badge tone={fac.type === "Internal" ? "emerald" : "amber"}>
                        {fac.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 border-b">
                      {fac.email ? (
                        <a
                          href={`mailto:${fac.email}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                          title={fac.email}
                        >
                          <FaEnvelope /> <span className="truncate">{fac.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b">
                      {fac.phone ? (
                        <a
                          href={`tel:${fac.phone}`}
                          className="inline-flex items-center gap-1 text-slate-700 hover:underline"
                          title={fac.phone}
                        >
                          <FaPhone /> <span className="truncate">{fac.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b">{fac.department || <span className="text-slate-400">—</span>}</td>
                    <td className="px-3 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(fac)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500"
                          title="Edit"
                        >
                          <FaEdit /> <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(fac._id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          title="Delete"
                        >
                          <FaTrash /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminFacultyPage;
