
"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/contexts/language-context";

const GOV_PORTAL_URL = "https://agricoop.gov.in/";

export default function GovernmentPortalPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">{t('shop.government.title')}</h1>
            <p className="text-muted-foreground text-sm">
                {t('shop.government.showingContentFrom')} <Link href={GOV_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="underline">{GOV_PORTAL_URL}</Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/dashboard/shop">
                    <ArrowLeft className="mr-2 h-4 w-4"/> {t('shop.government.backToStore')}
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href={GOV_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                    {t('shop.government.openInNewTab')} <ExternalLink className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
          </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t('shop.government.embedNote')}</p>
      <div className="flex-1 border rounded-md overflow-hidden">
        <iframe
          src={GOV_PORTAL_URL}
          title={t('shop.government.iframeTitle')}
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

    