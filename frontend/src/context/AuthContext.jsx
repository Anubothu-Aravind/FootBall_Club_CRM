import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiService, API_ENDPOINTS } from "../services/api";

const AuthContext = createContext(null);

/**
 * Decode a JWT token payload without a library.
 * Returns null if the token is malformed or expired.
 */
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check expiry (exp is in seconds, Date.now() in ms)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
};

/**
 * AuthProvider
 * Wraps the app and provides authentication state + helpers to all children.
 *
 * State shape:
 *   coach   – { id, email, role, image } or null
 *   token   – JWT string or null
 *   loading – true while restoring session on first render
 */
export const AuthProvider = ({ children }) => {
  const [coach, setCoach] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("coach");
    setCoach(null);
    setToken(null);
  }, []);

  // ── Restore session on mount ──────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");

    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded) {
        // Token is still valid - restore state
        setToken(savedToken);

        // Try to restore coach info from localStorage first (instant UI)
        const savedCoach = localStorage.getItem("coach");
        if (savedCoach) {
          try {
            setCoach(JSON.parse(savedCoach));
          } catch {
            // Corrupted data - fall back to decoded token info
            setCoach({
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
            });
          }
        } else {
          setCoach({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          });
        }
      } else {
        // Token expired - clean up
        logout();
      }
    }

    setLoading(false);
  }, [logout]);

  // ── Login ─────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await apiService.post(API_ENDPOINTS.ADMIN_LOGIN, {
      email,
      password,
    });

    // data = { message, token, admin: { id, email, role, image } }
    const { token: newToken, admin } = data;

    localStorage.setItem("authToken", newToken);
    localStorage.setItem("coach", JSON.stringify(admin));

    setToken(newToken);
    setCoach(admin);

    return data;
  };

  // ── Derived helpers ───────────────────────────────────
  const isAuthenticated = !!token && !!coach;
  const isSuperAdmin = coach?.role === "SUPER_ADMIN";

  const value = {
    coach,
    token,
    loading,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook – shortcut to consume the auth context.
 * Throws if used outside of <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
};

export default AuthContext;
