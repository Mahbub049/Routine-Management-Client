import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

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
};

function AdminForm({ onSuccess, editingData, clearEdit }) {
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [facultyType, setFacultyType] = useState("Internal");
    const [facultyOptions, setFacultyOptions] = useState([]);



    useEffect(() => {
        if (editingData) {
            setFormData({
                ...initialState,
                ...editingData,
                _id: editingData._id, // 🔥 ENSURE _id is preserved for update
            });
        } else {
            setFormData(initialState);
        }
    }, [editingData]);

    useEffect(() => {
        axios.get("/faculties")
            .then((res) => {
                const filtered = res.data.filter(fac => fac.type === facultyType);
                setFacultyOptions(filtered);
            })
            .catch((err) => console.error("Failed to fetch faculties", err));
    }, [facultyType]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = [
            "day", "time_range", "room", "section",
            "course_code", "course_title",
            "faculty_name", "faculty_designation",
            "faculty_department", "batch"
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the "${field.replace("_", " ")}" field.`);
                return;
            }
        }

        if (formData.is_lab && !formData.lab_fixed_time_range) {
            alert("Please specify lab fixed time range.");
            return;
        }

        try {
            setIsSubmitting(true); // START submit state

            if (editingData && editingData._id) {
                console.log("Submitting formData", formData);

                await axios.put(`/routines/${editingData._id}`, formData);
                alert("Routine updated successfully!");
            } else {
                await axios.post("/routines", formData);
                alert("Routine added successfully!");
            }

            setFormData(initialState);
            if (clearEdit) clearEdit();
            onSuccess();
        } catch (err) {
            alert("Submission failed. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false); // END submit state
        }
    };



    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day, Time, Room, Section */}
            {[
                { label: "Day", name: "day", type: "select", options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] },
                { label: "Time Range", name: "time_range", type: "select", options: ["08:30-10:00", "10:15-11:45", "12:00-13:30", "14:00-15:30", "15:45-17:15"] },
                { label: "Room", name: "room", type: "select", options: ["301", "302", "303", "304", "LAB1", "LAB2", "FBS 103", "MIST"] },
                { label: "Section", name: "section", type: "select", options: ["A", "B"] },
                { label: "Course Code", name: "course_code" },
                { label: "Course Title", name: "course_title" },
            ].map(({ label, name, type = "text", options }) => (
                <label key={name} className="flex flex-col">
                    {label}:
                    {type === "select" ? (
                        <select
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="border p-2 rounded-md"
                        >
                            <option value="">Select</option>
                            {options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="border p-2 rounded-md"
                        />
                    )}
                </label>
            ))}

            {/* Faculty Type */}
            <label className="flex flex-col">
                Faculty Type:
                <select
                    value={facultyType}
                    onChange={(e) => setFacultyType(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                </select>
            </label>

            {/* Faculty Name - from backend */}
            <label className="flex flex-col">
                Faculty Name:
                <select
                    name="faculty_name"
                    value={formData.faculty_name}
                    onChange={(e) => {
                        const selectedName = e.target.value;
                        setFormData((prev) => ({ ...prev, faculty_name: selectedName }));
                        const selected = facultyOptions.find((f) => f.name === selectedName);
                        if (selected) {
                            setFormData((prev) => ({
                                ...prev,
                                faculty_designation: selected.designation || "",
                                faculty_department: selected.department || "",
                            }));
                        }
                    }}
                    className="border p-2 rounded-md"
                >
                    <option value="">Select Faculty</option>
                    {facultyOptions.map((f) => (
                        <option key={f._id} value={f.name}>{f.name}</option>
                    ))}
                </select>
            </label>

            {/* Designation & Department (can be auto-filled but editable) */}
            <label className="flex flex-col">
                Faculty Designation:
                <input
                    name="faculty_designation"
                    value={formData.faculty_designation}
                    onChange={handleChange}
                    className="border p-2 rounded-md"
                />
            </label>

            <label className="flex flex-col">
                Faculty Department:
                <input
                    name="faculty_department"
                    value={formData.faculty_department}
                    onChange={handleChange}
                    className="border p-2 rounded-md"
                />
            </label>

            {/* Batch */}
            <label className="flex flex-col">
                Batch:
                <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="border p-2 rounded-md"
                >
                    <option value="">Select</option>
                    {["BICE-2021", "BICE-2022", "BICE-2023", "BICE-2024", "BICE-2025", "MICE-2024"].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </label>

            {/* Is Lab */}
            <label className="flex items-center gap-2 col-span-1 md:col-span-2">
                <input
                    type="checkbox"
                    name="is_lab"
                    checked={formData.is_lab}
                    onChange={handleChange}
                />
                Is Lab?
            </label>

            {/* Lab Time Range */}
            {formData.is_lab && (
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
            )}

            {/* Submit + Cancel */}
            <div className="col-span-1 md:col-span-2 flex justify-between gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-indigo-600 text-white px-4 py-2 rounded ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
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
