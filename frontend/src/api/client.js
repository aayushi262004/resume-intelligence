// src/api/client.js
const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(res) {
  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch { }
    throw new Error(detail);
  }
  return res.json();
}

export async function registerUser(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function analyzeResume(file, jobDescription, token) {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_description", jobDescription);

  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function getAnalysis(id, token) {
  const res = await fetch(`${API_URL}/analyze/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function listAnalyses(token) {
  const res = await fetch(`${API_URL}/analyze`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}