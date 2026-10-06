import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Assessment from "./pages/Assessment.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Privacy, { CONSENT_VERSION } from "./pages/Privacy.jsx";
import ConsentGate from "./components/ConsentGate.jsx";
import ForcePassword from "./components/ForcePassword.jsx";
import Tour from "./components/Tour.jsx";
import IdleWarning from "./components/IdleWarning.jsx";
import Help from "./pages/Help.jsx";
import { useIdle } from "./useIdle.js";
import Celebrate from "./components/Celebrate.jsx";
import NotFound from "./pages/NotFound.jsx";
import { encouragement } from "./insights.js";
import AdminApp from "./admin/AdminApp.jsx";
import { AppContext } from "./appContext.jsx";
import { useLang } from "./i18n.jsx";
import { useToast } from "./components/Toast.jsx";
import { usePush, disablePush } from "./push.js";
import * as api from "./api.js";

const KEY_SESSION = "esas.session";
const KEY_CACHE = "esas.cache";
const keyConsent = (id) => `esas.consent.${id}`;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// record: { clientId, createdAt, answers, synced }
const toAssessment = (r) => ({ id: r.clientId, createdAt: r.createdAt, answers: r.answers, otherSymptom: r.otherSymptom || null, synced: !!r.synced });
const byDate = (a, b) => String(a.createdAt).localeCompare(String(b.createdAt));
const PUBLIC_VIEWS = ["landing", "login", "privacy"];

export default function App() {
  const { t } = useLang();
  const toast = useToast();
  const [session, setSession] = useState(() => {
    const s = api.getToken() ? load(KEY_SESSION, null) : null;
    return s && typeof s === "object" && s.role ? s : null;
  });
  const patientId = session?.role === "patient" ? session.id : null;
  const isStaff = session && session.role !== "patient";
  const [view, setView] = useState(() => (api.getToken() && load(KEY_SESSION, null)?.role ? "dashboard" : "landing"));
  const [navState, setNavState] = useState(null);
  const prevView = useRef("landing");
  const [records, setRecords] = useState(() => load(KEY_CACHE, []));
  const [loginState, setLoginState] = useState({ loading: false, error: "" });
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));
  const [syncState, setSyncState] = useState({ status: "idle", error: null, lastSync: null });
  const [consent, setConsent] = useState({ known: false, consented: false, at: null });
  const [celebrate, setCelebrate] = useState(null);
  const [tour, setTour] = useState(false);
  const [notFound, setNotFound] = useState(() => typeof location !== "undefined" && !["/", "/index.html"].includes(location.pathname));
  const push = usePush(patientId);
  const recordsRef = useRef(records);
  recordsRef.current = records;
  const syncing = useRef(false);

  useEffect(() => { save(KEY_CACHE, records); }, [records]);

  const logout = useCallback(() => {
    const tok = api.getToken();
    if (tok && session?.role === "patient") disablePush(tok).catch(() => {}); // perangkat bersama: hentikan pengingat akun ini
    api.setToken(null);
    try { localStorage.removeItem(KEY_SESSION); localStorage.removeItem(KEY_CACHE); } catch {}
    setRecords([]);
    setSession(null);
    setCelebrate(null);
    setConsent({ known: false, consented: false, at: null });
    setSyncState({ status: "idle", error: null, lastSync: null });
    setNavState(null);
    setView("landing");
  }, [session]);
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  const sync = useCallback(async (manual = false) => {
    if (syncing.current || !api.getToken()) return;
    syncing.current = true;
    setSyncState((s) => ({ ...s, status: "syncing" }));
    try {
      const pendingBefore = recordsRef.current.filter((x) => !x.synced);
      for (const r of pendingBefore) await api.createAssessment(r);
      const server = await api.listAssessments();
      const ids = new Set(server.map((s) => s.clientId));
      // rekam baru yang dibuat selama proses sinkron tidak boleh hilang
      const stillLocal = recordsRef.current.filter((r) => !r.synced && !ids.has(r.clientId));
      setRecords([...server.map((s) => ({ ...s, synced: true })), ...stillLocal].sort(byDate));
      setSyncState({ status: "idle", error: null, lastSync: Date.now() });
      if (pendingBefore.length > 0 && stillLocal.length === 0) toast(t("toast.synced"));
    } catch (e) {
      if (e.message === "UNAUTHORIZED") return logoutRef.current();
      // data tetap aman di perangkat; dicoba lagi otomatis
      setSyncState((s) => ({ ...s, status: "error", error: e.message === "NETWORK" ? "network" : "server" }));
    } finally {
      syncing.current = false;
    }
  }, [t, toast]);
  const syncRef = useRef(sync);
  syncRef.current = sync;

  useEffect(() => { if (patientId) syncRef.current(); }, [patientId]);
  useEffect(() => { if (patientId && records.some((r) => !r.synced)) syncRef.current(); }, [records, patientId]);
  useEffect(() => {
    const on = () => { setOnline(true); toast(t("toast.online")); syncRef.current(); };
    const off = () => { setOnline(false); toast(t("toast.offline")); };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [t, toast]);
  // coba lagi berkala bila ada yang tertunda / gagal
  useEffect(() => {
    if (!patientId) return;
    const id = setInterval(() => {
      if (navigator.onLine !== false && (recordsRef.current.some((r) => !r.synced) || document.visibilityState === "visible" && syncState.status === "error")) syncRef.current();
    }, 45000);
    return () => clearInterval(id);
  }, [patientId, syncState.status]);

  // ---- persetujuan (A4) ----
  useEffect(() => {
    if (!patientId) return;
    const cached = load(keyConsent(patientId), null);
    const okCached = !!cached?.consented && cached.version === CONSENT_VERSION;
    if (okCached) setConsent({ known: true, consented: true, at: cached.at });
    let alive = true;
    api.getConsent()
      .then((r) => {
        if (!alive) return;
        const ok = !!r.consented && r.version === CONSENT_VERSION;
        setConsent({ known: true, consented: ok, at: r.at || null });
        if (ok) save(keyConsent(patientId), { consented: true, version: r.version, at: r.at });
      })
      .catch((e) => {
        if (!alive) return;
        if (e.message === "UNAUTHORIZED") return logoutRef.current();
        // server belum mendukung (mode n8n) -> pakai catatan di perangkat; jaringan putus -> pakai catatan lama
        if (e.status === 501) setConsent({ known: true, consented: okCached, at: cached?.at || null });
      });
    return () => { alive = false; };
  }, [patientId]);

  async function acceptConsent() {
    try {
      const r = await api.postConsent(CONSENT_VERSION);
      const at = r.at || new Date().toISOString();
      save(keyConsent(patientId), { consented: true, version: CONSENT_VERSION, at });
      setConsent({ known: true, consented: true, at });
    } catch (e) {
      if (e.status === 501) { // mode n8n: simpan di perangkat saja
        const at = new Date().toISOString();
        save(keyConsent(patientId), { consented: true, version: CONSENT_VERSION, at });
        setConsent({ known: true, consented: true, at });
        return;
      }
      if (e.message === "UNAUTHORIZED") return logout();
      throw e;
    }
  }

  async function login(id, password, role) {
    if (!id || !password) return setLoginState({ loading: false, error: "lg.err.empty" });
    setLoginState({ loading: true, error: "" });
    try {
      const res = await api.login(id, password, role);
      api.setToken(res.token);
      const next = { id: res.id, role: res.role, name: res.name, mustChange: res.mustChange === true };
      save(KEY_SESSION, next);
      setRecords([]);
      setSession(next);
      setLoginState({ loading: false, error: "" });
      setView("dashboard");
    } catch (e) {
      const code =
        e.message === "UNAUTHORIZED" ? "401" : e.message === "NETWORK" ? "network" :
        e.status === 400 ? "400" : e.status >= 500 ? "server" : "unknown";
      setLoginState({ loading: false, error: `lg.err.${code}` });
    }
  }

  const passwordChanged = useCallback(() => {
    setSession((cur) => {
      if (!cur) return cur;
      const next = { ...cur, mustChange: false };
      save(KEY_SESSION, next);
      return next;
    });
    toast(t("pw.done"));
  }, [t, toast]);

  function submitAssessment(answers, otherSymptom = null) {
    const rec = { clientId: crypto.randomUUID(), createdAt: new Date().toISOString(), answers, otherSymptom: answers[9] > 0 ? otherSymptom : null, synced: false };
    setRecords((prev) => [...prev, rec]);
    setCelebrate(encouragement([...recordsRef.current, rec].map(toAssessment)));
    toast(online ? t("toast.saved") : t("toast.savedOffline"));
    setNavState({ openId: rec.clientId });
    setView("history");
  }

  const navigate = useCallback((v, opts = null) => {
    setView((cur) => { if (v === "privacy" && cur !== "privacy") prevView.current = cur; return v; });
    setNavState(opts);
    window.scrollTo?.(0, 0);
  }, []);

  const assessments = useMemo(() => records.map(toAssessment), [records]);
  const pending = assessments.filter((a) => !a.synced).length;

  // D4: keluar otomatis bila tidak aktif (ditunda selama masih ada data belum terkirim)
  const idle = useIdle({
    enabled: !!session,
    idleMs: (isStaff ? 20 : 30) * 60 * 1000,
    warnMs: 60 * 1000,
    canLogout: pending === 0,
    onTimeout: () => { logoutRef.current(); toast(t("idle.done")); },
  });

  // B3: tur pertama kali (setelah persetujuan dan ganti password)
  const mustChangeNow = !!patientId && session?.mustChange === true;
  useEffect(() => {
    if (!patientId || !consent.consented || mustChangeNow) return;
    try { if (!localStorage.getItem(`esas.tour.${patientId}`)) setTour(true); } catch {}
  }, [patientId, consent.consented, mustChangeNow]);
  const closeTour = useCallback(() => {
    try { if (patientId) localStorage.setItem(`esas.tour.${patientId}`, "1"); } catch {}
    setTour(false);
  }, [patientId]);
  const ctx = useMemo(() => ({
    patientId, assessments, navigate, logout, online, navState, push, consent, passwordChanged,
    ready: records.length > 0 || syncState.lastSync != null,
    sync: { ...syncState, pending, run: () => syncRef.current(true) },
  }), [patientId, assessments, navigate, logout, online, navState, push, consent, passwordChanged, records.length, syncState, pending]);

  if (notFound) return <NotFound onHome={() => { try { history.replaceState(null, "", "/"); } catch {} setNotFound(false); }} />;
  if (isStaff) return (
    <>
      <AdminApp session={session} onLogout={logout} />
      {idle.left != null && <IdleWarning left={idle.left} onStay={idle.stay} onLogout={logout} />}
    </>
  );
  if (!PUBLIC_VIEWS.includes(view) && !patientId) return <Login onLogin={login} {...loginState} onBack={() => navigate("landing")} onPrivacy={() => navigate("privacy")} />;

  const common = { patientId, onNavigate: navigate, onLogout: logout };
  let page;
  switch (view) {
    case "login":
      page = <Login onLogin={login} {...loginState} onBack={() => navigate("landing")} onPrivacy={() => navigate("privacy")} />;
      break;
    case "privacy":
      return <Privacy onBack={() => navigate(prevView.current === "privacy" ? "landing" : prevView.current)} />;
    case "dashboard":
      page = <Dashboard {...common} assessments={assessments} onStartAssessment={() => navigate("assessment")} />;
      break;
    case "assessment":
      page = <Assessment {...common} onSubmit={submitAssessment} />;
      break;
    case "history":
      page = <History {...common} assessments={assessments} />;
      break;
    case "profile":
      page = <Profile {...common} assessments={assessments} />;
      break;
    case "settings":
      page = <Settings {...common} />;
      break;
    case "help":
      page = <Help {...common} onTour={() => setTour(true)} />;
      break;
    default:
      return <Landing onGetStarted={() => navigate("login")} onLogin={() => navigate("login")} onPrivacy={() => navigate("privacy")} />;
  }

  const mustChange = !!patientId && session?.mustChange === true;
  const gated = !!patientId && !mustChange && consent.known && !consent.consented;
  return (
    <AppContext.Provider value={ctx}>
      {page}
      {celebrate && !mustChange && !gated && <Celebrate info={celebrate} onClose={() => setCelebrate(null)} />}
      {tour && !mustChange && !gated && !celebrate && view !== "privacy" && <Tour onClose={closeTour} />}
      {idle.left != null && <IdleWarning left={idle.left} onStay={idle.stay} onLogout={logout} />}
      {mustChange && <ForcePassword onDone={passwordChanged} onLogout={logout} />}
      {gated && <ConsentGate onAccept={acceptConsent} onLogout={logout} onReadPolicy={() => navigate("privacy")} />}
    </AppContext.Provider>
  );
}
