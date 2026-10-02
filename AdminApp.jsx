import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminSidebar from "./AdminSidebar.jsx";
import Dashboard from "./Dashboard.jsx";
import Patients from "./Patients.jsx";
import PatientDetail from "./PatientDetail.jsx";
import Analytics from "./Analytics.jsx";
import Logs from "./Logs.jsx";
import { ghostBtn } from "./ui.jsx";
import * as api from "../api.js";

export default function AdminApp({ session, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [patientId, setPatientId] = useState(null);
  const [state, setState] = useState({ loading: true, error: "", patients: [], assessments: [] });
  const isAdmin = session.role === "admin";

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [patients, assessments] = await Promise.all([api.adminPatients(), api.adminAssessments()]);
      assessments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setState({ loading: false, error: "", patients, assessments });
    } catch (e) {
      if (e.message === "UNAUTHORIZED") return onLogout();
      setState((s) => ({ ...s, loading: false, error: "Gagal memuat data. Periksa koneksi lalu coba lagi." }));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const byId = useMemo(() => new Map(state.patients.map((p) => [p.id, p])), [state.patients]);
  const go = (v, id = null) => { setView(v); setPatientId(id); window.scrollTo?.(0, 0); };
  const data = { patients: state.patients, assessments: state.assessments, byId };

  return (
    <div className="shell" style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <AdminSidebar active={view} onNavigate={(v) => go(v)} session={session} onLogout={onLogout} onRefresh={load} loading={state.loading} />
      <main className="page page-fit">
        <div className="only-mobile" style={{ justifyContent: "flex-end", alignItems: "center", gap: 12, marginBottom: 6 }}>
          {state.loading && <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Memuat data…</span>}
          <button onClick={load} disabled={state.loading} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px" }}>
            <RefreshCw size={14} /> Muat ulang
          </button>
        </div>
        {state.error && (
          <div role="alert" className="alert-err">
            {state.error}
          </div>
        )}

        <div className="fit-body">
        {view === "dashboard" && <Dashboard {...data} onOpenPatient={(id) => go("patients", id)} onNavigate={go} />}
        {view === "patients" && !patientId && (
          <Patients {...data} isAdmin={isAdmin} onOpen={(id) => go("patients", id)} onCreated={load} />
        )}
        {view === "patients" && patientId && <PatientDetail {...data} id={patientId} isAdmin={isAdmin} onChanged={load} onBack={() => go("patients")} />}
        {view === "analytics" && <Analytics {...data} />}
        {view === "logs" && isAdmin && <Logs onUnauthorized={onLogout} />}
        </div>
      </main>
    </div>
  );
}
