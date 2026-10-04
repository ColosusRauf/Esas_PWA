import React, { useState } from "react";
import { useInstall } from "../pwa.js";
import { Download, LogOut, Smartphone, Palette, BellRing, ShieldCheck, KeyRound } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Card, primaryBtn, ghostBtn } from "../components/ui.jsx";
import { ThemeSegment, LangSegment } from "../components/Toggles.jsx";
import { useToast } from "../components/Toast.jsx";
import { useApp } from "../appContext.jsx";
import { useLang } from "../i18n.jsx";
import { fmtDate } from "../format.js";
import PasswordForm from "../components/PasswordForm.jsx";
import * as api from "../api.js";

const heading = { fontWeight: 700, fontSize: 17, color: "var(--ink)" };
const text = { fontSize: 14, color: "var(--ink-soft)", margin: "0 0 12px", lineHeight: 1.55 };


export default function Settings({ patientId, onNavigate, onLogout }) {
  const { t, lang } = useLang();
  const app = useApp();
  const toast = useToast();
  const push = app.push;
  const inst = useInstall();
  const [pushErr, setPushErr] = useState("");

  const errKey = (e) =>
    e.message === "DENIED" ? "se.reminder.denied" : e.message === "NOT_CONFIGURED" ? "se.reminder.notConfigured" :
    e.message === "UNSUPPORTED" ? "se.reminder.unsupported" : "se.reminder.error";

  async function turnOn() {
    setPushErr("");
    try { await push.enable(); toast(t("toast.pushOn")); } catch (e) { setPushErr(errKey(e)); }
  }
  async function turnOff() {
    setPushErr("");
    try { await push.disable(); toast(t("toast.pushOff")); } catch { setPushErr("se.reminder.error"); }
  }
  async function sendTest() {
    setPushErr("");
    try { await api.pushTest(); toast(t("toast.pushTest")); } catch (e) { setPushErr(e.status === 501 ? "se.reminder.notConfigured" : "se.reminder.error"); }
  }

  return (
    <Layout active="settings" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title={t("se.title")} subtitle={t("se.sub")}>
      <div className="fit-scroll">
        <div className="set-top">
          <Card>
            <div className="set-head"><span className="set-ico"><Palette size={20} color="var(--primary)" /></span><div style={{ ...heading, marginBottom: 0 }}>{t("se.appearance")}</div></div>
            <div className="set-appearance">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>{t("se.theme")}</div>
                <ThemeSegment />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>{t("se.language")}</div>
                <LangSegment />
              </div>
            </div>
          </Card>
        </div>

        <div className="set-grid">
          <div className="set-col">
            <Card>
              <div className="set-head"><span className="set-ico"><BellRing size={20} color="var(--primary)" /></span><div style={{ ...heading, marginBottom: 0 }}>{t("se.reminder")}</div></div>
              {push.status === "unsupported" && <p style={text}>{t("se.reminder.unsupported")}</p>}
              {push.status === "denied" && <p style={text}>{t("se.reminder.denied")}</p>}
              {push.status === "off" && (
                <>
                  <p style={text}>{t("se.reminder.desc")}</p>
                  <button onClick={turnOn} disabled={push.busy} style={{ ...primaryBtn, opacity: push.busy ? 0.6 : 1 }}>
                    {push.busy ? t("se.reminder.working") : t("se.reminder.enable")}
                  </button>
                </>
              )}
              {push.status === "on" && (
                <>
                  <p style={{ ...text, color: "var(--mild)", fontWeight: 600 }}>✓ {t("se.reminder.on")}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={sendTest} style={ghostBtn}>{t("se.reminder.test")}</button>
                    <button onClick={turnOff} disabled={push.busy} style={ghostBtn}>{t("se.reminder.disable")}</button>
                  </div>
                </>
              )}
              {pushErr && <p role="alert" className="alert-err" style={{ marginTop: 12, marginBottom: 0 }}>{t(pushErr)}</p>}
            </Card>

            <Card>
              <div className="set-head"><span className="set-ico"><Smartphone size={20} color="var(--primary)" /></span><div style={{ ...heading, marginBottom: 0 }}>{t("se.install")}</div></div>
              {inst.installed ? (
                <p style={text}>{t("se.installed")}</p>
              ) : inst.canPrompt ? (
                <>
                  <p style={text}>{t("se.installReady")}</p>
                  <button onClick={inst.prompt} style={{ ...primaryBtn, display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Download size={18} /> {t("se.installBtn")}
                  </button>
                </>
              ) : (
                <InstallSteps inst={inst} />
              )}
            </Card>
          </div>

          <div className="set-col">
            <Card>
              <div className="set-head"><span className="set-ico"><ShieldCheck size={20} color="var(--primary)" /></span><div style={{ ...heading, marginBottom: 0 }}>{t("se.privacyCard")}</div></div>
              <p style={{ ...text, marginBottom: 6 }}>{t("se.privacyText")}</p>
              {app.consent.at && <p style={{ ...text, fontSize: 13.5 }}>{t("se.consentAt", { date: fmtDate(app.consent.at, lang) })}</p>}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                <button onClick={() => onNavigate("privacy")} style={ghostBtn}>{t("se.privacyBtn")}</button>
                <button onClick={onLogout} style={{ ...ghostBtn, color: "var(--severe)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <LogOut size={17} /> {t("nav.logout")}
                </button>
              </div>
              <p style={{ ...text, marginTop: 14, marginBottom: 0, fontSize: 13.5 }}>{t("se.accountText", { id: patientId })}</p>
            </Card>
          </div>

          <div className="set-col">
            <Card>
              <div className="set-head"><span className="set-ico"><KeyRound size={20} color="var(--primary)" /></span><div style={{ ...heading, marginBottom: 0 }}>{t("pw.card")}</div></div>
              <p style={text}>{t("pw.cardText")}</p>
              <PasswordForm onDone={app.passwordChanged} onUnauthorized={onLogout} compact />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Petunjuk pasang sesuai perangkat (iPhone tidak punya tombol pasang otomatis)
export function InstallSteps({ inst }) {
  const { t } = useLang();
  const key = inst.platform === "ios" ? "ios" : inst.platform === "android" ? "android" : "other";
  const n = key === "ios" ? 4 : key === "android" ? 3 : 1;
  return (
    <div>
      {inst.inApp && <p className="alert-err" style={{ marginBottom: 10 }}>{t("in.inapp")}</p>}
      <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--ink)", marginBottom: 6 }}>{t(`in.${key}.title`)}</div>
      <ol style={{ margin: 0, paddingLeft: 20, color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
        {Array.from({ length: n }, (_, i) => <li key={i} style={{ marginBottom: 4 }}>{t(`in.${key}.${i + 1}`)}</li>)}
      </ol>
    </div>
  );
}
