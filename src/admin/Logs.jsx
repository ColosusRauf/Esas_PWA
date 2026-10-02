import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, Empty, th, td, PageTitle, inputStyle } from "./ui.jsx";
import { fmtDate, TZ } from "./stats.js";
import * as api from "../api.js";

const ACTIONS = {
  LOGIN: "Masuk",
  SUBMIT_ASSESSMENT: "Assessment dikirim",
  CREATE_PATIENT: "Pasien ditambahkan",
  UPDATE_PATIENT: "Data pasien diubah",
  SET_ACTIVE: "Status pasien diubah",
  RESET_PASSWORD: "Password direset",
  EXPORT_CSV: "Ekspor CSV",
};
const ROLE = { patient: "Pasien", admin: "Admin", researcher: "Peneliti" };
const time = (iso) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });

export default function Logs({ onUnauthorized }) {
  const [st, setSt] = useState({ loading: true, error: "", items: [] });
  const [action, setAction] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    api.adminLogs()
      .then((items) => live && setSt({ loading: false, error: "", items }))
      .catch((e) => {
        if (e.message === "UNAUTHORIZED") return onUnauthorized();
        live && setSt({ loading: false, error: "Gagal memuat log.", items: [] });
      });
    return () => { live = false; };
  }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return st.items.filter((r) =>
      (!action || r.action === action) &&
      (!s || [r.actor, r.target, r.detail].some((v) => (v || "").toLowerCase().includes(s)))
    );
  }, [st.items, action, q]);

  return (
    <>
      <PageTitle title="Log aktivitas" sub="500 aktivitas terbaru. Password tidak pernah dicatat." />
      <Card fill>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", flexShrink: 0 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
            <Search size={15} color="var(--ink-soft)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pelaku, sasaran, atau detail" aria-label="Cari log" style={{ ...inputStyle, paddingLeft: 34 }} />
          </div>
          <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Filter aktivitas" style={{ ...inputStyle, width: "auto" }}>
            <option value="">Semua aktivitas</option>
            {Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {st.loading ? <Empty>Memuat log…</Empty> : st.error ? <Empty>{st.error}</Empty> : rows.length === 0 ? <Empty>Tidak ada aktivitas yang cocok.</Empty> : (
          <div className="table-wrap scroll-y">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead><tr><th style={th}>Waktu (WIB)</th><th style={th}>Pelaku</th><th style={th}>Aktivitas</th><th style={th}>Sasaran</th><th style={th}>Detail</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDate(r.at)} {time(r.at)}</td>
                    <td style={td}><strong>{r.actor}</strong> <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>{ROLE[r.role] || r.role}</span></td>
                    <td style={td}>{ACTIONS[r.action] || r.action}</td>
                    <td style={td}>{r.target || "–"}</td>
                    <td style={{ ...td, color: "var(--ink-soft)" }}>{r.detail || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
