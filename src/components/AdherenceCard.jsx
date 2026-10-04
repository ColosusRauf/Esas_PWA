import React, { useMemo } from "react";
import { Flame, Trophy } from "lucide-react";
import { Card } from "./ui.jsx";
import { useLang } from "../i18n.jsx";
import { localeOf, dayKeyWIB, todayKeyWIB } from "../format.js";
import { streaks, addDays } from "../insights.js";
import { totalOf } from "../data.js";
import EmptyState from "./EmptyState.jsx";

const col = (total) => (total <= 30 ? "var(--mild)" : total <= 60 ? "var(--moderate)" : "var(--severe)");

// Streak + kalender 4 minggu terakhir (C1)
export default function AdherenceCard({ assessments }) {
  const { t, lang } = useLang();
  const { current, best, days } = useMemo(() => streaks(assessments), [assessments]);
  const today = todayKeyWIB();

  const { cells, filled } = useMemo(() => {
    const totals = new Map();
    for (const a of assessments) {
      const k = dayKeyWIB(a.createdAt);
      totals.set(k, Math.max(totals.get(k) ?? 0, totalOf(a.answers)));
    }
    const first = addDays(today, -27);
    const dow = (new Date(first + "T00:00:00Z").getUTCDay() + 6) % 7; // Senin = 0
    const start = addDays(first, -dow);
    const list = [];
    let n = 0;
    for (let k = start; k <= today || (new Date(k + "T00:00:00Z").getUTCDay() + 6) % 7 !== 0; k = addDays(k, 1)) {
      const inRange = k >= first && k <= today;
      const has = days.has(k);
      if (inRange && has) n++;
      list.push({ k, inRange, has, total: totals.get(k), future: k > today, isToday: k === today });
      if (list.length > 42) break;
    }
    return { cells: list, filled: n };
  }, [assessments, days, today]);

  const weekdays = useMemo(() => {
    const base = new Date(Date.UTC(2024, 0, 1)); // Senin
    return Array.from({ length: 7 }, (_, i) => new Date(base.getTime() + i * 864e5).toLocaleDateString(localeOf(lang), { weekday: "narrow", timeZone: "UTC" }));
  }, [lang]);

  return (
    <Card title={t("ad.title")}>
      {assessments.length === 0 ? (
        <EmptyState kind="calendar" compact title={t("ad.emptyTitle")} text={t("ad.emptyText")} />
      ) : (
        <>
          <div className="ad-stats">
            <div className="ad-stat"><Flame size={22} color="var(--moderate)" /><div><b>{t("ad.days", { n: current })}</b><small>{t("ad.current")}</small></div></div>
            <div className="ad-stat"><Trophy size={22} color="var(--primary)" /><div><b>{t("ad.days", { n: best })}</b><small>{t("ad.best")}</small></div></div>
            <div className="ad-stat"><div className="ad-ring">{Math.round((filled / 28) * 100)}%</div><div><b>{filled}/28</b><small>{t("ad.filled")}</small></div></div>
          </div>
          <div className="ad-grid" role="img" aria-label={t("ad.aria", { n: filled })}>
            {weekdays.map((w, i) => <span key={i} className="ad-wd">{w}</span>)}
            {cells.map((c) => (
              <span key={c.k} className={"ad-cell" + (c.has ? " on" : "") + (c.isToday ? " today" : "") + (!c.inRange ? " out" : "")}
                style={c.has ? { background: col(c.total) } : undefined}
                title={c.k}>
                {new Date(c.k + "T00:00:00Z").getUTCDate()}
              </span>
            ))}
          </div>
          <div className="ad-legend">
            <span><i style={{ background: "var(--mild)" }} />{t("ad.l.mild")}</span>
            <span><i style={{ background: "var(--moderate)" }} />{t("ad.l.mod")}</span>
            <span><i style={{ background: "var(--severe)" }} />{t("ad.l.sev")}</span>
            <span><i className="none" />{t("ad.l.none")}</span>
          </div>
        </>
      )}
    </Card>
  );
}
