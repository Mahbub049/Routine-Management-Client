import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function SettingsPage() {
    const [semester, setSemester] = useState({
        start_month: "", start_year: "", end_month: "", end_year: ""
    });
    const [batches, setBatches] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [newBatch, setNewBatch] = useState("");
    const [newRoom, setNewRoom] = useState("");

    useEffect(() => {
        axios.get("/settings").then(res => {
            setSemester(res.data.semester || {});
            setBatches(res.data.batches || []);
            setClassrooms(res.data.classrooms || []);
        });
    }, []);

    const saveSemester = () => {
        axios.put("/settings/semester", semester).then(() => alert("Updated semester!"));
    };

    const addBatch = () => {
        if (!newBatch) return;
        axios.post("/settings/batches", { batch: newBatch }).then(res => {
            setBatches(res.data);
            setNewBatch("");
        });
    };

    const deleteBatch = (b) => {
        axios.delete(`/settings/batches/${b}`).then(res => setBatches(res.data));
    };

    const addRoom = () => {
        if (!newRoom) return;
        axios.post("/settings/classrooms", { room: newRoom }).then(res => {
            setClassrooms(res.data);
            setNewRoom("");
        });
    };

    const deleteRoom = (r) => {
        axios.delete(`/settings/classrooms/${r}`).then(res => setClassrooms(res.data));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-700">📆 Current Semester</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Start Month */}
                <select
                    value={semester.start_month || ""}
                    onChange={(e) => setSemester({ ...semester, start_month: e.target.value })}
                    className="border p-2 rounded"
                >
                    <option value="">Start Month</option>
                    {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ].map((month) => (
                        <option key={month} value={month}>{month}</option>
                    ))}
                </select>

                {/* Start Year */}
                <select
                    value={semester.start_year || ""}
                    onChange={(e) => setSemester({ ...semester, start_year: e.target.value })}
                    className="border p-2 rounded"
                >
                    <option value="">Start Year</option>
                    {Array.from({ length: 21 }, (_, i) => 2020 + i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* End Month */}
                <select
                    value={semester.end_month || ""}
                    onChange={(e) => setSemester({ ...semester, end_month: e.target.value })}
                    className="border p-2 rounded"
                >
                    <option value="">End Month</option>
                    {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ].map((month) => (
                        <option key={month} value={month}>{month}</option>
                    ))}
                </select>

                {/* End Year */}
                <select
                    value={semester.end_year || ""}
                    onChange={(e) => setSemester({ ...semester, end_year: e.target.value })}
                    className="border p-2 rounded"
                >
                    <option value="">End Year</option>
                    {Array.from({ length: 21 }, (_, i) => 2020 + i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* Save Button */}
                <button
                    onClick={saveSemester}
                    className="col-span-2 md:col-span-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Save Semester
                </button>
            </div>



            <h2 className="text-xl font-bold text-slate-700">🎓 Batches</h2>
            <div className="flex gap-2">
                <input value={newBatch} onChange={e => setNewBatch(e.target.value)} placeholder="e.g. BICE-2026" className="border p-2 rounded" />
                <button onClick={addBatch} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
            </div>
            <ul className="list-disc ml-6">
                {batches.map((b) => (
                    <li key={b} className="flex items-center justify-between w-48">
                        {b}
                        <button onClick={() => deleteBatch(b)} className="text-red-600">❌</button>
                    </li>
                ))}
            </ul>

            <h2 className="text-xl font-bold text-slate-700">🏫 Classrooms</h2>
            <div className="flex gap-2">
                <input value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="e.g. 301 or LAB2" className="border p-2 rounded" />
                <button onClick={addRoom} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
            </div>
            <ul className="list-disc ml-6">
                {classrooms.map((r) => (
                    <li key={r} className="flex items-center justify-between w-48">
                        {r}
                        <button onClick={() => deleteRoom(r)} className="text-red-600">❌</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SettingsPage;
