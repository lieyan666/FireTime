import fs from "fs";
import path from "path";
import type {
  AppSettings,
  DayData,
  GlobalTodoList,
  ScheduleTemplate,
  User,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DAYS_DIR = path.join(DATA_DIR, "days");

// Ensure data directories exist
function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DAYS_DIR)) {
    fs.mkdirSync(DAYS_DIR, { recursive: true });
  }
}

// Users
export function getUsers(): User[] {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "users.json");
  if (!fs.existsSync(filePath)) {
    const defaultUsers: User[] = [
      { id: "user1", name: "用户 1" },
      { id: "user2", name: "用户 2" },
    ];
    fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function updateUser(id: string, name: string): User[] {
  const users = getUsers();
  const user = users.find((u) => u.id === id);
  if (user) {
    user.name = name;
    const filePath = path.join(DATA_DIR, "users.json");
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  }
  return users;
}

// App Settings (vacation, subjects)
export function getSettings(): AppSettings {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "settings.json");
  if (!fs.existsSync(filePath)) {
    const defaultSettings: AppSettings = {
      vacation: {
        name: "寒假",
        startDate: "2026-01-15",
        endDate: "2026-02-15",
      },
      exams: [
        { id: "exam-1", name: "开学考", date: "2026-02-17" },
      ],
      subjects: [
        {
          id: "math",
          name: "数学",
          color: "#3b82f6",
          homework: [
            { id: "math-1", title: "寒假作业本", totalPages: 60, completedPages: 0, unit: "页" },
          ],
        },
        {
          id: "chinese",
          name: "语文",
          color: "#ef4444",
          homework: [
            { id: "chinese-1", title: "阅读理解", totalPages: 30, completedPages: 0, unit: "篇" },
          ],
        },
        {
          id: "english",
          name: "英语",
          color: "#22c55e",
          homework: [
            { id: "english-1", title: "单词本", totalPages: 500, completedPages: 0, unit: "词" },
          ],
        },
        {
          id: "physics",
          name: "物理",
          color: "#f59e0b",
          homework: [
            { id: "physics-1", title: "练习册", totalPages: 40, completedPages: 0, unit: "页" },
          ],
        },
        {
          id: "chemistry",
          name: "化学",
          color: "#8b5cf6",
          homework: [
            { id: "chemistry-1", title: "实验报告", totalPages: 15, completedPages: 0, unit: "篇" },
          ],
        },
        {
          id: "biology",
          name: "生物",
          color: "#06b6d4",
          homework: [
            { id: "biology-1", title: "知识梳理", totalPages: 25, completedPages: 0, unit: "页" },
          ],
        },
      ],
    };
    fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function saveSettings(settings: AppSettings): void {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "settings.json");
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
}

// Global TodoList (independent of days)
export function getGlobalTodos(): GlobalTodoList {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "todos.json");
  if (!fs.existsSync(filePath)) {
    const defaultTodos: GlobalTodoList = {
      user1: [],
      user2: [],
    };
    fs.writeFileSync(filePath, JSON.stringify(defaultTodos, null, 2));
    return defaultTodos;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function saveGlobalTodos(todos: GlobalTodoList): void {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "todos.json");
  fs.writeFileSync(filePath, JSON.stringify(todos, null, 2));
}

// Templates
export function getTemplates(): ScheduleTemplate[] {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "templates.json");
  if (!fs.existsSync(filePath)) {
    const defaultTemplates: ScheduleTemplate[] = [
      {
        id: "default",
        name: "默认日程",
        isDefault: true,
        blocks: [
          { id: "1", startTime: "07:00", endTime: "08:00", label: "起床洗漱", category: "routine" },
          { id: "2", startTime: "08:00", endTime: "09:00", label: "早餐", category: "meal" },
          { id: "3", startTime: "09:00", endTime: "12:00", label: "学习/工作", category: "work" },
          { id: "4", startTime: "12:00", endTime: "13:00", label: "午餐", category: "meal" },
          { id: "5", startTime: "13:00", endTime: "14:00", label: "午休", category: "rest" },
          { id: "6", startTime: "14:00", endTime: "18:00", label: "学习/工作", category: "work" },
          { id: "7", startTime: "18:00", endTime: "19:00", label: "晚餐", category: "meal" },
          { id: "8", startTime: "19:00", endTime: "21:00", label: "自由时间", category: "free" },
          { id: "9", startTime: "21:00", endTime: "22:00", label: "整理/准备睡觉", category: "routine" },
          { id: "10", startTime: "22:00", endTime: "23:00", label: "睡觉", category: "sleep" },
        ],
      },
    ];
    fs.writeFileSync(filePath, JSON.stringify(defaultTemplates, null, 2));
    return defaultTemplates;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function saveTemplates(templates: ScheduleTemplate[]): void {
  ensureDataDirs();
  const filePath = path.join(DATA_DIR, "templates.json");
  fs.writeFileSync(filePath, JSON.stringify(templates, null, 2));
}

export function getDefaultTemplate(): ScheduleTemplate | undefined {
  const templates = getTemplates();
  return templates.find((t) => t.isDefault) || templates[0];
}

// Day Data
function getDayFilePath(date: string): string {
  return path.join(DAYS_DIR, `${date}.json`);
}

function createDayDataFromTemplate(date: string): DayData {
  const template = getDefaultTemplate();
  const blocks = template?.blocks || [];

  return {
    date,
    user1: {
      schedule: blocks.map((b) => ({ ...b })),
      tasks: [],
    },
    user2: {
      schedule: blocks.map((b) => ({ ...b })),
      tasks: [],
    },
  };
}

export function getDayData(date: string): DayData {
  ensureDataDirs();
  const filePath = getDayFilePath(date);

  if (!fs.existsSync(filePath)) {
    // Create new day from default template
    const dayData = createDayDataFromTemplate(date);
    fs.writeFileSync(filePath, JSON.stringify(dayData, null, 2));
    return dayData;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function saveDayData(data: DayData): void {
  ensureDataDirs();
  const filePath = getDayFilePath(data.date);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getAllDayDates(): string[] {
  ensureDataDirs();
  if (!fs.existsSync(DAYS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(DAYS_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
}

export function getMonthDayData(year: number, month: number): DayData[] {
  const allDates = getAllDayDates();
  const monthPrefix = `${year}-${(month + 1).toString().padStart(2, "0")}`;
  const monthDates = allDates.filter((d) => d.startsWith(monthPrefix));

  return monthDates.map((date) => getDayData(date));
}
