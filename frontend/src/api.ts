import type {
  AuthResponse,
  Resume,
  ResumeData,
  ResumeSummary,
  User,
} from "./types";

const TOKEN_KEY = "resume_app_token";

// In production the frontend and backend are deployed separately, so the API
// base URL is configured via VITE_API_BASE_URL. In dev it stays empty and the
// Vite proxy forwards "/api" to the local backend.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (resp.status === 204) {
    return undefined as T;
  }

  const text = await resp.text();
  const body = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    const detail = body?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg: string }) => d.msg).join(", ")
          : "エラーが発生しました";
    throw new ApiError(resp.status, message);
  }

  return body as T;
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  listResumes: () => request<ResumeSummary[]>("/resumes"),

  getResume: (id: number) => request<Resume>(`/resumes/${id}`),

  createResume: (title: string, data: ResumeData) =>
    request<Resume>("/resumes", {
      method: "POST",
      body: JSON.stringify({ title, data }),
    }),

  updateResume: (id: number, title: string, data: ResumeData) =>
    request<Resume>(`/resumes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, data }),
    }),

  deleteResume: (id: number) =>
    request<void>(`/resumes/${id}`, { method: "DELETE" }),
};

export { ApiError };
