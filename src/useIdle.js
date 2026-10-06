import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "esas.lastActive";
const EVENTS = ["pointerdown", "keydown", "touchstart", "scroll", "mousemove"];
const read = () => { try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; } };
const write = (n) => { try { localStorage.setItem(KEY, String(n)); } catch {} };

// Keluar otomatis bila tidak ada aktivitas (D4).
//  enabled: hanya saat ada sesi login. canLogout: false bila ada data belum terkirim (agar tidak hilang).
export function useIdle({ enabled, idleMs, warnMs, canLogout, onTimeout }) {
  const [left, setLeft] = useState(null); // detik tersisa saat peringatan, null = tidak tampil
  const last = useRef(Date.now());
  const cb = useRef(onTimeout); cb.current = onTimeout;
  const can = useRef(canLogout); can.current = canLogout;

  const touch = useCallback(() => {
    const now = Date.now();
    if (now - last.current < 1000) return;
    last.current = now; write(now); setLeft((v) => (v == null ? v : null));
  }, []);
  const stay = useCallback(() => { last.current = Date.now(); write(last.current); setLeft(null); }, []);

  useEffect(() => {
    if (!enabled) { setLeft(null); return; }
    // bila aplikasi dibuka kembali setelah lama ditinggal
    const stored = read();
    last.current = stored && Date.now() - stored > idleMs && can.current ? 0 : Date.now();
    if (last.current === 0) { write(Date.now()); cb.current(); return; }
    write(last.current);
    const onAct = (e) => { if (e.type === "scroll" || e.type === "mousemove") touch(); else { last.current = Date.now(); write(last.current); setLeft(null); } };
    EVENTS.forEach((ev) => window.addEventListener(ev, onAct, { passive: true, capture: true }));
    const tick = () => {
      // aktivitas di tab lain ikut dihitung
      const shared = read();
      if (shared > last.current) last.current = shared;
      const idle = Date.now() - last.current;
      if (!can.current) { setLeft(null); return; }
      if (idle >= idleMs) { setLeft(null); cb.current(); }
      else if (idle >= idleMs - warnMs) setLeft(Math.ceil((idleMs - idle) / 1000));
      else setLeft(null);
    };
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      EVENTS.forEach((ev) => window.removeEventListener(ev, onAct, { capture: true }));
    };
  }, [enabled, idleMs, warnMs, touch]);

  return { left, stay };
}
