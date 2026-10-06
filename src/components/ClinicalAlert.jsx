import React, { useState } from "react";
import { TriangleAlert, MessageCircle, Phone, X } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { DOMAINS, dShort } from "../data.js";
import { clinicalAlert } from "../insights.js";
import { CONTACT } from "../contact.js";

const KEY = "esas.alert.hide";
const hidden = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

// Banner peringatan di Dashboard bila gejala berat atau berulang (A3)
export default function ClinicalAlert({ assessments }) {
  const { t, lang } = useLang();
  const al = clinicalAlert(assessments);
  const [hideId, setHideId] = useState(hidden);
  if (!al || (al.level === "watch" && hideId === al.id) || (al.level === "urgent" && hideId === al.id)) return null;
  const names = (al.level === "urgent" ? al.severe : al.persistent).slice(0, 3).map((x) => `${dShort(DOMAINS[x.i], lang)} ${x.v}`).join(", ");
  const wa = String(CONTACT.phone || "").replace(/\D/g, "");
  const close = () => { try { localStorage.setItem(KEY, al.id); } catch {} setHideId(al.id); };
  return (
    <div className={"clin-alert " + al.level} role="alert">
      <TriangleAlert size={22} className="ca-ico" />
      <div className="ca-body">
        <b>{t(`al.${al.level}.title`)}</b>
        <span>{t(`al.${al.level}.text`, { names })}</span>
        {al.emergency && <strong className="ca-emerg">{t("al.emergency")}</strong>}
      </div>
      <div className="ca-actions">
        {wa && <a className="ca-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>}
        {CONTACT.phone && <a className="ca-btn" href={`tel:+${wa}`}><Phone size={15} /> {t("cel.call")}</a>}
      </div>
      <button className="ca-x" onClick={close} aria-label={t("al.dismiss")} title={t("al.dismiss")}><X size={16} /></button>
    </div>
  );
}
