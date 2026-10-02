export const TZ = "Asia/Jakarta";
export const localeOf = (lang) => (lang === "en" ? "en-GB" : "id-ID");
export const fmtDate = (iso, lang = "id") =>
  new Date(iso).toLocaleDateString(localeOf(lang), { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
export const fmtShort = (iso, lang = "id") =>
  new Date(iso).toLocaleDateString(localeOf(lang), { day: "numeric", month: "short", timeZone: TZ });
// YYYY-MM-DD menurut WIB
export const dayKeyWIB = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
export const todayKeyWIB = () => dayKeyWIB(new Date().toISOString());
