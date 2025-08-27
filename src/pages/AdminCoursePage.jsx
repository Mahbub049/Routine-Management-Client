import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";
import {
  FaPlus,
  FaSave,
  FaTrash,
  FaEdit,
  FaFlask,
  FaBookOpen,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

function AdminCoursePage() {
  const [course, setCourse] = useState({
    course_code: "",
    course_title: "",
    credit_hour: "",
    is_lab: false,
  });
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // UI controls
  const [tab, setTab] = useState("All"); // All | Theory | Lab
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  // toast helper
  const toast = (title, icon = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true,
    });

  useEffect(() => {
    fetchCourses(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const fetchCourses = async (page = 1, limit = pageSize) => {
    try {
      const res = await axios.get(`/courses?page=${page}&limit=${limit}`);
      const coursesArray = Array.isArray(res.data) ? res.data : res.data.courses;

      // sort by numeric part of code (e.g., ICE-4105)
      const sorted = Array.isArray(coursesArray)
        ? coursesArray.sort((a, b) => {
            const numA = parseInt(a.course_code?.split("-")[1] || "0", 10);
            const numB = parseInt(b.course_code?.split("-")[1] || "0", 10);
            return numA - numB;
          })
        : [];

      setCourses(sorted);
      setTotalCourses(res.data.total || sorted.length);
      setCurrentPage(page);
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
      setCourses([]);
      setTotalCourses(0);
    }
  };

  const resetForm = () =>
    setCourse({
      course_code: "",
      course_title: "",
      credit_hour: "",
      is_lab: false,
    });

  const validate = () => {
    if (!course.course_code.trim()) {
      toast("Course code required", "warning");
      return false;
    }
    if (!course.course_title.trim()) {
      toast("Course title required", "warning");
      return false;
    }
    if (course.credit_hour === "" || Number(course.credit_hour) <= 0) {
      toast("Valid credit hour required", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (editingId) {
        await axios.put(`/courses/${editingId}`, course);
        toast("Course updated");
      } else {
        await axios.post("/courses", course);
        toast("Course added");
      }
      resetForm();
      setEditingId(null);
      fetchCourses(currentPage);
    } catch (err) {
      console.error(err);
      Swal.fire({ title: "Error", text: "Error saving course", icon: "error" });
    }
  };

  const handleEdit = (c) => {
    setCourse({
      course_code: c.course_code,
      course_title: c.course_title,
      credit_hour: c.credit_hour,
      is_lab: c.is_lab,
    });
    setEditingId(c._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete this course?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await axios.delete(`/courses/${id}`);
      toast("Deleted");
      // if last item on page deleted, step back a page
      const nextPage =
        courses.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchCourses(nextPage);
    } catch (err) {
      console.error(err);
      Swal.fire({ title: "Error", text: "Error deleting course", icon: "error" });
    }
  };

  // derived: apply tab + query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesTab =
        tab === "All" ? true : tab === "Theory" ? !c.is_lab : c.is_lab;
      const matchesQuery =
        !q ||
        c.course_code?.toLowerCase().includes(q) ||
        c.course_title?.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [courses, tab, query]);

  // local pagination for filtered list (client-side when searching/tabbing)
  const totalFiltered = filtered.length;
  const totalPages =
    query || tab !== "All"
      ? Math.max(1, Math.ceil(totalFiltered / pageSize))
      : Math.max(1, Math.ceil(totalCourses / pageSize));

  const pageItems = useMemo(() => {
    // If user is filtering or searching, paginate the filtered list client-side.
    if (query || tab !== "All") {
      const start = (currentPage - 1) * pageSize;
      return filtered.slice(start, start + pageSize);
    }
    // Otherwise show the raw page of results from server
    return filtered;
  }, [filtered, query, tab, currentPage, pageSize]);

  const TabButton = ({ label, icon: Icon, value }) => (
    <button
      onClick={() => {
        setTab(value);
        setCurrentPage(1);
      }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition
        ${
          tab === value
            ? "bg-indigo-600 text-white shadow"
            : "bg-white text-slate-700 border hover:bg-slate-50"
        }`}
      type="button"
    >
      <Icon />
      {label}
    </button>
  );

  const badge = (yes) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        yes
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      {yes ? "Lab" : "Theory"}
    </span>
  );

  return (
    <div className="space-y-8">
      {/* Card: Form */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "✏️ Edit Course" : "➕ Add New Course"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Course Code</span>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g., ICE-4105"
              value={course.course_code}
              onChange={(e) =>
                setCourse({ ...course, course_code: e.target.value })
              }
            />
          </label>

          <label className="md:col-span-2 flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Course Title</span>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g., Optical Communication"
              value={course.course_title}
              onChange={(e) =>
                setCourse({ ...course, course_title: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Credit Hour</span>
            <input
              className="border p-2 rounded w-full"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g., 3.0"
              value={course.credit_hour}
              onChange={(e) =>
                setCourse({ ...course, credit_hour: e.target.value })
              }
            />
          </label>
        </div>

        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={course.is_lab}
            onChange={(e) =>
              setCourse({ ...course, is_lab: e.target.checked })
            }
          />
          Is Lab Course?
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            <FaSave />
            {editingId ? "Update Course" : "Add Course"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
            }}
            className="inline-flex items-center gap-2 bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300"
            type="button"
          >
            <FaTimes />
            Clear
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex gap-2">
          <TabButton label="All" value="All" icon={FaBookOpen} />
          <TabButton label="Theory" value="Theory" icon={FaBookOpen} />
          <TabButton label="Lab" value="Lab" icon={FaFlask} />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search code or title..."
              className="pl-9 pr-3 py-2 border rounded w-72"
            />
          </div>

          <select
            className="border rounded px-3 py-2"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
              // refetch when not filtering
              if (!query && tab === "All") fetchCourses(1, Number(e.target.value));
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left border-b">Code</th>
                <th className="px-3 py-2 text-left border-b">Title</th>
                <th className="px-3 py-2 text-left border-b">Credit</th>
                <th className="px-3 py-2 text-left border-b">Type</th>
                <th className="px-3 py-2 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border-b font-medium">{c.course_code}</td>
                    <td className="px-3 py-2 border-b">{c.course_title}</td>
                    <td className="px-3 py-2 border-b">{c.credit_hour}</td>
                    <td className="px-3 py-2 border-b">{badge(!!c.is_lab)}</td>
                    <td className="px-3 py-2 border-b">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-xs text-slate-500">
            Showing{" "}
            {pageItems.length > 0
              ? (currentPage - 1) * pageSize + 1
              : 0}{" "}
            – {(currentPage - 1) * pageSize + pageItems.length} of{" "}
            {query || tab !== "All" ? totalFiltered : totalCourses}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prev = Math.max(1, currentPage - 1);
                setCurrentPage(prev);
                if (!query && tab === "All") fetchCourses(prev);
              }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                setCurrentPage(next);
                if (!query && tab === "All") fetchCourses(next);
              }}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCoursePage;
