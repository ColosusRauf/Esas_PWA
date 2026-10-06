import React, { useEffect, useState } from "react";
import { ClipboardCheck, LineChart, BellRing, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { primaryBtn, ghostBtn } from "./ui.jsx";

const STEPS = [
  { icon: ClipboardCheck, k: "1" },
  { icon: LineChart, k: "2" },
  { icon: BellRing, k: "3" },
  { icon: ShieldCheck, k: "4" },
];

// Tur singkat saat pertama kali masuk (B3). Bisa dibuka lagi dari halaman Bantuan.
export default function Tour({ onClose }) {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const last = i === STEPS.length - 1;
  const S = STEPS[i];
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="tour-title" style={{ zIndex: 135 }}>
      <div className="modal tour-card">
        <div className="tour-ico" key={i}><S.icon size={34} color="var(--primary)" /></div>
        <h2 id="tour-title">{t(`tour.${S.k}.title`)}</h2>
        <p style={{ margin: "0 0 16px", color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.6 }}>{t(`tour.${S.k}.text`)}</p>
        <div className="tour-dots" aria-hidden="true">{STEPS.map((_, n) => <span key={n} className={n === i ? "on" : ""} />)}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {i > 0 ? (
            <button onClick={() => setI(i - 1)} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 4 }}><ChevronLeft size={17} />{t("tour.back")}</button>
          ) : (
            <button onClick={onClose} style={ghostBtn}>{t("tour.skip")}</button>
          )}
          <button onClick={() => (last ? onClose() : setI(i + 1))} style={{ ...primaryBtn, flex: 1, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 4 }} autoFocus>
            {last ? t("tour.done") : <>{t("tour.next")}<ChevronRight size={17} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
