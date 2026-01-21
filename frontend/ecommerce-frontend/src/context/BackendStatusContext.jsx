import { createContext, useEffect, useState } from "react";
import api from "../api";

export const BackendStatusContext = createContext();

export const BackendStatusProvider = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.get("/ping");
        setTimeout(() => {
          setReady(true);
          setChecking(false);
        }, 1500);
      } catch {
        setReady(false);
        setChecking(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <BackendStatusContext.Provider value={{ ready, checking }}>
      {children}
    </BackendStatusContext.Provider>
  );
};
