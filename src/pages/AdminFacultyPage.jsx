import React, { useEffect, useState } from "react";
import axios from "axios";

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

    const fetchFaculties = async () => {
        const res = await axios.get("https://routine-management-server.onrender.com/faculties");
        setFaculties(res.data);
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.designation || !form.type) {
            alert("Name, Designation and Type are required");
            return;
        }

        try {
            if (editingId) {
                await axios.put(`https://routine-management-server.onrender.com/faculties/${editingId}`, form);
                alert("Faculty updated");
            } else {
                await axios.post("https://routine-management-server.onrender.com/faculties", form);
                alert("Faculty added");
            }
            setForm(initialForm);
            setEditingId(null);
            fetchFaculties();
        } catch (err) {
            console.error(err);
            alert("Operation failed");
        }
    };

    const handleEdit = (faculty) => {
        setForm(faculty);
        setEditingId(faculty._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure to delete this faculty?")) {
            await axios.delete(`https://routine-management-server.onrender.com/faculties/${id}`);
            fetchFaculties();
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-700 mb-4">Faculty Management</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                    { label: "Name", name: "name", required: true },
                    {
                        label: "Designation",
                        name: "designation",
                        type: "select",
                        options: ["Lecturer", "Assistant Professor", "Associate Professor", "Professor", "Colonel"],
                        required: true,
                    },
                    {
                        label: "Type",
                        name: "type",
                        type: "select",
                        options: ["Internal", "External"],
                        required: true,
                    },
                    { label: "Email", name: "email" },
                    { label: "Phone", name: "phone" },
                    { label: "Department", name: "department" },
                ].map(({ label, name, type = "text", options }) => (
                    <label key={name} className="flex flex-col">
                        {label}:
                        {type === "select" ? (
                            <select
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                className="border p-2 rounded-md"
                                required
                            >
                                <option value="">-- Select {label} --</option>
                                {options.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={type}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                className="border p-2 rounded-md"
                                required={!!type.required}
                            />
                        )}
                    </label>
                ))}

                <div className="md:col-span-2 flex justify-between gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        {editingId ? "Update Faculty" : "Add Faculty"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            onClick={() => {
                                setForm(initialForm);
                                setEditingId(null);
                            }}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>


            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                    <thead className="bg-slate-200 text-slate-800">
                        <tr>
                            <th className="border px-2 py-1">Name</th>
                            <th className="border px-2 py-1">Designation</th>
                            <th className="border px-2 py-1">Type</th>
                            <th className="border px-2 py-1">Email</th>
                            <th className="border px-2 py-1">Phone</th>
                            <th className="border px-2 py-1">Dept.</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculties.map((fac) => (
                            <tr key={fac._id}>
                                <td className="border px-2 py-1">{fac.name}</td>
                                <td className="border px-2 py-1">{fac.designation}</td>
                                <td className="border px-2 py-1">{fac.type}</td>
                                <td className="border px-2 py-1">{fac.email}</td>
                                <td className="border px-2 py-1">{fac.phone}</td>
                                <td className="border px-2 py-1">{fac.department}</td>
                                <td className="border px-2 py-1 space-x-2">
                                    <button
                                        onClick={() => handleEdit(fac)}
                                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(fac._id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminFacultyPage;
