// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 w-full max-w-sm">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-indigo-600 font-semibold">R</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Create account</h2>
          <p className="text-sm text-slate-500 mt-1">Start analyzing your resume with AI</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-6 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-slate-500 mt-5 text-center">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}