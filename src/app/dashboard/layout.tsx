
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

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

  // While loading, or if there's no user (and redirecting), show a loading state.
  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Only render the dashboard if not loading and a user is present.
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <Sidebar className="hidden lg:flex lg:flex-col border-r bg-card/50">
            <div 
              className="absolute inset-0 -z-10" 
              style={{
                backgroundImage: "url('https://placehold.co/600x900.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px) brightness(0.6)',
              }}
              data-ai-hint="abstract ai agriculture"
            />
            <SidebarHeader className="p-4 bg-background/70 backdrop-blur-sm border-b">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span className="">KrishiMitra AI</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex-1 bg-background/20 backdrop-blur-sm">
              <MainNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="lg:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="lg:hidden max-w-xs p-0">
                   <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Main navigation links for the application.</SheetDescription>
                  </SheetHeader>
                  <div className="flex justify-center my-4">
                    <Link
                      href="/dashboard"
                      className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base px-4"
                    >
                      <Icons.logo className="h-5 w-5 transition-all group-hover:scale-110" />
                      <span className="">KrishiMitra AI</span>
                    </Link>
                  </div>
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
