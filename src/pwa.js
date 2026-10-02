import { useEffect, useState } from "react";

// Peristiwa "beforeinstallprompt" (Android/Chrome/Edge) hanya terjadi SEKALI, sering sebelum
// halaman Pengaturan dibuka. Maka kita tangkap sejak aplikasi dimulai dan simpan di sini.
let deferred = null;
const subs = new Set();
const notify = () => subs.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener("appinstalled", () => { deferred = null; notify(); });
}

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

export function platform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

// Browser bawaan aplikasi lain (Instagram, Facebook, dll.) tidak punya menu pasang
export const inAppBrowser = () => /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|Snapchat/i.test(navigator.userAgent || "");

export function useInstall() {
  const [, tick] = useState(0);
  const [installed, setInstalled] = useState(isStandalone);
  useEffect(() => {
    const f = () => { tick((n) => n + 1); setInstalled(isStandalone()); };
    subs.add(f);
    return () => subs.delete(f);
  }, []);
  return {
    installed,
    canPrompt: !!deferred,
    platform: platform(),
    inApp: inAppBrowser(),
    async prompt() {
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      notify();
    },
  };
}
