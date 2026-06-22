// src/pages/ResultsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getAnalysis } from "../api/client";
import { useAuth } from "../context/AuthContext";


function ScoreRing({ score }) {
  const scheme =
    score >= 75
      ? { ring: "#16A34A", bg: "#F0FDF4", text: "#15803D" }
      : score >= 50
        ? { ring: "#D97706", bg: "#FFFBEB", text: "#B45309" }
        : { ring: "#DC2626", bg: "#FEF2F2", text: "#B91C1C" };

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx="56" cy="56" r="42" fill="none"
          stroke={scheme.ring} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-semibold" style={{ color: scheme.text }}>{score}</p>
        <p className="text-xs text-slate-400">/ 100</p>
      </div>
    </div>
  );
}

function SkillPills({ items, tone }) {
  const style = tone === "matched"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
    : "bg-rose-50 text-rose-700 border border-rose-100";
  if (!items?.length) return <p className="text-sm text-slate-400">None found</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className={`text-xs font-medium px-3 py-1.5 rounded-full ${style}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ResultsPage() {

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [data, setData] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data) {
      getAnalysis(id, token)
        .then(setData)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, data, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading analysis...</p>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-rose-600 text-sm">{error || "No result found."}</p>
      </div>
    );
  }

  const r = data.result;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">R</span>
          </div>
          <h1 className="text-base font-semibold text-slate-900">Resume Intelligence</h1>
        </div>
        <div className="flex gap-5 items-center">
          <button onClick={() => navigate("/upload")} className="text-sm text-indigo-600 font-medium">
            New analysis
          </button>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-10 px-4">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4 flex items-center gap-6">
          <ScoreRing score={r.ats_score} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">ATS match score</h2>
            <p className="text-sm text-slate-500">
              Based on alignment between this resume and the job description provided.
            </p>
          </div>
        </div>

        <Section title="Recruiter summary">
          <p className="text-sm text-slate-700 leading-relaxed">{r.recruiter_summary}</p>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Matched skills</h3>
            <SkillPills items={r.matched_skills} tone="matched" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Missing skills</h3>
            <SkillPills items={r.missing_skills} tone="missing" />
          </div>
        </div>

        <Section title="Strengths">
          <ul className="space-y-2.5">
            {r.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Weaknesses">
          <ul className="space-y-2.5">
            {r.weaknesses.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs flex-shrink-0">!</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Suggestions to improve fit">
          <ol className="space-y-2.5">
            {r.suggestions.map((s, i) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-medium flex-shrink-0">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Recommended projects to close the gap">
          <ul className="space-y-2.5">
            {r.recommended_projects.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 text-indigo-500 flex-shrink-0">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

      </div>
    </div>
  );
}