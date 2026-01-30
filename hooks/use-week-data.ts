import useSWR from "swr";
import type { DayData } from "@/lib/types";
import { getWeekStart, addDays } from "@/lib/dates";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useWeekData(date: string) {
  const weekStart = getWeekStart(date);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch all days data and filter for the week
  const { data, error, isLoading, mutate } = useSWR<{ data: DayData[] }>(
    "/api/days",
    fetcher
  );

  const allDays = data?.data || [];
  const weekData = allDays
    .filter((d) => weekDates.includes(d.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    weekData,
    weekDates,
    isLoading,
    error,
    mutate,
  };
}
