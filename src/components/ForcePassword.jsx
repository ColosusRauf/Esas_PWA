import React, { useEffect } from "react";
import { KeyRound } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { LangSegment } from "./Toggles.jsx";
import { ghostBtn } from "./ui.jsx";
import PasswordForm from "./PasswordForm.jsx";

// Menahan aplikasi sampai password sementara diganti (akun baru / habis di-reset admin).
export default function ForcePassword({ onDone, onLogout }) {
  const { t } = useLang();
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="fp-title" style={{ zIndex: 160 }}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={24} color="var(--primary)" />
          </div>
          <LangSegment compact />
        </div>
        <h2 id="fp-title">{t("pw.force.title")}</h2>
        <p style={{ margin: "0 0 16px", color: "var(--ink-soft)", fontSize: 14.5 }}>{t("pw.force.text")}</p>
        <PasswordForm onDone={onDone} onUnauthorized={onLogout}
          extra={<button type="button" onClick={onLogout} style={{ ...ghostBtn, flex: "1 1 140px" }}>{t("nav.logout")}</button>} />
      </div>
    </div>
  );
}
