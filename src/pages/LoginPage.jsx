import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await user.user.getIdToken();

      const res = await axios.post("/api/admin/login", { token: firebaseToken });

      localStorage.setItem("adminToken", res.data.jwt);
      navigate("/admin"); // 🔄 Redirect after login
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check credentials or access rights.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white shadow-md p-6 rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-slate-700">Admin Login</h2>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <input
          className="w-full border p-2 mb-3 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-4 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
