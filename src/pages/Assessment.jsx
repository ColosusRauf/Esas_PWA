import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { DOMAINS } from "../data.js";

const PER_PAGE = 4;
const PAGES = Math.ceil(DOMAINS.length / PER_PAGE);

export default function Assessment({ patientId, onNavigate, onLogout, onSubmit }) {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState(Array(DOMAINS.length).fill(null));

  const start = page * PER_PAGE;
  const pageItems = DOMAINS.slice(start, start + PER_PAGE);
  const answeredCount = answers.filter((v) => v !== null).length;
  const pct = (answeredCount / DOMAINS.length) * 100;
  const isLastPage = page === PAGES - 1;
  const pageComplete = pageItems.every((_, i) => answers[start + i] !== null);

  function setAnswer(idx, v) {
    const next = [...answers];
    next[idx] = v;
    setAnswers(next);
  }

  function handleNext() {
    if (isLastPage) {
      onSubmit(answers);
    } else {
      setPage(page + 1);
    }
  }

  return (
    <div style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active="assessment" onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />

      <main style={{ flex: 1, padding: "22px 34px", maxWidth: 760 }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 26
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 19, margin: 0, color: "var(--ink)" }}>ESAS Assessment</h2>
            <span style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600 }}>
              {answeredCount} / {DOMAINS.length}
            </span>
          </div>

          <div style={{ height: 6, borderRadius: 4, background: "var(--primary-soft)", marginBottom: 20 }}>
            <div style={{ width: pct + "%", height: "100%", borderRadius: 4, background: "var(--primary)", transition: "width .2s" }} />
          </div>

          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 22 }}>
            Pilih angka yang sesuai dengan kondisi Anda hari ini. 0 = Tidak ada, 10 = Sangat berat.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 26 }}>
            {pageItems.map((d, i) => {
              const idx = start + i;
              const Icon = d.icon;
              const v = answers[idx];
              return (
                <div key={d.key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, background: "var(--primary-soft)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <Icon size={15} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      {idx + 1}. {d.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Array.from({ length: 11 }, (_, n) => n).map((n) => {
                      const selected = v === n;
                      return (
                        <button
                          key={n}
                          onClick={() => setAnswer(idx, n)}
                          style={{
                            width: 30, height: 30, borderRadius: "50%",
                            border: selected ? "none" : "1px solid var(--border)",
                            background: selected ? "var(--primary)" : "var(--surface)",
                            color: selected ? "#fff" : "var(--ink-soft)",
                            fontSize: 12.5, fontWeight: 600, cursor: "pointer"
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-soft)", marginTop: 6 }}>
                    <span>{d.lo}</span>
                    <span>{d.hi}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 11, fontSize: 14, fontWeight: 600,
                border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)",
                cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1
              }}
            >
              Sebelumnya
            </button>
            <button
              onClick={handleNext}
              disabled={!pageComplete}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 11, fontSize: 14, fontWeight: 600,
                border: "none", background: "var(--primary)", color: "#fff",
                cursor: pageComplete ? "pointer" : "not-allowed", opacity: pageComplete ? 1 : 0.45
              }}
            >
              {isLastPage ? "Selesai & Kirim" : "Berikutnya"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
