import { patientFromRequest } from "./_lib.js";
import { isPatientActive, savePushSub, deletePushSub, listPushSubs } from "./_store.js";
import { pushConfigured, sendPush, REMINDER } from "./_push.js";

const okSub = (s) =>
  s && typeof s.endpoint === "string" && s.endpoint.startsWith("https://") && s.endpoint.length <= 1500 &&
  typeof s.keys?.p256dh === "string" && typeof s.keys?.auth === "string" && s.keys.p256dh.length < 200 && s.keys.auth.length < 100;

export default async function handler(req, res) {
  const patientId = patientFromRequest(req);
  if (!patientId) return res.status(401).json({ error: "UNAUTHORIZED" });
  try {
    if (!(await isPatientActive(patientId))) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!pushConfigured()) return res.status(501).json({ error: "NOT_CONFIGURED" });

    if (req.method === "GET") return res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });

    if (req.method === "POST") {
      if (req.body?.test === true) {
        const subs = await listPushSubs(patientId);
        let sent = 0;
        for (const s of subs) {
          const r = await sendPush(s, { ...REMINDER, body: "Notifikasi uji berhasil · Test notification works" });
          if (r === "ok") sent++;
          if (r === "gone") await deletePushSub(s.endpoint);
        }
        return res.status(sent ? 200 : 404).json({ ok: sent > 0, sent });
      }
      if (!okSub(req.body?.subscription)) return res.status(400).json({ error: "BAD_REQUEST" });
      await savePushSub(patientId, req.body.subscription);
      return res.status(201).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const endpoint = req.body?.endpoint;
      if (typeof endpoint !== "string" || endpoint.length > 1500) return res.status(400).json({ error: "BAD_REQUEST" });
      await deletePushSub(endpoint, patientId);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  } catch (e) {
    if (e.status === 501) return res.status(501).json({ error: "NOT_SUPPORTED" });
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
