import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { Card } from "./ui.jsx";
import EmptyState from "./EmptyState.jsx";
import { useLang } from "../i18n.jsx";
import { DOMAINS, severity, SEV_COLOR, dShort } from "../data.js";
import { fmtShort } from "../format.js";

// Grafik tren satu gejala (C3): pilih gejala, titik diwarnai menurut tingkat keparahan
export default function SymptomTrend({ assessments }) {
  const { t, lang } = useLang();
  const [idx, setIdx] = useState(0);
  const d = DOMAINS[idx];
  const data = assessments.slice(-14).map((a) => ({ tanggal: fmtShort(a.createdAt, lang), v: a.answers[idx] }));
  const dot = (p) => {
    const c = SEV_COLOR[severity(p.payload.v)];
    return <circle key={p.index} cx={p.cx} cy={p.cy} r={5} fill={c} stroke="var(--surface)" strokeWidth={2} />;
  };
  return (
    <Card title={t("sx.title")}>
      {assessments.length === 0 ? (
        <EmptyState kind="chart" compact title={t("sx.emptyTitle")} text={t("sx.emptyText")} />
      ) : (
        <>
          <div className="chips sym-chips" role="tablist" aria-label={t("sx.title")}>
            {DOMAINS.map((x, i) => (
              <button key={x.key} role="tab" aria-selected={i === idx} className={"chip" + (i === idx ? " on" : "")} onClick={() => setIdx(i)}>
                {dShort(x, lang)}
              </button>
            ))}
          </div>
          <div className="chart-box" style={{ height: 240, flex: "none" }} role="img" aria-label={t("sx.aria", { name: dShort(d, lang) })}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 3, 6, 10]} tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30} />
                <ReferenceLine y={7} stroke="var(--severe)" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Tooltip contentStyle={{ fontSize: 13.5, borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)" }} formatter={(v) => [v, dShort(d, lang)]} />
                <Line type="linear" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} isAnimationActive={false} dot={dot} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="ad-legend" style={{ marginTop: 8 }}>
            <span><i style={{ background: "var(--mild)" }} />0–3</span>
            <span><i style={{ background: "var(--moderate)" }} />4–6</span>
            <span><i style={{ background: "var(--severe)" }} />7–10</span>
          </div>
        </>
      )}
    </Card>
  );
}
