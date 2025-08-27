import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";
import {
  FaUniversity,
  FaSchool,
  FaSave,
  FaClock,
  FaHashtag,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaImage,
  FaDoorOpen,
  FaUserGraduate,
} from "react-icons/fa";

function SettingsPage() {
  // ---- Base state
  const [semester, setSemester] = useState({
    start_month: "",
    start_year: "",
    end_month: "",
    end_year: "",
  });

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  // ---- General
  const [general, setGeneral] = useState({
    university_name: "",
    department_name: "",
    term_type: "",
    logo_url: "",
  });

  // ---- Collections
  const [timeRanges, setTimeRanges] = useState([]);
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // ---- Inputs for adders
  const [newTime, setNewTime] = useState({ start: "", end: "" });
  const [newSection, setNewSection] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newRoom, setNewRoom] = useState("");

  // ---- Logo
  const [logoUrl, setLogoUrl] = useState("");

  // Helper: toast
  const toast = (title, icon = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });

  // Initial load
  useEffect(() => {
    axios.get("/settings").then((res) => {
      setSemester(res.data.semester || {});
      setBatches(res.data.batches || []);
      setClassrooms(res.data.classrooms || []);
      setTimeRanges(res.data.time_ranges || []);
      setSections(res.data.sections || []);
      // (for backwards-compat with older shape)
      setGeneral((g) => ({
        ...g,
        university_name: res.data.universityName || g.university_name,
        department_name: res.data.departmentName || g.department_name,
        term_type: res.data.termType || g.term_type,
        logo_url: res.data.logo || g.logo_url,
      }));
      setLogoUrl(res.data.logo || "");
    });
  }, []);

  // Public settings for general (if your backend exposes it)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/public-settings");
        setGeneral({
          university_name: res.data.university_name || "",
          department_name: res.data.department_name || "",
          term_type: res.data.term_type || "",
          logo_url: res.data.logo_url || "",
        });
        setLogoUrl(res.data.logo_url || "");
      } catch (err) {
        // non-fatal
        console.error("Failed to load public settings", err);
      }
    };
    fetchSettings();
  }, []);

  // ---- Actions
  const saveSemester = async () => {
    try {
      await axios.put("/settings/semester", semester);
      toast("Semester updated");
    } catch (e) {
      toast("Failed to update semester", "error");
    }
  };

  const saveGeneral = async () => {
    try {
      await axios.put("/settings/general", general);
      toast("General settings saved");
    } catch (err) {
      console.error(err);
      toast("Failed to save general settings", "error");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;
      setLogoUrl(url);
      setGeneral((g) => ({ ...g, logo_url: url }));
      toast("Logo uploaded");
    } catch (err) {
      console.error("Upload failed", err);
      toast("Logo upload failed", "error");
    }
  };

  const addTimeRange = async () => {
    if (!newTime.start || !newTime.end) return toast("Pick both times", "warning");
    const formatted = `${newTime.start}-${newTime.end}`;
    try {
      const res = await axios.post("/settings/time-ranges", { time_range: formatted });
      setTimeRanges(res.data);
      setNewTime({ start: "", end: "" });
      toast("Time range added");
    } catch (err) {
      console.error(err);
      toast("Failed to add time range", "error");
    }
  };

  const deleteTimeRange = async (time) => {
    const ok = await Swal.fire({
      title: "Remove time range?",
      text: time,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Remove",
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await axios.delete(`/settings/time-ranges/${encodeURIComponent(time)}`);
      setTimeRanges(res.data);
      toast("Removed");
    } catch (err) {
      console.error(err);
      toast("Remove failed", "error");
    }
  };

  const addSection = async () => {
    if (!newSection.trim()) return toast("Enter a section", "warning");
    try {
      const res = await axios.post("/settings/sections", { section: newSection.trim() });
      setSections(res.data);
      setNewSection("");
      toast("Section added");
    } catch (err) {
      console.error(err);
      toast("Failed to add section", "error");
    }
  };

  const deleteSection = async (section) => {
    const ok = await Swal.fire({
      title: "Remove section?",
      text: section,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Remove",
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await axios.delete(`/settings/sections/${encodeURIComponent(section)}`);
      setSections(res.data);
      toast("Removed");
    } catch (err) {
      console.error(err);
      toast("Remove failed", "error");
    }
  };

  const addBatch = async () => {
    if (!newBatch.trim()) return toast("Enter a batch code", "warning");
    try {
      const res = await axios.post("/settings/batches", { batch: newBatch.trim() });
      setBatches(res.data);
      setNewBatch("");
      toast("Batch added");
    } catch (err) {
      console.error(err);
      toast("Failed to add batch", "error");
    }
  };

  const deleteBatch = async (b) => {
    const ok = await Swal.fire({
      title: "Remove batch?",
      text: b,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Remove",
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await axios.delete(`/settings/batches/${b}`);
      setBatches(res.data);
      toast("Removed");
    } catch (err) {
      console.error(err);
      toast("Remove failed", "error");
    }
  };

  const addRoom = async () => {
    if (!newRoom.trim()) return toast("Enter a room label", "warning");
    try {
      const res = await axios.post("/settings/classrooms", { room: newRoom.trim() });
      setClassrooms(res.data);
      setNewRoom("");
      toast("Classroom added");
    } catch (err) {
      console.error(err);
      toast("Failed to add classroom", "error");
    }
  };

  const deleteRoom = async (r) => {
    const ok = await Swal.fire({
      title: "Remove classroom?",
      text: r,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Remove",
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await axios.delete(`/settings/classrooms/${r}`);
      setClassrooms(res.data);
      toast("Removed");
    } catch (err) {
      console.error(err);
      toast("Remove failed", "error");
    }
  };

  const Chip = ({ text, onRemove, icon: Icon }) => (
    <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full">
      {Icon ? <Icon className="text-slate-500" /> : null}
      <span className="text-sm">{text}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-slate-200"
        title="Remove"
      >
        <FaTrash className="text-red-600 text-xs" />
      </button>
    </span>
  );

  return (
    <div className="space-y-8">
      {/* ===== General Settings ===== */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaUniversity className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-800">General Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">University Name</span>
            <input
              type="text"
              value={general.university_name}
              onChange={(e) =>
                setGeneral({ ...general, university_name: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="e.g., University of Example"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Department Name</span>
            <input
              type="text"
              value={general.department_name}
              onChange={(e) =>
                setGeneral({ ...general, department_name: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="e.g., CSE / ICE / EEE"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Term Type</span>
            <select
              value={general.term_type}
              onChange={(e) =>
                setGeneral({ ...general, term_type: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option value="">Select Term Type</option>
              <option value="Trimester">Trimester</option>
              <option value="Semester">Semester</option>
            </select>
          </label>

          {/* Logo uploader */}
          <div className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Logo</span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-slate-50">
                <FaImage />
                <span>Upload Logo</span>
                <input type="file" className="hidden" onChange={handleLogoUpload} />
              </label>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-14 w-14 object-contain border rounded shadow"
                />
              )}
            </div>
          </div>
        </div>

        <button
          onClick={saveGeneral}
          className="mt-5 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          <FaSave /> Save General Settings
        </button>
      </section>

      {/* ===== Semester ===== */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarAlt className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-800">Current Semester</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Start Month</span>
            <select
              value={semester.start_month || ""}
              onChange={(e) =>
                setSemester({ ...semester, start_month: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">Start Year</span>
            <select
              value={semester.start_year || ""}
              onChange={(e) =>
                setSemester({ ...semester, start_year: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">End Month</span>
            <select
              value={semester.end_month || ""}
              onChange={(e) =>
                setSemester({ ...semester, end_month: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-600 mb-1">End Year</span>
            <select
              value={semester.end_year || ""}
              onChange={(e) =>
                setSemester({ ...semester, end_year: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={saveSemester}
          className="mt-5 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          <FaSave /> Save Semester
        </button>
      </section>

      {/* ===== Time Ranges & Sections ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Ranges */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaClock className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">Time Ranges</h2>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="time"
              value={newTime.start}
              onChange={(e) => setNewTime({ ...newTime, start: e.target.value })}
              className="border p-2 rounded"
            />
            <span className="text-slate-500">to</span>
            <input
              type="time"
              value={newTime.end}
              onChange={(e) => setNewTime({ ...newTime, end: e.target.value })}
              className="border p-2 rounded"
            />
            <button
              onClick={addTimeRange}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700"
            >
              <FaPlus /> Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {timeRanges.map((t) => (
              <Chip key={t} text={t} onRemove={() => deleteTimeRange(t)} icon={FaClock} />
            ))}
            {timeRanges.length === 0 && (
              <p className="text-sm text-slate-500">No time ranges yet.</p>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaHashtag className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">Sections</h2>
          </div>

          <div className="flex gap-3">
            <input
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="e.g., A or B"
              className="border p-2 rounded w-1/2"
            />
            <button
              onClick={addSection}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700"
            >
              <FaPlus /> Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {sections.map((s) => (
              <Chip key={s} text={s} onRemove={() => deleteSection(s)} icon={FaHashtag} />
            ))}
            {sections.length === 0 && (
              <p className="text-sm text-slate-500">No sections yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== Batches & Classrooms ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batches */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUserGraduate className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">Batches</h2>
          </div>

          <div className="flex gap-3">
            <input
              value={newBatch}
              onChange={(e) => setNewBatch(e.target.value)}
              placeholder="e.g., BICE-2026"
              className="border p-2 rounded w-1/2"
            />
            <button
              onClick={addBatch}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700"
            >
              <FaPlus /> Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {batches.map((b) => (
              <Chip key={b} text={b} onRemove={() => deleteBatch(b)} icon={FaUserGraduate} />
            ))}
            {batches.length === 0 && (
              <p className="text-sm text-slate-500">No batches yet.</p>
            )}
          </div>
        </div>

        {/* Classrooms */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaDoorOpen className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">Classrooms</h2>
          </div>

          <div className="flex gap-3">
            <input
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="e.g., LAB 1 / 301"
              className="border p-2 rounded w-1/2"
            />
            <button
              onClick={addRoom}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700"
            >
              <FaPlus /> Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {classrooms.map((r) => (
              <Chip key={r} text={r} onRemove={() => deleteRoom(r)} icon={FaDoorOpen} />
            ))}
            {classrooms.length === 0 && (
              <p className="text-sm text-slate-500">No classrooms yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
