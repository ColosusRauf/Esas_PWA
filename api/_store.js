// Dua mode penyimpanan, dipilih lewat env STORE:
//   STORE=n8n       -> Vercel memanggil webhook n8n (n8n yang menyimpan ke Postgres)
//   STORE=supabase  -> Vercel langsung ke Supabase (tanpa n8n, lebih sederhana & murah)

async function n8n(path, body) {
  const base = (process.env.N8N_BASE_URL || "").replace(/\/$/, "");
  const r = await fetch(`${base}/webhook/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-esas-secret": process.env.N8N_SECRET || "" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`n8n ${path} -> ${r.status}`);
  return r.json();
}

async function sb(path, init = {}) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
         headers: {
         apikey: key,
         ...(String(key).startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
         "content-type": "application/json",
         ...init.headers,
       },
  });
  if (!r.ok) {
    const e = new Error(`supabase ${path} -> ${r.status}`);
    e.status = r.status;
    throw e;
  }
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

const useSupabase = () => (process.env.STORE || "n8n") === "supabase";
const rowsOf = (res) => (Array.isArray(res?.items) ? res.items : []);

// ---------- pasien ----------
export async function verifyLogin(patientId, password) {
  if (useSupabase()) {
    return (await sb("rpc/esas_login", { method: "POST", body: JSON.stringify({ pid: patientId, pw: password }) })) === true;
  }
  const res = await n8n("esas-login", { patientId, password });
  return res?.ok === true;
}

export async function listAssessments(patientId) {
  let rows;
  if (useSupabase()) {
    const q = `assessments?patient_id=eq.${encodeURIComponent(patientId)}&select=client_id,answers,created_at&order=created_at.asc`;
    rows = (await sb(q)).map((r) => ({ clientId: r.client_id, createdAt: r.created_at, answers: r.answers }));
  } else {
    rows = rowsOf(await n8n("esas-assessments-list", { patientId }));
  }
  return rows.filter((r) => r && r.clientId && Array.isArray(r.answers));
}

// -> true jika baru tersimpan, false jika ternyata kiriman ulang (duplikat)
export async function createAssessment(patientId, clientId, answers) {
  if (useSupabase()) {
    const rows = await sb("assessments?on_conflict=client_id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ patient_id: patientId, client_id: clientId, answers }),
    });
    return Array.isArray(rows) && rows.length > 0;
  }
  const res = await n8n("esas-assessments-create", { patientId, clientId, answers });
  return res?.created !== false;
}

export async function isPatientActive(patientId) {
  if (useSupabase()) {
    const rows = await sb(`patients?id=eq.${encodeURIComponent(patientId)}&select=active`);
    return rows?.[0]?.active === true;
  }
  return (await n8n("esas-patient-active", { patientId }))?.active === true;
}

// ---------- petugas (admin / peneliti) ----------
export async function verifyStaff(username, password) {
  if (useSupabase()) {
    const rows = await sb("rpc/esas_staff_login", { method: "POST", body: JSON.stringify({ uname: username, pw: password }) });
    const r = rows?.[0];
    return r ? { id: r.username, name: r.display_name, role: r.role } : null;
  }
  const res = await n8n("esas-staff-login", { username, password });
  return res?.ok === true && res.role ? { id: username, name: res.name || username, role: res.role } : null;
}

export async function listPatients() {
  let rows;
  if (useSupabase()) {
    rows = (await sb("patients?select=id,name,birth_date,sex,active,created_at&order=id.asc")).map((r) => ({
      id: r.id, name: r.name, birthDate: r.birth_date, sex: r.sex, active: r.active, createdAt: r.created_at,
    }));
  } else {
    rows = rowsOf(await n8n("esas-admin-patients-list", {}));
  }
  return rows.filter((r) => r && r.id);
}

// -> true jika dibuat, false jika Patient ID sudah dipakai
export async function createPatient({ id, name, birthDate, sex, password }) {
  if (useSupabase()) {
    try {
      await sb("rpc/esas_create_patient", {
        method: "POST",
        body: JSON.stringify({ pid: id, pw: password, pname: name, pbirth: birthDate, psex: sex }),
      });
      return true;
    } catch (e) {
      if (e.status === 409) return false;
      throw e;
    }
  }
  const res = await n8n("esas-admin-patients-create", { id, name, birthDate, sex, password });
  return res?.created === true;
}

export async function listAllAssessments() {
  let rows = [];
  if (useSupabase()) {
    // Supabase membatasi 1000 baris per permintaan -> ambil bertahap
    for (let offset = 0; offset < 50000; offset += 1000) {
      const page = await sb(
        `assessments?select=client_id,patient_id,answers,created_at&order=created_at.asc&limit=1000&offset=${offset}`
      );
      rows.push(...page.map((r) => ({ clientId: r.client_id, patientId: r.patient_id, createdAt: r.created_at, answers: r.answers })));
      if (page.length < 1000) break;
    }
  } else {
    rows = rowsOf(await n8n("esas-admin-assessments", {}));
  }
  return rows.filter((r) => r && r.clientId && r.patientId && Array.isArray(r.answers));
}

// -> true jika pasien ditemukan dan diubah
export async function updatePatient(id, { name = null, birthDate = null, sex = null, active = null }) {
  if (useSupabase()) {
    const patch = {};
    if (name !== null) patch.name = name;
    if (birthDate !== null) patch.birth_date = birthDate;
    if (sex !== null) patch.sex = sex;
    if (active !== null) patch.active = active;
    const rows = await sb(`patients?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    return Array.isArray(rows) && rows.length > 0;
  }
  return (await n8n("esas-admin-patients-update", { id, name, birthDate, sex, active }))?.updated === true;
}

export async function resetPassword(id, password) {
  if (useSupabase()) {
    return (await sb("rpc/esas_reset_password", { method: "POST", body: JSON.stringify({ pid: id, pw: password }) })) === true;
  }
  return (await n8n("esas-admin-reset-password", { id, password }))?.updated === true;
}

// Log bersifat best-effort: kegagalan mencatat tidak boleh menggagalkan permintaan utama.
export async function logActivity({ actor, role, action, target = null, detail = null }) {
  try {
    if (useSupabase()) {
      await sb("activity_logs", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ actor, actor_role: role, action, target, detail }),
      });
    } else {
      await n8n("esas-log", { actor, role, action, target, detail });
    }
  } catch (e) {
    console.error("logActivity gagal:", e.message);
  }
}

export async function listLogs(limit = 500) {
  let rows;
  if (useSupabase()) {
    rows = (await sb(`activity_logs?select=id,at,actor,actor_role,action,target,detail&order=at.desc&limit=${limit}`)).map((r) => ({
      id: r.id, at: r.at, actor: r.actor, role: r.actor_role, action: r.action, target: r.target, detail: r.detail,
    }));
  } else {
    rows = rowsOf(await n8n("esas-admin-logs", { limit }));
  }
  return rows.filter((r) => r && r.id != null && r.at && r.action).slice(0, limit);
}
