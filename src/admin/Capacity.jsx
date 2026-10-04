import React, { useEffect, useState } from "react";
import { Users, ClipboardCheck, ScrollText, BellRing, Database } from "lucide-react";
import { Card, StatCard, PageTitle, Empty } from "./ui.jsx";
import * as api from "../api.js";

const MB = 1024 * 1024;
const BYTES_PER_ASSESSMENT = 1024; // perkiraan konservatif termasuk indeks

function years(days) {
  if (!isFinite(days) || days > 365 * 50) return "lebih dari 50 tahun";
  if (days < 60) return `${Math.floor(days)} hari`;
  if (days < 700) return `${Math.floor(days / 30)} bulan`;
  return `${(days / 365).toFixed(1)} tahun`;
}

export default function Capacity({ onUnauthorized }) {
  const [st, setSt] = useState({ loading: true, error: "", d: null });
  useEffect(() => {
    let live = true;
    api.adminCapacity()
      .then((d) => live && setSt({ loading: false, error: "", d }))
      .catch((e) => {
        if (e.message === "UNAUTHORIZED") return onUnauthorized();
        live && setSt({ loading: false, error: e.status === 501 ? "Fitur ini hanya tersedia pada mode Supabase." : "Gagal memuat data kapasitas.", d: null });
      });
    return () => { live = false; };
  }, []);

  const d = st.d;
  const pct = d?.dbBytes ? Math.min(100, (d.dbBytes / d.dbLimitBytes) * 100) : null;
  const tone = pct == null ? "var(--primary)" : pct > 85 ? "var(--severe)" : pct > 60 ? "var(--moderate)" : "var(--mild)";
  const remain = d?.dbBytes ? Math.max(0, d.dbLimitBytes - d.dbBytes) : null;
  const rowsLeft = remain != null ? Math.floor(remain / BYTES_PER_ASSESSMENT) : null;
  const perDay = Math.max(1, d?.activePatients || 0);

  return (
    <>
      <PageTitle title="Kapasitas" sub="Pemakaian database dan perkiraan sisa kapasitas paket gratis." />
      {st.loading && <Empty>Memuat…</Empty>}
      {st.error && <div role="alert" className="alert-err">{st.error}</div>}
      {d && (
        <div className="fit-scroll" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            <StatCard icon={Users} label="Pasien" value={d.patients} sub={`${d.activePatients} aktif`} />
            <StatCard icon={ClipboardCheck} label="Assessment" value={d.assessments} />
            <StatCard icon={ScrollText} label="Log aktivitas" value={d.logs} />
            <StatCard icon={BellRing} label="Perangkat pengingat" value={d.pushSubs} />
          </div>

          <Card title="Ukuran database">
            {pct == null ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)" }}>
                Ukuran database belum bisa dibaca. Jalankan berkas <code>supabase/06_security.sql</code> di Supabase SQL Editor.
              </p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>
                  <span><Database size={15} style={{ verticalAlign: -2 }} /> {(d.dbBytes / MB).toFixed(1)} MB terpakai</span>
                  <span style={{ color: "var(--ink-soft)" }}>batas {d.dbLimitBytes / MB} MB</span>
                </div>
                <div className="cap-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${Math.max(pct, 1.5)}%`, background: tone }} />
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "10px 0 0" }}>{pct.toFixed(1)}% dari kuota database gratis.</p>
              </>
            )}
          </Card>

          <Card title="Perkiraan sisa kapasitas">
            {rowsLeft == null ? (
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)" }}>Menunggu data ukuran database.</p>
            ) : (
              <ul className="cap-list">
                <li>Sisa ruang cukup untuk sekitar <b>{rowsLeft.toLocaleString("id-ID")}</b> assessment lagi.</li>
                <li>Dengan <b>{perDay}</b> pasien aktif mengisi 1x per hari, kapasitas bertahan sekitar <b>{years(rowsLeft / perDay)}</b>.</li>
                <li>Perkiraan memakai 1 KB per assessment (sudah termasuk indeks). Angka nyata bisa sedikit berbeda.</li>
              </ul>
            )}
          </Card>

          <Card title="Batas paket gratis (patokan)">
            <ul className="cap-list">
              <li>Supabase: database 500 MB, 50.000 pengguna aktif per bulan, proyek di-<i>pause</i> bila tidak aktif 1 minggu, tanpa cadangan otomatis (gunakan tombol Cadangan lengkap di Analitik &amp; Ekspor).</li>
              <li>Vercel Hobby: 1 juta pemanggilan fungsi per bulan, cron 1x per hari, hanya untuk penggunaan non-komersial.</li>
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
