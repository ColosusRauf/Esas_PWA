import React from "react";
import { CalendarPlus, CalendarCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { Card, linkBtn, th, td, primaryBtn } from "../components/ui.jsx";
import { DOMAINS, totalOf, dShort } from "../data.js";
import { useLang } from "../i18n.jsx";
import { fmtDate, fmtShort, dayKeyWIB, todayKeyWIB } from "../format.js";

export default function Dashboard({ patientId, assessments, onNavigate, onLogout, onStartAssessment }) {
  const { t, lang } = useLang();
  const latest = assessments[assessments.length - 1];
  const total = latest ? totalOf(latest.answers) : 0;
  const doneToday = !!latest && dayKeyWIB(latest.createdAt) === todayKeyWIB();

  const trend = assessments.slice(-7).map((a) => ({
    tanggal: fmtShort(a.createdAt, lang),
    total: totalOf(a.answers),
  }));

  const topSymptoms = latest
    ? DOMAINS.map((d, i) => ({ ...d, v: latest.answers[i] })).sort((a, b) => b.v - a.v).slice(0, 5)
    : [];

  const Icon = doneToday ? CalendarCheck : CalendarPlus;

  return (
    <Layout active="dashboard" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title={t("dash.hello", { id: patientId })} subtitle={t("dash.sub")}>
      <div className="grid-2 fit-top">
        <Card bodyStyle={{ justifyContent: "space-between", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: "var(--primary-soft)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={30} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>{t("dash.today")}</div>
              <div style={{ fontSize: 15, color: doneToday ? "var(--mild)" : "var(--ink-soft)", marginTop: 3 }}>
                {doneToday ? t("dash.done") : t("dash.notyet")}
              </div>
            </div>
          </div>
          <button onClick={onStartAssessment} style={{ ...primaryBtn, width: "100%", padding: "14px 20px", fontSize: 16, borderRadius: 14 }}>
            {doneToday ? t("dash.again") : t("dash.start")}
          </button>
        </Card>

        <Card title={t("dash.summary")}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <ScoreRing value={total} size={128} />
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 9 }}>
              {topSymptoms.length === 0 && <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>{t("dash.nodata")}</span>}
              {topSymptoms.map((s) => (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 15.5 }}>
                  <span style={{ color: "var(--ink-soft)" }}>{dShort(s, lang)}</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)" }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid-2 fit-fill">
        <Card title={t("dash.history")} action={<button onClick={() => onNavigate("history")} style={linkBtn}>{t("dash.viewall")}</button>}>
          {assessments.length === 0 ? (
            <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>{t("dash.emptyHistory")}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>{t("common.date")}</th><th style={th}>{t("common.total")}</th><th style={th}>{t("common.status")}</th></tr></thead>
              <tbody>
                {[...assessments].reverse().slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td style={td}>{fmtDate(a.createdAt, lang)}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{totalOf(a.answers)}</td>
                    <td style={td}><span style={{ color: a.synced ? "var(--mild)" : "var(--moderate)", fontWeight: 600 }}>● {a.synced ? t("st.done") : t("st.pending")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title={t("dash.chart")}>
          <div className="chart-box" role="img" aria-label={t("dash.chartAria")}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={{ fontSize: 13.5, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)" }} formatter={(v) => [v, t("dash.totalTip")]} />
                <Line type="linear" dataKey="total" stroke="#2563EB" strokeWidth={2.5} isAnimationActive={false}
                  dot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
