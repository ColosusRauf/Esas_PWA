// Tips perawatan umum per gejala (C4).
// PENTING: ini draf informasi umum, BUKAN saran medis. Wajib ditinjau dokter/perawat onkologi
// sebelum dipakai pada pasien sungguhan. Ubah teksnya di sini; format [Indonesia, Inggris].
export const TIPS = {
  nyeri: [
    ["Catat kapan nyeri muncul dan apa yang memicunya, lalu sampaikan ke dokter.", "Note when the pain appears and what triggers it, then tell your doctor."],
    ["Minum obat nyeri hanya sesuai resep dan jadwal dari dokter.", "Take pain medicine only as prescribed and on schedule."],
  ],
  lelah: [
    ["Bagi aktivitas jadi bagian kecil dan sisipkan istirahat singkat.", "Split activities into small parts and add short rests."],
    ["Jalan ringan bila mampu dan cukup minum; hindari memaksakan diri.", "Take gentle walks if you can and drink enough; don't push yourself."],
  ],
  kantuk: [
    ["Tidur dan bangun di jam yang sama; batasi tidur siang maksimal 30 menit.", "Keep regular sleep times; limit daytime naps to 30 minutes."],
    ["Tanyakan ke dokter apakah rasa kantuk berkaitan dengan obat yang diminum.", "Ask your doctor whether drowsiness may be related to your medicines."],
  ],
  mual: [
    ["Makan porsi kecil tapi sering; hindari makanan berminyak atau berbau tajam.", "Eat small, frequent meals; avoid greasy or strongly scented food."],
    ["Minum sedikit-sedikit sepanjang hari. Minum obat anti mual sesuai anjuran dokter.", "Sip fluids through the day. Take anti-nausea medicine as advised."],
  ],
  nafsu: [
    ["Pilih makanan yang disukai dan tinggi energi dalam porsi kecil, beberapa kali sehari.", "Choose liked, energy-rich foods in small portions several times a day."],
    ["Makan saat merasa paling segar dan makan bersama keluarga bila bisa.", "Eat when you feel best and with family if possible."],
  ],
  napas: [
    ["Duduk tegak atau bersandar, lalu tarik napas pelan lewat hidung dan buang lewat mulut.", "Sit upright or lean back; breathe in slowly through the nose and out through the mouth."],
    ["Bila sesak muncul tiba-tiba atau makin berat, segera cari pertolongan medis.", "If breathlessness is sudden or getting worse, seek medical help right away."],
  ],
  sedih: [
    ["Ceritakan perasaan Anda kepada keluarga atau teman yang dipercaya.", "Share how you feel with trusted family or friends."],
    ["Lakukan kegiatan kecil yang menenangkan, dan bicarakan dengan tenaga kesehatan bila berlanjut.", "Do small calming activities, and talk to a health worker if it continues."],
  ],
  cemas: [
    ["Latih napas dalam perlahan selama beberapa menit.", "Practice slow deep breathing for a few minutes."],
    ["Tuliskan hal yang dikhawatirkan dan tanyakan ke tim medis agar lebih jelas.", "Write down your worries and ask the care team to clear them up."],
  ],
  sejahtera: [
    ["Atur posisi dan suhu ruangan senyaman mungkin, dan istirahat cukup.", "Make your position and room temperature as comfortable as possible and rest well."],
    ["Sampaikan ketidaknyamanan yang menetap pada kunjungan berikutnya.", "Mention lasting discomfort at your next visit."],
  ],
  lainnya: [
    ["Catat gejala lain yang Anda rasakan dan sampaikan ke tenaga kesehatan.", "Write down any other symptoms and tell your health worker."],
  ],
};
export const tipsFor = (key, lang) => (TIPS[key] || []).map((p) => p[lang === "en" ? 1 : 0]);
