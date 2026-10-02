import React, { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n.jsx";
import { LangSegment, ThemeButton } from "../components/Toggles.jsx";
import { CONTACT } from "../contact.js";
import { User, ShieldCheck, CalendarClock, FlaskConical, HeartPulse, ClipboardList, LineChart, Smartphone, LogIn, Mail, Phone, ArrowUp } from "lucide-react";

const NAV = [
  { id: "home", label: "ld.nav.home" },
  { id: "about", label: "ld.nav.about" },
  { id: "features", label: "ld.nav.features" },
  { id: "contact", label: "ld.nav.contact" },
];

const FEATURES = [
  { icon: User, title: "ld.feat.1t", desc: "ld.feat.1d" },
  { icon: ShieldCheck, title: "ld.feat.2t", desc: "ld.feat.2d" },
  { icon: CalendarClock, title: "ld.feat.3t", desc: "ld.feat.3d" },
  { icon: FlaskConical, title: "ld.feat.4t", desc: "ld.feat.4d" },
];

const ABOUT_POINTS = [
  { icon: ClipboardList, text: "ld.about.p1" },
  { icon: LineChart, text: "ld.about.p2" },
  { icon: Smartphone, text: "ld.about.p3" },
];

function goTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export default function Landing({ onGetStarted, onLogin, onPrivacy }) {
  const { t } = useLang();
  const [active, setActive] = useState("home");
  const [anim, setAnim] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      const line = window.innerHeight * 0.35;
      let cur = NAV[0].id;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= line) cur = n.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = NAV[NAV.length - 1].id;
      setActive(cur);
      const y = window.scrollY;
      setScrolled(y > 12);
      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--py", String(Math.min(y, 700) * 0.12) + "px");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Efek muncul saat di-scroll (dimatikan bila pengguna memilih "kurangi gerakan")
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    setAnim(true);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); setTimeout(() => e.target.classList.add("done"), 1500); io.unobserve(e.target); } }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    const t = setTimeout(() => document.querySelectorAll(".landing .reveal").forEach((el) => io.observe(el)), 30);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);

  // Efek riak saat tombol ditekan
  function ripple(e) {
    const btn = e.target.closest?.(".l-btn");
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 1.6;
    const s = document.createElement("span");
    s.className = "l-ripple";
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    btn.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }

  return (
    <div ref={rootRef} onPointerDown={ripple} style={{ minHeight: "100vh", background: "var(--bg)" }} className={"landing" + (anim ? " anim" : "") + (scrolled ? " scrolled" : "")}>
      <header className="l-header">
        <button onClick={() => goTo("home")} className="l-brand" aria-label={t("ld.brandAria")}>
          <span className="l-logo"><HeartPulse size={17} color="#fff" /></span>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>ESAS</span>
        </button>
        <nav className="l-nav" aria-label={t("nav.main")}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => goTo(n.id)} className={"l-link" + (active === n.id ? " on" : "")}
              aria-current={active === n.id ? "true" : undefined}>
              {t(n.label)}
            </button>
          ))}
        </nav>
        <div className="l-tools"><LangSegment compact /><ThemeButton /></div>
        <button onClick={onLogin} className="l-btn l-btn-primary l-login" style={{ padding: "9px 22px", fontSize: 14 }}>{t("ld.login")}</button>
      </header>

      <section id="home" className="l-section l-hero">
        <div className="l-col l-hero-text">
          <h1 className="l-h1">{t("ld.h1")}</h1>
          <p className="l-lead">
            {t("ld.lead")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onGetStarted} className="l-btn l-btn-primary">{t("ld.start")}</button>
            <button onClick={() => goTo("about")} className="l-btn l-btn-ghost">{t("ld.learn")}</button>
          </div>
        </div>
        <div className="l-col l-img l-hero-img">
          <img className="l-float" src="/img/hero.svg" alt={t("ld.heroAlt")} width="500" height="500" />
        </div>
      </section>

      <section id="about" className="l-section l-alt">
        <div className="l-row l-inner">
          <div className="l-col l-img reveal from-left">
            <img src="/img/about.svg" alt={t("ld.aboutAlt")} width="500" height="500" loading="lazy" />
          </div>
          <div className="l-col reveal from-right">
            <span className="l-eyebrow">{t("ld.about.eyebrow")}</span>
            <h2 className="l-h2">{t("ld.about.h2")}</h2>
            <p className="l-lead">{t("ld.about.text")}</p>
            <ul className="l-points">
              {ABOUT_POINTS.map((p, i) => (
                <li key={p.text} className="reveal from-right" style={{ "--d": `${0.15 + i * 0.12}s` }}>
                  <span className="l-ico"><p.icon size={18} color="var(--primary)" /></span>
                  {t(p.text)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="features" className="l-section">
        <div className="l-row l-inner">
          <div className="l-col">
            <span className="l-eyebrow reveal">{t("ld.feat.eyebrow")}</span>
            <h2 className="l-h2 reveal" style={{ "--d": "0.08s" }}>{t("ld.feat.h2")}</h2>
            <div className="l-feat-grid">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="l-feat reveal" style={{ "--d": `${0.12 + i * 0.1}s` }}>
                  <span className="l-ico"><f.icon size={19} color="var(--primary)" /></span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 3 }}>{t(f.title)}</div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{t(f.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="l-col l-img reveal from-right">
            <img src="/img/features.svg" alt={t("ld.featAlt")} width="500" height="500" loading="lazy" />
          </div>
        </div>
      </section>

      <section id="contact" className="l-section l-alt">
        <div className="l-row l-inner">
          <div className="l-col l-img reveal from-left">
            <img src="/img/contact.svg" alt={t("ld.contactAlt")} width="500" height="500" loading="lazy" />
          </div>
          <div className="l-col reveal from-right">
            <span className="l-eyebrow">{t("ld.contact.eyebrow")}</span>
            <h2 className="l-h2">{t("ld.contact.h2")}</h2>
            <p className="l-lead">{t("ld.contact.note")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {CONTACT.email && (
                <a className="l-contact" href={`mailto:${CONTACT.email}`}>
                  <span className="l-ico"><Mail size={18} color="var(--primary)" /></span>{CONTACT.email}
                </a>
              )}
              {CONTACT.phone && (
                <a className="l-contact" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                  <span className="l-ico"><Phone size={18} color="var(--primary)" /></span>{CONTACT.phone}
                </a>
              )}
            </div>
            <button onClick={onLogin} className="l-btn l-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
              <LogIn size={17} /> {t("ld.contact.cta")}
            </button>
          </div>
        </div>
      </section>

      <button onClick={() => goTo("home")} className={"l-top" + (scrolled ? " show" : "")} aria-label={t("ld.top")}>
        <ArrowUp size={20} />
      </button>

      <footer className="l-footer">
        © {new Date().getFullYear()} ESAS · {t("ld.footer")}
        {onPrivacy && <> · <button onClick={onPrivacy} style={{ background: "none", border: "none", padding: 0, color: "var(--primary)", cursor: "pointer", fontSize: "inherit", textDecoration: "underline" }}>{t("ld.privacy")}</button></>}
      </footer>
    </div>
  );
}
