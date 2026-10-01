const TOKEN_KEY = "esas.token";

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
};

async function call(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

// role: "patient" | "staff"
export const login = (id, password, role = "patient") =>
  call("/api/login", { method: "POST", body: { patientId: id, password, role } });

// pasien
export const listAssessments = async () => (await call("/api/assessments")).items;
export const createAssessment = ({ clientId, answers }) =>
  call("/api/assessments", { method: "POST", body: { clientId, answers } });

// petugas
export const adminPatients = async () => (await call("/api/admin/patients")).items;
export const adminAssessments = async () => (await call("/api/admin/assessments")).items;
export const adminCreatePatient = (body) => call("/api/admin/patients", { method: "POST", body });

export const adminUpdatePatient = (body) => call("/api/admin/patients", { method: "PATCH", body });
export const adminResetPassword = (body) => call("/api/admin/reset-password", { method: "POST", body });
export const adminLogs = async () => (await call("/api/admin/logs")).items;
export const adminLogExport = (body) => call("/api/admin/log", { method: "POST", body });
