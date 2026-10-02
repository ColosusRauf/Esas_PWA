import React, { useMemo } from "react";
import { Users, ClipboardCheck, Activity, AlertTriangle } from "lucide-react";
import { Card, StatCard, Empty, th, td, PageTitle } from "./ui.jsx";
import { TrendChart, Distribution } from "./charts.jsx";
import {
  dayKey, fmtDate, inPeriod, mean, r1, trend, distribution, withTotal, latestByPatient, severeSymptoms, topSymptom, who,
} from "./stats.js";

export default function Dashboard({ patients, assessments, byId, onOpenPatient, onNavigate }) {
  const m = useMemo(() => {
    const today = dayKey(new Date().toISOString());
    const cur = inPeriod(assessments, 30);
    const prev = inPeriod(assessments, 30, 1);
    const curMean = mean(withTotal(cur).map((a) => a.total));
    const prevMean = mean(withTotal(prev).map((a) => a.total));
    const delta = prev.length && cur.length ? Math.round(((curMean - prevMean) / (prevMean || 1)) * 100) : null;

    const recent14 = inPeriod(assessments, 14);
    const attention = [...latestByPatient(recent14).values()]
      .map((a) => ({ a, sev: severeSymptoms(a) }))
      .filter((x) => x.sev.length)
      .sort((x, y) => y.sev[0].v - x.sev[0].v);

    return {
      active: patients.filter((p) => p.active !== false).length,
      todayCount: assessments.filter((a) => dayKey(a.createdAt) === today).length,
      curMean: r1(curMean), n30: cur.length, delta,
      attention,
      trend7: trend(inPeriod(assessments, 7), 7),
      dist: distribution(cur),
      latest: withTotal(assessments).slice(-6).reverse(),
    };
  }, [patients, assessments]);

  return (
    <>
      <PageTitle title="Dashboard" sub="Ringkasan pasien dan hasil assessment ESAS." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        <StatCard icon={Users} label="Pasien aktif" value={m.active} />
        <StatCard icon={ClipboardCheck} label="Assessment hari ini" value={m.todayCount} />
        <StatCard
          icon={Activity} label="Rata-rata skor (30 hari)" value={m.n30 ? m.curMean : "–"}
          sub={m.delta === null ? `${m.n30} assessment` : `${m.delta > 0 ? "↑" : m.delta < 0 ? "↓" : "="} ${Math.abs(m.delta)}% dari 30 hari sebelumnya`}
          subTone={m.delta > 0 ? "up" : m.delta < 0 ? "down" : undefined}
        />
        <StatCard icon={AlertTriangle} label="Perlu perhatian" value={m.attention.length} sub="gejala > 6, 14 hari terakhir" />
      </div>

      <div className="fit-rows">
        <Card title="Tren rata-rata skor (7 hari)"><TrendChart data={m.trend7} /></Card>
        <Card title="Distribusi total skor (30 hari)"><Distribution bins={m.dist} /></Card>
        <Card title="Perlu perhatian">
          {m.attention.length === 0 ? (
            <Empty>Tidak ada pasien dengan gejala berat pada assessment terakhirnya.</Empty>
          ) : (
            <div className="table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Pasien</th><th style={th}>Tanggal</th><th style={th}>Gejala berat</th></tr></thead>
                <tbody>
                  {m.attention.slice(0, 8).map(({ a, sev }) => (
                    <tr key={a.clientId} onClick={() => onOpenPatient(a.patientId)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontWeight: 600 }}>{who(byId, a.patientId)}</td>
                      <td style={td}>{fmtDate(a.createdAt)}</td>
                      <td style={{ ...td, color: "var(--severe)" }}>{sev.slice(0, 3).map((s) => `${s.label} ${s.v}`).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Assessment terbaru" action={<button onClick={() => onNavigate("analytics")} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Analitik</button>}>
          {m.latest.length === 0 ? (
            <Empty>Belum ada assessment masuk.</Empty>
          ) : (
            <div className="table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Tanggal</th><th style={th}>Pasien</th><th style={th}>Total</th><th style={th}>Gejala tertinggi</th></tr></thead>
                <tbody>
                  {m.latest.map((a) => {
                    const t = topSymptom(a);
                    return (
                      <tr key={a.clientId} onClick={() => onOpenPatient(a.patientId)} style={{ cursor: "pointer" }}>
                        <td style={td}>{fmtDate(a.createdAt)}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{a.patientId}</td>
                        <td style={td}>{a.total}</td>
                        <td style={td}>{t.label} ({t.v})</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
