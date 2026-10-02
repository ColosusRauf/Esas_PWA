import { useCallback, useEffect, useState } from "react";
import * as api from "./api.js";

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const b64ToU8 = (b64) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function currentSub() {
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function enablePush() {
  if (!pushSupported()) throw new Error("UNSUPPORTED");
  const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (perm !== "granted") throw new Error("DENIED");
  let publicKey;
  try { publicKey = (await api.pushKey()).publicKey; }
  catch (e) { throw new Error(e.status === 501 ? "NOT_CONFIGURED" : e.message); }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(publicKey) });
  await api.pushSubscribe(sub.toJSON());
}

// token diberikan eksplisit supaya bisa dipakai tepat saat logout
export async function disablePush(token) {
  if (!pushSupported()) return;
  const sub = await currentSub();
  if (!sub) return;
  try { await api.pushUnsubscribe(sub.endpoint, token); } catch {}
  try { await sub.unsubscribe(); } catch {}
}

// status: "unsupported" | "denied" | "off" | "on"
export function usePush(patientId) {
  const [status, setStatus] = useState(pushSupported() ? "off" : "unsupported");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!pushSupported()) return setStatus("unsupported");
    if (Notification.permission === "denied") return setStatus("denied");
    try { setStatus((await currentSub()) && Notification.permission === "granted" ? "on" : "off"); } catch { setStatus("off"); }
  }, []);
  useEffect(() => { if (patientId) refresh(); }, [patientId, refresh]);

  const enable = useCallback(async () => {
    setBusy(true);
    try { await enablePush(); await refresh(); }
    finally { setBusy(false); refresh(); }
  }, [refresh]);
  const disable = useCallback(async () => {
    setBusy(true);
    try { await disablePush(api.getToken()); }
    finally { setBusy(false); refresh(); }
  }, [refresh]);

  return { status, busy, enable, disable, refresh };
}
