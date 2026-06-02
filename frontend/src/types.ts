export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Education {
  school: string;
  period: string;
  note: string;
}

export interface ResumeData {
  fullName: string;
  kana: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experiences: WorkExperience[];
  education: Education[];
  skills: string;
  qualifications: string;
  selfPr: string;
}

export interface ResumeSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Resume extends ResumeSummary {
  data: ResumeData;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export function emptyResumeData(): ResumeData {
  return {
    fullName: "",
    kana: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    experiences: [],
    education: [],
    skills: "",
    qualifications: "",
    selfPr: "",
  };
}
