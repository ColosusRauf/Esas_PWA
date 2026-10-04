import { patientFromRequest } from "./_lib.js";
import { changePassword, isPatientActive, logActivity } from "./_store.js";

// POST { oldPassword, newPassword } oleh pasien yang sedang login
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const patientId = patientFromRequest(req);
  if (!patientId) return res.status(401).json({ error: "UNAUTHORIZED" });
  const { oldPassword, newPassword } = req.body || {};
  if (typeof oldPassword !== "string" || !oldPassword || oldPassword.length > 200 ||
      typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 200) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }
  if (newPassword === oldPassword) return res.status(400).json({ error: "SAME_PASSWORD" });
  try {
    if (!(await isPatientActive(patientId))) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!(await changePassword(patientId, oldPassword, newPassword))) {
      await new Promise((r) => setTimeout(r, 600));
      return res.status(403).json({ error: "WRONG_PASSWORD" });
    }
    await logActivity({ actor: patientId, role: "patient", action: "PASSWORD_CHANGE", target: patientId });
    return res.status(200).json({ ok: true });
  } catch (e) {
    if (e.status === 501) return res.status(501).json({ error: "NOT_SUPPORTED" });
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
