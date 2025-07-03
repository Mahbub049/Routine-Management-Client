import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

function SettingsPage() {
    const [semester, setSemester] = useState({
        start_month: "", start_year: "", end_month: "", end_year: ""
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

    // 🔧 New States
    const [general, setGeneral] = useState({
        university_name: "",
        department_name: "",
        term_type: "",
        logo_url: ""
    });

    const [newTime, setNewTime] = useState({ start: "", end: "" });
    const [batches, setBatches] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [newBatch, setNewBatch] = useState("");
    const [newRoom, setNewRoom] = useState("");
    const [timeRanges, setTimeRanges] = useState([]);
    const [newStartTime, setNewStartTime] = useState("");
    const [newEndTime, setNewEndTime] = useState("");

    const [sections, setSections] = useState([]);
    const [newSection, setNewSection] = useState("");

    const [universityName, setUniversityName] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [termType, setTermType] = useState("");

    const [logoUrl, setLogoUrl] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);


    useEffect(() => {
        axios.get("/settings").then(res => {
            setSemester(res.data.semester || {});
            setBatches(res.data.batches || []);
            setClassrooms(res.data.classrooms || []);
            setTimeRanges(res.data.time_ranges || []);
            setSections(res.data.sections || []);
            setUniversityName(res.data.universityName || "");
            setDepartmentName(res.data.departmentName || "");
            setTermType(res.data.termType || "");
            setLogoUrl(res.data.logo || "");
        });

    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get("http://localhost:5000/public-settings");
                setGeneral({
                    university_name: res.data.university_name || "",
                    department_name: res.data.department_name || "",
                    term_type: res.data.term_type || "",
                    logo_url: res.data.logo_url || ""
                });

                // ✅ Set logo preview
                setLogoUrl(res.data.logo_url || ""); // 👈 this line ensures it appears after refresh
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };

        fetchSettings();
    }, []);



    const saveSemester = () => {
        axios.put("/settings/semester", semester).then(() => alert("Updated semester!"));
    };

    const saveGeneral = async () => {
        try {
            await axios.put("/settings/general", general);
            alert("General settings saved!");
        } catch (err) {
            console.error(err);
        }
    };


    const addTimeRange = async () => {
        if (!newTime.start || !newTime.end) return;
        const formatted = `${newTime.start}-${newTime.end}`;
        try {
            const res = await axios.post("/settings/time-ranges", { time_range: formatted }); // ✅ Corrected
            setTimeRanges(res.data);
            setNewTime({ start: "", end: "" });
        } catch (err) {
            console.error(err);
        }
    };


    const deleteTimeRange = async (time) => {
        try {
            const res = await axios.delete(`/settings/time-ranges/${encodeURIComponent(time)}`); // ✅ Corrected
            setTimeRanges(res.data);
        } catch (err) {
            console.error(err);
        }
    };


    const addSection = async () => {
        if (!newSection) return;
        try {
            const res = await axios.post("/settings/sections", { section: newSection });
            setSections(res.data);
            setNewSection("");
        } catch (err) {
            console.error(err);
        }
    };

    const deleteSection = async (section) => {
        try {
            const res = await axios.delete(`/settings/sections/${encodeURIComponent(section)}`);
            setSections(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("/upload/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const uploadedUrl = res.data.url;
            setLogoUrl(uploadedUrl);
            setGeneral({ ...general, logo_url: uploadedUrl }); // Save to general state
        } catch (err) {
            console.error("Upload failed", err);
        }
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
        <div className="space-y-10">

            {/* 📘 General Settings */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">📘 General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="University Name"
                        value={general.university_name}
                        onChange={(e) => setGeneral({ ...general, university_name: e.target.value })}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        placeholder="Department Name"
                        value={general.department_name}
                        onChange={(e) => setGeneral({ ...general, department_name: e.target.value })}
                        className="border p-2 rounded w-full"
                    />
                    <select
                        value={general.term_type}
                        onChange={(e) => setGeneral({ ...general, term_type: e.target.value })}
                        className="border p-2 rounded w-full"
                    >
                        <option value="">Select Term Type</option>
                        <option value="Trimester">Trimester</option>
                        <option value="Semester">Semester</option>
                    </select>

                    {/* 🖼 Logo Upload inside grid */}
                    <div className="flex items-center gap-3">
                        <input type="file" onChange={handleLogoUpload} className="border p-2 rounded w-full" />
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="h-14 w-14 object-contain border rounded shadow" />
                        )}
                    </div>
                </div>
                <button
                    onClick={saveGeneral}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Save General Settings
                </button>
            </section>

            {/* 📆 Current Semester */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">📆 Current Semester</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <select value={semester.start_month} onChange={(e) => setSemester({ ...semester, start_month: e.target.value })} className="border p-2 rounded">
                        <option value="">Start Month</option>
                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={semester.start_year} onChange={(e) => setSemester({ ...semester, start_year: e.target.value })} className="border p-2 rounded">
                        <option value="">Start Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={semester.end_month} onChange={(e) => setSemester({ ...semester, end_month: e.target.value })} className="border p-2 rounded">
                        <option value="">End Month</option>
                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={semester.end_year} onChange={(e) => setSemester({ ...semester, end_year: e.target.value })} className="border p-2 rounded">
                        <option value="">End Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button
                    onClick={saveSemester}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Save Semester
                </button>
            </section>

            {/* ⏰ Time Ranges + 🔤 Sections */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">⏰ Time Ranges</h2>
                        <div className="flex flex-wrap gap-4 items-center">
                            <input type="time" value={newTime.start} onChange={(e) => setNewTime({ ...newTime, start: e.target.value })} className="border p-2 rounded" />
                            <input type="time" value={newTime.end} onChange={(e) => setNewTime({ ...newTime, end: e.target.value })} className="border p-2 rounded" />
                            <button onClick={addTimeRange} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1">
                            {timeRanges.map((t) => (
                                <li key={t} className="flex justify-between items-center w-52 bg-gray-100 px-3 py-1 rounded">
                                    <span>{t}</span>
                                    <button onClick={() => deleteTimeRange(t)} className="text-red-500 hover:text-red-700">❌</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">🔤 Sections</h2>
                        <div className="flex gap-3">
                            <input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="e.g. A or B" className="border p-2 rounded w-1/2" />
                            <button onClick={addSection} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1">
                            {sections.map((s) => (
                                <li key={s} className="flex justify-between items-center w-52 bg-gray-100 px-3 py-1 rounded">
                                    <span>{s}</span>
                                    <button onClick={() => deleteSection(s)} className="text-red-500 hover:text-red-700">❌</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 🎓 Batches + 🏫 Classrooms */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">🎓 Batches</h2>
                        <div className="flex gap-3">
                            <input value={newBatch} onChange={e => setNewBatch(e.target.value)} placeholder="e.g. BICE-2026" className="border p-2 rounded w-1/2" />
                            <button onClick={addBatch} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1">
                            {batches.map((b) => (
                                <li key={b} className="flex justify-between items-center w-52 bg-gray-100 px-3 py-1 rounded">
                                    <span>{b}</span>
                                    <button onClick={() => deleteBatch(b)} className="text-red-500 hover:text-red-700">❌</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">🏫 Classrooms</h2>
                        <div className="flex gap-3">
                            <input value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="e.g. LAB 1" className="border p-2 rounded w-1/2" />
                            <button onClick={addRoom} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1">
                            {classrooms.map((r) => (
                                <li key={r} className="flex justify-between items-center w-52 bg-gray-100 px-3 py-1 rounded">
                                    <span>{r}</span>
                                    <button onClick={() => deleteRoom(r)} className="text-red-500 hover:text-red-700">❌</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

        </div>


    );
}

export default SettingsPage;
