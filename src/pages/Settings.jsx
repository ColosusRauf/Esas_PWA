import React, { useEffect, useState } from "react";
import { Download, LogOut, Smartphone, Palette, BellRing, ShieldCheck } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Card, primaryBtn, ghostBtn } from "../components/ui.jsx";
import { ThemeSegment, LangSegment } from "../components/Toggles.jsx";
import { useToast } from "../components/Toast.jsx";
import { useApp } from "../appContext.jsx";
import { useLang } from "../i18n.jsx";
import { fmtDate } from "../format.js";
import * as api from "../api.js";

const iconBox = { width: 52, height: 52, borderRadius: 15, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const heading = { fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 6 };
const text = { fontSize: 14.5, color: "var(--ink-soft)", margin: "0 0 14px", lineHeight: 1.6 };


export default function Settings({ patientId, onNavigate, onLogout }) {
  const { t, lang } = useLang();
  const app = useApp();
  const toast = useToast();
  const push = app.push;
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );
  const [pushErr, setPushErr] = useState("");

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvent(e); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

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
        <div className="grid-2" style={{ alignItems: "start" }}>
          <Card>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={iconBox}><Palette size={25} color="var(--primary)" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={heading}>{t("se.appearance")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>{t("se.theme")}</div>
                    <ThemeSegment />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>{t("se.language")}</div>
                    <LangSegment />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={iconBox}><BellRing size={25} color="var(--primary)" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={heading}>{t("se.reminder")}</div>
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
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={iconBox}><Smartphone size={25} color="var(--primary)" /></div>
              <div style={{ flex: 1 }}>
                <div style={heading}>{t("se.install")}</div>
                <p style={text}>
                  {installed ? t("se.installed") : installEvent ? t("se.installReady") : t("se.installHow")}
                </p>
                {installEvent && !installed && (
                  <button onClick={install} style={{ ...primaryBtn, display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Download size={18} /> {t("se.installBtn")}
                  </button>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={iconBox}><ShieldCheck size={25} color="var(--primary)" /></div>
              <div style={{ flex: 1 }}>
                <div style={heading}>{t("se.privacyCard")}</div>
                <p style={{ ...text, marginBottom: 6 }}>{t("se.privacyText")}</p>
                {app.consent.at && <p style={{ ...text, fontSize: 13.5 }}>{t("se.consentAt", { date: fmtDate(app.consent.at, lang) })}</p>}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                  <button onClick={() => onNavigate("privacy")} style={ghostBtn}>{t("se.privacyBtn")}</button>
                  <button onClick={onLogout} style={{ ...ghostBtn, color: "var(--severe)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <LogOut size={17} /> {t("nav.logout")}
                  </button>
                </div>
                <p style={{ ...text, marginTop: 14, marginBottom: 0, fontSize: 13.5 }}>{t("se.accountText", { id: patientId })}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
