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
