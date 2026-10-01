import { sessionFromRequest, isPatientId, isIsoDate } from "../_lib.js";
import {
  listPatients, createPatient, updatePatient, resetPassword, listAllAssessments, listLogs, logActivity,
} from "../_store.js";

const validName = (v) => typeof v === "string" && v.trim().length >= 1 && v.trim().length <= 100;
const validPassword = (v) => typeof v === "string" && v.length >= 8 && v.length <= 200;

export default async function handler(req, res) {
  const session = sessionFromRequest(req);
  if (!session || !["admin", "researcher"].includes(session.role)) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  const isAdmin = session.role === "admin";
  const action = req.query.action;
  const m = req.method;
  const body = req.body || {};
  const actor = { actor: session.sub, role: session.role };

  try {
    // ---- baca ----
    if (action === "patients" && m === "GET") {
      const items = await listPatients();
      // Peneliti hanya melihat Patient ID (tanpa identitas)
      return res.status(200).json({
        items: isAdmin ? items : items.map((p) => ({ id: p.id, sex: p.sex, active: p.active, createdAt: p.createdAt })),
      });
    }
    if (action === "assessments" && m === "GET") {
      return res.status(200).json({ items: await listAllAssessments() });
    }

    // ---- catat ekspor (admin & peneliti) ----
    if (action === "log" && m === "POST") {
      const { kind, from, to, count } = body;
      const ok = ["full", "summary"].includes(kind) && isIsoDate(from) && isIsoDate(to) && Number.isInteger(count) && count >= 0 && count < 1e7;
      if (!ok) return res.status(400).json({ error: "BAD_REQUEST" });
      await logActivity({ ...actor, action: "EXPORT_CSV", target: kind, detail: `${from} s/d ${to}, ${count} assessment` });
      return res.status(201).json({ ok: true });
    }

    // ---- hanya admin ----
    if (!isAdmin) return res.status(403).json({ error: "FORBIDDEN" });

    if (action === "patients" && m === "POST") {
      const { id, name, birthDate, sex, password } = body;
      if (!isPatientId(id) || !validName(name) || !isIsoDate(birthDate) || !["L", "P"].includes(sex) || !validPassword(password)) {
        return res.status(400).json({ error: "BAD_REQUEST" });
      }
      const created = await createPatient({ id, name: name.trim(), birthDate, sex, password });
      if (!created) return res.status(409).json({ error: "ID_TAKEN" });
      await logActivity({ ...actor, action: "CREATE_PATIENT", target: id });
      return res.status(201).json({ ok: true });
    }

    if (action === "patients" && m === "PATCH") {
      const { id, name, birthDate, sex, active } = body;
      if (!isPatientId(id)) return res.status(400).json({ error: "BAD_REQUEST" });
      const patch = {};
      if (name !== undefined) { if (!validName(name)) return res.status(400).json({ error: "BAD_REQUEST" }); patch.name = name.trim(); }
      if (birthDate !== undefined) { if (!isIsoDate(birthDate)) return res.status(400).json({ error: "BAD_REQUEST" }); patch.birthDate = birthDate; }
      if (sex !== undefined) { if (!["L", "P"].includes(sex)) return res.status(400).json({ error: "BAD_REQUEST" }); patch.sex = sex; }
      if (active !== undefined) { if (typeof active !== "boolean") return res.status(400).json({ error: "BAD_REQUEST" }); patch.active = active; }
      if (!Object.keys(patch).length) return res.status(400).json({ error: "BAD_REQUEST" });

      if (!(await updatePatient(id, patch))) return res.status(404).json({ error: "NOT_FOUND" });
      if (patch.active !== undefined) {
        await logActivity({ ...actor, action: "SET_ACTIVE", target: id, detail: patch.active ? "diaktifkan" : "dinonaktifkan" });
      }
      const fields = Object.keys(patch).filter((k) => k !== "active");
      if (fields.length) {
        const label = { name: "nama", birthDate: "tanggal lahir", sex: "jenis kelamin" };
        await logActivity({ ...actor, action: "UPDATE_PATIENT", target: id, detail: fields.map((f) => label[f]).join(", ") });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === "reset-password" && m === "POST") {
      const { id, password } = body;
      if (!isPatientId(id) || !validPassword(password)) return res.status(400).json({ error: "BAD_REQUEST" });
      if (!(await resetPassword(id, password))) return res.status(404).json({ error: "NOT_FOUND" });
      await logActivity({ ...actor, action: "RESET_PASSWORD", target: id });
      return res.status(200).json({ ok: true });
    }

    if (action === "logs" && m === "GET") {
      return res.status(200).json({ items: await listLogs(500) });
    }

    return res.status(404).json({ error: "NOT_FOUND" });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "UPSTREAM" });
  }
}
