
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
  Wallet,
  Leaf,
  User,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { SheetClose } from "@/components/ui/sheet";
import { useTranslation } from "@/contexts/language-context";

interface MainNavProps {
  isSheet?: boolean;
}

export function MainNav({ isSheet = false }: MainNavProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard/profile", icon: User, label: t('nav.profile') },
    { href: "/dashboard", icon: LayoutGrid, label: t('nav.dashboard') },
    { href: "/dashboard/crop-doctor", icon: HeartPulse, label: t('nav.cropDoctor') },
    { href: "/dashboard/crop-recommender", icon: Leaf, label: t('nav.cropRecommender') },
    { href: "/dashboard/market-analyst", icon: LineChart, label: t('nav.marketAnalyst') },
    { href: "/dashboard/schemes", icon: Banknote, label: t('nav.govtSchemes') },
    { href: "/dashboard/tracker", icon: Wallet, label: t('nav.tracker') },
    { href: "/dashboard/weather", icon: CloudSun, label: t('nav.weather') },
    { href: "/dashboard/community", icon: Users, label: t('nav.community') },
    { href: "/dashboard/shop", icon: ShoppingCart, label: t('nav.shop') },
    { href: "/dashboard/learn", icon: BookOpen, label: t('nav.eLearning') },
    { href: "/dashboard/settings", icon: Settings, label: t('nav.settings') },
  ];

  const renderLink = (item: typeof navItems[0]) => {
    const isActive = (pathname === item.href) || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    const isShopActive = (pathname.startsWith("/dashboard/shop") && item.href === "/dashboard/shop");
    const isDashboardActive = pathname === "/dashboard" && item.href === "/dashboard";

    return (
      <Link 
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          (isActive || isShopActive || isDashboardActive) && "bg-muted text-primary",
          state === "collapsed" && !isSheet && "justify-center"
        )}
      >
        <item.icon className="h-5 w-5" />
        <span
          className={cn(
            "truncate",
            state === "collapsed" && !isSheet ? "lg:hidden" : "block"
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <nav className="flex flex-col gap-2 p-2">
      {navItems.map((item) => {
        if (isSheet) {
             return (
                 <SheetClose asChild key={item.href}>
                     {renderLink(item)}
                 </SheetClose>
             )
        }
        
        return (
          <Tooltip key={item.href} delayDuration={0}>
            <TooltipTrigger asChild>
              {renderLink(item)}
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
