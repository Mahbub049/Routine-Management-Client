import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";

function AdminCoursePage() {
    const [course, setCourse] = useState({
        course_code: "",
        course_title: "",
        credit_hour: "",
        is_lab: false,
    });
    const [courses, setCourses] = useState([]); // ✅ NOT null or object

    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const coursesPerPage = 10;


    // Fetch all courses
    useEffect(() => {
        fetchCourses();
        console.log("courses:", courses);
    }, []);

    const fetchCourses = async (page = 1) => {
        try {
            const res = await axios.get(`/courses?page=${page}&limit=${coursesPerPage}`);
            const coursesArray = Array.isArray(res.data) ? res.data : res.data.courses;

            const sorted = Array.isArray(coursesArray)
                ? coursesArray.sort((a, b) => {
                    const numA = parseInt(a.course_code?.split("-")[1] || "0");
                    const numB = parseInt(b.course_code?.split("-")[1] || "0");
                    return numA - numB;
                })
                : [];

            setCourses(sorted);
            setTotalCourses(res.data.total || sorted.length); // fallback if no total
            setCurrentPage(page);
        } catch (err) {
            console.error("❌ Error fetching courses:", err);
            setCourses([]);
        }
    };





    const handleSubmit = async () => {
        try {
            if (editingId) {
                await axios.put(`/courses/${editingId}`, course);
                // alert("Course updated!");
            } else {
                await axios.post("/courses", course);
                // alert("Course added!");
            }

            setCourse({
                course_code: "",
                course_title: "",
                credit_hour: "",
                is_lab: false,
            });
            setEditingId(null);
            fetchCourses(1);

        } catch (err) {
            Swal.fire({
                title: "Error!",
                text: "Error saving course",
                icon: "error",
            });
            console.error(err);
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
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await axios.delete(`/courses/${id}`);
            fetchCourses(1);

        } catch (err) {
            alert("Error deleting course");
            Swal.fire({
                title: "Error!",
                text: "Error deleting course",
                icon: "error",
            });
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
                {editingId ? "✏️ Edit Course" : "➕ Add New Course"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    className="border p-2 rounded w-full"
                    placeholder="Course Code"
                    value={course.course_code}
                    onChange={(e) =>
                        setCourse({ ...course, course_code: e.target.value })
                    }
                />
                <input
                    className="border p-2 rounded w-full"
                    placeholder="Course Title"
                    value={course.course_title}
                    onChange={(e) =>
                        setCourse({ ...course, course_title: e.target.value })
                    }
                />
                <input
                    className="border p-2 rounded w-full"
                    type="number"
                    placeholder="Credit Hour"
                    value={course.credit_hour}
                    onChange={(e) =>
                        setCourse({ ...course, credit_hour: e.target.value })
                    }
                />
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

            <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                {editingId ? "Update Course" : "Add Course"}
            </button>

            {/* Table Section */}
            <h3 className="text-lg font-semibold mt-10 mb-4">📋 All Courses</h3>
            <table className="min-w-full border border-gray-300 text-left">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border">Code</th>
                        <th className="p-2 border">Title</th>
                        <th className="p-2 border">Credit</th>
                        <th className="p-2 border">Is Lab?</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-100">
                            <td className="p-2 border">{c.course_code}</td>
                            <td className="p-2 border">{c.course_title}</td>
                            <td className="p-2 border">{c.credit_hour}</td>
                            <td className="p-2 border">
                                {c.is_lab ? "Yes" : "No"}
                            </td>
                            <td className="p-2 border flex gap-2">
                                <button
                                    onClick={() => handleEdit(c)}
                                    className="bg-yellow-400 px-3 py-1 rounded text-white"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(c._id)}
                                    className="bg-red-500 px-3 py-1 rounded text-white"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center items-center gap-4">
                <button
                    onClick={() => fetchCourses(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                >
                    ⬅️ Prev
                </button>

                <span className="text-sm font-medium">
                    Page {currentPage} of {Math.ceil(totalCourses / coursesPerPage)}
                </span>

                <button
                    onClick={() => fetchCourses(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalCourses / coursesPerPage)}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                >
                    Next ➡️
                </button>
            </div>

        </div>
    );
}

export default AdminCoursePage;
