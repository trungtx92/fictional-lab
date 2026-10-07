import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "../api/client.js";

const STORAGE_KEY = "sales-dashboard-user";
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// "Remember me" keeps the session across browser restarts (localStorage);
// otherwise it ends when the tab closes (sessionStorage).
function storeUser(user, remember) {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (user) (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable (private mode): the session just lives in memory.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const signIn = useCallback(async ({ email, password, remember }) => {
    const signedIn = await api.signIn({ email, password });
    storeUser(signedIn, remember);
    setUser(signedIn);
  }, []);

  const signInWithGoogle = useCallback(async ({ remember }) => {
    const signedIn = await api.signInWithGoogle();
    storeUser(signedIn, remember);
    setUser(signedIn);
  }, []);

  const signOut = useCallback(() => {
    storeUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signInWithGoogle, signOut }),
    [user, signIn, signInWithGoogle, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
