"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeftIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Constants
const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// Context
type SidebarContextValue = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

// Provider
export function SidebarProvider({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const isMobile = useIsMobile();
  const [expanded, setExpandedState] = React.useState(defaultExpanded);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setExpanded = React.useCallback((value: boolean) => {
    setExpandedState(value);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, []);

  const toggle = React.useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setExpanded(!expanded);
    }
  }, [isMobile, expanded, setExpanded]);

  // Keyboard shortcut (Cmd/Ctrl + B)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const value = React.useMemo(
    () => ({
      expanded,
      setExpanded,
      toggle,
      isMobile,
      mobileOpen,
      setMobileOpen,
    }),
    [expanded, setExpanded, toggle, isMobile, mobileOpen]
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div className="flex min-h-screen w-full">{children}</div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// Sidebar
export function Sidebar({ children }: { children: React.ReactNode }) {
  const { expanded, isMobile, mobileOpen, setMobileOpen } = useSidebar();

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>导航菜单</SheetTitle>
            <SheetDescription>应用导航菜单</SheetDescription>
          </SheetHeader>
          <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            {children}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out"
      style={{ width: expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
    >
      {children}
    </aside>
  );
}

// Spacer for main content
export function SidebarInset({ children }: { children: React.ReactNode }) {
  const { expanded, isMobile } = useSidebar();

  return (
    <div
      className="flex flex-1 flex-col transition-[margin] duration-300 ease-in-out"
      style={{
        marginLeft: isMobile ? 0 : expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
      }}
    >
      {children}
    </div>
  );
}

// Trigger button
export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggle}
    >
      <PanelLeftIcon className="h-4 w-4" />
      <span className="sr-only">切换侧边栏</span>
    </Button>
  );
}

// Header
export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

// Content (scrollable)
export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden", className)}>
      {children}
    </div>
  );
}

// Footer
export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

// Separator
export function SidebarSeparator({ className }: { className?: string }) {
  return <div className={cn("mx-3 my-2 h-px bg-sidebar-border", className)} />;
}

// Group
export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col py-2", className)}>{children}</div>;
}

// Group Label
export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { expanded, isMobile } = useSidebar();
  const showLabel = isMobile || expanded;

  return (
    <div
      className={cn(
        "overflow-hidden px-4 text-xs font-medium text-sidebar-foreground/60 transition-all duration-300",
        showLabel ? "mb-1 h-6 opacity-100" : "h-0 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// Group Content
export function SidebarGroupContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

// Menu
export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={cn("flex flex-col gap-1 px-2", className)}>{children}</ul>;
}

// Menu Item
export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <li className={cn("relative", className)}>{children}</li>;
}

// Menu Button - 核心组件，统一处理图标和文字
export function SidebarMenuButton({
  children,
  asChild = false,
  isActive = false,
  tooltip,
  className,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  const { expanded, isMobile } = useSidebar();
  const Comp = asChild ? Slot : "button";
  const showTooltip = !isMobile && !expanded && tooltip;
  const isCollapsed = !isMobile && !expanded;

  const button = (
    <Comp
      className={cn(
        "group flex h-10 w-full items-center rounded-lg text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
        // 折叠时居中，展开时左对齐带 padding
        isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Comp>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// Menu Icon - 固定尺寸的图标容器
export function SidebarMenuIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center",
        "[&>svg]:h-5 [&>svg]:w-5",
        className
      )}
    >
      {children}
    </span>
  );
}

// Menu Label - 可折叠的文字标签
export function SidebarMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { expanded, isMobile } = useSidebar();
  const show = isMobile || expanded;

  if (!show) return null;

  return (
    <span
      className={cn(
        "truncate whitespace-nowrap transition-opacity duration-200",
        className
      )}
    >
      {children}
    </span>
  );
}

// Deprecated exports for backward compatibility
export const SidebarGroupAction = () => null;
export const SidebarInput = () => null;
export const SidebarMenuAction = () => null;
export const SidebarMenuBadge = () => null;
export const SidebarMenuSkeleton = () => null;
export const SidebarMenuSub = () => null;
export const SidebarMenuSubButton = () => null;
export const SidebarMenuSubItem = () => null;
export const SidebarRail = () => null;
