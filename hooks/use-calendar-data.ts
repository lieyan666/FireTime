import useSWR from "swr";
import type { DayData, DayStatus, UserId } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCalendarData() {
  const { data, error, isLoading, mutate } = useSWR<{ data: DayData[] }>(
    "/api/days",
    fetcher
  );

  return {
    allDays: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

export function getDayStatus(dayData: DayData | undefined, userId: UserId): DayStatus {
  if (!dayData) return "unplanned";

  const userData = dayData[userId];
  if (!userData || userData.tasks.length === 0) return "unplanned";

  const totalTasks = userData.tasks.length;
  const completedTasks = userData.tasks.filter((t) => t.completed).length;

  if (completedTasks === 0) return "incomplete";
  if (completedTasks === totalTasks) return "complete";
  return "partial";
}

export function getStatusColor(status: DayStatus): string {
  switch (status) {
    case "complete":
      return "bg-green-500";
    case "partial":
      return "bg-yellow-500";
    case "incomplete":
      return "bg-red-500";
    case "unplanned":
    default:
      return "bg-gray-300 dark:bg-gray-600";
  }
}
