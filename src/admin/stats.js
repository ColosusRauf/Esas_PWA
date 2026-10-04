import { DOMAINS, totalOf } from "../data.js";

export const TZ = "Asia/Jakarta";
export const dayKey = (iso) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ }); // YYYY-MM-DD (WIB)
export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
export const keyLabel = (key) =>
  new Date(key + "T00:00:00Z").toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
export const sd = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); // sampel (n-1)
};
export const r1 = (n) => Math.round(n * 10) / 10;

export const withTotal = (items) => items.map((a) => ({ ...a, total: totalOf(a.answers) }));

// Periode: [now - (offset+1)*days, now - offset*days]
export function inPeriod(items, days, offset = 0) {
  const end = Date.now() - offset * days * 864e5;
  const start = end - days * 864e5;
  return items.filter((a) => {
    const t = +new Date(a.createdAt);
    return t > start && t <= end;
  });
}

export function inDateRange(items, from, to) {
  return items.filter((a) => {
    const k = dayKey(a.createdAt);
    return (!from || k >= from) && (!to || k <= to);
  });
}

function weekStart(key) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// Rentang <= 31 hari: per hari. Lebih panjang: per minggu (Senin).
export function trend(items, days) {
  const bucket = days <= 31 ? (k) => k : weekStart;
  const map = new Map();
  for (const a of withTotal(items)) {
    const k = bucket(dayKey(a.createdAt));
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(a.total);
  }
  return [...map.entries()]
    .sort((x, y) => x[0].localeCompare(y[0]))
    .map(([key, v]) => ({ key, label: keyLabel(key), mean: r1(mean(v)), n: v.length }));
}

export const symptomMeans = (items) =>
  DOMAINS.map((d, i) => ({ key: d.key, label: d.label.split(" (")[0], mean: r1(mean(items.map((a) => a.answers[i]))) }));

export const BINS = [
  { label: "0–25", lo: 0, hi: 25 },
  { label: "26–50", lo: 26, hi: 50 },
  { label: "51–75", lo: 51, hi: 75 },
  { label: "76–100", lo: 76, hi: 100 },
];
export function distribution(items) {
  const totals = withTotal(items).map((a) => a.total);
  return BINS.map((b) => {
    const count = totals.filter((t) => t >= b.lo && t <= b.hi).length;
    return { ...b, count, pct: totals.length ? Math.round((count / totals.length) * 100) : 0 };
  });
}

export function latestByPatient(items) {
  const m = new Map();
  for (const a of items) {
    const cur = m.get(a.patientId);
    if (!cur || a.createdAt > cur.createdAt) m.set(a.patientId, a);
  }
  return m;
}

// Gejala dengan skor > 6 (pita "berat" yang sama dengan sisi pasien)
export const severeSymptoms = (a) =>
  DOMAINS.map((d, i) => ({ label: d.label.split(" (")[0], v: a.answers[i] })).filter((s) => s.v > 6).sort((x, y) => y.v - x.v);

export const topSymptom = (a) => {
  const s = DOMAINS.map((d, i) => ({ label: d.label.split(" (")[0], v: a.answers[i] })).sort((x, y) => y.v - x.v)[0];
  return s;
};

// A4: pasien aktif yang belum mengisi >= days hari (atau belum pernah mengisi sejak akun dibuat)
export function missingPatients(patients, assessments, days) {
  const last = latestByPatient(assessments);
  const now = Date.now();
  const out = [];
  for (const p of patients) {
    if (p.active === false) continue;
    const a = last.get(p.id);
    const ref = a ? +new Date(a.createdAt) : p.createdAt ? +new Date(p.createdAt) : null;
    if (ref == null) continue;
    const since = Math.floor((now - ref) / 864e5);
    if (since >= days) out.push({ id: p.id, since, lastAt: a?.createdAt || null });
  }
  return out.sort((x, y) => y.since - x.since);
}

// A5: kamus data untuk berkas CSV
export function dictionaryCsv() {
  const rows = [
    ["berkas", "kolom", "tipe", "deskripsi", "nilai"],
    ["lengkap", "patient_id", "teks", "Kode pasien (tanpa nama)", ""],
    ["lengkap", "tanggal", "tanggal", "Tanggal pengisian, zona waktu WIB", "YYYY-MM-DD"],
    ["lengkap", "waktu_wib", "waktu", "Jam pengisian, zona waktu WIB", "HH:MM"],
    ...DOMAINS.map((d) => ["lengkap", d.key, "angka", `Skor gejala: ${d.label}`, `0 = ${d.lo}; 10 = ${d.hi}`]),
    ["lengkap", "total_skor", "angka", "Jumlah 10 skor gejala", `0-${DOMAINS.length * 10}`],
    ["ringkasan", "patient_id", "teks", "Kode pasien", ""],
    ["ringkasan", "jumlah_assessment", "angka", "Banyak pengisian pada rentang tanggal", ""],
    ["ringkasan", "rata_total", "angka", "Rata-rata total skor", ""],
    ["ringkasan", "min_total", "angka", "Total skor terendah", ""],
    ["ringkasan", "max_total", "angka", "Total skor tertinggi", ""],
    ["ringkasan", "sd_total", "angka", "Simpangan baku sampel (n-1)", ""],
    ["ringkasan", "assessment_terakhir", "tanggal", "Tanggal pengisian terakhir", "YYYY-MM-DD"],
    ["catatan", "tingkat keparahan", "", "Ringan 0-3, sedang 4-6, berat 7-10 per gejala", ""],
  ];
  return toCsv(rows);
}

export const ageOf = (birthDate) => {
  if (!birthDate) return null;
  const b = new Date(birthDate), n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
  return age;
};

export const who = (byId, id) => (byId.get(id)?.name ? `${id} · ${byId.get(id).name}` : id);

// ---------- CSV ----------
const esc = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // cegah formula injection di Excel
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) => rows.map((r) => r.map(esc).join(",")).join("\r\n");

export function fullCsv(items) {
  const head = ["patient_id", "tanggal", "waktu_wib", ...DOMAINS.map((d) => d.key), "total_skor"];
  const rows = withTotal(items).map((a) => [
    a.patientId,
    dayKey(a.createdAt),
    new Date(a.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }),
    ...a.answers,
    a.total,
  ]);
  return toCsv([head, ...rows]);
}

export function summaryCsv(items) {
  const byP = new Map();
  for (const a of withTotal(items)) {
    if (!byP.has(a.patientId)) byP.set(a.patientId, []);
    byP.get(a.patientId).push(a);
  }
  const head = ["patient_id", "jumlah_assessment", "rata_total", "min_total", "max_total", "sd_total", "assessment_terakhir"];
  const rows = [...byP.entries()].sort().map(([id, list]) => {
    const t = list.map((x) => x.total);
    return [id, list.length, r1(mean(t)), Math.min(...t), Math.max(...t), r1(sd(t)), dayKey(list[list.length - 1].createdAt)];
  });
  return toCsv([head, ...rows]);
}

export function downloadCsv(filename, text) {
  const url = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" })); // BOM agar Excel membaca UTF-8
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
