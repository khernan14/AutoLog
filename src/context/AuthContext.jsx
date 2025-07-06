import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../config/variables"; // Asegúrate de que tenga TOKEN y USER definidos

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userDataString = localStorage.getItem(STORAGE_KEYS.USER);
    // console.log("AuthContext: UserData string from localStorage:", userDataString); // Debugging
    try {
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
      return null;
    }
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token || isExpired(token)) {
      setIsSessionExpired(true);
      // Opcional: Si la sesión expiró, limpia el usuario para forzar re-login
      if (user) {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setCheckingSession(false);
  }, [user]); // Añadir 'user' como dependencia para re-evaluar si el usuario cambia

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setIsSessionExpired(false);
    navigate("/auth/login");
  };

  const hasPermiso = (permisoNombre) => {
    // console.log(`Checking permission for ${permisoNombre}. User permissions:`, user?.permisos); // Debugging
    return user?.permisos?.includes(permisoNombre);
  };

  const restoreSessionFromStorage = () => {
    const userDataString = localStorage.getItem(STORAGE_KEYS.USER);
    try {
      const parsedUser = userDataString ? JSON.parse(userDataString) : null;
      setUser(parsedUser);
    } catch (e) {
      console.error("Error restoring user from localStorage:", e);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData: user,
        setUser,
        isSessionExpired,
        setIsSessionExpired,
        logout,
        checkingSession,
        hasPermiso,
        restoreSessionFromStorage, // 👈 agregado aquí
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const isExpired = (token) => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
