import React, { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Card, Empty, th, td, PageTitle, primaryBtn, ghostBtn, inputStyle } from "./ui.jsx";
import { latestByPatient, withTotal, fmtDate, ageOf } from "./stats.js";
import { Modal, randomPassword, fieldLabel } from "./Modal.jsx";
import * as api from "../api.js";

export default function Patients({ patients, assessments, isAdmin, onOpen, onCreated }) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const latest = useMemo(() => latestByPatient(withTotal(assessments)), [assessments]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return patients.filter((p) => !s || p.id.toLowerCase().includes(s) || (p.name || "").toLowerCase().includes(s));
  }, [patients, q]);

  const nextId = useMemo(() => {
    const max = Math.max(0, ...patients.map((p) => Number(/^P(\d+)$/.exec(p.id)?.[1] ?? 0)));
    return "P" + String(max + 1).padStart(3, "0");
  }, [patients]);

  return (
    <>
      <PageTitle
        title="Data pasien"
        sub={isAdmin ? "Kelola pasien yang terdaftar di sistem ESAS." : "Daftar pasien (hanya Patient ID, tanpa identitas)."}
        right={isAdmin && (
          <button onClick={() => setAdding(true)} style={{ ...primaryBtn, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <UserPlus size={16} /> Tambah pasien
          </button>
        )}
      />

      <Card>
        <div style={{ position: "relative", marginBottom: 14, maxWidth: 380 }}>
          <Search size={15} color="var(--ink-soft)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isAdmin ? "Cari ID atau nama" : "Cari Patient ID"} aria-label="Cari pasien" style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>

        {rows.length === 0 ? (
          <Empty>{patients.length === 0 ? "Belum ada pasien terdaftar." : "Tidak ada pasien yang cocok."}</Empty>
        ) : (
          <div className="table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  {isAdmin && <th style={th}>Nama</th>}
                  {isAdmin && <th style={th}>Usia</th>}
                  <th style={th}>Skor terakhir</th>
                  <th style={th}>Assessment terakhir</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const l = latest.get(p.id);
                  return (
                    <tr key={p.id} onClick={() => onOpen(p.id)} style={{ cursor: "pointer" }}>
                      <td style={{ ...td, fontWeight: 600 }}>{p.id}</td>
                      {isAdmin && <td style={td}>{p.name || "–"}</td>}
                      {isAdmin && <td style={td}>{ageOf(p.birthDate) ?? "–"}</td>}
                      <td style={td}>{l ? l.total : "–"}</td>
                      <td style={td}>{l ? fmtDate(l.createdAt) : "Belum ada"}</td>
                      <td style={td}>
                        <span style={{ color: p.active === false ? "var(--ink-soft)" : "var(--mild)", fontWeight: 600 }}>
                          ● {p.active === false ? "Nonaktif" : "Aktif"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adding && <AddPatient suggestedId={nextId} onClose={() => setAdding(false)} onCreated={onCreated} />}
    </>
  );
}

function AddPatient({ suggestedId, onClose, onCreated }) {
  const [f, setF] = useState({ id: suggestedId, name: "", birthDate: "", sex: "P", password: randomPassword() });
  const [state, setState] = useState({ busy: false, error: "", done: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "", done: null });
    try {
      await api.adminCreatePatient({ ...f, id: f.id.trim(), name: f.name.trim() });
      setState({ busy: false, error: "", done: { id: f.id.trim(), password: f.password } });
      onCreated();
    } catch (err) {
      const msg = err.message === "HTTP_409" ? "Patient ID sudah dipakai. Gunakan ID lain."
        : err.message === "HTTP_400" ? "Data belum valid. ID hanya huruf/angka/_/-, password minimal 8 karakter."
        : "Gagal menyimpan. Coba lagi.";
      setState({ busy: false, error: msg, done: null });
    }
  }

  return (
    <Modal title={state.done ? "Pasien ditambahkan" : "Tambah pasien"} onClose={onClose}>
      {state.done ? (
        <div>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 0 }}>
            Berikan data login ini ke pasien. Password hanya ditampilkan sekali dan tidak bisa dilihat lagi.
          </p>
          <div style={{ background: "var(--primary-soft)", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.9, color: "var(--ink)" }}>
            Patient ID: <strong>{state.done.id}</strong><br />
            Password: <strong style={{ fontFamily: "ui-monospace, monospace" }}>{state.done.password}</strong>
          </div>
          <button onClick={onClose} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>Selesai</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={fieldLabel} htmlFor="np-id">Patient ID</label><input id="np-id" required value={f.id} onChange={set("id")} pattern="[A-Za-z0-9_\-]{1,32}" style={inputStyle} /></div>
          <div><label style={fieldLabel} htmlFor="np-name">Nama lengkap</label><input id="np-name" required maxLength={100} value={f.name} onChange={set("name")} style={inputStyle} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={fieldLabel} htmlFor="np-birth">Tanggal lahir</label><input id="np-birth" type="date" required min="1900-01-01" max={today} value={f.birthDate} onChange={set("birthDate")} style={inputStyle} /></div>
            <div style={{ width: 130 }}><label style={fieldLabel} htmlFor="np-sex">Jenis kelamin</label>
              <select id="np-sex" value={f.sex} onChange={set("sex")} style={inputStyle}><option value="P">Perempuan</option><option value="L">Laki-laki</option></select>
            </div>
          </div>
          <div>
            <label style={fieldLabel} htmlFor="np-pw">Password awal</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="np-pw" required minLength={8} value={f.password} onChange={set("password")} style={{ ...inputStyle, fontFamily: "ui-monospace, monospace" }} />
              <button type="button" onClick={() => setF({ ...f, password: randomPassword() })} style={{ ...ghostBtn, whiteSpace: "nowrap" }}>Acak</button>
            </div>
          </div>
          {state.error && <p role="alert" style={{ color: "var(--severe)", fontSize: 13, margin: 0 }}>{state.error}</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Batal</button>
            <button type="submit" disabled={state.busy} style={{ ...primaryBtn, flex: 1, opacity: state.busy ? 0.6 : 1 }}>{state.busy ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
