
"use client";

import { CropDoctorClient } from './_components/crop-doctor-client';
import { useTranslation } from '@/contexts/language-context';

export default function CropDoctorPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">{t('cropDoctor.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('cropDoctor.description')}
      </p>
      <CropDoctorClient />
    </div>
  );
}

    