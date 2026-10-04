import React, { useEffect, useMemo } from "react";
import { CheckCircle2, Flame, MessageCircle, Phone } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { primaryBtn, ghostBtn } from "./ui.jsx";
import { CONTACT } from "../contact.js";

const COLORS = ["#2563EB", "#16A34A", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];

// Layar ucapan setelah mengisi ESAS (C2): animasi, pesan semangat, streak, dan kontak bila gejala berat
export default function Celebrate({ info, onClose }) {
  const { t } = useLang();
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pieces = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37) % 100, delay: (i % 9) * 0.12, dur: 2.2 + (i % 5) * 0.35, color: COLORS[i % COLORS.length], rot: (i * 53) % 360,
  })), []);
  const wa = String(CONTACT.phone || "").replace(/\D/g, "");

  return (
    <div className="overlay cel" role="dialog" aria-modal="true" aria-labelledby="cel-title" onClick={onClose}>
      <div className="confetti" aria-hidden="true">
        {pieces.map((p, i) => (
          <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, background: p.color, transform: `rotate(${p.rot}deg)` }} />
        ))}
      </div>
      <div className="modal cel-card" onClick={(e) => e.stopPropagation()}>
        <div className="cel-check"><CheckCircle2 size={46} color="var(--mild)" /></div>
        <h2 id="cel-title">{t(`cel.${info.kind}.title`)}</h2>
        <p className="cel-text">{t(`cel.${info.kind}.text`)}</p>
        {info.current >= 2 && (
          <div className="cel-streak"><Flame size={18} color="var(--moderate)" /> {t("cel.streak", { n: info.current })}</div>
        )}
        {info.severe && (
          <div className="cel-warn" role="note">
            <b>{t("cel.warn.title")}</b>
            <p>{t("cel.warn.text")}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {wa && <a className="cel-link" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>}
              {CONTACT.phone && <a className="cel-link" href={`tel:+${wa}`}><Phone size={16} /> {t("cel.call")}</a>}
            </div>
          </div>
        )}
        <button onClick={onClose} style={{ ...primaryBtn, width: "100%", marginTop: 6 }} autoFocus>{t("cel.close")}</button>
        <p className="cel-note">{t("cel.disclaimer")}</p>
      </div>
    </div>
  );
}
