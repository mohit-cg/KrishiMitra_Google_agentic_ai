
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";
import { useMemo } from "react";

const productsData = [
  { key: "organicFertilizer", price: "₹450", image: "https://placehold.co/400x400.png", hint: "fertilizer bag" },
  { key: "pesticideSpray", price: "₹700", image: "https://placehold.co/400x400.png", hint: "pesticide bottle" },
  { key: "highYieldSeeds", price: "₹1200", image: "https://placehold.co/400x400.png", hint: "seed packet" },
  { key: "gardeningToolsSet", price: "₹1500", image: "https://placehold.co/400x400.png", hint: "gardening tools" },
  { key: "dripIrrigationKit", price: "₹2500", image: "https://placehold.co/400x400.png", hint: "irrigation kit" },
  { key: "soilTestKit", price: "₹900", image: "https://placehold.co/400x400.png", hint: "soil test" },
  { key: "protectiveGloves", price: "₹250", image: "https://placehold.co/400x400.png", hint: "gloves" },
  { key: "powerSprayer", price: "₹3500", image: "https://placehold.co/400x400.png", hint: "power sprayer" },
  { key: "greenhousePolythene", price: "₹4200", image: "https://placehold.co/400x400.png", hint: "greenhouse sheet" },
  { key: "waterPump", price: "₹5500", image: "https://placehold.co/400x400.png", hint: "water pump" },
  { key: "cowManure", price: "₹300", image: "https://placehold.co/400x400.png", hint: "manure bag" },
  { key: "neemOil", price: "₹850", image: "https://placehold.co/400x400.png", hint: "neem oil" },
];

export default function MarketplacePage() {
  const { t } = useTranslation();

  const products = useMemo(() => productsData.map(product => ({
    ...product,
    name: t(`shop.marketplace.products.${product.key}`)
  })), [t]);
  
  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="flex justify-between items-center mb-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">{t('shop.marketplace.title')}</h1>
            <p className="text-muted-foreground">
                {t('shop.marketplace.description')}
            </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/dashboard/shop">
                <ArrowLeft className="mr-2 h-4 w-4"/> {t('shop.marketplace.backToStore')}
            </Link>
        </Button>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="aspect-square relative">
                <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.hint} />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
              <p className="text-2xl font-bold text-primary mt-2">{product.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" /> {t('shop.marketplace.addToCart')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

    