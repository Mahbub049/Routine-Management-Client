import React, { useEffect, useState } from "react";
import axios from "axios";

function RoutineTable({ onEdit, refreshKey }) {
    const [routines, setRoutines] = useState([]);

    useEffect(() => {
        fetchRoutines();
    }, [refreshKey]);



    const fetchRoutines = async () => {
        try {
            const res = await axios.get("https://routine-management-server.onrender.com/routines");
            setRoutines(res.data);
        } catch (err) {
            console.error("Failed to fetch routines:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this routine?")) return;

        try {
            await axios.delete(`https://routine-management-server.onrender.com/routines/${id}`);
            alert("Routine deleted successfully.");
            fetchRoutines(); // Refresh table
        } catch (err) {
            alert("Failed to delete routine.");
            console.error("Delete error:", err);
        }
    };

    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const timeOrder = ["08:30-10:00", "10:15-11:45", "12:00-13:30", "14:00-15:30", "15:45-17:15"];
    const grouped = {};

    const sortedRoutines = [...routines].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return timeOrder.indexOf(a.time_range) - timeOrder.indexOf(b.time_range);
    });

    sortedRoutines.forEach((r) => {
        const key = `${r.day}-${r.time_range}`;
        if (!grouped[key]) {
            grouped[key] = { count: 0, items: [] };
        }
        grouped[key].count += 1;
        grouped[key].items.push(r);
    });


    return (
        <div className="overflow-x-auto">
            <table className="w-full border border-collapse text-sm">
                <thead className="bg-slate-200">
                    <tr>
                        <th className="border px-2 py-1">Day</th>
                        <th className="border px-2 py-1">Time</th>
                        <th className="border px-2 py-1">Room</th>
                        <th className="border px-2 py-1">Section</th>
                        <th className="border px-2 py-1">Course</th>
                        <th className="border px-2 py-1">Faculty</th>
                        <th className="border px-2 py-1">Batch</th>
                        <th className="border px-2 py-1">Lab?</th>
                        <th className="border px-2 py-1">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {routines.length === 0 ? (
                        <tr>
                            <td colSpan="9" className="text-center py-4 text-slate-500">
                                No routines found.
                            </td>
                        </tr>
                    ) : (
                        Object.entries(grouped).map(([key, group]) =>
                            group.items.map((r, index) => (
                                <tr key={r._id} className="hover:bg-gray-100">
                                    {index === 0 && (
                                        <td className="border px-2 py-1" rowSpan={group.count}>
                                            {r.day}
                                        </td>
                                    )}
                                    {index === 0 && (
                                        <td className="border px-2 py-1" rowSpan={group.count}>
                                            {r.time_range}
                                        </td>
                                    )}
                                    <td className="border px-2 py-1">{r.room}</td>
                                    <td className="border px-2 py-1">{r.section}</td>
                                    <td className="border px-2 py-1">{r.course_code}</td>
                                    <td className="border px-2 py-1">{r.faculty_name}</td>
                                    <td className="border px-2 py-1">{r.batch}</td>
                                    <td className="border px-2 py-1">{r.is_lab ? "Yes" : "No"}</td>
                                    <td className="border px-2 py-1 text-center text-sm text-slate-700">
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mr-2"
                                            onClick={() => handleDelete(r._id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            onClick={() => onEdit(r)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )

                    )}
                </tbody>
            </table>
        </div>
    );
}

export default RoutineTable;
