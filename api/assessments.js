import { patientFromRequest, isUuid, isAnswers } from "./_lib.js";
import { listAssessments, createAssessment, isPatientActive, logActivity } from "./_store.js";

export default async function handler(req, res) {
  const patientId = patientFromRequest(req);
  if (!patientId) return res.status(401).json({ error: "UNAUTHORIZED" });

  try {
    // Token lama milik pasien yang sudah dinonaktifkan tidak boleh dipakai lagi
    if (!(await isPatientActive(patientId))) return res.status(401).json({ error: "UNAUTHORIZED" });

    if (req.method === "GET") {
      return res.status(200).json({ items: await listAssessments(patientId) });
    }
    if (req.method === "POST") {
      const { clientId, answers, otherSymptom } = req.body || {};
      if (!isUuid(clientId) || !isAnswers(answers)) return res.status(400).json({ error: "BAD_REQUEST" });
      // nama gejala item ke-10: teks pendek tanpa karakter kontrol; hanya disimpan bila skornya > 0
      let other = null;
      if (typeof otherSymptom === "string") {
        const v = otherSymptom.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
        if (v && answers[9] > 0) other = v;
      }
      const created = await createAssessment(patientId, clientId, answers, other);
      if (created) {
        await logActivity({
          actor: patientId, role: "patient", action: "SUBMIT_ASSESSMENT", target: patientId,
          detail: `total ${answers.reduce((a, b) => a + b, 0)}`,
        });
      }
      return res.status(201).json({ ok: true });
    }
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
