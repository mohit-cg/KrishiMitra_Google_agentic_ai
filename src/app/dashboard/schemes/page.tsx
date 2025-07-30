
"use client";

import { SchemeNavigatorClient } from "./_components/scheme-navigator-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/contexts/language-context";
import { useMemo } from "react";

const keySchemesData = [
  {
    key: "pmkisan",
    hint: "stack of coins",
    link: "https://pmkisan.gov.in/",
  },
  {
    key: "pmfby",
    hint: "insurance document shield",
    link: "https://pmfby.gov.in/",
  },
  {
    key: "kcc",
    hint: "credit card bank",
    link: "https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-credit-card",
  },
];

const latestNewsData = [
    {
        key: "kharifMsp",
        date: "June 19, 2024",
        link: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2025732"
    },
    {
        key: "subsidyPortal",
        date: "June 10, 2024",
        link: "https://krishijagran.com/agriculture-world/central-government-launches-new-portal-for-farm-subsidies-to-ensure-transparency-and-efficiency/"
    },
    {
        key: "horticultureMission",
        date: "June 5, 2024",
        link: "https://nhm.gov.in/Guideline/Mission-for-Integrated-Development-of-Horticulture.pdf"
    },
    {
        key: "enamMilestone",
        date: "May 28, 2024",
        link: "https://enam.gov.in/web/"
    },
    {
        key: "solarPump",
        date: "May 20, 2024",
        link: "https://mnre.gov.in/solar/pm-kusum-scheme"
    }
];

export default function SchemeNavigatorPage() {
  const { t } = useTranslation();

  const keySchemes = useMemo(() => keySchemesData.map(scheme => ({
      ...scheme,
      title: t(`schemes.keySchemes.${scheme.key}.title`),
      description: t(`schemes.keySchemes.${scheme.key}.description`),
  })), [t]);

  const latestNews = useMemo(() => latestNewsData.map(news => ({
      ...news,
      title: t(`schemes.latestNews.${news.key}.title`),
      description: t(`schemes.latestNews.${news.key}.description`),
  })), [t]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold mb-2 font-headline">{t('schemes.title')}</h1>
            <p className="text-muted-foreground">
                {t('schemes.description')}
            </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
            </Link>
        </Button>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 font-headline flex items-center"><ShieldCheck className="mr-3 h-6 w-6 text-primary"/> {t('schemes.keySchemesTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keySchemes.map(scheme => (
                    <Card key={scheme.title}>
                        <CardHeader className="flex flex-row items-start gap-4">
                            <Image src={`https://placehold.co/80x80.png`} width={50} height={50} alt={scheme.title} className="rounded-lg" data-ai-hint={scheme.hint}/>
                            <div>
                               <CardTitle className="text-lg">{scheme.title}</CardTitle>
                               <CardDescription className="text-xs">{scheme.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardFooter>
                             <Button asChild className="w-full" variant="secondary">
                                <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                                    {t('schemes.visitSite')} <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-headline flex items-center"><Newspaper className="mr-3 h-6 w-6 text-primary"/> {t('schemes.latestNewsTitle')}</h2>
             <ScrollArea className="h-[350px] w-full pr-4">
                <div className="space-y-4">
                    {latestNews.map(news => (
                        <Card key={news.title} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <p className="font-semibold">{news.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{news.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">{news.date}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <Button asChild variant="outline" size="sm">
                                    <Link href={news.link} target="_blank" rel="noopener noreferrer">
                                        {t('schemes.readMore')} <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                            </Button>
                        </div>
                        </Card>
                    ))}
                </div>
             </ScrollArea>
        </div>

        <div className="lg:col-span-1">
            <SchemeNavigatorClient />
        </div>

      </div>
    </div>
  );
}
