const TOKEN_KEY = "esas.token";

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
};

// Kode error yang dilempar:
//   NETWORK       -> tidak ada koneksi / server tak terjangkau
//   UNAUTHORIZED  -> 401 (token kedaluwarsa atau login salah)
//   HTTP_<status> -> respons lain (error.status berisi angkanya, error.code isi "error" dari server)
async function call(path, { method = "GET", body, token } = {}) {
  const tk = token ?? getToken();
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(tk ? { authorization: `Bearer ${tk}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("NETWORK");
  }
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const e = new Error(`HTTP_${res.status}`);
    e.status = res.status;
    try { e.code = (await res.json()).error; } catch {}
    throw e;
  }
  return res.json();
}

// role: "patient" | "staff"
export const login = (id, password, role = "patient") =>
  call("/api/login", { method: "POST", body: { patientId: id, password, role } });

// pasien
export const listAssessments = async () => (await call("/api/assessments")).items;
export const createAssessment = ({ clientId, answers }) =>
  call("/api/assessments", { method: "POST", body: { clientId, answers } });
export const getConsent = () => call("/api/consent");
export const postConsent = (version) => call("/api/consent", { method: "POST", body: { version } });
export const pushKey = () => call("/api/push");
export const pushSubscribe = (subscription) => call("/api/push", { method: "POST", body: { subscription } });
export const pushUnsubscribe = (endpoint, token) => call("/api/push", { method: "DELETE", body: { endpoint }, token });
export const pushTest = () => call("/api/push", { method: "POST", body: { test: true } });

// petugas
export const adminPatients = async () => (await call("/api/admin/patients")).items;
export const adminAssessments = async () => (await call("/api/admin/assessments")).items;
export const adminCreatePatient = (body) => call("/api/admin/patients", { method: "POST", body });

export const adminUpdatePatient = (body) => call("/api/admin/patients", { method: "PATCH", body });
export const adminResetPassword = (body) => call("/api/admin/reset-password", { method: "POST", body });
export const adminLogs = async () => (await call("/api/admin/logs")).items;
export const adminLogExport = (body) => call("/api/admin/log", { method: "POST", body });
