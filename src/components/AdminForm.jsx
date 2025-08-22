import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";

const initialState = {
    day: "",
    time_range: "",
    room: "",
    section: "",
    course_code: "",
    course_title: "",
    faculty_name: "",
    faculty_designation: "",
    faculty_department: "",
    batch: "",
    is_lab: false,
    lab_fixed_time_range: "",
    faculty_name_2: "",
    faculty_designation_2: "",
    faculty_department_2: "",
};

function AdminForm({ onSuccess, editingData, clearEdit }) {
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [facultyType, setFacultyType] = useState("Internal");
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [facultyType2, setFacultyType2] = useState("Internal");
    const [facultyOptions2, setFacultyOptions2] = useState([]);
    const [courses, setCourses] = useState([]);
    const [settings, setSettings] = useState({
        time_ranges: [],
        classrooms: [],
        sections: [],
    });

    // Set editing data
    useEffect(() => {
        if (editingData) {
            setFormData({ ...initialState, ...editingData, _id: editingData._id });
        } else {
            setFormData(initialState);
        }
    }, [editingData]);

    // Fetch faculty A
    useEffect(() => {
        axios
            .get("/faculties")
            .then((res) => {
                const filtered = res.data.filter((fac) => fac.type === facultyType);
                setFacultyOptions(filtered);
            })
            .catch((err) => console.error("Failed to fetch faculties", err));
    }, [facultyType]);

    // Fetch faculty B
    useEffect(() => {
        axios
            .get("/faculties")
            .then((res) => {
                const filtered = res.data.filter((fac) => fac.type === facultyType2);
                setFacultyOptions2(filtered);
            })
            .catch((err) => console.error("Failed to fetch faculty B list", err));
    }, [facultyType2]);

    // Fetch settings
    useEffect(() => {
        axios
            .get("/settings")
            .then((res) => {
                setSettings({
                    time_ranges: res.data.time_ranges || [],
                    classrooms: res.data.classrooms || [],
                    sections: res.data.sections || [],
                });
            })
            .catch((err) => console.error("Failed to fetch settings", err));
    }, []);

    // Fetch courses
    useEffect(() => {
        axios
            .get("/courses")
            .then((res) => {
                const coursesArray = Array.isArray(res.data) ? res.data : res.data.courses;
                setCourses(coursesArray || []);
            })
            .catch((err) => console.error("Failed to fetch courses", err));
    }, []);


    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;

        // 👇 Custom logic when selecting a course title
        if (name === "course_title") {
            const selectedCourse = courses.find((course) => course.course_title === value);
            if (selectedCourse) {
                try {
                    // Fetch full course info including is_lab
                    const res = await axios.get(`/courses/${selectedCourse.course_code}`);
                    const courseData = res.data;

                    // Update course_code and is_lab in formData
                    setFormData((prev) => ({
                        ...prev,
                        course_title: value,
                        course_code: selectedCourse.course_code,
                        is_lab: courseData.is_lab || false, // checkbox will reflect this
                    }));
                } catch (error) {
                    console.error("❌ Failed to fetch course info:", error);
                    // fallback to update course title & code only
                    setFormData((prev) => ({
                        ...prev,
                        course_title: value,
                        course_code: selectedCourse.course_code,
                    }));
                }
            }
            return; // Exit here
        }

        // Default behavior for all other fields
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = [
            "day",
            "time_range",
            "room",
            "section",
            "course_code",
            "course_title",
            "faculty_name",
            "faculty_designation",
            "faculty_department",
            "batch",
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                Swal.fire({
                    title: "Incomplete!",
                    text: `Please fill in the "${field.replace("_", " ")}" field.`,
                    icon: "warning"
                });
                return;
            }
        }

        if (formData.is_lab) {
            if (!formData.lab_fixed_time_range) {
                Swal.fire({
                    title: "Incomplete!",
                    text: `Please specify lab fixed time range.`,
                    icon: "warning"
                });
                return;
            }
            if (!formData.faculty_name_2) {
                Swal.fire({
                    title: "Incomplete!",
                    text: `Please select Faculty B for lab course.`,
                    icon: "warning"
                });
                return;
            }
        }

        try {
            setIsSubmitting(true);
            const params = new URLSearchParams({
                day: formData.day,
                time_range: formData.time_range,
                room: formData.room,
                section: formData.section,
                batch: formData.batch,
            });

            if (editingData && editingData._id) {
                params.append("currentId", editingData._id);
            }

            await axios.get(`/routines/check-conflict?${params.toString()}`);

            if (editingData && editingData._id) {
                await axios.put(`/routines/${editingData._id}`, formData);
                Swal.fire({
                    title: "Updated!",
                    text: `Routine updated successfully!`,
                    icon: "success"
                });

            } else {
                await axios.post("/routines", formData);
                Swal.fire({
                    title: "Updated!",
                    text: `Routine added successfully!`,
                    icon: "success"
                });

            }

            setFormData(initialState);
            clearEdit?.();
            onSuccess();
        } catch (err) {
            if (err.response?.status === 409) {
                Swal.fire({
                    title: "Not Applicable!",
                    text: `❌ Conflict: ${err.response.data.message}`,
                    icon: "error"
                });
            } else {
                Swal.fire({
                    title: "Not Applicable!",
                    text: `Submission failed. Please try again.`,
                    icon: "error"
                });
                console.error(err);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTo12Hour = (range) => {
        const [start, end] = range.split("-");
        return `${convert(start)} - ${convert(end)}`;
    };

    const convert = (time) => {
        const [hourStr, minuteStr] = time.split(":");
        let hour = parseInt(hourStr, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour.toString().padStart(2, "0")}:${minuteStr}${suffix}`;
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { label: "Day", name: "day", options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
                { label: "Time Range", name: "time_range", options: settings.time_ranges },
                { label: "Room", name: "room", options: settings.classrooms },
                { label: "Section", name: "section", options: settings.sections },
            ].map(({ label, name, options }) => (
                <label key={name} className="flex flex-col">
                    {label}:
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="border p-2 rounded-md"
                    >
                        <option value="">Select</option>
                        {options.map((opt) =>
                            label === "Time Range" ? (
                                <option key={opt} value={opt}>
                                    {formatTo12Hour(opt)}
                                </option>
                            ) : (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            )
                        )}
                    </select>
                </label>
            ))}

            {/* Course Title Dropdown */}
            <label className="flex flex-col">
                Course Title:
                <select
                    name="course_title"
                    value={formData.course_title}
                    onChange={(e) => {
                        const selectedTitle = e.target.value;
                        const selectedCourse = courses.find((c) => c.course_title === selectedTitle);
                        if (selectedCourse) {
                            setFormData((prev) => ({
                                ...prev,
                                course_title: selectedCourse.course_title,
                                course_code: selectedCourse.course_code,
                                is_lab: selectedCourse.is_lab ?? false,
                            }));
                        } else {
                            setFormData((prev) => ({
                                ...prev,
                                course_title: "",
                                course_code: "",
                                is_lab: false,
                            }));
                        }
                    }}
                    className="border p-2 rounded-md"
                >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                        <option key={course._id} value={course.course_title}>
                            {course.course_title}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col">
                Course Code:
                <input
                    type="text"
                    name="course_code"
                    value={formData.course_code}
                    readOnly
                    className="border p-2 rounded-md bg-gray-100"
                />
            </label>

            {/* Faculty A */}
            <label className="flex flex-col">
                Faculty Type:
                <select value={facultyType} onChange={(e) => setFacultyType(e.target.value)} className="border p-2 rounded-md">
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                </select>
            </label>

            <label className="flex flex-col">
                Faculty Name:
                <select
                    name="faculty_name"
                    value={formData.faculty_name}
                    onChange={(e) => {
                        const selected = facultyOptions.find((f) => f.name === e.target.value);
                        setFormData((prev) => ({
                            ...prev,
                            faculty_name: selected?.name || "",
                            faculty_designation: selected?.designation || "",
                            faculty_department: selected?.department || "",
                        }));
                    }}
                    className="border p-2 rounded-md"
                >
                    <option value="">Select Faculty</option>
                    {facultyOptions.map((f) => (
                        <option key={f._id} value={f.name}>
                            {f.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col">
                Faculty Designation:
                <input name="faculty_designation" value={formData.faculty_designation} onChange={handleChange} className="border p-2 rounded-md" />
            </label>

            <label className="flex flex-col">
                Faculty Department:
                <input name="faculty_department" value={formData.faculty_department} onChange={handleChange} className="border p-2 rounded-md" />
            </label>

            {/* Batch */}
            <label className="flex flex-col">
                Batch:
                <select name="batch" value={formData.batch} onChange={handleChange} className="border p-2 rounded-md">
                    <option value="">Select</option>
                    {["BICE-2021", "BICE-2022", "BICE-2023", "BICE-2024", "BICE-2025", "MICE-2024"].map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </label>

            {/* Is Lab Checkbox */}
            <label className="flex items-center gap-2 col-span-1 md:col-span-2">
                <input
                    type="checkbox"
                    checked={formData.is_lab}
                    onChange={(e) => setFormData({ ...formData, is_lab: e.target.checked })}
                />

                Is Lab?
            </label>

            {formData.is_lab && (
                <>
                    <label className="flex flex-col col-span-1 md:col-span-2">
                        Lab Fixed Time Range:
                        <input
                            type="text"
                            name="lab_fixed_time_range"
                            value={formData.lab_fixed_time_range}
                            onChange={handleChange}
                            className="border p-2 rounded-md"
                            placeholder="e.g. 08:30 AM - 11:30 AM"
                        />
                    </label>

                    {/* Faculty B */}
                    <label className="flex flex-col">
                        Faculty B Type:
                        <select value={facultyType2} onChange={(e) => setFacultyType2(e.target.value)} className="border p-2 rounded-md">
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        Faculty B Name:
                        <select
                            name="faculty_name_2"
                            value={formData.faculty_name_2}
                            onChange={(e) => {
                                const selected = facultyOptions2.find((f) => f.name === e.target.value);
                                setFormData((prev) => ({
                                    ...prev,
                                    faculty_name_2: selected?.name || "",
                                    faculty_designation_2: selected?.designation || "",
                                    faculty_department_2: selected?.department || "",
                                }));
                            }}
                            className="border p-2 rounded-md"
                        >
                            <option value="">Select Faculty B</option>
                            {facultyOptions2.map((f) => (
                                <option key={f._id} value={f.name}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col">
                        Faculty B Designation:
                        <input name="faculty_designation_2" value={formData.faculty_designation_2} onChange={handleChange} className="border p-2 rounded-md" />
                    </label>

                    <label className="flex flex-col">
                        Faculty B Department:
                        <input name="faculty_department_2" value={formData.faculty_department_2} onChange={handleChange} className="border p-2 rounded-md" />
                    </label>
                </>
            )}

            <div className="col-span-1 md:col-span-2 flex justify-between gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-indigo-600 text-white px-4 py-2 rounded ${isSubmitting ? "opacity-50" : "hover:bg-indigo-700"}`}
                >
                    {isSubmitting ? "Submitting..." : editingData ? "Update Routine" : "Submit Routine"}
                </button>

                {editingData && (
                    <button
                        type="button"
                        onClick={() => {
                            setFormData(initialState);
                            clearEdit();
                        }}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Cancel Edit
                    </button>
                )}
            </div>
        </form>
    );
}

export default AdminForm;
