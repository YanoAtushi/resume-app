import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ResumePreview from "../components/ResumePreview";
import { api } from "../api";
import {
  emptyResumeData,
  type Education,
  type ResumeData,
  type WorkExperience,
} from "../types";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const resumeId = Number(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("無題の経歴書");
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const dirtyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getResume(resumeId)
      .then((resume) => {
        if (cancelled) return;
        setTitle(resume.title);
        setData({ ...emptyResumeData(), ...resume.data });
      })
      .catch(() => setError("経歴書の読み込みに失敗しました"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  const save = useCallback(async () => {
    setSaveState("saving");
    try {
      await api.updateResume(resumeId, title, data);
      dirtyRef.current = false;
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [resumeId, title, data]);

  // Auto-save 1.5s after the last change.
  useEffect(() => {
    if (loading) return;
    dirtyRef.current = true;
    setSaveState("idle");
    const t = setTimeout(() => {
      void save();
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, data]);

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addExperience() {
    update("experiences", [
      ...data.experiences,
      { company: "", role: "", startDate: "", endDate: "", current: false, description: "" },
    ]);
  }

  function updateExperience(index: number, patch: Partial<WorkExperience>) {
    update(
      "experiences",
      data.experiences.map((exp, i) => (i === index ? { ...exp, ...patch } : exp)),
    );
  }

  function removeExperience(index: number) {
    update(
      "experiences",
      data.experiences.filter((_, i) => i !== index),
    );
  }

  function addEducation() {
    update("education", [
      ...data.education,
      { school: "", startDate: "", endDate: "", current: false, note: "" },
    ]);
  }

  function updateEducation(index: number, patch: Partial<Education>) {
    update(
      "education",
      data.education.map((edu, i) => (i === index ? { ...edu, ...patch } : edu)),
    );
  }

  function removeEducation(index: number) {
    update(
      "education",
      data.education.filter((_, i) => i !== index),
    );
  }

  if (loading) {
    return <div className="centered">読み込み中...</div>;
  }
  if (error) {
    return (
      <div className="centered">
        <p>{error}</p>
        <button className="btn" onClick={() => navigate("/")}>
          一覧に戻る
        </button>
      </div>
    );
  }

  const saveLabel = {
    idle: "未保存の変更",
    saving: "保存中...",
    saved: "保存済み",
    error: "保存に失敗",
  }[saveState];

  return (
    <div className="editor-shell">
      <header className="topbar no-print">
        <button className="btn ghost" onClick={() => navigate("/")}>
          ← 一覧
        </button>
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="経歴書のタイトル"
        />
        <div className="topbar-right">
          <span className={`save-status ${saveState}`}>{saveLabel}</span>
          <button className="btn" onClick={() => void save()}>
            保存
          </button>
          <button className="btn primary" onClick={() => window.print()}>
            PDF出力
          </button>
        </div>
      </header>

      <div className="editor-body">
        <div className="editor-form no-print">
          <fieldset>
            <legend>基本情報</legend>
            <div className="grid-2">
              <label>
                氏名
                <input
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="山田 太郎"
                />
              </label>
              <label>
                ふりがな
                <input
                  value={data.kana}
                  onChange={(e) => update("kana", e.target.value)}
                  placeholder="やまだ たろう"
                />
              </label>
              <label>
                生年月日
                <input
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                />
              </label>
              <label>
                電話番号
                <input
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="090-1234-5678"
                />
              </label>
              <label>
                メールアドレス
                <input
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="taro@example.com"
                />
              </label>
              <label>
                住所
                <input
                  value={data.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="東京都..."
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>職務要約</legend>
            <textarea
              rows={3}
              value={data.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="これまでのキャリアの概要を記入"
            />
          </fieldset>

          <fieldset>
            <legend>
              職務経歴
              <button className="btn small" onClick={addExperience}>
                + 追加
              </button>
            </legend>
            {data.experiences.length === 0 && (
              <p className="hint">「+ 追加」で職歴を追加できます。</p>
            )}
            {data.experiences.map((exp, i) => (
              <div key={i} className="entry-card">
                <div className="grid-2">
                  <label>
                    会社名
                    <input
                      value={exp.company}
                      onChange={(e) => updateExperience(i, { company: e.target.value })}
                    />
                  </label>
                  <label>
                    役職・部署
                    <input
                      value={exp.role}
                      onChange={(e) => updateExperience(i, { role: e.target.value })}
                    />
                  </label>
                </div>
                <label className="field-label">在籍期間</label>
                <div className="date-range">
                  <input
                    type="month"
                    aria-label="在籍期間 開始"
                    value={exp.startDate ?? ""}
                    onChange={(e) => updateExperience(i, { startDate: e.target.value })}
                  />
                  <span className="date-range-sep">〜</span>
                  <input
                    type="month"
                    aria-label="在籍期間 終了"
                    value={exp.endDate ?? ""}
                    disabled={exp.current}
                    onChange={(e) => updateExperience(i, { endDate: e.target.value })}
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={!!exp.current}
                      onChange={(e) =>
                        updateExperience(i, {
                          current: e.target.checked,
                          endDate: e.target.checked ? "" : exp.endDate,
                        })
                      }
                    />
                    現在
                  </label>
                </div>
                <label>
                  業務内容
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(i, { description: e.target.value })}
                  />
                </label>
                <button className="btn danger small" onClick={() => removeExperience(i)}>
                  この職歴を削除
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>
              学歴
              <button className="btn small" onClick={addEducation}>
                + 追加
              </button>
            </legend>
            {data.education.map((edu, i) => (
              <div key={i} className="entry-card">
                <div className="grid-2">
                  <label>
                    学校名
                    <input
                      value={edu.school}
                      onChange={(e) => updateEducation(i, { school: e.target.value })}
                    />
                  </label>
                </div>
                <label className="field-label">期間</label>
                <div className="date-range">
                  <input
                    type="month"
                    aria-label="在学期間 開始"
                    value={edu.startDate ?? ""}
                    onChange={(e) => updateEducation(i, { startDate: e.target.value })}
                  />
                  <span className="date-range-sep">〜</span>
                  <input
                    type="month"
                    aria-label="在学期間 終了"
                    value={edu.endDate ?? ""}
                    disabled={edu.current}
                    onChange={(e) => updateEducation(i, { endDate: e.target.value })}
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={!!edu.current}
                      onChange={(e) =>
                        updateEducation(i, {
                          current: e.target.checked,
                          endDate: e.target.checked ? "" : edu.endDate,
                        })
                      }
                    />
                    在学中
                  </label>
                </div>
                <label>
                  備考
                  <input
                    value={edu.note}
                    onChange={(e) => updateEducation(i, { note: e.target.value })}
                  />
                </label>
                <button className="btn danger small" onClick={() => removeEducation(i)}>
                  この学歴を削除
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>スキル</legend>
            <textarea
              rows={3}
              value={data.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="言語・ツール・得意分野など"
            />
          </fieldset>

          <fieldset>
            <legend>資格・免許</legend>
            <textarea
              rows={2}
              value={data.qualifications}
              onChange={(e) => update("qualifications", e.target.value)}
            />
          </fieldset>

          <fieldset>
            <legend>自己PR</legend>
            <textarea
              rows={4}
              value={data.selfPr}
              onChange={(e) => update("selfPr", e.target.value)}
            />
          </fieldset>
        </div>

        <div className="editor-preview">
          <ResumePreview title={title} data={data} />
        </div>
      </div>
    </div>
  );
}
