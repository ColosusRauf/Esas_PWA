import React from "react";
import { PlayCircle, MessageCircle, Mail } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Card, ghostBtn } from "../components/ui.jsx";
import { useLang } from "../i18n.jsx";
import { CONTACT } from "../contact.js";

const N = 8;

export default function Help({ patientId, onNavigate, onLogout, onTour }) {
  const { t } = useLang();
  const wa = String(CONTACT.phone || "").replace(/\D/g, "");
  return (
    <Layout active="help" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout} title={t("hp.title")} subtitle={t("hp.sub")}>
      <div className="fit-scroll">
        <div className="set-grid" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }} id="help-grid">
          <Card title={t("hp.faq")}>
            <div className="faq">
              {Array.from({ length: N }, (_, i) => (
                <details key={i}>
                  <summary>{t(`hp.q${i + 1}`)}</summary>
                  <p>{t(`hp.a${i + 1}`)}</p>
                </details>
              ))}
            </div>
          </Card>
          <div className="set-col">
            <Card title={t("hp.tour")}>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55 }}>{t("hp.tourText")}</p>
              <button onClick={onTour} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 8 }}><PlayCircle size={17} /> {t("hp.tourBtn")}</button>
            </Card>
            <Card title={t("hp.contact")}>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55 }}>{t("hp.contactText")}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {wa && <a className="ca-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>}
                {CONTACT.email && <a className="ca-btn" href={`mailto:${CONTACT.email}`}><Mail size={15} /> Email</a>}
              </div>
            </Card>
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "2px 4px", lineHeight: 1.5 }}>{t("hp.emergency")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
