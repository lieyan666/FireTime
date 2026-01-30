import useSWR from "swr";
import type { AppSettings, Subject, HomeworkItem } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<{ settings: AppSettings }>(
    "/api/settings",
    fetcher
  );

  const settings = data?.settings;

  const updateSettings = async (newSettings: AppSettings) => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
    mutate();
  };

  const updateVacation = async (vacation: AppSettings["vacation"]) => {
    if (!settings) return;
    await updateSettings({ ...settings, vacation });
  };

  const updateSubjects = async (subjects: Subject[]) => {
    if (!settings) return;
    await updateSettings({ ...settings, subjects });
  };

  const updateHomeworkProgress = async (
    subjectId: string,
    homeworkId: string,
    completedPages: number
  ) => {
    if (!settings) return;
    const newSubjects = settings.subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          homework: s.homework.map((h) =>
            h.id === homeworkId ? { ...h, completedPages } : h
          ),
        };
      }
      return s;
    });
    await updateSettings({ ...settings, subjects: newSubjects });
  };

  return {
    settings,
    isLoading,
    error,
    mutate,
    updateSettings,
    updateVacation,
    updateSubjects,
    updateHomeworkProgress,
  };
}

// 计算假期进度
export function getVacationProgress(
  startDate: string,
  endDate: string,
  today: string
): { daysPassed: number; totalDays: number; percentage: number; daysRemaining: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(today);

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = Math.max(0, Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const daysRemaining = Math.max(0, totalDays - daysPassed);
  const percentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

  return { daysPassed, totalDays, percentage, daysRemaining };
}

// 计算学科作业整体进度
export function getSubjectProgress(subjects: Subject[]): {
  totalItems: number;
  completedItems: number;
  percentage: number;
  bySubject: { id: string; name: string; color: string; percentage: number }[];
} {
  let totalItems = 0;
  let completedItems = 0;
  const bySubject: { id: string; name: string; color: string; percentage: number }[] = [];

  for (const subject of subjects) {
    let subjectTotal = 0;
    let subjectCompleted = 0;
    for (const hw of subject.homework) {
      subjectTotal += hw.totalPages;
      subjectCompleted += hw.completedPages;
    }
    totalItems += subjectTotal;
    completedItems += subjectCompleted;
    bySubject.push({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      percentage: subjectTotal > 0 ? (subjectCompleted / subjectTotal) * 100 : 0,
    });
  }

  return {
    totalItems,
    completedItems,
    percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
    bySubject,
  };
}
