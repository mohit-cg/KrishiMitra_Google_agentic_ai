
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/contexts/language-context";

export default function ShopPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('shop.title')}</h1>
          <p className="text-muted-foreground">
            {t('shop.description')}
          </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
            </Link>
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader>
             <div className="relative h-40 w-full mb-4">
                <Image src="https://source.unsplash.com/600x400/?government,building" alt={t('shop.govStoreAlt')} layout="fill" objectFit="cover" className="rounded-md" />
             </div>
            <CardTitle>{t('shop.govStoreTitle')}</CardTitle>
            <CardDescription>
              {t('shop.govStoreDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full" variant="secondary">
              <Link href="/dashboard/shop/government">
                {t('shop.govStoreButton')} <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="relative h-40 w-full mb-4">
                <Image src="https://source.unsplash.com/600x400/?market,stall" alt={t('shop.privateMarketplaceAlt')} layout="fill" objectFit="cover" className="rounded-md" />
            </div>
            <CardTitle>{t('shop.privateMarketplaceTitle')}</CardTitle>
            <CardDescription>
              {t('shop.privateMarketplaceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
             <Button asChild className="w-full">
              <Link href="/dashboard/shop/marketplace">
                <Store className="mr-2 h-4 w-4" /> {t('shop.privateMarketplaceButton')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
