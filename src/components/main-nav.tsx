
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/contexts/language-context";

export function MainNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isMobile = useIsMobile();
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

  return (
    <nav className="flex flex-col gap-2 px-2">
      {navItems.map((item) => {
        const isActive = (pathname === item.href) || (pathname.startsWith(item.href) && item.href !== '/dashboard');
        
        // A special case for the shop parent route
        const isShopActive = (pathname.startsWith("/dashboard/shop") && item.href === "/dashboard/shop");

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
            (isActive || isShopActive) && "bg-muted text-primary",
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
