import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, GitCompareArrows, X } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout.jsx";
import { Card, th, td } from "../components/ui.jsx";
import { useApp } from "../appContext.jsx";
import { useLang } from "../i18n.jsx";
import { DOMAINS, totalOf, severity, SEV_COLOR, SEV_LABEL_L } from "../data.js";
import { fmtDate, dayKeyWIB, todayKeyWIB } from "../format.js";

const PRESETS = [["all", "hi.f.all"], ["7", "hi.f.7"], ["30", "hi.f.30"], ["90", "hi.f.90"]];
const shortName = (d, lang) => (lang === "en" ? d.en : d.label.split(" (")[0].replace(/^Rasa /, "").replace(" Umum", ""));
const daysAgoKey = (n) => dayKeyWIB(new Date(Date.now() - n * 86400000).toISOString());

export default function History({ patientId, assessments, onNavigate, onLogout }) {
  const { t, lang } = useLang();
  const app = useApp();
  const wanted = app?.navState?.openId ?? null;
  const [openId, setOpenId] = useState(wanted ?? assessments[assessments.length - 1]?.id ?? null);
  const touched = useRef(!!wanted);
  const [preset, setPreset] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cmp, setCmp] = useState(false);
  const [picks, setPicks] = useState([]); // maksimal 2 id

  // dibuka dari pencarian / notifikasi
  useEffect(() => {
    if (wanted) { setOpenId(wanted); setCmp(false); setPreset("all"); setFrom(""); setTo(""); touched.current = true; }
  }, [wanted]);
  // data baru tiba setelah halaman terbuka
  useEffect(() => {
    if (!touched.current && !openId && assessments.length) setOpenId(assessments[assessments.length - 1].id);
  }, [assessments, openId]);

  const filtered = useMemo(() => {
    let lo = from, hi = to;
    if (!lo && !hi && preset !== "all") { lo = daysAgoKey(Number(preset) - 1); hi = todayKeyWIB(); }
    return [...assessments].reverse().filter((a) => {
      const k = dayKeyWIB(a.createdAt);
      return (!lo || k >= lo) && (!hi || k <= hi);
    });
  }, [assessments, preset, from, to]);

  const openItem = assessments.find((a) => a.id === openId);
  const filtering = preset !== "all" || from || to;

  function choosePreset(v) { setPreset(v); setFrom(""); setTo(""); }
  function dateChange(setter) { return (e) => { setter(e.target.value); setPreset("all"); }; }
  function resetFilter() { setPreset("all"); setFrom(""); setTo(""); }
  function toggleCompare() { setCmp((c) => !c); setPicks([]); }
  function clickRow(a) {
    if (cmp) setPicks((p) => (p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id].slice(-2)));
    else { touched.current = true; setOpenId(openId === a.id ? null : a.id); }
  }

  // urutkan: A = lebih lama, B = lebih baru
  const pair = picks.length === 2 ? picks.map((id) => assessments.find((a) => a.id === id)).filter(Boolean).sort((x, y) => x.createdAt.localeCompare(y.createdAt)) : null;

  return (
    <Layout active="history" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout} title={t("hi.title")} subtitle={t("hi.sub")}>
      <div className="grid-2 fit-fill history-grid">
        <Card bodyStyle={{ overflow: "hidden" }}>
          {assessments.length === 0 ? (
            <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>{t("hi.empty")}</p>
          ) : (
            <>
              <div className="hist-bar">
                <div className="chips">
                  {PRESETS.map(([v, k]) => (
                    <button key={v} className={"chip" + (preset === v && !from && !to ? " on" : "")} onClick={() => choosePreset(v)}>{t(k)}</button>
                  ))}
                  <button className={"chip" + (cmp ? " on" : "")} onClick={toggleCompare} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {cmp ? <X size={14} /> : <GitCompareArrows size={14} />}{cmp ? t("hi.compare.exit") : t("hi.compare")}
                  </button>
                </div>
                <div className="dates">
                  <label>{t("hi.from")} <input type="date" value={from} max={to || undefined} onChange={dateChange(setFrom)} /></label>
                  <label>{t("hi.to")} <input type="date" value={to} min={from || undefined} onChange={dateChange(setTo)} /></label>
                  {filtering && <button className="chip" onClick={resetFilter}>{t("hi.reset")}</button>}
                  <span style={{ marginLeft: "auto" }}>{t("hi.count", { n: filtered.length })}</span>
                </div>
                {cmp && <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>{picks.length === 1 ? t("hi.compare.pickOne") : t("hi.compare.pick")}</div>}
              </div>

              <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                {filtered.length === 0 ? (
                  <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "8px 0 0" }}>{t("hi.noResult")}</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{cmp && <th style={th} />}<th style={th}>{t("common.date")}</th><th style={th}>{t("common.total")}</th><th style={th}>{t("common.status")}</th>{!cmp && <th style={th} />}</tr></thead>
                    <tbody>
                      {filtered.map((a) => {
                        const isOpen = !cmp && openId === a.id;
                        const pi = picks.indexOf(a.id);
                        const sel = isOpen || pi >= 0;
                        return (
                          <tr key={a.id} className={"hist-row" + (sel ? " sel" : "")} onClick={() => clickRow(a)} style={{ cursor: "pointer" }}>
                            {cmp && <td style={{ ...td, paddingLeft: 10, width: 34 }}>{pi >= 0 ? <span className="cmp-tag">{pi + 1}</span> : <span className="cmp-tag" style={{ background: "transparent", border: "1.5px solid var(--border)" }} />}</td>}
                            <td style={{ ...td, paddingLeft: cmp ? 0 : 12 }}>{fmtDate(a.createdAt, lang)}</td>
                            <td style={{ ...td, fontWeight: 700 }}>{totalOf(a.answers)}</td>
                            <td style={td}><span style={{ color: a.synced ? "var(--mild)" : "var(--moderate)", fontWeight: 600 }}>● {a.synced ? t("st.done") : t("st.pending")}</span></td>
                            {!cmp && <td style={{ ...td, textAlign: "right", color: "var(--ink-soft)", paddingRight: 12 }}>{isOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </Card>

        {cmp ? (
          pair ? <Compare a={pair[0]} b={pair[1]} /> : (
            <Card><p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>{t("hi.compare.pick")}</p></Card>
          )
        ) : openItem ? (
          <Detail item={openItem} />
        ) : (
          <Card><p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>{t("hi.pick")}</p></Card>
        )}
      </div>
    </Layout>
  );
}

function Detail({ item }) {
  const { t, lang } = useLang();
  const data = DOMAINS.map((d, i) => ({ name: shortName(d, lang), value: item.answers[i] }));
  return (
    <Card title={t("hi.totalTitle", { date: fmtDate(item.createdAt, lang), n: totalOf(item.answers) })}>
      <div className="tiles" style={{ display: "grid", gap: 10, marginBottom: "clamp(10px, 2vh, 20px)", flexShrink: 0 }}>
        {DOMAINS.map((d, i) => {
          const v = item.answers[i];
          const sev = severity(v);
          return (
            <div key={d.key} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "clamp(8px, 1.4vh, 13px) 14px" }}>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName(d, lang)}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: SEV_COLOR[sev], lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontSize: 12.5, color: SEV_COLOR[sev], marginTop: 3 }}>{SEV_LABEL_L[lang][sev]}</div>
            </div>
          );
        })}
      </div>
      <div className="chart-box" role="img" aria-label={t("hi.chartAria")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} interval={0} height={70} angle={-30} textAnchor="end" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ fontSize: 13.5, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)" }} formatter={(v) => [v, t("hi.score")]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.name} fill={SEV_COLOR[severity(d.value)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// Gejala: skor lebih rendah = lebih baik
function Delta({ d }) {
  const { t } = useLang();
  const color = d < 0 ? "var(--mild)" : d > 0 ? "var(--severe)" : "var(--ink-soft)";
  const sign = d > 0 ? "▲ +" : d < 0 ? "▼ " : "= ";
  return <span className="delta" style={{ color }} title={d < 0 ? t("hi.compare.better") : d > 0 ? t("hi.compare.worse") : t("hi.compare.same")}>{sign}{d === 0 ? 0 : d}</span>;
}

function Compare({ a, b }) {
  const { t, lang } = useLang();
  const ta = totalOf(a.answers), tb = totalOf(b.answers);
  let better = 0, worse = 0, same = 0;
  const rows = DOMAINS.map((d, i) => {
    const diff = b.answers[i] - a.answers[i];
    diff < 0 ? better++ : diff > 0 ? worse++ : same++;
    return { d, va: a.answers[i], vb: b.answers[i], diff };
  });
  const diffTotal = tb - ta;
  return (
    <Card title={t("hi.compare.title")}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12, flexShrink: 0 }}>
        {[[t("hi.compare.older"), fmtDate(a.createdAt, lang), ta], [t("hi.compare.newer"), fmtDate(b.createdAt, lang), tb]].map(([lab, date, tot]) => (
          <div key={lab} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "10px 14px" }}>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{lab}</div>
            <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 600, margin: "2px 0" }}>{date}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1 }}>{tot}</div>
          </div>
        ))}
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "10px 14px", background: "var(--primary-soft)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{t("hi.compare.change")}</div>
          <div style={{ fontSize: 22, marginTop: 6, lineHeight: 1.1 }}><Delta d={diffTotal} /></div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6, flexShrink: 0 }}>{t("hi.compare.summary", { better, worse, same })}</div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table className="cmp-table">
          <thead><tr><th>{t("common.symptom")}</th><th>{fmtDate(a.createdAt, lang)}</th><th>{fmtDate(b.createdAt, lang)}</th><th>Δ</th></tr></thead>
          <tbody>
            {rows.map(({ d, va, vb, diff }) => (
              <tr key={d.key}>
                <td>{shortName(d, lang)}</td>
                <td style={{ color: SEV_COLOR[severity(va)], fontWeight: 600 }}>{va}</td>
                <td style={{ color: SEV_COLOR[severity(vb)], fontWeight: 600 }}>{vb}</td>
                <td><Delta d={diff} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
