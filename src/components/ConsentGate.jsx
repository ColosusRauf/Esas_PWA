import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { LangSegment } from "./Toggles.jsx";
import { primaryBtn, ghostBtn } from "./ui.jsx";

// Menahan seluruh aplikasi pasien sampai persetujuan diberikan.
export default function ConsentGate({ onAccept, onLogout, onReadPolicy }) {
  const { t } = useLang();
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  async function go() {
    setBusy(true); setErr(false);
    try { await onAccept(); } catch { setErr(true); setBusy(false); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="cg-title">
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} color="var(--primary)" />
          </div>
          <LangSegment compact />
        </div>
        <h2 id="cg-title">{t("cg.title")}</h2>
        <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14.5 }}>{t("cg.intro")}</p>
        <ul>
          <li>{t("cg.p1")}</li>
          <li>{t("cg.p2")}</li>
          <li>{t("cg.p3")}</li>
          <li>{t("cg.p4")}</li>
        </ul>
        <button onClick={onReadPolicy} style={{ background: "none", border: "none", padding: 0, color: "var(--primary)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", textDecoration: "underline" }}>
          {t("cg.read")}
        </button>
        <label className="check">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>{t("cg.check")}</span>
        </label>
        {err && <p role="alert" className="alert-err">{t("cg.error")}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={go} disabled={!ok || busy} style={{ ...primaryBtn, flex: "1 1 200px", opacity: ok && !busy ? 1 : 0.45, cursor: ok && !busy ? "pointer" : "not-allowed" }}>
            {busy ? t("cg.saving") : t("cg.agree")}
          </button>
          <button onClick={onLogout} style={{ ...ghostBtn, flex: "1 1 160px" }}>{t("cg.decline")}</button>
        </div>
      </div>
    </div>
  );
}
