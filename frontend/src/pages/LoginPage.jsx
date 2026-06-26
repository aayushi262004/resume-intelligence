// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleLogin } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.access_token);
      navigate("/upload");
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
          <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1">Log in to analyze your resume</p>
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
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-6 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-3 text-sm text-slate-400">OR</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const data = await googleLogin(credentialResponse.credential);

                login(data.access_token);
                navigate("/upload");
              } catch (err) {
                setError(err.message);
              }
            }}
            onError={() => {
              setError("Google login failed");
            }}
          />
        </div>

        <p className="text-sm text-slate-500 mt-5 text-center">
          No account? <Link to="/register" className="text-indigo-600 font-medium">Register</Link>
        </p>
      </form>
    </div>
  );
}