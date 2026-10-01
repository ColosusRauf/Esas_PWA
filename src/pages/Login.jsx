import React, { useState } from "react";
import { HeartPulse, User, Lock, Eye, EyeOff } from "lucide-react";

export default function Login({ onLogin, loading, error }) {
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [staff, setStaff] = useState(false);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24
    }}>
      <div style={{
        display: "flex", width: "100%", maxWidth: 920, minHeight: 480, borderRadius: 22,
        overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 24px 60px -30px rgba(30,41,59,0.3)"
      }}>
        <div style={{
          flex: 1, minWidth: 300, background: "linear-gradient(160deg, var(--primary) 0%, #1E3A8A 100%)",
          color: "#fff", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18
          }}>
            <HeartPulse size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>ESAS</div>
          <h2 style={{ fontSize: 24, lineHeight: 1.35, margin: "0 0 14px", fontWeight: 700 }}>
            Monitoring Gejala Pasca Kemoterapi
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.85, maxWidth: 320 }}>
            Masuk ke akun Anda untuk melanjutkan pemantauan gejala dan mendapatkan perawatan yang
            lebih baik.
          </p>
        </div>

        <div style={{ flex: 1, minWidth: 300, background: "var(--surface)", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 22, margin: "0 0 4px", color: "var(--ink)" }}>Selamat Datang</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 26px" }}>
            Silakan login dengan Patient ID Anda
          </p>

          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 7, display: "block" }}>{staff ? "Username petugas" : "Patient ID"}</label>
          <div style={{ position: "relative", marginBottom: 18 }}>
            <User size={16} color="var(--ink-soft)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={patientId} onChange={(e) => setPatientId(e.target.value)}
              placeholder={staff ? "Masukkan username" : "Masukkan Patient ID"}
              style={{
                width: "100%", padding: "12px 14px 12px 38px", borderRadius: 11, border: "1px solid var(--border)",
                fontSize: 14, boxSizing: "border-box", color: "var(--ink)"
              }}
            />
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 7, display: "block" }}>Password</label>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Lock size={16} color="var(--ink-soft)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type={showPw ? "text" : "password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              style={{
                width: "100%", padding: "12px 38px 12px 38px", borderRadius: 11, border: "1px solid var(--border)",
                fontSize: 14, boxSizing: "border-box", color: "var(--ink)"
              }}
            />
            <button onClick={() => setShowPw(!showPw)} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)"
            }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <span style={{ fontSize: 12.5, color: "var(--primary)", cursor: "pointer" }}>Lupa password?</span>
          </div>

          {error && <p role="alert" style={{ color: "var(--severe)", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
          <button
            onClick={() => onLogin(patientId.trim(), password, staff ? "staff" : "patient")}
            disabled={loading}
            style={{
              background: "var(--primary)", color: "#fff", border: "none", borderRadius: 11,
              padding: "13px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16
            }}
          >
            {loading ? "Memeriksa..." : "Login"}
          </button>

          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center", margin: 0 }}>
            Belum punya akun? <span style={{ color: "var(--primary)", fontWeight: 600 }}>Hubungi petugas kesehatan</span>
          </p>
          <p style={{ textAlign: "center", margin: "12px 0 0" }}>
            <button onClick={() => setStaff(!staff)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "var(--ink-soft)", textDecoration: "underline" }}>
              {staff ? "Masuk sebagai pasien" : "Masuk sebagai petugas / peneliti"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
