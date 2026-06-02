import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { emptyResumeData, type ResumeSummary } from "../types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setResumes(await api.listResumes());
    } catch {
      setError("経歴書の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const created = await api.createResume("無題の経歴書", emptyResumeData());
      navigate(`/editor/${created.id}`);
    } catch {
      setError("作成に失敗しました");
      setCreating(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`「${title}」を削除しますか?`)) {
      return;
    }
    try {
      await api.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("削除に失敗しました");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">経歴書メーカー</span>
        <div className="topbar-right">
          <span className="user-email">{user?.name || user?.email}</span>
          <button className="btn ghost" onClick={logout}>
            ログアウト
          </button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-head">
          <h1>マイ経歴書</h1>
          <button className="btn primary" onClick={handleCreate} disabled={creating}>
            {creating ? "作成中..." : "+ 新規作成"}
          </button>
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <p>読み込み中...</p>
        ) : resumes.length === 0 ? (
          <div className="empty-state">
            <p>まだ経歴書がありません。</p>
            <button className="btn primary" onClick={handleCreate} disabled={creating}>
              最初の経歴書を作成
            </button>
          </div>
        ) : (
          <ul className="resume-list">
            {resumes.map((r) => (
              <li key={r.id} className="resume-card">
                <button
                  className="resume-card-main"
                  onClick={() => navigate(`/editor/${r.id}`)}
                >
                  <span className="resume-title">{r.title}</span>
                  <span className="resume-date">更新: {formatDate(r.updated_at)}</span>
                </button>
                <button
                  className="btn danger small"
                  onClick={() => handleDelete(r.id, r.title)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
