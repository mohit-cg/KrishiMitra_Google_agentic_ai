
"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Icons } from "@/components/icons";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/contexts/language-context";
import { AnnapurnaChatbot } from "@/components/annapurna-chatbot";
import { Notifications } from "@/components/notifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">{t('common.loading')}...</div>;
  }
  
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="grid h-screen w-full lg:grid-cols-[auto_1fr]">
          <Sidebar className="hidden lg:flex flex-col border-r h-full bg-background/70 backdrop-blur-sm">
            <SidebarHeader className="p-4 flex justify-between items-center sticky top-0 z-10 border-b">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span className="text-xl">KrishiMitra</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex-1 overflow-y-auto">
              <MainNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col h-screen overflow-y-hidden">
            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 py-2 shrink-0">
               <div className="hidden lg:block">
                  <SidebarTrigger />
               </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="lg:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">{t('dashboardLayout.toggleMenu')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="lg:hidden max-w-xs p-0">
                   <SheetHeader className="sr-only">
                    <SheetTitle>{t('dashboardLayout.menuTitle')}</SheetTitle>
                    <SheetDescription>{t('dashboardLayout.menuDescription')}</SheetDescription>
                  </SheetHeader>
                  <div className="flex justify-center my-4">
                    <Link
                      href="/dashboard"
                      className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base px-4"
                    >
                      <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
                      <span>KrishiMitra</span>
                    </Link>
                  </div>
                  <MainNav isSheet={true} />
                </SheetContent>
              </Sheet>
              <div className="flex-1">
                {/* Placeholder for breadcrumbs or page title */}
              </div>
              <Notifications />
              <UserNav />
            </header>
            <main className="flex-1 overflow-y-auto p-4 sm:px-6 sm:py-0 bg-card/50 backdrop-blur-sm m-4 rounded-lg border">
              {children}
            </main>
          </div>
          <AnnapurnaChatbot />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
