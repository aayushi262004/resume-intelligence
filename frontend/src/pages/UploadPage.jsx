// src/pages/UploadPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeResume } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function UploadPage() {

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please select a PDF resume.");
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeResume(file, jobDescription, token);
      navigate(`/results/${result.id}`, { state: { result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">R</span>
          </div>
          <h1 className="text-base font-semibold text-slate-900">Resume Intelligence</h1>
        </div>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
          Log out
        </button>
      </header>

      <div className="flex items-center justify-center py-12 px-4">
        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 w-full max-w-lg">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Analyze your resume</h2>
          <p className="text-sm text-slate-500 mb-6">
            Upload a PDF resume and paste the job description you're targeting.
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700 mb-2">Resume (PDF)</label>
          <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-lg px-4 py-3 mb-5 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-slate-600">
              {file ? file.name : "Choose a PDF file"}
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="hidden"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 mb-2">Job description</label>
          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            placeholder="Paste the full job description here..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-6 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Analyzing... this can take a few seconds" : "Analyze resume"}
          </button>
        </form>
      </div>
    </div>
  );
}