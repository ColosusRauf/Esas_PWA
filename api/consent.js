import { patientFromRequest } from "./_lib.js";
import { getConsent, setConsent, isPatientActive, logActivity } from "./_store.js";

export default async function handler(req, res) {
  const patientId = patientFromRequest(req);
  if (!patientId) return res.status(401).json({ error: "UNAUTHORIZED" });
  try {
    if (!(await isPatientActive(patientId))) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (req.method === "GET") return res.status(200).json(await getConsent(patientId));
    if (req.method === "POST") {
      const version = req.body?.version;
      if (typeof version !== "string" || !/^[0-9A-Za-z._-]{1,20}$/.test(version)) return res.status(400).json({ error: "BAD_REQUEST" });
      const at = await setConsent(patientId, version);
      await logActivity({ actor: patientId, role: "patient", action: "CONSENT", target: patientId, detail: `versi ${version}` });
      return res.status(200).json({ ok: true, at, version });
    }
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  } catch (e) {
    if (e.status === 501) return res.status(501).json({ error: "NOT_SUPPORTED" });
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
