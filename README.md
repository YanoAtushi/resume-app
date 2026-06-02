# 経歴書メーカー (Resume App)

経歴書(職務経歴書)を作成・保存できるWebアプリです。アカウント登録/ログインに対応し、データはサーバーに保存されるため複数の端末から閲覧・編集できます。

## 主な機能

- メールアドレス + パスワードによる新規登録・ログイン(JWT認証)
- 経歴書の作成・編集・削除(ユーザーごとに保存)
- 入力内容のリアルタイムプレビュー
- 自動保存(入力停止後に自動でサーバーへ保存)
- PDF出力(ブラウザの印刷機能を利用し、プレビューをそのままPDF化)

## 構成

| レイヤー | 技術 |
| --- | --- |
| フロントエンド | React + TypeScript + Vite + React Router |
| バックエンド | FastAPI (Python) |
| データベース | SQLite (SQLAlchemy) |
| 認証 | JWT (PyJWT) + bcrypt によるパスワードハッシュ |

```
resume-app/
├── backend/    # FastAPI アプリ (API + 認証 + DB)
└── frontend/   # React + Vite フロントエンド
```

## ローカル開発

### 1. バックエンド

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

API は `http://localhost:8000` で起動します(ドキュメント: `http://localhost:8000/docs`)。

環境変数(任意):

| 変数 | 説明 | デフォルト |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy の接続URL | `sqlite:///./resume_app.db` |
| `SECRET_KEY` | JWT 署名用の秘密鍵(本番では必ず変更) | `dev-insecure-secret-change-me` |
| `CORS_ORIGINS` | 許可するオリジン(カンマ区切り、`*`で全許可) | `*` |

### 2. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` で起動します。開発時は `/api` へのリクエストをバックエンド(8000番)へプロキシします。

## テスト / Lint

```bash
# バックエンド
cd backend && source .venv/bin/activate
pytest
ruff check .

# フロントエンド
cd frontend
npm run build   # 型チェック + ビルド
npm run lint
```

## API 概要

| メソッド | パス | 説明 | 認証 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 新規登録 | 不要 |
| POST | `/api/auth/login` | ログイン | 不要 |
| GET | `/api/auth/me` | ログイン中のユーザー情報 | 必要 |
| GET | `/api/resumes` | 経歴書一覧 | 必要 |
| POST | `/api/resumes` | 経歴書作成 | 必要 |
| GET | `/api/resumes/{id}` | 経歴書取得 | 必要 |
| PUT | `/api/resumes/{id}` | 経歴書更新 | 必要 |
| DELETE | `/api/resumes/{id}` | 経歴書削除 | 必要 |
