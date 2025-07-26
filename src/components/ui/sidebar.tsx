
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PanelLeft } from "lucide-react"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  setState: React.Dispatch<React.SetStateAction<"expanded" | "collapsed">>
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<"expanded" | "collapsed">(
    "collapsed"
  )

  return (
    <SidebarContext.Provider value={{ state, setState }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "hidden lg:flex flex-col border-r h-full bg-background/70 backdrop-blur-sm transition-all duration-300 ease-in-out",
  {
    variants: {
      state: {
        expanded: "w-64",
        collapsed: "w-[57px]",
      },
    },
    defaultVariants: {
      state: "expanded",
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { state } = useSidebar()
    const isMobile = useIsMobile();
    
    if(isMobile) return null;

    return (
       <div
        ref={ref}
        className={cn(sidebarVariants({ state }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-[57px] items-center border-b p-4", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { state } = useSidebar()
    return (
        <div
            ref={ref}
            className={cn("flex-1 overflow-y-auto", state === 'collapsed' ? "overflow-x-hidden" : "", className)}
            {...props}
        />
    )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"


const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { state, setState } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 hidden lg:flex", className)}
      onClick={() =>
        setState(state === "expanded" ? "collapsed" : "expanded")
      }
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex justify-end pr-3", className)} {...props} />
))
SidebarInset.displayName = "SidebarInset"

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset
}
