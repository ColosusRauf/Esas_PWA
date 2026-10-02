import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Bell, User, LayoutDashboard, ClipboardList, History as HistoryIcon, Settings as SettingsIcon,
  ShieldCheck, CalendarDays, Activity, AlertTriangle, CloudUpload, BellRing, CalendarPlus,
} from "lucide-react";
import { useApp } from "../appContext.jsx";
import { useLang } from "../i18n.jsx";
import { DOMAINS, totalOf, severity, dShort, SEV_LABEL_L } from "../data.js";
import { fmtDate, dayKeyWIB, todayKeyWIB } from "../format.js";

const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const PAGES = [
  { key: "dashboard", label: "nav.dashboard", icon: LayoutDashboard, kw: "beranda home ringkasan" },
  { key: "assessment", label: "nav.assessment", icon: ClipboardList, kw: "isi esas kuesioner questionnaire mulai start" },
  { key: "history", label: "nav.history", icon: HistoryIcon, kw: "riwayat history grafik chart bandingkan compare" },
  { key: "profile", label: "nav.profile", icon: User, kw: "profil profile akun account" },
  { key: "settings", label: "nav.settings", icon: SettingsIcon, kw: "pengaturan settings tema gelap dark theme bahasa language pengingat reminder notifikasi pasang install" },
  { key: "privacy", label: "nav.privacy", icon: ShieldCheck, kw: "privasi privacy persetujuan consent data" },
];

const KEY_READ = "esas.notif.read";
const readSet = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY_READ) || "[]")); } catch { return new Set(); } };
const writeSet = (s) => { try { localStorage.setItem(KEY_READ, JSON.stringify([...s].slice(-60))); } catch {} };

// ---------------- Pencarian ----------------
function SearchBox() {
  const app = useApp();
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const input = useRef(null);
  const box = useRef(null);

  const results = useMemo(() => {
    const n = norm(q);
    if (!n) return [];
    const out = [];
    for (const p of PAGES) {
      if (norm(t(p.label)).includes(n) || p.kw.includes(n)) {
        out.push({ group: "search.pages", icon: p.icon, title: t(p.label), run: () => app.navigate(p.key) });
      }
    }
    const list = [...app.assessments].reverse();
    let c = 0;
    for (const a of list) {
      const total = totalOf(a.answers);
      const hay = norm([fmtDate(a.createdAt, "id"), fmtDate(a.createdAt, "en"), dayKeyWIB(a.createdAt), `skor ${total} score ${total} ${total}`].join(" "));
      if (hay.includes(n) && c++ < 6) {
        out.push({ group: "search.records", icon: CalendarDays, title: fmtDate(a.createdAt, lang), sub: t("search.recordSub", { n: total }), run: () => app.navigate("history", { openId: a.id }) });
      }
    }
    const latest = list[0];
    for (const d of DOMAINS) {
      if (norm(d.label + " " + d.en).includes(n)) {
        const v = latest?.answers[DOMAINS.indexOf(d)];
        out.push({
          group: "search.symptoms", icon: Activity, title: dShort(d, lang),
          sub: latest ? t("search.symptomSub", { v, sev: SEV_LABEL_L[lang][severity(v)] }) : "—",
          run: () => app.navigate("history", latest ? { openId: latest.id } : null),
        });
      }
    }
    return out;
  }, [q, app.assessments, lang, t]);

  useEffect(() => { setIdx(0); }, [q]);

  // pintasan "/" dan klik di luar
  useEffect(() => {
    const key = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea" && !e.target.isContentEditable) { e.preventDefault(); input.current?.focus(); }
    };
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    window.addEventListener("keydown", key);
    document.addEventListener("pointerdown", away);
    return () => { window.removeEventListener("keydown", key); document.removeEventListener("pointerdown", away); };
  }, []);

  function pick(r) { r.run(); setOpen(false); setQ(""); input.current?.blur(); }
  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[idx]) { e.preventDefault(); pick(results[idx]); }
    else if (e.key === "Escape") { setOpen(false); input.current?.blur(); }
  }

  let lastGroup = null;
  return (
    <div className="sr-wrap" ref={box}>
      <label className="topbar-search" style={{
        display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "0 14px 0 18px", height: 44, cursor: "text",
      }}>
        <Search size={19} color="var(--ink-soft)" />
        <input ref={input} value={q} placeholder={t("search.placeholder")} aria-label={t("search.aria")}
          role="combobox" aria-expanded={open && !!q} aria-controls="sr-list" autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)", width: "100%", minWidth: 0 }} />
        {!q && <span className="kbd" title={t("search.hint")}>/</span>}
      </label>
      {open && q.trim() && (
        <div className="dd left" id="sr-list" role="listbox">
          {results.length === 0 && <div className="dd-empty">{t("search.none", { q: q.trim() })}</div>}
          {results.map((r, i) => {
            const head = r.group !== lastGroup ? (lastGroup = r.group, <div className="dd-g" key={"g" + r.group}>{t(r.group)}</div>) : null;
            return (
              <React.Fragment key={r.group + i}>
                {head}
                <button role="option" aria-selected={i === idx} className={"dd-item" + (i === idx ? " act" : "")} onMouseEnter={() => setIdx(i)} onClick={() => pick(r)}>
                  <span className="dd-ico"><r.icon size={16} /></span>
                  <span style={{ minWidth: 0 }}>{r.title}{r.sub && <small>{r.sub}</small>}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------- Lonceng ----------------
function BellMenu() {
  const app = useApp();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(readSet);
  const ref = useRef(null);

  const items = useMemo(() => {
    const out = [];
    const list = app.assessments;
    const latest = list[list.length - 1];
    if (app.ready && !(latest && dayKeyWIB(latest.createdAt) === todayKeyWIB())) {
      out.push({ key: `today:${todayKeyWIB()}`, icon: CalendarPlus, tone: "var(--primary)", title: t("n.today.t"), body: t("n.today.b"), act: [t("n.today.a"), () => app.navigate("assessment")] });
    }
    if (latest) {
      const severe = DOMAINS.map((d, i) => ({ d, v: latest.answers[i] })).filter((x) => x.v > 6).sort((a, b) => b.v - a.v);
      if (severe.length) {
        out.push({
          key: `severe:${latest.id}`, icon: AlertTriangle, tone: "var(--severe)", title: t("n.severe.t"),
          body: t("n.severe.b", { list: severe.map((x) => `${dShort(x.d, lang)} (${x.v})`).join(", ") }),
          act: [t("n.severe.a"), () => app.navigate("history", { openId: latest.id })],
        });
      }
    }
    if (app.sync.pending > 0) {
      out.push({ key: `pending:${app.sync.pending}`, icon: CloudUpload, tone: "var(--moderate)", title: t("n.pending.t", { n: app.sync.pending }), body: t("n.pending.b"), act: app.online ? [t("n.pending.a"), app.sync.run] : null });
    }
    if (app.push.status === "off") {
      out.push({ key: "remind", icon: BellRing, tone: "var(--primary)", title: t("n.remind.t"), body: t("n.remind.b"), act: [t("n.remind.a"), () => app.navigate("settings")] });
    }
    return out;
  }, [app.assessments, app.ready, app.sync.pending, app.sync.run, app.online, app.push.status, lang, t]);

  const unread = items.filter((i) => !read.has(i.key)).length;
  useEffect(() => {
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); window.removeEventListener("keydown", esc); };
  }, []);

  function markAll() { const s = new Set([...read, ...items.map((i) => i.key)]); writeSet(s); setRead(s); }
  function run(it) { const s = new Set(read); s.add(it.key); writeSet(s); setRead(s); setOpen(false); it.act[1](); }

  return (
    <div className="bell-wrap" ref={ref}>
      <button aria-label={t("bell.title") + (unread ? ` (${unread})` : "")} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)} style={{
        width: 44, height: 44, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, position: "relative",
      }}>
        <Bell size={21} color="var(--ink-soft)" />
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="dd right" role="menu">
          <div className="dd-head">
            <span>{t("bell.title")}</span>
            {unread > 0 && <button onClick={markAll}>{t("bell.markall")}</button>}
          </div>
          {items.length === 0 && <div className="dd-empty">{t("bell.empty")}</div>}
          {items.map((it) => (
            <div key={it.key} className={"nt" + (read.has(it.key) ? "" : " unread")}>
              <span className="dd-ico" style={{ color: it.tone }}><it.icon size={16} /></span>
              <div style={{ minWidth: 0 }}>
                <div className="nt-title">{it.title}</div>
                <div className="nt-body">{it.body}</div>
                {it.act && <button className="nt-act" onClick={() => run(it)}>{it.act[0]} →</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Topbar({ patientId }) {
  const { t } = useLang();
  return (
    <header className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: "clamp(10px, 2vh, 22px)" }}>
      <SearchBox />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
        <BellMenu />
        <div style={{
          display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "6px 18px 6px 6px",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <User size={20} />
          </div>
          <div className="user-text" style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{patientId}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{t("common.patient")}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
