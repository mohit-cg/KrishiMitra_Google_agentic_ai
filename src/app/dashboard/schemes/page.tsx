import { SchemeNavigatorClient } from "./_components/scheme-navigator-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Newspaper, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";


const keySchemes = [
  {
    title: "PM-KISAN Scheme",
    description: "Financial support of ₹6,000 per year for small and marginal farmer families.",
    icon: "https://placehold.co/80x80.png",
    hint: "coin stack rupee",
    link: "https://pmkisan.gov.in/",
  },
  {
    title: "Pradhan Mantri Fasal Bima Yojana",
    description: "Insurance coverage against crop failure due to natural calamities, pests or diseases.",
    icon: "https://placehold.co/80x80.png",
    hint: "crop insurance document",
    link: "https://pmfby.gov.in/",
  },
  {
    title: "Kisan Credit Card (KCC)",
    description: "Provides farmers with timely access to credit for their cultivation and other needs.",
    icon: "https://placehold.co/80x80.png",
    hint: "credit card",
    link: "https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-credit-card",
  },
];

const latestNews = [
    {
        title: "Government increases MSP for Kharif crops",
        description: "The Cabinet has approved a significant hike in the Minimum Support Price for all mandated Kharif crops for the upcoming marketing season.",
        date: "June 19, 2024",
        link: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2025732"
    },
    {
        title: "New portal launched for farm subsidy disbursal",
        description: "A new unified portal has been launched to streamline the process of subsidy application and disbursal for various farming equipment.",
        date: "June 10, 2024",
        link: "https://krishijagran.com/agriculture-world/central-government-launches-new-portal-for-farm-subsidies-to-ensure-transparency-and-efficiency/"
    },
    {
        title: "Guidelines issued for National Horticulture Mission",
        description: "The Department of Agriculture has released updated guidelines for the NHM to boost the horticulture sector, with a focus on post-harvest management.",
        date: "June 5, 2024",
        link: "https://nhm.gov.in/Guideline/Mission-for-Integrated-Development-of-Horticulture.pdf"
    },
    {
        title: "e-NAM reaches new milestone with 1,000 mandis integrated",
        description: "The electronic National Agriculture Market (e-NAM) platform has now connected over 1,000 agricultural produce markets across the country.",
        date: "May 28, 2024",
        link: "https://enam.gov.in/web/"
    },
    {
        title: "Solar pump scheme extended for another year",
        description: "The PM-KUSUM scheme, aimed at providing solar-powered irrigation pumps to farmers, has been extended until March 2025.",
        date: "May 20, 2024",
        link: "https://mnre.gov.in/solar/pm-kusum-scheme"
    }
];

export default function SchemeNavigatorPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Scheme & Information Hub</h1>
      <p className="text-muted-foreground mb-8">
        Discover key government schemes, stay updated with the latest news, and find information tailored for you.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 font-headline flex items-center"><ShieldCheck className="mr-3 h-6 w-6 text-primary"/> Key Government Schemes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keySchemes.map(scheme => (
                    <Card key={scheme.title}>
                        <CardHeader className="flex flex-row items-start gap-4">
                            <Image src={scheme.icon} width={50} height={50} alt={scheme.title} data-ai-hint={scheme.hint} className="rounded-lg"/>
                            <div>
                               <CardTitle className="text-lg">{scheme.title}</CardTitle>
                               <CardDescription className="text-xs">{scheme.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardFooter>
                             <Button asChild className="w-full" variant="secondary">
                                <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                                    Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4 font-headline flex items-center"><Newspaper className="mr-3 h-6 w-6 text-primary"/> Latest News & Updates</h2>
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
                                        Read More <ExternalLink className="ml-2 h-4 w-4" />
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
