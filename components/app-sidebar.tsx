"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Swords,
  Settings,
  UserRound,
  ArrowLeftRight,
  Link2,
  ClipboardCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/components/user-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getToday } from "@/lib/dates";

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, otherUser, setCurrentUserId, currentUserId } = useUser();
  const { state } = useSidebar();
  const [today, setToday] = useState<string | null>(null);

  // 只在客户端获取今天的日期，避免hydration mismatch
  useEffect(() => {
    setToday(getToday());
  }, []);

  const switchUser = () => {
    setCurrentUserId(currentUserId === "user1" ? "user2" : "user1");
  };

  const navItems = [
    { title: "仪表盘", icon: LayoutDashboard, href: "/dashboard" },
    { title: "今日", icon: CalendarDays, href: today ? `/day/${today}` : "/dashboard" },
    { title: "每日打卡", icon: ClipboardCheck, href: "/checkin" },
    { title: "任务分配", icon: Link2, href: "/assign" },
    { title: "月历", icon: CalendarDays, href: "/calendar" },
    { title: "时钟", icon: Clock, href: "/clock" },
    { title: "PK", icon: Swords, href: "/pk" },
    { title: "设置", icon: Settings, href: "/settings" },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <Clock className="h-6 w-6 text-primary" />
          <span className="ml-2 max-w-[10rem] overflow-hidden whitespace-nowrap text-lg font-bold opacity-100 transition-[max-width,opacity,margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
            FireTime
          </span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      pathname === item.href ||
                      (item.title === "今日" && pathname.startsWith("/day/"))
                    }
                    size="lg"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <button
          onClick={switchUser}
          className="flex w-full items-center rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
          title={state === "collapsed" ? `切换到 ${otherUser?.name || "..."}` : undefined}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              <UserRound className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex min-w-0 max-w-[14rem] flex-1 flex-col items-start overflow-hidden text-sm opacity-100 transition-[max-width,opacity,margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="font-medium">{currentUser?.name || "加载中..."}</span>
            <span className="text-xs text-muted-foreground">
              切换到 {otherUser?.name || "..."}
            </span>
          </div>
          <ArrowLeftRight className="ml-2 h-4 w-4 overflow-hidden text-muted-foreground opacity-100 transition-[width,opacity,margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
