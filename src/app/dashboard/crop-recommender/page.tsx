
"use client";

import { CropRecommenderClient } from './_components/crop-recommender-client';
import { useTranslation } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CropRecommenderPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold mb-2 font-headline">{t('cropRecommender.title')}</h1>
            <p className="text-muted-foreground">
                {t('cropRecommender.description')}
            </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
            </Link>
        </Button>
      </div>
      <CropRecommenderClient />
    </div>
  );
}
