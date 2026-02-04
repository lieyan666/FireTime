"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  Calendar,
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
  SidebarMenuIcon,
  SidebarMenuLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/components/user-provider";

const navItems = [
  { title: "仪表盘", icon: LayoutDashboard, href: "/dashboard" },
  { title: "今日", icon: CalendarDays, href: "/day" },
  { title: "每日打卡", icon: ClipboardCheck, href: "/checkin" },
  { title: "任务分配", icon: Link2, href: "/assign" },
  { title: "月历", icon: Calendar, href: "/calendar" },
  { title: "时钟", icon: Clock, href: "/clock" },
  { title: "PK", icon: Swords, href: "/pk" },
  { title: "设置", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, otherUser, setCurrentUserId, currentUserId } = useUser();
  const { expanded, isMobile } = useSidebar();

  const switchUser = () => {
    setCurrentUserId(currentUserId === "user1" ? "user2" : "user1");
  };

  const showLabels = isMobile || expanded;

  return (
    <Sidebar>
      {/* Header: Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="FireTime">
              <Link href="/dashboard">
                <SidebarMenuIcon>
                  <Flame className="text-orange-500" />
                </SidebarMenuIcon>
                <SidebarMenuLabel className="text-base font-bold">
                  FireTime
                </SidebarMenuLabel>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/day" && pathname.startsWith("/day/"));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.href}>
                        <SidebarMenuIcon>
                          <item.icon />
                        </SidebarMenuIcon>
                        <SidebarMenuLabel>{item.title}</SidebarMenuLabel>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer: User Switcher */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={switchUser}
              tooltip={`切换到 ${otherUser?.name || "..."}`}
            >
              {/* 头像作为图标 */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserRound className="h-4 w-4" />
              </div>
              {/* 用户信息 - 只在展开时显示 */}
              {showLabels && (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {currentUser?.name || "加载中..."}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      切换到 {otherUser?.name || "..."}
                    </div>
                  </div>
                  <ArrowLeftRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
