import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import PublicPage from "./PublicPage"; // Replace with your main routine page
import AdminFacultyPage from "./pages/AdminFacultyPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/faculties" element={<AdminFacultyPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
