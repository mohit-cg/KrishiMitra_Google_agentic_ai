
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/contexts/language-context"
import { ArrowLeft, Moon, Sun, Laptop } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const { t } = useTranslation()

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('settings.theme.title')}</CardTitle>
          <CardDescription>{t('settings.theme.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant={theme === "light" ? "secondary" : "outline"}
            onClick={() => setTheme("light")}
            className="flex flex-col h-24"
          >
            <Sun className="h-6 w-6 mb-2" />
            {t('settings.theme.light')}
          </Button>
          <Button
            variant={theme === "dark" ? "secondary" : "outline"}
            onClick={() => setTheme("dark")}
             className="flex flex-col h-24"
          >
            <Moon className="h-6 w-6 mb-2" />
            {t('settings.theme.dark')}
          </Button>
          <Button
            variant={theme === "system" ? "secondary" : "outline"}
            onClick={() => setTheme("system")}
             className="flex flex-col h-24"
          >
            <Laptop className="h-6 w-6 mb-2" />
            {t('settings.theme.system')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
