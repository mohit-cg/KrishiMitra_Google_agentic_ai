
"use client";

import { CropDoctorClient } from './_components/crop-doctor-client';
import { useTranslation } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CropDoctorPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold mb-2 font-headline">{t('cropDoctor.title')}</h1>
            <p className="text-muted-foreground">
                {t('cropDoctor.description')}
            </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
            </Link>
        </Button>
      </div>
      <CropDoctorClient />
    </div>
  );
}
