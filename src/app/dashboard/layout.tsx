
"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/contexts/language-context";
import { AnnapurnaChatbot } from "@/components/annapurna-chatbot";
import { Notifications } from "@/components/notifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";

// Moved DashboardPageLayout to be a top-level function
function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">{t('common.loading')}...</div>;
  }
  
  return (
    <div className="h-screen w-full flex flex-col">
       <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 shrink-0">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('dashboardLayout.toggleMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                 <SheetHeader className="sr-only">
                    <SheetTitle>{t('dashboardLayout.menuTitle')}</SheetTitle>
                    <SheetDescription>{t('dashboardLayout.menuDescription')}</SheetDescription>
                  </SheetHeader>
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Icons.logo className="h-6 w-6" />
                    <span>KrishiMitra</span>
                  </Link>
                  <MainNav isSheet={true} />
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
             <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span>KrishiMitra</span>
             </Link>
          )}

          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
            <LanguageSwitcher />
            <Notifications />
            <UserNav />
          </div>
        </header>

      <div className="flex-1 grid grid-cols-[auto_1fr] overflow-hidden">
        <Sidebar>
          <SidebarHeader />
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
      <AnnapurnaChatbot />
    </div>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardPageLayout>
          {children}
        </DashboardPageLayout>
      </SidebarProvider>
    </TooltipProvider>
  );
}
