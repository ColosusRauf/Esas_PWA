import React from "react";
import { WifiOff, CloudOff, RefreshCw } from "lucide-react";
import { useApp } from "../appContext.jsx";
import { useLang } from "../i18n.jsx";

// Pita tipis di atas halaman: offline, data menunggu dikirim, atau gagal sinkron.
export default function SyncBanner() {
  const app = useApp();
  const { t } = useLang();
  if (!app) return null;
  const { online, sync } = app;
  const { pending, status, error } = sync;

  if (!online) {
    return (
      <div className="banner" role="status">
        <WifiOff size={17} />
        <span>{t("sync.offline")}{pending > 0 ? " " + t("sync.pending", { n: pending }) : ""}</span>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="banner err" role="alert">
        <CloudOff size={17} />
        <span>{error === "server" ? t("sync.server") : t("sync.error")}{pending > 0 ? " " + t("sync.pending", { n: pending }) : ""}</span>
        <button onClick={sync.run}>{t("common.retry")}</button>
      </div>
    );
  }
  if (pending > 0) {
    const busy = status === "syncing";
    return (
      <div className="banner" role="status">
        <RefreshCw size={17} className={busy ? "spin" : undefined} />
        <span>{t("sync.pending", { n: pending })}</span>
        <button onClick={sync.run} disabled={busy}>{busy ? t("sync.sending") : t("sync.sendNow")}</button>
      </div>
    );
  }
  return null;
}
