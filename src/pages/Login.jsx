import React, { useState } from "react";
import { HeartPulse, User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { LangSegment, ThemeButton } from "../components/Toggles.jsx";

export default function Login({ onLogin, loading, error, onBack, onPrivacy }) {
  const { t } = useLang();
  const [forgot, setForgot] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [staff, setStaff] = useState(false);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24, flexDirection: "column", gap: 14
    }}>
      <div style={{ width: "100%", maxWidth: 920, display: "flex", alignItems: "center", gap: 8 }}>
        {onBack && (
          <button onClick={onBack} className="icon-btn" aria-label={t("lg.backHome")} title={t("lg.backHome")}><ArrowLeft size={17} /></button>
        )}
        <div className="l-tools"><LangSegment compact /><ThemeButton /></div>
      </div>
      <div style={{
        display: "flex", width: "100%", maxWidth: 920, minHeight: 480, borderRadius: 22,
        overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 24px 60px -30px rgba(30,41,59,0.3)"
      }}>
        <div style={{
          flex: 1, minWidth: 300, background: "linear-gradient(160deg, var(--primary) 0%, #1E3A8A 100%)",
          color: "#fff", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18
          }}>
            <HeartPulse size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>ESAS</div>
          <h2 style={{ fontSize: 24, lineHeight: 1.35, margin: "0 0 14px", fontWeight: 700 }}>
            {t("lg.heroTitle")}
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.85, maxWidth: 320 }}>
            {t("lg.heroText")}
          </p>
        </div>

        <div style={{ flex: 1, minWidth: 300, background: "var(--surface)", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 22, margin: "0 0 4px", color: "var(--ink)" }}>{t("lg.welcome")}</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 26px" }}>
            {staff ? t("lg.sub.staff") : t("lg.sub")}
          </p>

          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 7, display: "block" }}>{staff ? t("lg.id.staff") : t("lg.id")}</label>
          <div style={{ position: "relative", marginBottom: 18 }}>
            <User size={16} color="var(--ink-soft)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={patientId} onChange={(e) => setPatientId(e.target.value)}
              placeholder={staff ? t("lg.id.ph.staff") : t("lg.id.ph")}
              onKeyDown={(e) => e.key === "Enter" && onLogin(patientId.trim(), password, staff ? "staff" : "patient")}
              autoCapitalize="none" autoComplete="username"
              style={{
                width: "100%", padding: "12px 14px 12px 38px", borderRadius: 11, border: "1px solid var(--border)",
                fontSize: 14, boxSizing: "border-box", color: "var(--ink)"
              }}
            />
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 7, display: "block" }}>{t("lg.pw")}</label>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Lock size={16} color="var(--ink-soft)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type={showPw ? "text" : "password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("lg.pw.ph")}
              onKeyDown={(e) => e.key === "Enter" && onLogin(patientId.trim(), password, staff ? "staff" : "patient")}
              autoComplete="current-password"
              style={{
                width: "100%", padding: "12px 38px 12px 38px", borderRadius: 11, border: "1px solid var(--border)",
                fontSize: 14, boxSizing: "border-box", color: "var(--ink)"
              }}
            />
            <button onClick={() => setShowPw(!showPw)} aria-label={showPw ? t("lg.pw.hide") : t("lg.pw.show")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)"
            }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <button onClick={() => setForgot(!forgot)} style={{ fontSize: 12.5, color: "var(--primary)", cursor: "pointer", background: "none", border: "none", padding: 0 }}>{t("lg.forgot")}</button>
            {forgot && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 6, textAlign: "left" }}>{t("lg.forgotHelp")}</div>}
          </div>

          {error && <p role="alert" style={{ color: "var(--severe)", fontSize: 13, margin: "0 0 12px" }}>{t(error)}</p>}
          <button
            onClick={() => onLogin(patientId.trim(), password, staff ? "staff" : "patient")}
            disabled={loading}
            style={{
              background: "var(--primary)", color: "#fff", border: "none", borderRadius: 11,
              padding: "13px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16
            }}
          >
            {loading ? t("lg.checking") : t("lg.submit")}
          </button>

          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center", margin: 0 }}>
            {t("lg.noAccount")} <span style={{ color: "var(--primary)", fontWeight: 600 }}>{t("lg.contactStaff")}</span>
          </p>
          <p style={{ textAlign: "center", margin: "12px 0 0" }}>
            <button onClick={() => setStaff(!staff)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "var(--ink-soft)", textDecoration: "underline" }}>
              {staff ? t("lg.asPatient") : t("lg.asStaff")}
            </button>
          </p>
          {onPrivacy && (
            <p style={{ textAlign: "center", margin: "10px 0 0" }}>
              <button onClick={onPrivacy} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "var(--primary)" }}>{t("lg.privacy")}</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
