import React from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { LangSegment, ThemeButton } from "../components/Toggles.jsx";
import { CONTACT } from "../contact.js";

// Naikkan versi ini bila isi kebijakan berubah berarti; semua pasien akan diminta menyetujui ulang.
export const CONSENT_VERSION = "1.0";

// CATATAN UNTUK PENELITI: teks di bawah adalah DRAF. Sesuaikan dengan protokol penelitian
// dan minta tinjauan komite etik / pembimbing sebelum dipakai untuk pasien sungguhan.
const CONTENT = {
  id: [
    { h: "Tentang ESAS", p: ["ESAS adalah aplikasi untuk membantu pasien pasca kemoterapi memantau gejala secara mandiri dan digunakan dalam sebuah penelitian."] },
    { h: "Data yang kami kumpulkan", ul: [
      "Patient ID dan password Anda (password disimpan dalam bentuk terenkripsi/hash, sehingga tidak dapat dibaca siapa pun).",
      "Data dasar yang dicatat petugas saat membuatkan akun, misalnya nama, tanggal lahir, dan jenis kelamin.",
      "Jawaban 10 pertanyaan gejala (skor 0–10) beserta tanggal dan waktu pengisian.",
      "Catatan aktivitas seperti waktu masuk dan waktu pengiriman assessment, serta waktu dan versi persetujuan Anda.",
      "Bila Anda mengaktifkan pengingat: alamat langganan notifikasi dari browser Anda (bukan isi pesan pribadi).",
    ] },
    { h: "Untuk apa data dipakai", ul: [
      "Menampilkan riwayat dan grafik gejala Anda.",
      "Membantu tenaga kesehatan memantau kondisi Anda.",
      "Analisis penelitian tentang gejala pasca kemoterapi. Hasil penelitian dilaporkan secara gabungan tanpa menyebut identitas Anda.",
      "Mengirim pengingat harian, bila Anda mengaktifkannya.",
    ] },
    { h: "Siapa yang dapat melihat", ul: [
      "Anda dapat melihat data Anda sendiri setelah login.",
      "Petugas kesehatan/admin yang berwenang dapat melihat data pasien untuk keperluan pemantauan.",
      "Peneliti menganalisis data memakai Patient ID, tanpa memerlukan identitas lain.",
      "Data tidak dijual dan tidak dibagikan untuk iklan.",
    ] },
    { h: "Penyimpanan dan keamanan", ul: [
      "Data disimpan di basis data terkelola (Supabase) dengan server di Singapura dan dikirim melalui koneksi terenkripsi (HTTPS).",
      "Akses dibatasi menurut akun dan peran; setiap akun pasien hanya dapat membuka datanya sendiri.",
      "Agar dapat dipakai saat sinyal lemah, salinan data Anda juga disimpan di perangkat ini. Salinan itu dihapus saat Anda keluar (logout). Gunakan tombol Keluar bila memakai perangkat bersama.",
    ] },
    { h: "Hak Anda", p: ["Anda dapat bertanya, meminta salinan data, meminta koreksi atau penghapusan data, maupun menarik persetujuan kapan saja tanpa memengaruhi perawatan Anda. Hubungi peneliti melalui kontak di bawah."] },
    { h: "Keikutsertaan sukarela", p: ["Memakai ESAS bersifat sukarela. Anda boleh berhenti kapan saja."] },
    { h: "Bukan nasihat medis", p: ["ESAS tidak menggantikan pemeriksaan atau nasihat dokter. Bila gejala terasa berat atau mengkhawatirkan, segera hubungi tenaga kesehatan. Dalam keadaan darurat, hubungi layanan gawat darurat setempat."] },
    { h: "Perubahan kebijakan", p: ["Bila kebijakan ini berubah secara berarti, Anda akan diminta membaca dan menyetujuinya kembali."] },
    { h: "Kontak", p: [] },
  ],
  en: [
    { h: "About ESAS", p: ["ESAS is an app that helps post-chemotherapy patients monitor their symptoms independently and is used in a research study."] },
    { h: "Data we collect", ul: [
      "Your Patient ID and password (the password is stored in encrypted/hashed form, so nobody can read it).",
      "Basic details recorded by staff when creating your account, such as name, date of birth and sex.",
      "Your answers to the 10 symptom questions (score 0–10) with the date and time you filled them in.",
      "Activity records such as login time and when an assessment was sent, plus the time and version of your consent.",
      "If you turn on reminders: your browser's notification subscription address (not any personal message content).",
    ] },
    { h: "What the data is used for", ul: [
      "Showing your symptom history and charts.",
      "Helping healthcare staff follow your condition.",
      "Research analysis on post-chemotherapy symptoms. Results are reported in aggregate without naming you.",
      "Sending a daily reminder, if you turn it on.",
    ] },
    { h: "Who can see it", ul: [
      "You can see your own data after logging in.",
      "Authorised healthcare staff/admins can see patient data for monitoring.",
      "Researchers analyse data using your Patient ID, without needing other identity details.",
      "Your data is not sold and not shared for advertising.",
    ] },
    { h: "Storage and security", ul: [
      "Data is stored in a managed database (Supabase) on servers in Singapore and sent over encrypted connections (HTTPS).",
      "Access is limited by account and role; each patient account can only open its own data.",
      "To work with a weak signal, a copy of your data is also kept on this device. It is removed when you log out. Use the Log out button on a shared device.",
    ] },
    { h: "Your rights", p: ["You may ask questions, request a copy of your data, ask for corrections or deletion, or withdraw your consent at any time without affecting your care. Contact the researcher using the details below."] },
    { h: "Voluntary participation", p: ["Using ESAS is voluntary. You may stop at any time."] },
    { h: "Not medical advice", p: ["ESAS does not replace a doctor's examination or advice. If your symptoms feel severe or worrying, contact healthcare staff right away. In an emergency, call your local emergency services."] },
    { h: "Changes to this policy", p: ["If this policy changes in a meaningful way, you will be asked to read and agree to it again."] },
    { h: "Contact", p: [] },
  ],
};

export default function Privacy({ onBack }) {
  const { lang, t } = useLang();
  return (
    <div className="doc-page">
      <header className="doc-head">
        <button className="icon-btn" onClick={onBack} aria-label={t("pv.back")} title={t("pv.back")}><ArrowLeft size={18} /></button>
        <span className="l-logo"><HeartPulse size={17} color="#fff" /></span>
        <strong style={{ fontSize: 18, color: "var(--ink)" }}>ESAS</strong>
        <div className="l-tools"><LangSegment compact /><ThemeButton /></div>
      </header>
      <main className="doc-body">
        <h1>{t("pv.title")}</h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 14 }}>{t("pv.updated", { v: CONSENT_VERSION })}</div>
        {CONTENT[lang].map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p?.map((x) => <p key={x} style={{ margin: "0 0 8px" }}>{x}</p>)}
            {s.ul && <ul>{s.ul.map((x) => <li key={x}>{x}</li>)}</ul>}
            {s.h === "Kontak" || s.h === "Contact" ? (
              <p style={{ margin: 0 }}>
                {CONTACT.email && <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--primary)", fontWeight: 600 }}>{CONTACT.email}</a>}
                {CONTACT.email && CONTACT.phone && " · "}
                {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} style={{ color: "var(--primary)", fontWeight: 600 }}>{CONTACT.phone}</a>}
              </p>
            ) : null}
          </section>
        ))}
      </main>
    </div>
  );
}
