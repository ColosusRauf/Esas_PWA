import React, { useEffect, useState } from "react";
import { Download, LogOut, Smartphone } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Card, primaryBtn, ghostBtn } from "../components/ui.jsx";

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

  return (
    <Layout active="settings" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title="Pengaturan" subtitle="Atur aplikasi dan akun Anda.">
      <div className="grid-2" style={{ alignItems: "start" }}>
        <Card>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Smartphone size={27} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 19, color: "var(--ink)", marginBottom: 6 }}>Pasang aplikasi</div>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "0 0 18px", lineHeight: 1.6 }}>
                {installed
                  ? "ESAS sudah terpasang di perangkat ini."
                  : installEvent
                  ? "Pasang ESAS di layar utama agar bisa dibuka seperti aplikasi biasa."
                  : "Buka menu browser lalu pilih “Tambahkan ke layar utama” untuk memasang ESAS."}
              </p>
              {installEvent && !installed && (
                <button onClick={install} style={{ ...primaryBtn, display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Download size={18} /> Pasang ESAS
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 19, color: "var(--ink)", marginBottom: 6 }}>Akun</div>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Anda masuk sebagai Pasien <strong style={{ color: "var(--ink)" }}>{patientId}</strong>. Keluar bila memakai perangkat bersama.
          </p>
          <button onClick={onLogout} style={{ ...ghostBtn, color: "var(--severe)", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <LogOut size={18} /> Keluar
          </button>
        </Card>
      </div>
    </Layout>
  );
}
