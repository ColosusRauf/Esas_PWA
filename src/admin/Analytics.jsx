import React, { useMemo, useState } from "react";
import { ArrowUpToLine, ArrowDownToLine, Sigma, Gauge, Download } from "lucide-react";
import { Card, StatCard, PageTitle, primaryBtn, inputStyle } from "./ui.jsx";
import { TrendChart, Distribution, SymptomBars } from "./charts.jsx";
import {
  inPeriod, inDateRange, withTotal, mean, sd, r1, trend, symptomMeans, distribution, fullCsv, summaryCsv, downloadCsv, dayKey, fmtDate,
} from "./stats.js";
import * as api from "../api.js";

const RANGES = [[7, "7 hari"], [30, "30 hari"], [90, "3 bulan"], [180, "6 bulan"], [365, "1 tahun"]];

export default function Analytics({ assessments }) {
  const [days, setDays] = useState(30);
  const items = useMemo(() => inPeriod(assessments, days), [assessments, days]);
  const prev = useMemo(() => inPeriod(assessments, days, 1), [assessments, days]);

  const s = useMemo(() => {
    const t = withTotal(items);
    const totals = t.map((a) => a.total);
    const prevMean = mean(withTotal(prev).map((a) => a.total));
    const m = mean(totals);
    const hi = t.length ? t.reduce((x, y) => (y.total > x.total ? y : x)) : null;
    const lo = t.length ? t.reduce((x, y) => (y.total < x.total ? y : x)) : null;
    return {
      n: t.length, patients: new Set(t.map((a) => a.patientId)).size,
      hi, lo, mean: r1(m), sd: r1(sd(totals)),
      delta: prev.length && t.length ? Math.round(((m - prevMean) / (prevMean || 1)) * 100) : null,
      trend: trend(items, days), sym: symptomMeans(items), dist: distribution(items),
    };
  }, [items, prev, days]);

  return (
    <>
      <PageTitle
        title="Analitik & Ekspor"
        sub="Analisis data ESAS untuk mendukung penelitian dan pengambilan keputusan klinis."
        right={
          <div role="group" aria-label="Rentang waktu" style={{ display: "flex", maxWidth: "100%", overflowX: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            {RANGES.map(([d, label]) => (
              <button key={d} onClick={() => setDays(d)} aria-pressed={days === d} style={{
                border: "none", padding: "8px 14px", fontSize: 13, whiteSpace: "nowrap", fontWeight: 600, cursor: "pointer",
                background: days === d ? "var(--primary)" : "transparent", color: days === d ? "#fff" : "var(--ink-soft)",
              }}>{label}</button>
            ))}
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        <StatCard icon={ArrowUpToLine} label="Skor tertinggi" value={s.hi ? s.hi.total : "–"} sub={s.hi ? `${fmtDate(s.hi.createdAt)} (${s.hi.patientId})` : undefined} />
        <StatCard icon={ArrowDownToLine} label="Skor terendah" value={s.lo ? s.lo.total : "–"} sub={s.lo ? `${fmtDate(s.lo.createdAt)} (${s.lo.patientId})` : undefined} />
        <StatCard icon={Gauge} label="Rata-rata skor" value={s.n ? s.mean : "–"}
          sub={s.delta === null ? `${s.n} assessment, ${s.patients} pasien` : `${s.delta > 0 ? "↑" : s.delta < 0 ? "↓" : "="} ${Math.abs(s.delta)}% dari periode sebelumnya`}
          subTone={s.delta > 0 ? "up" : s.delta < 0 ? "down" : undefined} />
        <StatCard icon={Sigma} label="Standar deviasi" value={s.n ? s.sd : "–"} sub="sampel (n−1)" />
      </div>

      <div className="fit-rows">
        <Card title={`Tren total skor ESAS (${days <= 31 ? "per hari" : "per minggu"})`}><TrendChart data={s.trend} /></Card>
        <Card title="Rata-rata skor per gejala"><SymptomBars rows={s.sym} /></Card>
        <Card title="Distribusi total skor ESAS"><Distribution bins={s.dist} /></Card>
        <ExportPanel assessments={assessments} />
      </div>
    </>
  );
}

function ExportPanel({ assessments }) {
  const today = dayKey(new Date().toISOString());
  const [from, setFrom] = useState(() => dayKey(new Date(Date.now() - 29 * 864e5).toISOString()));
  const [to, setTo] = useState(today);
  const [kind, setKind] = useState("full");

  const rows = useMemo(() => inDateRange(assessments, from, to), [assessments, from, to]);
  const nPatients = new Set(rows.map((a) => a.patientId)).size;

  function run() {
    const csv = kind === "full" ? fullCsv(rows) : summaryCsv(rows);
    downloadCsv(`esas-${kind === "full" ? "lengkap" : "ringkasan"}-${from}_${to}.csv`, csv);
    api.adminLogExport({ kind, from, to, count: rows.length }).catch(() => {}); // pencatatan ekspor, tidak menghalangi unduhan
  }

  const opt = (value, title, desc) => (
    <label style={{ display: "flex", gap: 10, padding: "10px 12px", border: `1px solid ${kind === value ? "var(--primary)" : "var(--border)"}`, borderRadius: 11, cursor: "pointer", background: kind === value ? "var(--primary-soft)" : "transparent" }}>
      <input type="radio" name="kind" checked={kind === value} onChange={() => setKind(value)} style={{ marginTop: 3 }} />
      <span><strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{title}</strong><br /><span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{desc}</span></span>
    </label>
  );

  return (
    <Card title="Ekspor data penelitian">
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 10px" }}>
        Berkas CSV hanya memuat Patient ID, tanpa nama atau tanggal lahir.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 12 }}>
        {opt("full", "Data ESAS lengkap", "Satu baris per assessment, 10 gejala dan total skor.")}
        {opt("summary", "Data ringkasan", "Satu baris per pasien: jumlah, rata-rata, min, maks, SD.")}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 130 }}>
          <label htmlFor="ex-from" style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "block", marginBottom: 5 }}>Dari</label>
          <input id="ex-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 130 }}>
          <label htmlFor="ex-to" style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "block", marginBottom: 5 }}>Sampai</label>
          <input id="ex-to" type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <button onClick={run} disabled={!rows.length} style={{ ...primaryBtn, width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 8, opacity: rows.length ? 1 : 0.5, cursor: rows.length ? "pointer" : "not-allowed" }}>
        <Download size={16} /> Ekspor CSV
      </button>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "center", margin: "10px 0 0" }}>
        {rows.length ? `${rows.length} assessment dari ${nPatients} pasien` : "Tidak ada data pada rentang ini."}
      </p>
    </Card>
  );
}
