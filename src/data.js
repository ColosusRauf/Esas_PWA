import {
  Flame, BatteryLow, Moon, Waves, UtensilsCrossed, Wind,
  CloudRain, HeartPulse, Heart, MoreHorizontal
} from "lucide-react";

// 10 gejala sesuai desain (9 gejala ESAS + "Lainnya"). Skor maksimal = 100.
export const DOMAINS = [
  { key: "nyeri", label: "Nyeri (Pain)", en: "Pain", lo: "Tidak ada", hi: "Sangat berat", icon: Flame },
  { key: "lelah", en: "Fatigue", label: "Kelelahan (Fatigue)", lo: "Tidak ada", hi: "Sangat berat", icon: BatteryLow },
  { key: "kantuk", en: "Drowsiness", label: "Rasa Mengantuk", lo: "Tidak ada", hi: "Sangat berat", icon: Moon },
  { key: "mual", en: "Nausea", label: "Mual (Nausea)", lo: "Tidak ada", hi: "Sangat berat", icon: Waves },
  { key: "nafsu", en: "Appetite", label: "Nafsu Makan (Appetite)", lo: "Baik", hi: "Sangat buruk", icon: UtensilsCrossed },
  { key: "napas", en: "Shortness of breath", label: "Sesak Napas", lo: "Tidak ada", hi: "Sangat berat", icon: Wind },
  { key: "sedih", en: "Sadness", label: "Perasaan Sedih", lo: "Tidak ada", hi: "Sangat berat", icon: CloudRain },
  { key: "cemas", en: "Anxiety", label: "Rasa Cemas", lo: "Tidak ada", hi: "Sangat berat", icon: HeartPulse },
  { key: "sejahtera", en: "General discomfort", label: "Rasa Tidak Nyaman Umum", lo: "Tidak ada", hi: "Sangat berat", icon: Heart },
  { key: "lainnya", en: "Other", label: "Lainnya (Other)", lo: "Tidak ada", hi: "Sangat berat", icon: MoreHorizontal },
];

export const MAX_SCORE = DOMAINS.length * 10;

export const severity = (v) => (v <= 3 ? "ringan" : v <= 6 ? "sedang" : "berat");
export const SEV_COLOR = { ringan: "var(--mild)", sedang: "var(--moderate)", berat: "var(--severe)" };
export const SEV_LABEL = { ringan: "Ringan", sedang: "Sedang", berat: "Berat" };

export const totalOf = (answers) => answers.reduce((a, b) => a + (b ?? 0), 0);

// ---- Teks dua bahasa untuk halaman pasien ----
export const dShort = (d, lang) => (lang === "en" ? d.en : d.label.split(" (")[0]); // nama pendek
export const dFull = (d, lang) => (lang === "en" ? d.en : d.label);
export const dLo = (d, lang) => (lang === "en" ? (d.key === "nafsu" ? "Good" : "None") : d.lo);
export const dHi = (d, lang) => (lang === "en" ? (d.key === "nafsu" ? "Very poor" : "Very severe") : d.hi);
export const SEV_LABEL_L = {
  id: { ringan: "Ringan", sedang: "Sedang", berat: "Berat" },
  en: { ringan: "Mild", sedang: "Moderate", berat: "Severe" },
};

// Nama gejala untuk item "Lainnya": bila pasien menuliskan gejalanya, tampilkan itu.
//  mode "short" -> "sembelit"; mode "full" -> "Lainnya: sembelit"
export const otherName = (d, rec) => (d.key === "lainnya" && rec?.otherSymptom ? rec.otherSymptom : null);
export const symLabel = (d, rec, base, mode = "short") => {
  const o = otherName(d, rec);
  if (!o) return base;
  return mode === "full" ? `${base}: ${o}` : o;
};
