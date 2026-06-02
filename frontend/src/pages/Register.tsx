import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api";
import { useAuth } from "../auth";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="brand">経歴書メーカー</h1>
        <h2>新規登録</h2>
        {error && <div className="alert">{error}</div>}
        <label>
          お名前
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            autoComplete="name"
          />
        </label>
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          パスワード(6文字以上)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "登録中..." : "登録する"}
        </button>
        <p className="auth-switch">
          すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </form>
    </div>
  );
}
