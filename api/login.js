import { signToken, isPatientId } from "./_lib.js";
import { verifyLogin, verifyStaff, logActivity, mustChangePassword } from "./_store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const { patientId, password, role } = req.body || {};
  if (!isPatientId(patientId) || typeof password !== "string" || !password || password.length > 200) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }
  try {
    let session = null;
    if (role === "staff") {
      session = await verifyStaff(patientId, password);
    } else if (await verifyLogin(patientId, password)) {
      session = { id: patientId, name: null, role: "patient" };
    }
    if (!session) {
      await new Promise((r) => setTimeout(r, 600)); // perlambat tebakan password
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    await logActivity({ actor: session.id, role: session.role, action: "LOGIN", target: session.id });
    const token = signToken({ sub: session.id, role: session.role }, process.env.SESSION_SECRET);
    const mustChange = session.role === "patient" ? await mustChangePassword(session.id) : false;
    return res.status(200).json({ token, id: session.id, role: session.role, name: session.name, mustChange });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
