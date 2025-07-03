import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import PublicPage from "./PublicPage"; // Replace with your main routine page
import AdminFacultyPage from "./pages/AdminFacultyPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/admin/faculties" element={<ProtectedRoute><AdminFacultyPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
