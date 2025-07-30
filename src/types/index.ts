export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  position?: string;
  mypage_url?: string;
  mypage_password?: string;
  current_step: number; // 1-5
  status: '合格' | '不合格' | '選考中';
  memo?: string;
  application_date?: string; // YYYY-MM-DD format
  sort_order?: number; // For ordering within steps
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  company_id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  created_at: string;
  updated_at: string;
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  company_id: string;
  title: string;
  event_date: string;
  event_type: 'deadline' | 'interview';
  gcal_event_id?: string;
  created_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  filename: string;
  file_url: string;
  file_type: 'pdf' | 'link';
  created_at: string;
}

export interface ExternalLink {
  id: string;
  company_id: string;
  title: string;
  url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  google_id: string;
  created_at: string;
  updated_at: string;
}

export interface SharedBoard {
  id: string;
  owner_id: string;
  share_id: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export const SELECTION_STEPS = [
  { id: 1, name: 'ES提出', progress: 20 },
  { id: 2, name: '書類選考', progress: 40 },
  { id: 3, name: '一次面接', progress: 60 },
  { id: 4, name: '最終面接', progress: 80 },
  { id: 5, name: '内定', progress: 100 },
] as const;

export type SelectionStep = typeof SELECTION_STEPS[number];

export type SelectionStatus = '合格' | '不合格' | '選考中';

export type ViewMode = 'kanban' | 'table';