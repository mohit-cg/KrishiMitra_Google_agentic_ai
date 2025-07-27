
"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Icons } from "@/components/icons";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/contexts/language-context";
import { AnnapurnaChatbot } from "@/components/annapurna-chatbot";
import { Notifications } from "@/components/notifications";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { state } = useSidebar();

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
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline mr-4">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className={cn(state === 'expanded' && "hidden")}>KrishiMitra</span>
          </Link>
          <div className="flex-1">
             {/* Header content can go here if needed */}
          </div>
          <Notifications />
          <UserNav />
        </header>

      <div className="flex-1 grid grid-cols-[auto_1fr] overflow-y-hidden">
        <Sidebar>
          <SidebarHeader>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span className={cn(state === "collapsed" && "hidden")}>KrishiMitra</span>
              </Link>
              <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 m-4 rounded-lg border">
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
