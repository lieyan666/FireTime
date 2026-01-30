export type UserId = "user1" | "user2";

export interface User {
  id: UserId;
  name: string;
}

export interface TimeBlock {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  label: string;
  category: string;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  linkedBlockId?: string;
}

export interface UserDayData {
  schedule: TimeBlock[];
  tasks: Task[];
}

export interface DayData {
  date: string; // YYYY-MM-DD format
  user1: UserDayData;
  user2: UserDayData;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  blocks: TimeBlock[];
  isDefault: boolean;
}

// 假期设置
export interface VacationSettings {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  name: string; // e.g., "寒假"
}

// 考试倒计时
export interface ExamCountdown {
  id: string;
  name: string; // e.g., "开学考"
  date: string; // YYYY-MM-DD
}

// 学科作业
export interface HomeworkItem {
  id: string;
  title: string;
  totalPages: number;
  completedPages: number;
  unit: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  homework: HomeworkItem[];
}

// 待办状态: pending -> in_progress -> completed
export type TodoStatus = "pending" | "in_progress" | "completed";

// 独立的双人待办事项
export interface GlobalTodoItem {
  id: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
  deadline?: string; // YYYY-MM-DD HH:mm
  createdBy?: UserId; // 如果由对方添加则记录
  linkedBlockId?: string;
  linkedSubjectId?: string;
}

export interface GlobalTodoList {
  user1: GlobalTodoItem[];
  user2: GlobalTodoItem[];
}

// 应用设置
export interface AppSettings {
  vacation: VacationSettings;
  subjects: Subject[];
  exams: ExamCountdown[];
}

// API Response types
export interface UsersResponse {
  users: User[];
}

export interface DayDataResponse {
  data: DayData;
}

export interface TemplatesResponse {
  templates: ScheduleTemplate[];
}

export interface SettingsResponse {
  settings: AppSettings;
}

export interface TodoListResponse {
  todos: GlobalTodoList;
}

// Day status for calendar coloring
export type DayStatus = "complete" | "partial" | "incomplete" | "unplanned";
