
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/contexts/language-context"
import { ArrowLeft, Moon, Sun, Laptop, Info, GitBranch, Cpu, Users, Phone, Shield, FileText } from "lucide-react"
import Link from "next/link"

const appVersion = "1.0.0";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const { t } = useTranslation()

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>{t('settings.about.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('settings.about.description')}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary"/>{t('settings.version.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-mono text-lg">{appVersion}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-primary"/>{t('settings.poweredBy.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>{t('settings.poweredBy.tech1')}</li>
                        <li>{t('settings.poweredBy.tech2')}</li>
                        <li>{t('settings.poweredBy.tech3')}</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
        
        <Card>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>{t('settings.developedBy.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{t('settings.developedBy.teamName')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-primary"/>{t('settings.contact.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>{t('settings.contact.emailLabel')}:</strong> <a href="mailto:support@krishimitra.in" className="text-primary hover:underline">support@krishimitra.in</a></p>
                    <p><strong>{t('settings.contact.whatsappLabel')}:</strong> +91-9876543210</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button asChild variant="outline">
                <Link href="/dashboard/privacy">
                    <Shield className="mr-2 h-4 w-4"/> {t('settings.legal.privacy')}
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/dashboard/terms">
                     <FileText className="mr-2 h-4 w-4"/> {t('settings.legal.terms')}
                </Link>
            </Button>
        </div>

      </div>
    </div>
  )
}
