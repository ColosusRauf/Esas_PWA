import {
  Flame, BatteryLow, Moon, Waves, UtensilsCrossed, Wind,
  CloudRain, HeartPulse, Heart, MoreHorizontal
} from "lucide-react";

// 10 gejala sesuai desain (9 gejala ESAS + "Lainnya"). Skor maksimal = 100.
export const DOMAINS = [
  { key: "nyeri", label: "Nyeri (Pain)", lo: "Tidak ada", hi: "Sangat berat", icon: Flame },
  { key: "lelah", label: "Kelelahan (Fatigue)", lo: "Tidak ada", hi: "Sangat berat", icon: BatteryLow },
  { key: "kantuk", label: "Rasa Mengantuk", lo: "Tidak ada", hi: "Sangat berat", icon: Moon },
  { key: "mual", label: "Mual (Nausea)", lo: "Tidak ada", hi: "Sangat berat", icon: Waves },
  { key: "nafsu", label: "Nafsu Makan (Appetite)", lo: "Baik", hi: "Sangat buruk", icon: UtensilsCrossed },
  { key: "napas", label: "Sesak Napas", lo: "Tidak ada", hi: "Sangat berat", icon: Wind },
  { key: "sedih", label: "Perasaan Sedih", lo: "Tidak ada", hi: "Sangat berat", icon: CloudRain },
  { key: "cemas", label: "Rasa Cemas", lo: "Tidak ada", hi: "Sangat berat", icon: HeartPulse },
  { key: "sejahtera", label: "Rasa Tidak Nyaman Umum", lo: "Tidak ada", hi: "Sangat berat", icon: Heart },
  { key: "lainnya", label: "Lainnya (Other)", lo: "Tidak ada", hi: "Sangat berat", icon: MoreHorizontal },
];

export const MAX_SCORE = DOMAINS.length * 10;

export const severity = (v) => (v <= 3 ? "ringan" : v <= 6 ? "sedang" : "berat");
export const SEV_COLOR = { ringan: "var(--mild)", sedang: "var(--moderate)", berat: "var(--severe)" };
export const SEV_LABEL = { ringan: "Ringan", sedang: "Sedang", berat: "Berat" };

export const totalOf = (answers) => answers.reduce((a, b) => a + (b ?? 0), 0);
