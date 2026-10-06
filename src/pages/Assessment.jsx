import React, { useState } from "react";
import Layout from "../components/Layout.jsx";
import { Card, primaryBtn, ghostBtn } from "../components/ui.jsx";
import { DOMAINS, dFull, dLo, dHi } from "../data.js";
import { useLang } from "../i18n.jsx";

const PER_PAGE = 4;
const PAGES = Math.ceil(DOMAINS.length / PER_PAGE);

export default function Assessment({ patientId, onNavigate, onLogout, onSubmit }) {
  const { t, lang } = useLang();
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState(Array(DOMAINS.length).fill(null));
  const [other, setOther] = useState("");

  const start = page * PER_PAGE;
  const pageItems = DOMAINS.slice(start, start + PER_PAGE);
  const answeredCount = answers.filter((v) => v !== null).length;
  const pct = (answeredCount / DOMAINS.length) * 100;
  const isLastPage = page === PAGES - 1;
  const otherIdx = DOMAINS.findIndex((d) => d.key === "lainnya");
  const otherOk = answers[otherIdx] === 0 || other.trim().length > 0; // bila skor > 0, nama gejala wajib
  const pageComplete = pageItems.every((_, i) => answers[start + i] !== null) && (!pageItems.some((d) => d.key === "lainnya") || otherOk);

  function setAnswer(idx, v) {
    const next = [...answers];
    next[idx] = v;
    setAnswers(next);
  }

  function handleNext() {
    if (isLastPage) onSubmit(answers, answers[otherIdx] > 0 ? other.trim().slice(0, 60) : null);
    else setPage(page + 1);
  }

  return (
    <Layout active="assessment" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title={t("as.title")} subtitle={t("as.sub")}>
      <Card style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 15, color: "var(--ink-soft)", fontWeight: 600 }}>{t("as.page", { a: page + 1, b: PAGES })}</span>
          <span style={{ fontSize: 15, color: "var(--ink-soft)", fontWeight: 600 }}>{t("as.answered", { n: answeredCount, m: DOMAINS.length })}</span>
        </div>
        <div style={{ height: 8, borderRadius: 6, background: "var(--primary-soft)", marginBottom: "clamp(12px, 3vh, 28px)", flexShrink: 0 }}>
          <div style={{ width: pct + "%", height: "100%", borderRadius: 6, background: "var(--primary)", transition: "width .2s" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 470px), 1fr))", gap: "clamp(14px, 4vh, 34px) 40px", marginBottom: "clamp(14px, 3vh, 30px)", flex: 1, alignContent: "space-evenly" }}>
          {pageItems.map((d, i) => {
            const idx = start + i;
            const Icon = d.icon;
            const v = answers[idx];
            return (
              <div key={d.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={21} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{idx + 1}. {dFull(d, lang)}</span>
                </div>
                <div style={{ width: "fit-content", maxWidth: "100%" }}>
                <div role="radiogroup" aria-label={dFull(d, lang)} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Array.from({ length: 11 }, (_, n) => n).map((n) => {
                    const selected = v === n;
                    return (
                      <button key={n} role="radio" aria-checked={selected} onClick={() => setAnswer(idx, n)} style={{
                        width: "clamp(32px, min(3.2vw, 5.4vh), 50px)", height: "clamp(32px, min(3.2vw, 5.4vh), 50px)", borderRadius: "50%",
                        border: selected ? "none" : "1px solid var(--border)",
                        background: selected ? "var(--primary)" : "var(--surface)",
                        color: selected ? "#fff" : "var(--ink-soft)", fontSize: 16, fontWeight: 600, cursor: "pointer",
                      }}>{n}</button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--ink-soft)", marginTop: 10 }}>
                  <span>{dLo(d, lang)}</span>
                  <span>{dHi(d, lang)}</span>
                </div>
                {d.key === "lainnya" && v > 0 && (
                  <div className="other-field">
                    <label htmlFor="other-sym">{t("as.other.label")}</label>
                    <input id="other-sym" value={other} maxLength={60} onChange={(e) => setOther(e.target.value)}
                      placeholder={t("as.other.ph")} autoComplete="off" aria-required="true" aria-invalid={!other.trim()} />
                    {!other.trim() && <small>{t("as.other.hint")}</small>}
                  </div>
                )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{
            ...ghostBtn, flex: 1, padding: "13px 18px", fontSize: 16, flexShrink: 0,
            cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1,
          }}>{t("as.prev")}</button>
          <button onClick={handleNext} disabled={!pageComplete} style={{
            ...primaryBtn, flex: 1, padding: "15px 18px", fontSize: 16,
            cursor: pageComplete ? "pointer" : "not-allowed", opacity: pageComplete ? 1 : 0.45,
          }}>{isLastPage ? t("as.submit") : t("as.next")}</button>
        </div>
      </Card>
    </Layout>
  );
}
