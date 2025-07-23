
"use client";

import { MarketAnalystClient } from "./_components/market-analyst-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "@/contexts/language-context";

export default function MarketAnalystPage() {
  const { t } = useTranslation();

  const faqs = useMemo(() => [
    {
        question: t('marketAnalyst.faqs.q1'),
        answer: t('marketAnalyst.faqs.a1')
    },
    {
        question: t('marketAnalyst.faqs.q2'),
        answer: t('marketAnalyst.faqs.a2')
    },
    {
        question: t('marketAnalyst.faqs.q3'),
        answer: t('marketAnalyst.faqs.a3')
    },
    {
        question: t('marketAnalyst.faqs.q4'),
        answer: t('marketAnalyst.faqs.a4')
    }
  ], [t]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">{t('marketAnalyst.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('marketAnalyst.description')}
      </p>
      <MarketAnalystClient />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center">
            <HelpCircle className="mr-3 h-6 w-6 text-primary"/>
            {t('marketAnalyst.faqTitle')}
        </h2>
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
                 <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}

    