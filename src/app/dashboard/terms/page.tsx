
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/contexts/language-context"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsOfUsePage() {
  const { t } = useTranslation()

  // This is a basic template. For a real application, consult a legal professional.
  const sections = [
    { key: 'acceptance' },
    { key: 'useOfService', items: ['item1', 'item2', 'item3'] },
    { key: 'disclaimer' },
    { key: 'limitation' },
    { key: 'termination' },
    { key: 'governingLaw' },
    { key: 'changes' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('settings.legal.terms')}</h1>
          <p className="text-muted-foreground">{t('terms.description')}</p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard/settings">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('privacy.backToSettings')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
           <p className="text-sm text-muted-foreground">
            <strong>{t('terms.lastUpdated.title')}:</strong> {t('terms.lastUpdated.date')}
          </p>

          {sections.map(section => (
            <div key={section.key} className="mt-6">
              <h2 className="text-xl font-semibold font-headline">{t(`terms.${section.key}.title`)}</h2>
              <p>{t(`terms.${section.key}.content`)}</p>
              {section.items && (
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  {section.items.map(item => (
                    <li key={item}>{t(`terms.${section.key}.${item}`)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
