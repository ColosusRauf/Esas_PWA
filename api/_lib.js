import crypto from "node:crypto";

const b64 = (v) => Buffer.from(v).toString("base64url");

export function signToken(payload, secret, ttlSeconds = 7 * 24 * 3600) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const head = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const data = b64(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", secret).update(`${head}.${data}`).digest("base64url");
  return `${head}.${data}.${sig}`;
}

export function verifyToken(token, secret) {
  try {
    const [head, data, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", secret).update(`${head}.${data}`).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const body = JSON.parse(Buffer.from(data, "base64url").toString());
    return body.exp > Math.floor(Date.now() / 1000) ? body : null;
  } catch {
    return null;
  }
}

// -> { sub, role } atau null. role: "patient" | "admin" | "researcher"
export function sessionFromRequest(req) {
  const m = (req.headers.authorization || "").match(/^Bearer (.+)$/);
  if (!m || !process.env.SESSION_SECRET) return null;
  const t = verifyToken(m[1], process.env.SESSION_SECRET);
  return t?.sub && t?.role ? { sub: t.sub, role: t.role } : null;
}

export function patientFromRequest(req) {
  const s = sessionFromRequest(req);
  return s?.role === "patient" ? s.sub : null;
}

export const isPatientId = (v) => typeof v === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(v);
export const isUuid = (v) =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const isAnswers = (v) =>
  Array.isArray(v) && v.length === 10 && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 10);
export const isIsoDate = (v) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && v >= "1900-01-01" && v <= new Date().toISOString().slice(0, 10);
