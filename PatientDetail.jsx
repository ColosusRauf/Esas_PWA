import React, { useMemo, useState } from "react";
import { Card, StatCard, Empty, th, td, ghostBtn, primaryBtn, inputStyle, PageTitle } from "./ui.jsx";
import { Modal, randomPassword, fieldLabel } from "./Modal.jsx";
import * as api from "../api.js";
import { TrendChart } from "./charts.jsx";
import { DOMAINS, severity, SEV_COLOR, SEV_LABEL } from "../data.js";
import { withTotal, fmtDate, dayKey, keyLabel, mean, r1, ageOf } from "./stats.js";
import { Activity, ClipboardCheck, TrendingUp } from "lucide-react";

export default function PatientDetail({ id, byId, assessments, onBack, isAdmin, onChanged }) {
  const [dialog, setDialog] = useState(null); // 'edit' | 'reset' | 'active'
  const p = byId.get(id);
  const list = useMemo(() => withTotal(assessments.filter((a) => a.patientId === id)), [assessments, id]);
  const last = list[list.length - 1];
  const recent = list.slice(-4); // kolom tabel per gejala (terlama -> terbaru)
  const trendData = list.map((a) => ({ label: keyLabel(dayKey(a.createdAt)), mean: a.total, n: 1 }));

  if (!p) return <><button onClick={onBack} style={ghostBtn}>Kembali</button><Empty>Pasien tidak ditemukan.</Empty></>;

  return (
    <>
      <PageTitle
        onBack={onBack}
        title={p.name ? `${p.id} · ${p.name}` : p.id}
        right={isAdmin && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setDialog("edit")} style={ghostBtn}>Edit data</button>
            <button onClick={() => setDialog("reset")} style={ghostBtn}>Reset password</button>
            <button onClick={() => setDialog("active")} style={{ ...ghostBtn, color: p.active === false ? "var(--mild)" : "var(--severe)" }}>
              {p.active === false ? "Aktifkan" : "Nonaktifkan"}
            </button>
          </div>
        )}
        sub={[p.sex === "L" ? "Laki-laki" : p.sex === "P" ? "Perempuan" : null, ageOf(p.birthDate) != null ? `${ageOf(p.birthDate)} tahun` : null, p.active === false ? "Nonaktif" : "Aktif"].filter(Boolean).join(" · ")}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        <StatCard icon={ClipboardCheck} label="Jumlah assessment" value={list.length} />
        <StatCard icon={Activity} label="Skor terakhir" value={last ? last.total : "–"} sub={last ? fmtDate(last.createdAt) : undefined} />
        <StatCard icon={TrendingUp} label="Rata-rata skor" value={list.length ? r1(mean(list.map((a) => a.total))) : "–"} />
      </div>

      <div className="fit-rows pd-grid">
        <Card title="Skor per gejala">
          {recent.length === 0 ? <Empty>Pasien ini belum mengisi assessment.</Empty> : (
            <div className="table-wrap scroll-y">
              <table style={{ width: "100%", minWidth: 0, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Gejala</th>
                    {recent.map((a) => <th key={a.clientId} style={th}>{keyLabel(dayKey(a.createdAt))}</th>)}
                    <th style={th}>Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {DOMAINS.map((d, i) => (
                    <tr key={d.key}>
                      <td style={td}>{d.label.split(" (")[0]}</td>
                      {recent.map((a) => {
                        const v = a.answers[i];
                        return <td key={a.clientId} style={{ ...td, color: SEV_COLOR[severity(v)], fontWeight: 600 }} title={SEV_LABEL[severity(v)]}>{v}</td>;
                      })}
                      <td style={{ ...td, fontWeight: 700 }}>{r1(mean(recent.map((a) => a.answers[i])))}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...td, fontWeight: 700 }}>Total</td>
                    {recent.map((a) => <td key={a.clientId} style={{ ...td, fontWeight: 700 }}>{a.total}</td>)}
                    <td style={{ ...td, fontWeight: 700 }}>{r1(mean(recent.map((a) => a.total)))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "10px 0 0" }}>
            Warna angka: hijau 0–3 (ringan), kuning 4–6 (sedang), merah 7–10 (berat).
          </p>
        </Card>
        <Card title="Tren total skor"><TrendChart data={trendData} unit="Total skor" /></Card>
        <Card title="Riwayat assessment">
          {list.length === 0 ? <Empty>Belum ada riwayat.</Empty> : (
            <div className="table-wrap scroll-y">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Tanggal</th><th style={th}>Total skor</th><th style={th}>Gejala berat (&gt; 6)</th></tr></thead>
                <tbody>
                  {[...list].reverse().map((a) => {
                    const sev = DOMAINS.map((d, i) => ({ l: d.label.split(" (")[0], v: a.answers[i] })).filter((s) => s.v > 6);
                    return (
                      <tr key={a.clientId}>
                        <td style={td}>{fmtDate(a.createdAt)}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{a.total}</td>
                        <td style={{ ...td, color: sev.length ? "var(--severe)" : "var(--ink-soft)" }}>{sev.length ? sev.map((s) => `${s.l} ${s.v}`).join(", ") : "Tidak ada"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {dialog === "edit" && <EditDialog p={p} onClose={() => setDialog(null)} onChanged={onChanged} />}
      {dialog === "reset" && <ResetDialog p={p} onClose={() => setDialog(null)} />}
      {dialog === "active" && <ActiveDialog p={p} onClose={() => setDialog(null)} onChanged={onChanged} />}
    </>
  );
}

function useAction() {
  const [st, setSt] = useState({ busy: false, error: "" });
  async function run(fn) {
    setSt({ busy: true, error: "" });
    try { await fn(); setSt({ busy: false, error: "" }); return true; }
    catch (e) { setSt({ busy: false, error: e.message === "HTTP_400" ? "Data belum valid." : "Gagal menyimpan. Coba lagi." }); return false; }
  }
  return [st, run];
}

function EditDialog({ p, onClose, onChanged }) {
  const [f, setF] = useState({ name: p.name || "", birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : "", sex: p.sex || "P" });
  const [st, run] = useAction();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    if (await run(() => api.adminUpdatePatient({ id: p.id, name: f.name.trim(), birthDate: f.birthDate, sex: f.sex }))) { onChanged(); onClose(); }
  }
  return (
    <Modal title={`Edit ${p.id}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div><label style={fieldLabel} htmlFor="ed-name">Nama lengkap</label><input id="ed-name" required maxLength={100} value={f.name} onChange={set("name")} style={inputStyle} /></div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><label style={fieldLabel} htmlFor="ed-birth">Tanggal lahir</label><input id="ed-birth" type="date" required min="1900-01-01" max={new Date().toISOString().slice(0, 10)} value={f.birthDate} onChange={set("birthDate")} style={inputStyle} /></div>
          <div style={{ width: 130 }}><label style={fieldLabel} htmlFor="ed-sex">Jenis kelamin</label>
            <select id="ed-sex" value={f.sex} onChange={set("sex")} style={inputStyle}><option value="P">Perempuan</option><option value="L">Laki-laki</option></select>
          </div>
        </div>
        {st.error && <p role="alert" style={{ color: "var(--severe)", fontSize: 13, margin: 0 }}>{st.error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Batal</button>
          <button type="submit" disabled={st.busy} style={{ ...primaryBtn, flex: 1, opacity: st.busy ? 0.6 : 1 }}>{st.busy ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </Modal>
  );
}

function ResetDialog({ p, onClose }) {
  const [pw, setPw] = useState(randomPassword());
  const [done, setDone] = useState(false);
  const [st, run] = useAction();
  async function submit(e) {
    e.preventDefault();
    if (await run(() => api.adminResetPassword({ id: p.id, password: pw }))) setDone(true);
  }
  return (
    <Modal title={done ? "Password diganti" : `Reset password ${p.id}`} onClose={onClose}>
      {done ? (
        <div>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 0 }}>Berikan password baru ini ke pasien. Password hanya ditampilkan sekali.</p>
          <div style={{ background: "var(--primary-soft)", borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.9, color: "var(--ink)" }}>
            Patient ID: <strong>{p.id}</strong><br />
            Password: <strong style={{ fontFamily: "ui-monospace, monospace" }}>{pw}</strong>
          </div>
          <button onClick={onClose} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>Selesai</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0 }}>Password lama tidak akan berlaku lagi. Pasien harus memakai password baru untuk masuk.</p>
          <div>
            <label style={fieldLabel} htmlFor="rs-pw">Password baru</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="rs-pw" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} style={{ ...inputStyle, fontFamily: "ui-monospace, monospace" }} />
              <button type="button" onClick={() => setPw(randomPassword())} style={{ ...ghostBtn, whiteSpace: "nowrap" }}>Acak</button>
            </div>
          </div>
          {st.error && <p role="alert" style={{ color: "var(--severe)", fontSize: 13, margin: 0 }}>{st.error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Batal</button>
            <button type="submit" disabled={st.busy} style={{ ...primaryBtn, flex: 1, opacity: st.busy ? 0.6 : 1 }}>{st.busy ? "Menyimpan..." : "Ganti password"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ActiveDialog({ p, onClose, onChanged }) {
  const turnOff = p.active !== false;
  const [st, run] = useAction();
  async function go() {
    if (await run(() => api.adminUpdatePatient({ id: p.id, active: !turnOff }))) { onChanged(); onClose(); }
  }
  return (
    <Modal title={turnOff ? `Nonaktifkan ${p.id}?` : `Aktifkan ${p.id}?`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 0 }}>
        {turnOff
          ? "Pasien tidak akan bisa masuk atau mengirim assessment, dan sesi yang sedang aktif langsung ditolak. Data yang sudah ada tetap tersimpan dan tetap muncul di analitik."
          : "Pasien bisa masuk dan mengirim assessment lagi dengan password yang berlaku."}
      </p>
      {st.error && <p role="alert" style={{ color: "var(--severe)", fontSize: 13 }}>{st.error}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Batal</button>
        <button onClick={go} disabled={st.busy} style={{ ...primaryBtn, flex: 1, background: turnOff ? "var(--severe)" : "var(--primary)", opacity: st.busy ? 0.6 : 1 }}>
          {turnOff ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </Modal>
  );
}
