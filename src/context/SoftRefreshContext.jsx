// src/context/SoftRefreshContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const SoftRefreshCtx = createContext({ key: 0, trigger: () => {} });

export function SoftRefreshProvider({ children }) {
  const [key, setKey] = useState(0);
  const trigger = useCallback(() => setKey((k) => k + 1), []);
  return (
    <SoftRefreshCtx.Provider value={{ key, trigger }}>
      {children}
    </SoftRefreshCtx.Provider>
  );
}

export function useSoftRefresh() {
  return useContext(SoftRefreshCtx);
}
