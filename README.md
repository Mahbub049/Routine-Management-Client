# Class Routine Management System (v2)

A fast, printable class-routine web app with an **Admin Panel** (manage routines, courses, faculties & settings) and a **Public Page** (filter + print schedules).  
This is **Version 2** – focused on cleaner UI, better printing, and safer admin workflows.

> Add screenshots to `docs/` and link here:
>
> ![Public page](docs/public-page.png)
>
> ![Admin page](docs/admin-page.png)

---

## ✨ What’s new in v2

- Polished **Public page UI** with density toggle (Compact/Comfortable), color legend, and improved filters.
- **Consistent batch colors** (background + border + text) with accessible contrast.
- **Great print layout**: header with logo, university/department, semester band, and page breaks per day.
- **Admin UX** improvements:
  - Routine form with **bidirectional course selection** (choose title _or_ code).
  - Lab course validation (fixed time range + 2nd faculty required).
  - Faculty management with **filter (All/Internal/External)** and quick search.
  - Course management split into **Theory / Lab** tables + pagination.
  - Settings for **semester, batches, rooms, sections, time ranges, logo**.
  - **End Semester**: one-click purge with confirmation.
- **Firebase Auth (email/password)** + backend JWT exchange for admin routes.
- Friendlier error/success feedback with SweetAlert2 toasts.

---

## 🧭 Features

### Public
- Filter by **day, faculty, batch, time**.
- Color-coded entries by **batch** with a legend.
- Responsive grid: **Room × Time** with entries inside each cell.
- **Print-ready** (header with logo, university/department, term/semester; page per day).

### Admin
- Add / edit / delete **routines** with **conflict pre-check** (`/routines/check-conflict`).
- Manage **faculties** (Internal/External) with search and filtering.
- Manage **courses** (code/title/credit/is_lab) with split tables + pagination.
- Global **settings** (semester dates, batches, rooms, sections, time ranges, logo).
- **End Semester**: one click to clear all routines (protected by JWT).
- Firebase **admin login** (Email/Password) → backend **JWT** → stored as `adminToken`.

---

## 🛠️ Tech Stack

**Frontend**
- React + Tailwind CSS  
- SweetAlert2, React Icons  
- Firebase Auth (client SDK)

**Backend (expected)**
- REST API (Node/Express recommended)
- MongoDB (or equivalent)
- Firebase Admin SDK (verify Firebase ID token)
- JWT issued by backend for admin routes

> The app expects certain REST endpoints (below). Your backend can be any stack as long as it honors the contract.

---

## 🗂️ Project Structure (frontend)

src/
api/
axiosInstance.js
components/
AdminForm.jsx
RoutineTable.jsx
Sidebar.jsx
PrintHeader.jsx
Footer.jsx
pages/
AdminPage.jsx
AdminCoursePage.jsx
AdminFacultyPage.jsx
SettingsPage.jsx
LoginPage.jsx
PublicPage.jsx
firebase.js
public/
images/
logo.png
login-illustration.jpg
docs/
public-page.png
admin-page.png


---

## 🚀 Getting Started

### 1) Prerequisites
- Node 18+ and npm (or pnpm/yarn)
- A running backend that implements the endpoints below
- Firebase project (Email/Password enabled)

### 2) Clone & install
~~~bash
git clone https://github.com/<you>/<repo>.git
cd <repo>
npm install
~~~

### 3) Environment (frontend)
Create `.env` (Vite) or `.env.local` (CRA) with your Firebase config and API base:

~~~bash
# Example (adjust to your setup)
VITE_API_BASE_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=<...>
VITE_FIREBASE_AUTH_DOMAIN=<...>
VITE_FIREBASE_PROJECT_ID=<...>
VITE_FIREBASE_APP_ID=<...>
~~~

Ensure `src/api/axiosInstance.js` reads your base URL (e.g., `import.meta.env.VITE_API_BASE_URL`).

### 4) Firebase Auth
- In Firebase console: add a Web app, enable **Email/Password** under Authentication.
- Put the config in `src/firebase.js`.

### 5) Images
- **Logo:** `public/images/logo.png` (transparent PNG/SVG ~200×200). Used in the app bar and print header.
- **Login hero:** `public/images/login-illustration.jpg` (clean campus or abstract tech illustration, ~1600×1200, ≤400 KB). Displayed on the login page.

### 6) Run
~~~bash
npm run dev   # Vite
# or
npm start     # CRA
~~~

---

## 🔒 Auth Flow

1. Admin signs in with Firebase (email/password).  
2. Frontend sends Firebase ID token → `POST /api/admin/login`.  
3. Backend verifies token (Firebase Admin SDK), issues **JWT**.  
4. Frontend stores JWT as `localStorage.adminToken`.  
5. Admin endpoints include `Authorization: Bearer <jwt>`.

---

## 🔌 REST API (expected contract)

> Adjust if your backend differs. The UI already calls these paths.

### Auth
- `POST /api/admin/login`  
  **Body:** `{ "token": "<firebase-id-token>" }`  
  **Response:** `{ "jwt": "<backend-jwt>" }`

### Public Settings
- `GET /public-settings` →  
  ~~~json
  {
    "logo_url": "/images/logo.png",
    "university_name": "Bangladesh University of Professionals",
    "department_name": "Information and Communication Engineering",
    "term_type": "Semester",
    "semester": { "start_month": "July", "start_year": 2025, "end_month": "December", "end_year": 2025 },
    "time_ranges": ["08:30-10:00","10:15-11:45","12:00-13:30","14:00-15:30","15:45-17:15"],
    "classrooms": ["301","303","CL","LAB1","LAB2"],
    "sections": ["A","B","Both"],
    "batches": ["BICE-2022","BICE-2023","BICE-2024","BICE-2025"]
  }
  ~~~

### Routines (Public + Admin)
- `GET /routines` with optional query: `day`, `faculty`, `batch`, `time`  
  **Returns:** array of routines:
  ~~~json
  {
    "_id":"...",
    "day":"Sunday",
    "time_range":"10:15-11:45",
    "room":"303",
    "section":"A",
    "course_code":"ICE-4106",
    "course_title":"Optical Communication",
    "faculty_name":"Dr. X",
    "faculty_designation":"Professor",
    "faculty_department":"EEE",
    "batch":"BICE-2022",
    "is_lab": false,
    "lab_fixed_time_range": "",
    "faculty_name_2":"", "faculty_designation_2":"", "faculty_department_2":""
  }
  ~~~

- `GET /routines/check-conflict?day=...&time_range=...&room=...&section=...&batch=...&currentId=<optional>`  
  **200** if no conflict; **409** with `{ "message": "..." }` if conflict.

- `POST /routines` (admin, JWT)  
- `PUT /routines/:id` (admin, JWT)  
- `DELETE /routines/:id` (admin, JWT)  
- `DELETE /routines` (admin, JWT) → **End Semester** (purge)

### Faculties (Admin)
- `GET /faculties`
- `POST /faculties` (fields: `name, designation, type, email, phone, department`)
- `PUT /faculties/:id`
- `DELETE /faculties/:id`

### Courses (Admin)
- `GET /courses?page=&limit=` (also supports `GET /courses/all`)
- `GET /courses/:course_code`
- `POST /courses` (fields: `course_code, course_title, credit_hour, is_lab`)
- `PUT /courses/:id`
- `DELETE /courses/:id`

### Settings (Admin)
- `GET /settings`
- `PUT /settings/general`  
  Body: `{ university_name, department_name, term_type, logo_url }`
- `PUT /settings/semester`  
  Body: `{ start_month, start_year, end_month, end_year }`
- `POST /settings/time-ranges` `{ time_range }`
- `DELETE /settings/time-ranges/:value`
- `POST /settings/sections` `{ section }`
- `DELETE /settings/sections/:value`
- `POST /settings/batches` `{ batch }`
- `DELETE /settings/batches/:value`
- `POST /settings/classrooms` `{ room }`
- `DELETE /settings/classrooms/:value`

### Uploads
- `POST /upload/logo` → multipart form under key `file`, returns `{ "url": "<public-path>" }`.

---

## 🧩 Key Components

- **PublicPage.jsx** – public grid, filters, print styles, batch legend.
- **PrintHeader.jsx** – print-only banner with logo, university/department, semester, and batch color band.
- **AdminForm.jsx** – add/edit routine, faculty A/B, bidirectional course selection, lab rules, conflict check.
- **AdminFacultyPage.jsx** – form + table with filter/search.
- **AdminCoursePage.jsx** – form + theory/lab tables + pagination.
- **SettingsPage.jsx** – semester, general info, logo upload, batches/rooms/sections/time ranges.
- **RoutineTable.jsx** – grouped table of routines for the admin “All Routines” tab.
- **Sidebar.jsx** – admin navigation + semester end + logout.

---

## 🧪 Data Model (suggested)

> Example Mongoose-ish shape (align with your backend):

~~~ts
type Routine = {
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
  time_range: string; // "08:30-10:00", etc.
  room: string;
  section: string;
  course_code: string;
  course_title: string;
  faculty_name: string;
  faculty_designation: string;
  faculty_department: string;
  batch: string;
  is_lab: boolean;
  lab_fixed_time_range?: string;
  faculty_name_2?: string;
  faculty_designation_2?: string;
  faculty_department_2?: string;
};
~~~

---

## 🖨️ Printing Tips

- Browser print dialog: **Margins = Default**, **Background graphics ON** (for color bands).
- Each **day** starts on its own page (page break applied).
- `PrintHeader` appears **only** when printing.

---

## 🔧 Configuration Notes

- **Axios base URL** is centralized in `src/api/axiosInstance.js`. Protected calls set:
  ~~~js
  { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
  ~~~
- **Auth:** frontend stores backend JWT in `localStorage.adminToken`.

---

## 🗺️ Roadmap

- Merge duplicate lab blocks (UI merging of adjacent entries with same course/section/faculty).
- Role-based permissions (super admin vs editor).
- Import/export (CSV/Excel) of routines.
- i18n and RTL.
- Tests (unit + e2e).

---

## 🤝 Contributing

1. Fork & create a feature branch.  
2. Follow the existing code style (Tailwind + small components).  
3. Open a PR with a clear description and screenshots.

---

## 📄 License

MIT – see `LICENSE`.

---

## 🙌 Credits

- React, Tailwind CSS, SweetAlert2, React Icons, Firebase
