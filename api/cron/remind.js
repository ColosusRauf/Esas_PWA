import { listDueSubs, deletePushSub } from "../_store.js";
import { pushConfigured, sendPush, REMINDER } from "../_push.js";

// Dipanggil Vercel Cron setiap hari (lihat vercel.json). Vercel mengirim "Authorization: Bearer <CRON_SECRET>".
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "UNAUTHORIZED" });
  if (!pushConfigured()) return res.status(501).json({ error: "NOT_CONFIGURED" });
  try {
    // awal hari ini menurut WIB (UTC+7)
    const wibDate = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    const since = new Date(`${wibDate}T00:00:00+07:00`).toISOString();
    const due = await listDueSubs(since);
    let sent = 0, removed = 0, failed = 0;
    for (const s of due) {
      const r = await sendPush(s, REMINDER);
      if (r === "ok") sent++;
      else if (r === "gone") { await deletePushSub(s.endpoint); removed++; }
      else failed++;
    }
    return res.status(200).json({ ok: true, due: due.length, sent, removed, failed });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
