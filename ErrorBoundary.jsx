import React from "react";

// Menangkap error tampilan agar pengguna tidak melihat layar putih.
// Teks sengaja dua bahasa secara langsung karena boundary berdiri di luar provider bahasa.
export default class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("UI error:", error, info?.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    let en = false;
    try { en = localStorage.getItem("esas.lang") === "en"; } catch {}
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)" }}>
        <div className="modal" role="alert" style={{ textAlign: "center" }}>
          <h2>{en ? "Something went wrong" : "Terjadi kesalahan"}</h2>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
            {en ? "The app ran into a problem. Your data is safe. Reload the page to continue." : "Aplikasi mengalami masalah. Data Anda aman. Muat ulang halaman untuk melanjutkan."}
          </p>
          <button onClick={() => location.reload()} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {en ? "Reload page" : "Muat ulang halaman"}
          </button>
        </div>
      </div>
    );
  }
}
