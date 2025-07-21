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
  SidebarInset,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <Sidebar className="hidden lg:flex lg:flex-col border-r">
            <SidebarHeader className="p-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span className="">KrishiMitra AI</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex-1">
              <MainNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="lg:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="lg:hidden max-w-xs">
                  <Link
                    href="/dashboard"
                    className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">KrishiMitra AI</span>
                  </Link>
                  <MainNav />
                </SheetContent>
              </Sheet>
              <div className="flex-1">
                {/* Placeholder for breadcrumbs or page title */}
              </div>
              <UserNav />
            </header>
            <main className="flex-1 p-4 sm:px-6 sm-py-0 ">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
