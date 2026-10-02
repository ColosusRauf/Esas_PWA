import React from "react";
import { ClipboardCheck, Gauge, CalendarClock, User } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Card } from "../components/ui.jsx";
import { totalOf } from "../data.js";
import { useLang } from "../i18n.jsx";
import { dayKeyWIB } from "../format.js";

export default function Profile({ patientId, assessments, onNavigate, onLogout }) {
  const { t, lang } = useLang();
  const totals = assessments.map((a) => totalOf(a.answers));
  const avg = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : "-";
  const lastRec = assessments[assessments.length - 1];
  const last = lastRec ? dayKeyWIB(lastRec.createdAt).split("-").reverse().join(" - ") : "-"; // dd - mm - yyyy

  const stats = [
    { icon: ClipboardCheck, label: t("pr.count"), value: assessments.length },
    { icon: Gauge, label: t("pr.avg"), value: avg },
    { icon: CalendarClock, label: t("pr.last"), value: last, small: true },
  ];

  return (
    <Layout active="profile" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title={t("pr.title")} subtitle={t("pr.sub")}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 20, alignItems: "start" }} className="profile-grid">
        <Card style={{ textAlign: "center" }} bodyStyle={{ justifyContent: "center" }}>
          <div style={{
            width: 104, height: 104, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 36, margin: "0 auto 18px",
          }}>
            <User size={46} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{t("common.patient")} {patientId}</div>
          <div style={{ fontSize: 15, color: "var(--ink-soft)", marginTop: 4 }}>{t("pr.role")}</div>
          <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 15 }}>
            <span style={{ color: "var(--ink-soft)" }}>{t("lg.id")}</span>
            <strong style={{ color: "var(--ink)" }}>{patientId}</strong>
          </div>
        </Card>

        <div className="stats-col">
          {stats.map((s) => (
            <Card key={s.label} bodyStyle={{ flexDirection: "row", gap: 14, alignItems: "center", justifyContent: "flex-start" }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={27} color="var(--primary)" />
              </div>
              <div style={{ minWidth: 0, flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{s.label}</div>
                <div style={{ fontSize: s.small ? 20 : 26, whiteSpace: "nowrap", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{s.value}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
