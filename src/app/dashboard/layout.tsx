
"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Icons } from "@/components/icons";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/contexts/language-context";
import { AnnapurnaChatbot } from "@/components/annapurna-chatbot";
import { Notifications } from "@/components/notifications";

// A component to render the main layout, as it needs access to the sidebar context
function DashboardPageLayout({ children }: { children: React.ReactNode }) {
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
    <div className="h-screen w-full flex flex-col">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline mr-auto">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span>KrishiMitra</span>
          </Link>
          <Notifications />
          <UserNav />
        </header>

      <div className="flex-1 grid grid-cols-[auto_1fr] overflow-y-hidden">
        <Sidebar>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-card/50 backdrop-blur-sm m-4 rounded-lg border">
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
