
"use client";

import { CropRecommenderClient } from './_components/crop-recommender-client';
import { useTranslation } from '@/contexts/language-context';

export default function CropRecommenderPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">{t('cropRecommender.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('cropRecommender.description')}
      </p>
      <CropRecommenderClient />
    </div>
  );
}
