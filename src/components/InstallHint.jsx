import React, { useState } from "react";
import { Smartphone, X } from "lucide-react";
import { useInstall } from "../pwa.js";
import { useLang } from "../i18n.jsx";
import { useMobile } from "../useMedia.js";

const KEY = "esas.installHint";

// Ajakan memasang aplikasi di HP (hilang bila sudah dipasang atau ditutup)
export default function InstallHint({ onHow }) {
  const { t } = useLang();
  const inst = useInstall();
  const mobile = useMobile();
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } });
  if (!mobile || inst.installed || hidden || inst.platform === "other") return null;
  const close = () => { setHidden(true); try { localStorage.setItem(KEY, "1"); } catch {} };
  return (
    <div className="banner" style={{ background: "var(--primary-soft)", borderColor: "var(--primary-line)", color: "var(--ink)" }}>
      <Smartphone size={18} color="var(--primary)" />
      <span>{t("in.banner")}</span>
      <button onClick={inst.canPrompt ? inst.prompt : onHow} style={{ color: "var(--primary)" }}>{inst.canPrompt ? t("se.installBtn") : t("in.banner.how")}</button>
      <button aria-label={t("in.banner.close")} onClick={close} style={{ border: "none", padding: 4, display: "flex" }}><X size={16} /></button>
    </div>
  );
}
