import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const KEY = "esas.theme"; // "auto" | "light" | "dark"
const Ctx = createContext({ mode: "auto", resolved: "light", setMode: () => {} });
export const useTheme = () => useContext(Ctx);

const read = () => { try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; } catch { return "auto"; } };
const systemDark = () => !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(read);
  const [sys, setSys] = useState(systemDark);
  const resolved = mode === "auto" ? (sys ? "dark" : "light") : mode;

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const on = () => setSys(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#0B1220" : "#2563EB");
  }, [resolved]);

  const setMode = useCallback((m) => {
    setModeState(m);
    try { m === "auto" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, m); } catch {}
  }, []);

  return <Ctx.Provider value={{ mode, resolved, setMode }}>{children}</Ctx.Provider>;
}
