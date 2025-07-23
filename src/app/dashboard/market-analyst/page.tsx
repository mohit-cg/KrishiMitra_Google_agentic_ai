
import { MarketAnalystClient } from "./_components/market-analyst-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react";


const faqs = [
    {
        question: "What kind of questions can I ask?",
        answer: "You can ask about current crop prices in specific locations, price trends, and get recommendations on whether to sell or hold your produce. For example: 'What is the price of tomatoes in Pune?' or 'Should I sell my wheat stock now?'"
    },
    {
        question: "How accurate is the price information?",
        answer: "The price information is based on real-time data from various agricultural markets (mandis). While we strive for accuracy, prices can fluctuate rapidly. Use the information as a guide for your decisions."
    },
    {
        question: "Can I ask about future price predictions?",
        answer: "Yes, you can ask for price trend analysis and predictions. The AI will provide insights based on historical data and current market conditions, but please note that these are forecasts and not guarantees."
    },
    {
        question: "What locations and crops are supported?",
        answer: "The assistant covers a wide range of major crops and markets across India. You can ask about vegetables, grains, fruits, and more in various cities and their main agricultural markets."
    }
];


export default function MarketAnalystPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Market Analyst</h1>
      <p className="text-muted-foreground mb-8">
        Get real-time market price analysis and recommendations. Ask a question like "What is the price of onions in Pune Mandi?"
      </p>
      <MarketAnalystClient />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center">
            <HelpCircle className="mr-3 h-6 w-6 text-primary"/>
            Frequently Asked Questions
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
