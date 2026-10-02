import { createContext, useContext } from "react";

// Data & aksi bersama untuk halaman pasien (dipakai Topbar: pencarian, lonceng, banner sinkron)
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
