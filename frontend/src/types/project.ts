export interface Project {
  project_code: string;
  project_name: string;
  client_alias: string;
  engagement_type: string;
  project_type_api?: string;
  stage?: string;
  status: string;
  health: string;
  owner_alias?: string;
  owner_role?: string;
  start_date?: string;
  target_date?: string;
  business_value?: number;
  currency?: string;
  open_tasks: number;
  overdue_tasks: number;
  blockers?: string;
  summary?: string;
  recent_completed_examples?: string;
  risk_score: number;
  risk_level: string;
}
