// src/pages/LoginPage.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);
      const user = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await user.user.getIdToken();
      const res = await axios.post("/api/admin/login", { token: firebaseToken });
      localStorage.setItem("adminToken", res.data.jwt);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check credentials or access rights.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-indigo-50 to-slate-100">
      {/* Left: Hero / Illustration */}
      <aside
        className="relative hidden lg:block"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/login-illustration.png')" }}
        />
        <div className="absolute inset-0 bg-indigo-900/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-white px-12">
          {/* Optional logo */}
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-14 w-14 object-contain mb-4 drop-shadow"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <h1 className="text-3xl font-bold tracking-wide text-white/95">
            Class Routine Management
          </h1>
          <p className="mt-2 text-white/85 text-sm max-w-md text-center">
            Manage courses, faculties, and schedules with a fast, clean interface.
          </p>
        </div>
      </aside>

      {/* Right: Form */}
      <main className="flex items-center justify-center p-6 lg:p-10">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-7 border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-9 w-9 object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Email */}
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <div className="mb-4 relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <FiMail />
            </span>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <div className="mb-2 relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <FiLock />
            </span>
            <input
              type={showPw ? "text" : "password"}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-slate-500">
              Use your authorized admin account
            </span>
            {/* Optional link, wire up later if needed */}
            <span className="text-xs text-indigo-600 hover:underline cursor-default">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white py-2.5 font-medium transition 
              ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"}`}
          >
            <FiLogIn />
            {isLoading ? "Signing in…" : "Sign in"}
          </button>

          {/* Footer note */}
          <p className="mt-4 text-center text-xs text-slate-500">
            By signing in you agree to the acceptable use policy.
          </p>
        </form>
      </main>
    </div>
  );
}

export default LoginPage;
