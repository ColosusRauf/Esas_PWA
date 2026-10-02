import React, { useEffect, useRef, useState } from "react";
import { User, ShieldCheck, CalendarClock, FlaskConical, HeartPulse, ClipboardList, LineChart, Smartphone, LogIn, Mail, Phone, ArrowUp } from "lucide-react";

// Isi data kontak di sini. Bagian yang dikosongkan ("") tidak akan ditampilkan.
const CONTACT = {
  email: "hafizavv@gmail.com",
  phone: "+62 852 1071 3255",
  note: "Untuk pertanyaan seputar akun atau penggunaan aplikasi, hubungi peneliti atau tenaga kesehatan yang mendampingi Anda.",
};

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "features", label: "Features" },
  { id: "contact", label: "Contact" },
];

const FEATURES = [
  { icon: User, title: "Mudah Digunakan", desc: "Tampilan sederhana dan intuitif" },
  { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Data Anda terlindungi dengan baik" },
  { icon: CalendarClock, title: "Pantauan Berkala", desc: "Lihat perkembangan gejala dari waktu ke waktu" },
  { icon: FlaskConical, title: "Untuk Penelitian", desc: "Mendukung analisis data untuk riset medis" },
];

const ABOUT_POINTS = [
  { icon: ClipboardList, text: "10 gejala dinilai dengan skala 0–10 setiap hari" },
  { icon: LineChart, text: "Skor dan grafik perkembangan tersimpan rapi" },
  { icon: Smartphone, text: "Bisa dipasang di HP dan tetap dapat dipakai saat sinyal lemah" },
];

function goTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export default function Landing({ onGetStarted, onLogin }) {
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
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const root = rootRef.current;
      if (root) {
        root.style.setProperty("--progress", max > 0 ? String(y / max) : "0");
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
        <button onClick={() => goTo("home")} className="l-brand" aria-label="ESAS — ke atas">
          <span className="l-logo"><HeartPulse size={17} color="#fff" /></span>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>ESAS</span>
        </button>
        <nav className="l-nav" aria-label="Menu utama">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => goTo(n.id)} className={"l-link" + (active === n.id ? " on" : "")}
              aria-current={active === n.id ? "true" : undefined}>
              {n.label}
            </button>
          ))}
        </nav>
        <button onClick={onLogin} className="l-btn l-btn-primary l-login" style={{ padding: "9px 22px", fontSize: 14 }}>Login</button>
      </header>

      <section id="home" className="l-section l-hero">
        <div className="l-col l-hero-text">
          <h1 className="l-h1">Better Symptom Monitoring for Better Care</h1>
          <p className="l-lead">
            Aplikasi ESAS untuk membantu pasien pasca kemoterapi memantau gejala dan kualitas
            hidup secara mandiri dan mudah.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onGetStarted} className="l-btn l-btn-primary">Get Started</button>
            <button onClick={() => goTo("about")} className="l-btn l-btn-ghost">Learn More</button>
          </div>
        </div>
        <div className="l-col l-img l-hero-img">
          <img className="l-float" src="/img/hero.svg" alt="Ilustrasi konsultasi dokter secara daring" width="500" height="500" />
        </div>
      </section>

      <section id="about" className="l-section l-alt">
        <div className="l-row l-inner">
          <div className="l-col l-img reveal from-left">
            <img src="/img/about.svg" alt="Tim tenaga medis" width="500" height="500" loading="lazy" />
          </div>
          <div className="l-col reveal from-right">
            <span className="l-eyebrow">About</span>
            <h2 className="l-h2">Tentang ESAS</h2>
            <p className="l-lead">
              ESAS (Edmonton Symptom Assessment System) adalah kuesioner singkat untuk menilai
              keparahan gejala yang sering dialami pasien kanker, seperti nyeri, kelelahan, mual,
              dan gangguan tidur. Dengan mengisinya secara rutin, pasien dan tenaga kesehatan
              dapat melihat perubahan gejala sejak dini.
            </p>
            <ul className="l-points">
              {ABOUT_POINTS.map((p, i) => (
                <li key={p.text} className="reveal from-right" style={{ "--d": `${0.15 + i * 0.12}s` }}>
                  <span className="l-ico"><p.icon size={18} color="var(--primary)" /></span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="features" className="l-section">
        <div className="l-row l-inner">
          <div className="l-col">
            <span className="l-eyebrow reveal">Features</span>
            <h2 className="l-h2 reveal" style={{ "--d": "0.08s" }}>Fitur yang membantu pemantauan</h2>
            <div className="l-feat-grid">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="l-feat reveal" style={{ "--d": `${0.12 + i * 0.1}s` }}>
                  <span className="l-ico"><f.icon size={19} color="var(--primary)" /></span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="l-col l-img reveal from-right">
            <img src="/img/features.svg" alt="Pemeriksaan gejala pasien" width="500" height="500" loading="lazy" />
          </div>
        </div>
      </section>

      <section id="contact" className="l-section l-alt">
        <div className="l-row l-inner">
          <div className="l-col l-img reveal from-left">
            <img src="/img/contact.svg" alt="Dokter siap membantu" width="500" height="500" loading="lazy" />
          </div>
          <div className="l-col reveal from-right">
            <span className="l-eyebrow">Contact</span>
            <h2 className="l-h2">Hubungi Kami</h2>
            <p className="l-lead">{CONTACT.note}</p>
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
              <LogIn size={17} /> Masuk ke ESAS
            </button>
          </div>
        </div>
      </section>

      <button onClick={() => goTo("home")} className={"l-top" + (scrolled ? " show" : "")} aria-label="Kembali ke atas">
        <ArrowUp size={20} />
      </button>

      <footer className="l-footer">© {new Date().getFullYear()} ESAS · Pemantauan gejala pasca kemoterapi</footer>
    </div>
  );
}
