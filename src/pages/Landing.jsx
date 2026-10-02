import React, { useEffect, useState } from "react";
import { User, ShieldCheck, CalendarClock, FlaskConical, HeartPulse, ClipboardList, LineChart, Smartphone, LogIn, Mail, Phone } from "lucide-react";

// Isi data kontak di sini. Bagian yang dikosongkan ("") tidak akan ditampilkan.
const CONTACT = {
  email: "",
  phone: "",
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
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }} className="landing">
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
        <div className="l-col">
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
        <div className="l-col l-img">
          <img src="/img/hero.svg" alt="Ilustrasi konsultasi dokter secara daring" width="500" height="500" />
        </div>
      </section>

      <section id="about" className="l-section l-alt">
        <div className="l-row l-inner">
          <div className="l-col l-img">
            <img src="/img/about.svg" alt="Tim tenaga medis" width="500" height="500" loading="lazy" />
          </div>
          <div className="l-col">
            <span className="l-eyebrow">About</span>
            <h2 className="l-h2">Tentang ESAS</h2>
            <p className="l-lead">
              ESAS (Edmonton Symptom Assessment System) adalah kuesioner singkat untuk menilai
              keparahan gejala yang sering dialami pasien kanker, seperti nyeri, kelelahan, mual,
              dan gangguan tidur. Dengan mengisinya secara rutin, pasien dan tenaga kesehatan
              dapat melihat perubahan gejala sejak dini.
            </p>
            <ul className="l-points">
              {ABOUT_POINTS.map((p) => (
                <li key={p.text}>
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
            <span className="l-eyebrow">Features</span>
            <h2 className="l-h2">Fitur yang membantu pemantauan</h2>
            <div className="l-feat-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="l-feat">
                  <span className="l-ico"><f.icon size={19} color="var(--primary)" /></span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="l-col l-img">
            <img src="/img/features.svg" alt="Pemeriksaan gejala pasien" width="500" height="500" loading="lazy" />
          </div>
        </div>
      </section>

      <section id="contact" className="l-section l-alt">
        <div className="l-row l-inner">
          <div className="l-col l-img">
            <img src="/img/contact.svg" alt="Dokter siap membantu" width="500" height="500" loading="lazy" />
          </div>
          <div className="l-col">
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

      <footer className="l-footer">© {new Date().getFullYear()} ESAS · Pemantauan gejala pasca kemoterapi</footer>
    </div>
  );
}
