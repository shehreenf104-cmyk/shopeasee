import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginUser, logoutUser, signupUser } from "../services/api";

const AuthContext = createContext(null);
const AUTH_KEY = "shopEaseAuth";

const decodeTokenPayload = (token) => {
  const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
};

const isExpired = (token) => {
  try {
    const payload = decodeTokenPayload(token);
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const readStoredAuth = () => {
  localStorage.removeItem("shopEaseAccounts");
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const stored = JSON.parse(storage.getItem(AUTH_KEY) ?? "null");
      if (stored?.token && stored?.user && !isExpired(stored.token)) {
        return stored;
      }
      if (stored) storage.removeItem(AUTH_KEY);
    } catch {
      storage.removeItem(AUTH_KEY);
    }
  }
  return { token: null, user: null };
};

const getUserDisplayName = (userData) => {
  const firstName =
    userData?.name?.firstname ?? userData?.name?.first ?? "";
  const lastName =
    userData?.name?.lastname ?? userData?.name?.last ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || userData?.username || userData?.email?.split("@")[0] || "guest";
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const persistAuth = useCallback((authData, rememberMe = false) => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    (rememberMe ? localStorage : sessionStorage).setItem(
      AUTH_KEY,
      JSON.stringify(authData),
    );
    setAuth(authData);
  }, []);

  const signOut = useCallback((revoke = true) => {
    const token = auth.token;
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setAuth({ token: null, user: null });
    if (revoke && token) {
      logoutUser(token).catch((requestError) => {
        console.error("Server sign-out could not be completed:", requestError.message);
      });
    }
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token) return undefined;
    try {
      const payload = decodeTokenPayload(auth.token);
      const remaining = payload.exp * 1000 - Date.now();
      if (remaining <= 0) {
        const timeout = window.setTimeout(() => signOut(false), 0);
        return () => window.clearTimeout(timeout);
      }
      const timeout = window.setTimeout(() => signOut(false), remaining);
      return () => window.clearTimeout(timeout);
    } catch {
      const timeout = window.setTimeout(() => signOut(false), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [auth.token, signOut]);

  const signIn = useCallback(async ({ identifier, password, rememberMe }) => {
    setLoading(true);
    setError("");
    try {
      const response = await loginUser({
        username: identifier,
        password,
        rememberMe,
      });
      const authData = {
        token: response.token,
        user: {
          ...response.user,
          displayName: getUserDisplayName(response.user),
        },
      };
      persistAuth(authData, rememberMe);
      return authData;
    } catch (err) {
      setError(err.message || "Unable to sign in right now.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError("");
    try {
      return await signupUser(userData);
    } catch (err) {
      setError(err.message || "Unable to create account.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeOAuth = useCallback((response) => {
    const authData = {
      token: response.token,
      user: {
        ...response.user,
        displayName: getUserDisplayName(response.user),
      },
    };
    persistAuth(authData);
    return authData;
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      loading,
      error,
      isAuthenticated: Boolean(auth.token),
      isAdmin: auth.user?.role === "admin",
      signIn,
      signOut,
      register,
      completeOAuth,
    }),
    [auth, loading, error, signIn, signOut, register, completeOAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
