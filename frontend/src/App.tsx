import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="centered">読み込み中...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) {
    return <div className="centered">読み込み中...</div>;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <RequireAuth>
            <Editor />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
