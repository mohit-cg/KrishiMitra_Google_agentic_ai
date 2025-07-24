
"use client";

import React from "react";
import { Bell, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/language-context";
import { Badge } from "./ui/badge";

export function Notifications() {
    const { t } = useTranslation();

    // Mock data for now, this would come from a backend in a real app
    const notifications = [
        { 
            title: "Market Alert: Tomato Prices Up", 
            description: "Tomato prices in your region have increased by 12%. Consider selling.",
            type: "info"
        },
        { 
            title: "Weather Warning: Heavy Rain", 
            description: "Heavy rainfall expected in the next 24 hours. Secure your crops.",
            type: "warning"
        },
        { 
            title: "New Govt. Scheme Available",
            description: "A new subsidy for solar pumps is now available in your state.",
            type: "info"
        },
    ];

    const getIcon = (type: string) => {
        if (type === 'warning') {
            return <TriangleAlert className="h-4 w-4 text-destructive" />;
        }
        return <Info className="h-4 w-4 text-primary" />;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                         <Badge variant="destructive" className="absolute top-0 right-0 h-5 w-5 justify-center p-0">
                            {notifications.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <React.Fragment key={index}>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 whitespace-normal">
                                <div className="flex items-center gap-2">
                                   {getIcon(notification.type)}
                                   <p className="font-semibold">{notification.title}</p>
                                </div>
                                <p className="pl-6 text-xs text-muted-foreground">{notification.description}</p>
                            </DropdownMenuItem>
                             {index < notifications.length - 1 && <DropdownMenuSeparator />}
                        </React.Fragment>
                    ))
                ) : (
                    <p className="p-2 text-center text-sm text-muted-foreground">No new notifications</p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
