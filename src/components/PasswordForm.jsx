import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { primaryBtn } from "./ui.jsx";
import * as api from "../api.js";

const inp = { width: "100%", padding: "12px 44px 12px 14px", borderRadius: 11, border: "1px solid var(--border)", fontSize: 16, boxSizing: "border-box", color: "var(--ink)", background: "var(--surface)" };
const lbl = { fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6, display: "block" };

function Field({ id, label, value, onChange, show, onToggle, auto }) {
  const { t } = useLang();
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={lbl}>{label}</label>
      <div style={{ position: "relative" }}>
        <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          autoComplete={auto} autoCapitalize="none" style={inp} />
        <button type="button" onClick={onToggle} aria-label={show ? t("lg.pw.hide") : t("lg.pw.show")}
          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 8, cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// Dipakai di Pengaturan dan di layar "wajib ganti password".
export default function PasswordForm({ onDone, onUnauthorized, extra, compact }) {
  const { t } = useLang();
  const [oldPw, setOld] = useState("");
  const [newPw, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e?.preventDefault();
    if (!oldPw || !newPw || !confirm) return setErr("pw.err.empty");
    if (newPw.length < 8) return setErr("pw.err.short");
    if (newPw === oldPw) return setErr("pw.err.same");
    if (newPw !== confirm) return setErr("pw.err.mismatch");
    setBusy(true); setErr("");
    try {
      await api.changePassword(oldPw, newPw);
      setOld(""); setNew(""); setConfirm("");
      onDone?.();
    } catch (e2) {
      if (e2.message === "UNAUTHORIZED") return onUnauthorized?.();
      setErr(e2.message === "NETWORK" ? "pw.err.network" : e2.code === "WRONG_PASSWORD" ? "pw.err.wrong" :
        e2.code === "SAME_PASSWORD" ? "pw.err.same" : e2.status === 501 ? "pw.err.unsupported" : "pw.err.unknown");
    } finally { setBusy(false); }
  }

  const strength = newPw.length === 0 ? 0 : newPw.length < 8 ? 1 : /(?=.*[A-Za-z])(?=.*\d)/.test(newPw) && newPw.length >= 10 ? 3 : 2;

  return (
    <form onSubmit={submit} noValidate className={compact ? "pw-compact" : undefined}>
      <Field id="pw-old" label={t("pw.old")} value={oldPw} onChange={setOld} show={show} onToggle={() => setShow((s) => !s)} auto="current-password" />
      <Field id="pw-new" label={t("pw.new")} value={newPw} onChange={setNew} show={show} onToggle={() => setShow((s) => !s)} auto="new-password" />
      <div className="pw-meter" aria-hidden="true">
        {[1, 2, 3].map((i) => <span key={i} className={strength >= i ? `on s${strength}` : ""} />)}
        <small>{strength ? t(`pw.strength.${strength}`) : t("pw.hint")}</small>
      </div>
      <Field id="pw-cf" label={t("pw.confirm")} value={confirm} onChange={setConfirm} show={show} onToggle={() => setShow((s) => !s)} auto="new-password" />
      {err && <p role="alert" className="alert-err">{t(err)}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: "1 1 180px", opacity: busy ? 0.6 : 1 }}>
          {busy ? t("pw.saving") : t("pw.save")}
        </button>
        {extra}
      </div>
    </form>
  );
}
