"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  HeartPulse,
  LayoutGrid,
  LineChart,
  Banknote,
  CloudSun,
  Users,
  ShoppingCart,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/dashboard/crop-doctor", icon: HeartPulse, label: "Crop Doctor" },
  { href: "/dashboard/market-analyst", icon: LineChart, label: "Market Analyst" },
  { href: "/dashboard/schemes", icon: Banknote, label: "Govt Schemes" },
  { href: "/dashboard/weather", icon: CloudSun, label: "Weather" },
  { href: "/dashboard/community", icon: Users, label: "Community" },
  { href: "/dashboard/shop", icon: ShoppingCart, label: "E-Commerce" },
  { href: "/dashboard/learn", icon: BookOpen, label: "E-Learning" },
];

export function MainNav() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <nav className="flex flex-col gap-2 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary",
                  state === "collapsed" && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    "truncate",
                    state === "collapsed" ? "hidden" : "block"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </TooltipTrigger>
            {state === "collapsed" && (
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </nav>
  );
}
