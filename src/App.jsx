import React, { useEffect, useRef, useState } from "react";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Assessment from "./pages/Assessment.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import * as api from "./api.js";

const KEY_SESSION = "esas.session";
const KEY_CACHE = "esas.cache";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

// record: { clientId, createdAt, answers, synced }
const toAssessment = (r) => ({
  id: r.clientId,
  tanggal: fmtDate(r.createdAt),
  answers: r.answers,
  status: r.synced ? "Selesai" : "Menunggu sinkron",
});

export default function App() {
  const [session, setSession] = useState(() => {
    const s = api.getToken() ? load(KEY_SESSION, null) : null;
    return s && typeof s === "object" && s.role ? s : null;
  });
  const patientId = session?.role === "patient" ? session.id : null;
  const isStaff = session && session.role !== "patient";
  const [view, setView] = useState(() => (api.getToken() && load(KEY_SESSION, null)?.role ? "dashboard" : "landing"));
  const [records, setRecords] = useState(() => load(KEY_CACHE, []));
  const [loginState, setLoginState] = useState({ loading: false, error: "" });
  const recordsRef = useRef(records);
  recordsRef.current = records;
  const syncing = useRef(false);

  useEffect(() => { save(KEY_CACHE, records); }, [records]);

  async function sync() {
    if (syncing.current || !api.getToken()) return;
    syncing.current = true;
    try {
      for (const r of recordsRef.current.filter((x) => !x.synced)) await api.createAssessment(r);
      const server = await api.listAssessments();
      setRecords(server.map((s) => ({ ...s, synced: true })));
    } catch (e) {
      if (e.message === "UNAUTHORIZED") logout();
      // gangguan jaringan: data tetap aman di perangkat, dicoba lagi saat online
    } finally {
      syncing.current = false;
    }
  }

  useEffect(() => { if (patientId) sync(); }, [patientId]);
  useEffect(() => { if (patientId && records.some((r) => !r.synced)) sync(); }, [records]);
  useEffect(() => {
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, []);

  async function login(id, password, role) {
    setLoginState({ loading: true, error: "" });
    try {
      const res = await api.login(id, password, role);
      api.setToken(res.token);
      const next = { id: res.id, role: res.role, name: res.name };
      save(KEY_SESSION, next);
      setRecords([]);
      setSession(next);
      setLoginState({ loading: false, error: "" });
      setView("dashboard");
    } catch (e) {
      setLoginState({
        loading: false,
        error: e.message === "UNAUTHORIZED" ? "ID atau password salah." : "Tidak dapat terhubung ke server. Coba lagi.",
      });
    }
  }

  function logout() {
    api.setToken(null);
    try { localStorage.removeItem(KEY_SESSION); localStorage.removeItem(KEY_CACHE); } catch {}
    setRecords([]);
    setSession(null);
    setView("landing");
  }

  function submitAssessment(answers) {
    const rec = { clientId: crypto.randomUUID(), createdAt: new Date().toISOString(), answers, synced: false };
    setRecords((prev) => [...prev, rec]);
    setView("history");
  }

  const assessments = records.map(toAssessment);
  if (isStaff) return <AdminApp session={session} onLogout={logout} />;
  const guarded = ["dashboard", "assessment", "history", "profile", "settings"];
  if (guarded.includes(view) && !patientId) return <Login onLogin={login} {...loginState} />;

  const common = { patientId, onNavigate: setView, onLogout: logout };

  switch (view) {
    case "login":
      return <Login onLogin={login} {...loginState} />;
    case "dashboard":
      return <Dashboard {...common} assessments={assessments} onStartAssessment={() => setView("assessment")} />;
    case "assessment":
      return <Assessment {...common} onSubmit={submitAssessment} />;
    case "history":
      return <History {...common} assessments={assessments} />;
    case "profile":
      return <Profile {...common} assessments={assessments} />;
    case "settings":
      return <Settings {...common} />;
    default:
      return <Landing onGetStarted={() => setView("login")} onLogin={() => setView("login")} />;
  }
}
