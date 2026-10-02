import React from "react";
import { CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { totalOf } from "../data.js";
import { fmtDate } from "../format.js";

// Satu baris riwayat berbentuk kartu (tampilan HP)
export default function RecordCard({ a, onClick, selected, tag }) {
  const { t, lang } = useLang();
  const total = totalOf(a.answers);
  const col = total <= 30 ? "var(--mild)" : total <= 60 ? "var(--moderate)" : "var(--severe)";
  const st = a.synced ? "var(--mild)" : "var(--moderate)";
  return (
    <button className={"rc" + (selected ? " sel" : "")} onClick={onClick}>
      <span className="rc-ico" style={{ color: col, background: "color-mix(in srgb, " + col + " 14%, transparent)" }}>
        {tag ?? (a.synced ? <CheckCircle2 size={20} /> : <Clock size={20} />)}
      </span>
      <span className="rc-main">
        <b>{fmtDate(a.createdAt, lang)}</b>
        <small>{t("common.total")}: {total}</small>
      </span>
      <span className="pill" style={{ color: st, background: "color-mix(in srgb, " + st + " 14%, transparent)" }}>
        {a.synced ? t("st.done") : t("st.pending")}
      </span>
      {!tag && <ChevronRight size={18} color="var(--ink-soft)" />}
    </button>
  );
}
