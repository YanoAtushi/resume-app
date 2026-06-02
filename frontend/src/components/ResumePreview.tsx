import type { ResumeData } from "../types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="preview-section">
      <h3 className="preview-section-title">{title}</h3>
      {children}
    </section>
  );
}

function multiline(text: string) {
  return text.split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>);
}

export default function ResumePreview({
  title,
  data,
}: {
  title: string;
  data: ResumeData;
}) {
  return (
    <div className="preview-sheet" id="resume-preview">
      <div className="preview-header">
        <h1 className="preview-doc-title">{title || "経歴書"}</h1>
      </div>

      <div className="preview-basic">
        <div className="preview-name-block">
          {data.kana && <div className="preview-kana">{data.kana}</div>}
          <div className="preview-name">{data.fullName || "氏名未入力"}</div>
        </div>
        <div className="preview-contact">
          {data.birthDate && <div>生年月日: {data.birthDate}</div>}
          {data.address && <div>住所: {data.address}</div>}
          {data.phone && <div>電話: {data.phone}</div>}
          {data.email && <div>メール: {data.email}</div>}
        </div>
      </div>

      {data.summary && (
        <Section title="職務要約">
          <div className="preview-text">{multiline(data.summary)}</div>
        </Section>
      )}

      {data.experiences.length > 0 && (
        <Section title="職務経歴">
          {data.experiences.map((exp, i) => (
            <div key={i} className="preview-entry">
              <div className="preview-entry-head">
                <span className="preview-entry-title">{exp.company || "会社名"}</span>
                <span className="preview-entry-period">{exp.period}</span>
              </div>
              {exp.role && <div className="preview-entry-role">{exp.role}</div>}
              {exp.description && (
                <div className="preview-text">{multiline(exp.description)}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="学歴">
          {data.education.map((edu, i) => (
            <div key={i} className="preview-entry">
              <div className="preview-entry-head">
                <span className="preview-entry-title">{edu.school || "学校名"}</span>
                <span className="preview-entry-period">{edu.period}</span>
              </div>
              {edu.note && <div className="preview-text">{multiline(edu.note)}</div>}
            </div>
          ))}
        </Section>
      )}

      {data.skills && (
        <Section title="スキル">
          <div className="preview-text">{multiline(data.skills)}</div>
        </Section>
      )}

      {data.qualifications && (
        <Section title="資格・免許">
          <div className="preview-text">{multiline(data.qualifications)}</div>
        </Section>
      )}

      {data.selfPr && (
        <Section title="自己PR">
          <div className="preview-text">{multiline(data.selfPr)}</div>
        </Section>
      )}
    </div>
  );
}
