import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, signupUser } from '../services/api'

const AuthContext = createContext(null)
const ACCOUNTS_KEY = 'shopEaseAccounts'
const ADMIN_CREDENTIALS = {
  email: "admin@shopease.com",
  password: "admin123",
  username: "admin",
  name: { firstname: "Admin", lastname: "User" },
};

const getLocalAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
  } catch {
    localStorage.removeItem(ACCOUNTS_KEY);
    return {};
  }
};

const saveLocalAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const createLocalAccount = (account) => {
  const accounts = getLocalAccounts();
  if (accounts[account.username]) {
    throw new Error("Username already exists locally.");
  }
  accounts[account.username] = account;
  saveLocalAccounts(accounts);
};

const getUserDisplayName = (userData) => {
  const firstName =
    userData?.name?.firstname ??
    userData?.name?.first ??
    userData?.firstName ??
    "";
  const lastName =
    userData?.name?.lastname ??
    userData?.name?.last ??
    userData?.lastName ??
    "";
  const concatenated = [firstName, lastName].filter(Boolean).join(" ");

  if (concatenated) {
    return concatenated;
  }

  return userData?.username ?? userData?.email?.split("@")[0] ?? "guest";
};

const findLocalAccount = (identifier, password) => {
  const accounts = getLocalAccounts();
  const byUsername = accounts[identifier];
  if (byUsername && byUsername.password === password) {
    return byUsername;
  }

  const byEmail = Object.values(accounts).find(
    (account) => account.email === identifier && account.password === password,
  );
  return byEmail || null;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("shopEaseAuth") ?? "null");
      if (stored?.token) {
        setToken(stored.token);
        setUser(stored.user);
      }
    } catch {
      localStorage.removeItem("shopEaseAuth");
    }
  }, []);

  const persistAuth = (authData) => {
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem("shopEaseAuth", JSON.stringify(authData));
  };

  const authenticate = async ({ identifier, password }) => {
    const normalizedIdentifier = String(identifier || "")
      .trim()
      .toLowerCase();
    const normalizedPassword = String(password || "");

    if (
      normalizedIdentifier === ADMIN_CREDENTIALS.email.toLowerCase() &&
      normalizedPassword === ADMIN_CREDENTIALS.password
    ) {
      return {
        token: `admin-${Date.now()}`,
        user: {
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          name: ADMIN_CREDENTIALS.name,
          displayName: getUserDisplayName({
            username: ADMIN_CREDENTIALS.username,
            email: ADMIN_CREDENTIALS.email,
            name: ADMIN_CREDENTIALS.name,
          }),
          role: "admin",
        },
      };
    }

    const localAccount = findLocalAccount(identifier, password);
    if (localAccount) {
      return {
        token: `local-${localAccount.username}-${Date.now()}`,
        user: {
          username: localAccount.username,
          email: localAccount.email,
          name: localAccount.name,
          phone: localAccount.phone || "N/A",
          displayName: getUserDisplayName(localAccount),
          role: "user",
        },
      };
    }

    if (identifier.includes("@")) {
      throw new Error("Login failed. No local account found for that email.");
    }

    try {
      const response = await loginUser({ username: identifier, password });
      const displayName = getUserDisplayName({ username: identifier });
      return {
        token: response.token,
        user: { username: identifier, displayName, role: "user" },
      };
    } catch {
      throw new Error("Login failed. Please check your username and password.");
    }
  };

  const signIn = async ({ identifier, password }) => {
    setLoading(true);
    setError("");

    try {
      const authData = await authenticate({ identifier, password });
      persistAuth(authData);
      return authData;
    } catch (err) {
      setError(err.message ?? "Login failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ username, password, email, name, phone }) => {
    setLoading(true);
    setError("");

    try {
      const safePhone = phone?.trim() || "000-000-0000";

      await signupUser({
        email,
        username,
        password,
        name,
        address: {
          city: "Unknown",
          street: "Unknown",
          number: 0,
          zipcode: "00000",
          geolocation: { lat: "0", long: "0" },
        },
        phone: safePhone,
      }).catch(() => null);

      createLocalAccount({ username, password, email, name, phone: safePhone });

      const authData = {
        token: `local-${username}-${Date.now()}`,
        user: {
          username,
          email,
          name,
          phone: safePhone,
          displayName: getUserDisplayName({ username, email, name }),
        },
      };
      persistAuth(authData);
      return authData;
    } catch (err) {
      setError(err.message || "Unable to create account.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("shopEaseAuth");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "admin",
      signIn,
      signOut,
      register,
    }),
    [token, user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
