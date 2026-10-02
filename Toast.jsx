import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const n = useRef(0);
  const push = useCallback((text, ms = 3200) => {
    const id = ++n.current;
    setItems((x) => [...x.slice(-2), { id, text }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), ms);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((i) => <div key={i.id} className="toast">{i.text}</div>)}
      </div>
    </Ctx.Provider>
  );
}
