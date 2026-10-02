import webpush from "web-push";

export const pushConfigured = () =>
  !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);

let ready = false;
function setup() {
  if (ready) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  ready = true;
}

// -> "ok" | "gone" (langganan sudah mati, hapus) | "fail"
export async function sendPush(sub, payload) {
  setup();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 6 * 3600 }
    );
    return "ok";
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) return "gone";
    console.error("push gagal:", e.statusCode || e.message);
    return "fail";
  }
}

export const REMINDER = {
  title: "ESAS",
  body: "Waktunya mengisi ESAS hari ini · Time to fill in your ESAS today",
  url: "/",
};
