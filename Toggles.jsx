import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../theme.jsx";
import { useLang } from "../i18n.jsx";

// Tiga pilihan: Otomatis / Terang / Gelap (dipakai di Pengaturan & sidebar admin)
export function ThemeSegment({ compact = false, showLabels = true }) {
  const { mode, setMode } = useTheme();
  const { t } = useLang();
  const opts = [
    { v: "auto", icon: Monitor, label: t("se.theme.auto") },
    { v: "light", icon: Sun, label: t("se.theme.light") },
    { v: "dark", icon: Moon, label: t("se.theme.dark") },
  ];
  return (
    <div className={"seg" + (compact ? " sm" : "")} role="group" aria-label={t("tg.theme")}>
      {opts.map((o) => (
        <button key={o.v} className={mode === o.v ? "on" : ""} aria-pressed={mode === o.v} title={o.label} onClick={() => setMode(o.v)}>
          <o.icon size={compact ? 14 : 16} />
          {showLabels && o.label}
        </button>
      ))}
    </div>
  );
}

// Satu tombol ikon: terang <-> gelap (dipakai di header landing)
export function ThemeButton() {
  const { resolved, setMode } = useTheme();
  const { t } = useLang();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button className="icon-btn" aria-label={t("tg.theme")} title={t("tg.theme")} onClick={() => setMode(next)}>
      {resolved === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function LangSegment({ compact = false }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={"seg" + (compact ? " sm" : "")} role="group" aria-label={t("tg.lang")}>
      {[["id", "ID"], ["en", "EN"]].map(([v, label]) => (
        <button key={v} className={lang === v ? "on" : ""} aria-pressed={lang === v} onClick={() => setLang(v)} lang={v}>
          {label}
        </button>
      ))}
    </div>
  );
}
