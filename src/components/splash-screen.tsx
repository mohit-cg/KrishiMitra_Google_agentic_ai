import { Icons } from "@/components/icons";

export const SplashScreen = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-4 text-primary">
        <Icons.logo className="h-16 w-16 animate-pulse" />
        <span className="text-4xl font-bold font-headline">KrishiMitra</span>
      </div>
      <p className="mt-4 text-muted-foreground">Initializing your dashboard...</p>
    </div>
  );
};
