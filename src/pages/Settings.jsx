import React, { useEffect, useState } from "react";
import { Download, LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";

export default function Settings({ patientId, onNavigate, onLogout }) {
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvent(e); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  const btn = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)",
    background: "var(--surface)", color: "var(--ink)"
  };

  return (
    <div style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active="settings" onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />
      <main style={{ flex: 1, padding: "22px 34px", maxWidth: 720 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 20px", color: "var(--ink)" }}>Pengaturan</h2>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 22 }}>
          <section>
            <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Pasang aplikasi</div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 10px" }}>
              {installed
                ? "ESAS sudah terpasang di perangkat ini."
                : installEvent
                ? "Pasang ESAS di layar utama agar bisa dibuka seperti aplikasi biasa."
                : "Buka menu browser lalu pilih “Tambahkan ke layar utama” untuk memasang ESAS."}
            </p>
            {installEvent && !installed && (
              <button onClick={install} style={{ ...btn, background: "var(--primary)", color: "#fff", border: "none" }}>
                <Download size={16} /> Pasang ESAS
              </button>
            )}
          </section>
          <section>
            <button onClick={onLogout} style={{ ...btn, color: "var(--severe)" }}>
              <LogOut size={16} /> Keluar
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
