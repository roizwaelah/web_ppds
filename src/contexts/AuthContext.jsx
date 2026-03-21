import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  loginApi,
  logoutApi,
  getUsers,
  createUser,
  updateUserApi,
  deleteUserApi,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 menit
  const inactivityRef = useRef(null);

  // =========================
  // SESSION MANAGEMENT
  // =========================

  const clearSessionTimers = () => {
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = null;
    }
  };

  const scheduleInactivityTimeout = () => {
    if (!user) return;

    clearSessionTimers();

    inactivityRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  };

  const activityHandler = () => {
    scheduleInactivityTimeout();
  };

  const attachActivityListeners = () => {
    window.addEventListener("mousemove", activityHandler);
    window.addEventListener("keydown", activityHandler);
    window.addEventListener("click", activityHandler);
    window.addEventListener("touchstart", activityHandler);
    window.addEventListener("scroll", activityHandler);
  };

  const detachActivityListeners = () => {
    window.removeEventListener("mousemove", activityHandler);
    window.removeEventListener("keydown", activityHandler);
    window.removeEventListener("click", activityHandler);
    window.removeEventListener("touchstart", activityHandler);
    window.removeEventListener("scroll", activityHandler);
  };

  useEffect(() => {
    if (user) {
      attachActivityListeners();
      scheduleInactivityTimeout();
    } else {
      detachActivityListeners();
      clearSessionTimers();
    }

    return () => {
      detachActivityListeners();
      clearSessionTimers();
    };
  }, [user]);

  // =========================
  // VERIFY SESSION (ADMIN ONLY)
  // =========================

  useEffect(() => {
    const verifySession = async () => {
      // ❗ HANYA cek session jika di area admin
      if (!window.location.pathname.startsWith("/admin")) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/me.php", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setUser(null);
          localStorage.removeItem("ppds_user");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("ppds_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("ppds_user");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("ppds_user");
      }

      setLoading(false);
    };

    verifySession();
  }, []);

  // =========================
  // AUTH FUNCTIONS
  // =========================

  const login = async (username, password) => {
    try {
      const res = await loginApi({ username, password });

      if (res?.user) {
        setUser(res.user);
        localStorage.setItem("ppds_user", JSON.stringify(res.user));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi(); // hapus httpOnly cookie
    } catch {}

    setUser(null);
    setUsers([]);
    localStorage.removeItem("ppds_user");
    clearSessionTimers();
  };

  // =========================
  // USERS MANAGEMENT
  // =========================

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  // Fetch users hanya untuk superadmin
  useEffect(() => {
    if (user?.level >= 10) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [user]);

  const addUser = async (newUser) => {
    try {
      await createUser(newUser);
      await fetchUsers();
      return true;
    } catch {
      return false;
    }
  };

  const updateUser = async (id, updatedUser) => {
    try {
      await updateUserApi(id, updatedUser);
      await fetchUsers();

      // Jika update diri sendiri → refresh session
      if (user && String(user.id) === String(id)) {
        const res = await fetch("/api/me.php", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("ppds_user", JSON.stringify(data.user));
        }
      }

      return true;
    } catch {
      return false;
    }
  };

  const deleteUser = async (id) => {
    if (user && String(user.id) === String(id)) return false;

    try {
      await deleteUserApi(id);
      await fetchUsers();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
}