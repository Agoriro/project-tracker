export interface Task {
  task_code: string;
  project_code: string;
  assignee_alias: string;
  assignee_role?: string;
  priority: string;
  status: string;
  due_date?: string;
  is_overdue: boolean;
  dependency?: string;
  title: string;
  detail?: string;
  last_progress?: string;
  engagement_type?: string;
  client_alias?: string;
  project_name?: string;
}
