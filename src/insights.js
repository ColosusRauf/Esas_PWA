import { dayKeyWIB, todayKeyWIB } from "./format.js";
import { totalOf } from "./data.js";

const addDays = (key, n) => {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export { addDays };

// Himpunan tanggal (WIB) yang sudah diisi
export const filledDays = (assessments) => new Set(assessments.map((a) => dayKeyWIB(a.createdAt)));

// streak = hari berturut-turut sampai hari ini (atau sampai kemarin bila hari ini belum diisi)
export function streaks(assessments) {
  const days = filledDays(assessments);
  const today = todayKeyWIB();
  let cur = 0;
  let k = days.has(today) ? today : addDays(today, -1);
  while (days.has(k)) { cur++; k = addDays(k, -1); }
  const sorted = [...days].sort();
  let best = 0, run = 0, prev = null;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current: cur, best, days };
}

// Pesan semangat setelah mengisi. kind menentukan teks (kunci i18n "cel.<kind>")
export function encouragement(assessments) {
  const last = assessments[assessments.length - 1];
  const prev = assessments[assessments.length - 2];
  const answers = last?.answers || [];
  const total = totalOf(answers);
  const maxV = Math.max(0, ...answers);
  const { current } = streaks(assessments);
  let kind = "first";
  if (prev) {
    const d = total - totalOf(prev.answers);
    kind = d <= -5 ? "better" : d >= 5 ? "worse" : "same";
  }
  return { kind, total, current, severe: maxV >= 7, maxV };
}

// A3: peringatan klinis dari pengisian terbaru.
//  urgent = ada gejala >= 7 pada pengisian terakhir (dalam 3 hari terakhir)
//  watch  = gejala yang >= 5 pada 3 pengisian berturut-turut (berulang)
export function clinicalAlert(assessments) {
  const last = assessments[assessments.length - 1];
  if (!last) return null;
  const ageDays = Math.round((new Date(todayKeyWIB() + "T00:00:00Z") - new Date(dayKeyWIB(last.createdAt) + "T00:00:00Z")) / 864e5);
  if (ageDays > 3) return null;
  const severe = [];
  last.answers.forEach((v, i) => { if (v >= 7) severe.push({ i, v }); });
  const persistent = [];
  const three = assessments.slice(-3);
  if (three.length === 3) {
    last.answers.forEach((_, i) => {
      if (three.every((a) => a.answers[i] >= 5) && !severe.some((s) => s.i === i)) persistent.push({ i, v: last.answers[i] });
    });
  }
  const level = severe.length ? "urgent" : persistent.length ? "watch" : null;
  if (!level) return null;
  // indeks 5 = sesak napas, indeks 0 = nyeri
  const emergency = severe.some((s) => (s.i === 5 && s.v >= 7) || (s.i === 0 && s.v >= 9));
  return { level, severe: severe.sort((a, b) => b.v - a.v), persistent, emergency, id: last.id };
}
