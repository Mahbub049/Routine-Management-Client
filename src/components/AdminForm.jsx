import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Swal from "sweetalert2";
import {
  FaCalendarAlt,
  FaClock,
  FaDoorOpen,
  FaLayerGroup,
  FaBook,
  FaHashtag,
  FaUserTie,
  FaFlask,
  FaUniversity,
} from "react-icons/fa";

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
  const [batches, setBatches] = useState([]);

  const [settings, setSettings] = useState({
    time_ranges: [],
    classrooms: [],
    sections: [],
  });

  // Toast helper
  const toast = (title, icon = "success") =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

  // Prefill when editing
  useEffect(() => {
    if (editingData) {
      setFormData({ ...initialState, ...editingData, _id: editingData._id });
    } else {
      setFormData(initialState);
    }
  }, [editingData]);

  // Faculty A
  useEffect(() => {
    axios
      .get("/faculties")
      .then((res) => {
        const filtered = (res.data || []).filter((f) => f.type === facultyType);
        setFacultyOptions(filtered);
      })
      .catch((e) => console.error("Failed to fetch faculties", e));
  }, [facultyType]);

  // Faculty B
  useEffect(() => {
    axios
      .get("/faculties")
      .then((res) => {
        const filtered = (res.data || []).filter((f) => f.type === facultyType2);
        setFacultyOptions2(filtered);
      })
      .catch((e) => console.error("Failed to fetch faculty B", e));
  }, [facultyType2]);

  // Settings
  useEffect(() => {
    axios
      .get("/settings")
      .then((res) =>
        setSettings({
          time_ranges: res.data.time_ranges || [],
          classrooms: res.data.classrooms || [],
          sections: res.data.sections || [],
        })
      )
      .catch((e) => console.error("Failed to fetch settings", e));
  }, []);

  // Courses
  useEffect(() => {
    axios
      .get("/courses/all")
      .then((res) => setCourses(res.data || []))
      .catch((e) => console.error("Failed to fetch courses", e));
  }, []);

  // Batches
  useEffect(() => {
    axios
      .get("/settings")
      .then((res) => setBatches(res.data.batches || []))
      .catch((e) => console.error("Failed to fetch batches", e));
  }, []);

  // ---------- Helpers ----------
  const baseInput =
    "border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500";

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-slate-800 font-semibold">
        {Icon && <Icon className="text-indigo-600" />} <span>{title}</span>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );

  const Field = ({ label, children, hint, icon: Icon }) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-slate-700 flex items-center gap-2">
        {Icon && <Icon className="text-slate-400" />} {label}
      </span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );

  const formatTo12Hour = (range) => {
    const [start, end] = (range || "").split("-");
    if (!start || !end) return range || "";
    return `${convert(start)} – ${convert(end)}`;
  };

  const convert = (time) => {
    if (!time) return "";
    const [H, M] = time.split(":").map(Number);
    const ampm = H >= 12 ? "PM" : "AM";
    const h = ((H + 11) % 12) + 1;
    return `${String(h).padStart(2, "0")}:${String(M).padStart(2, "0")} ${ampm}`;
  };

  // Keep title/code in sync and set is_lab
  const applyCourse = async (course) => {
    if (!course) {
      setFormData((p) => ({ ...p, course_title: "", course_code: "", is_lab: false }));
      return;
    }
    try {
      const res = await axios.get(`/courses/${course.course_code}`);
      setFormData((p) => ({
        ...p,
        course_title: course.course_title,
        course_code: course.course_code,
        is_lab: !!res.data?.is_lab,
      }));
    } catch {
      // fallback to local data if single-course endpoint fails
      setFormData((p) => ({
        ...p,
        course_title: course.course_title,
        course_code: course.course_code,
        is_lab: !!course.is_lab,
      }));
    }
  };

  const handleCourseTitleChange = async (e) => {
    const selected = courses.find((c) => c.course_title === e.target.value);
    await applyCourse(selected);
  };

  const handleCourseCodeChange = async (e) => {
    const selected = courses.find((c) => c.course_code === e.target.value);
    await applyCourse(selected);
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
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

    for (const f of required) {
      if (!formData[f]) {
        Swal.fire({
          title: "Incomplete!",
          text: `Please fill in the "${f.replace("_", " ")}" field.`,
          icon: "warning",
        });
        return;
      }
    }

    if (formData.is_lab) {
      if (!formData.lab_fixed_time_range) {
        Swal.fire({
          title: "Incomplete!",
          text: "Please specify lab fixed time range.",
          icon: "warning",
        });
        return;
      }
      if (!formData.faculty_name_2) {
        Swal.fire({
          title: "Incomplete!",
          text: "Please select Faculty B for lab course.",
          icon: "warning",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // conflict check
      const params = new URLSearchParams({
        day: formData.day,
        time_range: formData.time_range,
        room: formData.room,
        section: formData.section,
        batch: formData.batch,
      });
      if (editingData?._id) params.append("currentId", editingData._id);

      await axios.get(`/routines/check-conflict?${params.toString()}`);

      if (editingData?._id) {
        await axios.put(`/routines/${editingData._id}`, formData);
        toast("Routine updated!");
      } else {
        await axios.post("/routines", formData);
        toast("Routine added!");
      }

      // stay on page, keep values
      onSuccess?.({ stay: true, updated: !!editingData });
    } catch (err) {
      if (err?.response?.status === 409) {
        Swal.fire({
          title: "Not Applicable!",
          text: `❌ Conflict: ${err.response.data.message}`,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Not Applicable!",
          text: "Submission failed. Please try again.",
          icon: "error",
        });
        console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- UI ----------
  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      {/* Left: Form (2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Schedule */}
        <div className="bg-white rounded-xl shadow p-5">
          <SectionTitle
            icon={FaCalendarAlt}
            title="Schedule"
            subtitle="Choose day, time slot, room and section."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Day" icon={FaCalendarAlt}>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className={baseInput}
              >
                <option value="">— Select Day —</option>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Time Range" icon={FaClock} hint="Displayed in 12-hour format">
              <select
                name="time_range"
                value={formData.time_range}
                onChange={handleChange}
                className={baseInput}
              >
                <option value="">— Select Time —</option>
                {settings.time_ranges.map((t) => (
                  <option key={t} value={t}>
                    {formatTo12Hour(t)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Room" icon={FaDoorOpen}>
              <select
                name="room"
                value={formData.room}
                onChange={handleChange}
                className={baseInput}
              >
                <option value="">— Select Room —</option>
                {settings.classrooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Section" icon={FaLayerGroup}>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className={baseInput}
              >
                <option value="">— Select Section —</option>
                {settings.sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Course */}
        <div className="bg-white rounded-xl shadow p-5">
          <SectionTitle
            icon={FaBook}
            title="Course"
            subtitle="Pick by title or code — both stay in sync."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Course Title" icon={FaBook}>
              <select
                name="course_title"
                value={formData.course_title}
                onChange={handleCourseTitleChange}
                className={baseInput}
              >
                <option value="">— Select Title —</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.course_title}>
                    {c.course_title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Course Code" icon={FaHashtag}>
              <select
                name="course_code"
                value={formData.course_code}
                onChange={handleCourseCodeChange}
                className={baseInput}
              >
                <option value="">— Select Code —</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.course_code}>
                    {c.course_code}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Faculty A & Batch */}
        <div className="bg-white rounded-xl shadow p-5">
          <SectionTitle
            icon={FaUserTie}
            title="Faculty & Batch"
            subtitle="Assign primary faculty and batch."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Faculty Type (A)" icon={FaUserTie}>
              <select
                value={facultyType}
                onChange={(e) => setFacultyType(e.target.value)}
                className={baseInput}
              >
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </Field>

            <Field label="Faculty Name (A)" icon={FaUserTie}>
              <select
                name="faculty_name"
                value={formData.faculty_name}
                onChange={(e) => {
                  const selected = facultyOptions.find((f) => f.name === e.target.value);
                  setFormData((p) => ({
                    ...p,
                    faculty_name: selected?.name || "",
                    faculty_designation: selected?.designation || "",
                    faculty_department: selected?.department || "",
                  }));
                }}
                className={baseInput}
              >
                <option value="">— Select Faculty —</option>
                {facultyOptions.map((f) => (
                  <option key={f._id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Designation (A)">
              <input
                name="faculty_designation"
                value={formData.faculty_designation}
                onChange={handleChange}
                className={baseInput}
                placeholder="e.g. Assistant Professor"
              />
            </Field>

            <Field label="Department (A)">
              <input
                name="faculty_department"
                value={formData.faculty_department}
                onChange={handleChange}
                className={baseInput}
                placeholder="e.g. CSE"
              />
            </Field>

            <Field label="Batch" icon={FaUniversity}>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className={baseInput}
              >
                <option value="">— Select Batch —</option>
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Lab toggle */}
        <div className="bg-white rounded-xl shadow p-5">
          <SectionTitle
            icon={FaFlask}
            title="Lab"
            subtitle="If the course has a lab, fill B-faculty and the fixed time."
          />
          <label className="inline-flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_lab}
              onChange={(e) => setFormData({ ...formData, is_lab: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-slate-700">This course has a lab</span>
          </label>

          {formData.is_lab && (
            <div className="mt-4 border rounded-lg p-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Lab Fixed Time Range" hint="e.g. 08:30 AM – 11:30 AM" icon={FaClock}>
                  <input
                    type="text"
                    name="lab_fixed_time_range"
                    value={formData.lab_fixed_time_range}
                    onChange={handleChange}
                    className={baseInput}
                    placeholder="08:30 AM – 11:30 AM"
                  />
                </Field>

                <Field label="Faculty B Type" icon={FaUserTie}>
                  <select
                    value={facultyType2}
                    onChange={(e) => setFacultyType2(e.target.value)}
                    className={baseInput}
                  >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </select>
                </Field>

                <Field label="Faculty B Name" icon={FaUserTie}>
                  <select
                    name="faculty_name_2"
                    value={formData.faculty_name_2}
                    onChange={(e) => {
                      const selected = facultyOptions2.find((f) => f.name === e.target.value);
                      setFormData((p) => ({
                        ...p,
                        faculty_name_2: selected?.name || "",
                        faculty_designation_2: selected?.designation || "",
                        faculty_department_2: selected?.department || "",
                      }));
                    }}
                    className={baseInput}
                  >
                    <option value="">— Select Faculty B —</option>
                    {facultyOptions2.map((f) => (
                      <option key={f._id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Designation (B)">
                  <input
                    name="faculty_designation_2"
                    value={formData.faculty_designation_2}
                    onChange={handleChange}
                    className={baseInput}
                  />
                </Field>

                <Field label="Department (B)">
                  <input
                    name="faculty_department_2"
                    value={formData.faculty_department_2}
                    onChange={handleChange}
                    className={baseInput}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-lg text-white shadow ${
              isSubmitting ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? "Submitting…" : editingData ? "Update Routine" : "Submit Routine"}
          </button>

          {editingData ? (
            <button
              type="button"
              onClick={() => {
                setFormData(initialState);
                clearEdit?.();
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Cancel Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFormData(initialState)}
              className="px-5 py-2.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Live Summary */}
      <aside className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow p-5 sticky top-4">
          <h3 className="text-slate-800 font-semibold mb-3">Live Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Day</span>
              <span className="font-medium">{formData.day || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-medium">
                {formData.time_range ? formatTo12Hour(formData.time_range) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room</span>
              <span className="font-medium">{formData.room || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Section</span>
              <span className="font-medium">{formData.section || "—"}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span className="text-slate-500">Course</span>
              <span className="font-medium">
                {formData.course_code || "—"}
                {formData.course_title ? ` · ${formData.course_title}` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch</span>
              <span className="font-medium">{formData.batch || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Faculty A</span>
              <span className="font-medium">{formData.faculty_name || "—"}</span>
            </div>
            {formData.is_lab && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lab Time</span>
                  <span className="font-medium">
                    {formData.lab_fixed_time_range || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Faculty B</span>
                  <span className="font-medium">{formData.faculty_name_2 || "—"}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}

export default AdminForm;
