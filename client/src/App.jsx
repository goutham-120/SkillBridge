import { Navigate, Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SchedulingPage from "./pages/SchedulingPage";
import AdminPage from "./pages/AdminPage";

function ProtectedRoute({ user, children, adminOnly = false, userOnly = false }) {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (userOnly && user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function App() {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    user: getSavedUser(),
  });

  const onAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setAuthState({ token: data.token, user: data.user });
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({ token: null, user: null });
  };

  const user = useMemo(() => authState.user, [authState.user]);

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onAuthSuccess={onAuthSuccess} />} />
        <Route path="/signup" element={<SignupPage onAuthSuccess={onAuthSuccess} />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute user={user} userOnly><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute user={user} userOnly><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/schedule/:requestId"
          element={<ProtectedRoute user={user} userOnly><SchedulingPage /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute user={user} adminOnly><AdminPage /></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
}

export default App;
