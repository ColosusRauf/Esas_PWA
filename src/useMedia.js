import { useEffect, useState } from "react";

// true bila lebar layar <= 820px (HP / tablet kecil), mengikuti perubahan ukuran/rotasi
export function useMobile(query = "(max-width: 820px)") {
  const get = () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches;
  const [m, setM] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [query]);
  return m;
}
