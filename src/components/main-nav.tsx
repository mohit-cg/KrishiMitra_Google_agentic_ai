
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
import { SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <nav className="flex flex-col gap-2 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const linkContent = (
            <>
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    "truncate",
                    state === "collapsed" && !isMobile ? "hidden" : "block"
                  )}
                >
                  {item.label}
                </span>
            </>
        );

        const linkClassName = cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            isActive && "bg-muted text-primary",
            state === "collapsed" && !isMobile && "justify-center"
        );
        
        // On mobile, the nav is in a Sheet, so we wrap links in SheetClose
        // to close the sheet after navigation.
        if (isMobile) {
             return (
                 <SheetClose asChild key={item.href}>
                     <Link href={item.href} className={linkClassName}>
                         {linkContent}
                     </Link>
                 </SheetClose>
             )
        }
        
        // On desktop, we use tooltips for collapsed sidebar state.
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={linkClassName}
              >
                {linkContent}
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
