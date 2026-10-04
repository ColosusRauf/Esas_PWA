import React from "react";
import EmptyState from "../components/EmptyState.jsx";
import { LangSegment, ThemeButton } from "../components/Toggles.jsx";
import { useLang } from "../i18n.jsx";
import { primaryBtn } from "../components/ui.jsx";

export default function NotFound({ onHome }) {
  const { t } = useLang();
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 10 }}>
      <div className="l-tools" style={{ position: "absolute", top: 16, right: 16 }}><LangSegment compact /><ThemeButton /></div>
      <EmptyState kind="search" title={t("nf.title")} text={t("nf.text")}
        action={<button onClick={onHome} style={{ ...primaryBtn, marginTop: 14 }}>{t("nf.home")}</button>} />
      <div style={{ fontSize: 56, fontWeight: 800, color: "var(--border)", letterSpacing: 2 }} aria-hidden="true">404</div>
    </div>
  );
}
