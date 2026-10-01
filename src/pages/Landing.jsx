import React from "react";
import { User, ShieldCheck, CalendarClock, FlaskConical, HeartPulse, TrendingUp, Bell } from "lucide-react";

const FEATURES = [
  { icon: User, title: "Mudah Digunakan", desc: "Tampilan sederhana dan intuitif" },
  { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Data Anda terlindungi dengan baik" },
  { icon: CalendarClock, title: "Pantauan Berkala", desc: "Lihat perkembangan gejala dari waktu ke waktu" },
  { icon: FlaskConical, title: "Untuk Penelitian", desc: "Mendukung analisis data untuk riset medis" },
];

export default function Landing({ onGetStarted, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px", borderBottom: "1px solid var(--border)", background: "var(--surface)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HeartPulse size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>ESAS</span>
        </div>
        <nav style={{ display: "flex", gap: 30, fontSize: 14, color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>Home</span>
          <span>About</span>
          <span>Features</span>
          <span>Contact</span>
        </nav>
        <button onClick={onLogin} style={{
          background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10,
          padding: "9px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>
          Login
        </button>
      </header>

      <section style={{
        maxWidth: 1180, margin: "0 auto", padding: "64px 48px 40px",
        display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h1 style={{ fontSize: 44, lineHeight: 1.18, margin: "0 0 16px", color: "var(--ink)", fontWeight: 800 }}>
            Better Symptom Monitoring for Better Care
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 440, marginBottom: 26 }}>
            Aplikasi ESAS untuk membantu pasien pasca kemoterapi memantau gejala dan kualitas
            hidup secara mandiri dan mudah.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onGetStarted} style={{
              background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10,
              padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>
              Get Started
            </button>
            <button style={{
              background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>
              Learn More
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320, display: "flex", justifyContent: "center" }}>
          <PreviewCard />
        </div>
      </section>

      <section style={{
        maxWidth: 1180, margin: "0 auto", padding: "28px 48px 64px",
        borderTop: "1px solid var(--border)",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 26
      }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ display: "flex", gap: 13, alignItems: "flex-start", paddingTop: 26 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: "var(--primary-soft)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <f.icon size={19} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)", marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function PreviewCard() {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18,
      padding: 20, width: 300, boxShadow: "0 18px 40px -22px rgba(30,41,59,0.25)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Halo, Pasien P001</span>
        <TrendingUp size={16} color="var(--primary)" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 54, height: 54, borderRadius: "50%",
          background: "conic-gradient(var(--primary) 180deg, var(--border) 0deg)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
            15.2
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 6 }}>Ringkasan Skor</div>
          <div style={{ height: 6, borderRadius: 4, background: "var(--primary-soft)" }}>
            <div style={{ width: "40%", height: "100%", borderRadius: 4, background: "var(--primary)" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 46 }}>
        {[22, 30, 26, 34, 28, 36, 31].map((h, i) => (
          <div key={i} style={{ flex: 1, height: h, borderRadius: 3, background: "var(--primary-soft)" }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 11, color: "var(--ink-soft)" }}>
        <Bell size={13} color="var(--primary)" /> Assessment hari ini belum diisi
      </div>
    </div>
  );
}
