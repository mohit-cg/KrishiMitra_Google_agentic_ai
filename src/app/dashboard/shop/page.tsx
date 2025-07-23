
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ShopPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Krishi Store</h1>
      <p className="text-muted-foreground mb-8">
        Choose where you want to buy your farming supplies from.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader>
             <div className="relative h-40 w-full mb-4">
                <Image src="https://placehold.co/600x400.png" alt="Government Store" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="government building" />
             </div>
            <CardTitle>Government Stores</CardTitle>
            <CardDescription>
              Purchase subsidized seeds, fertilizers, and equipment directly from government-approved outlets. Ensures quality and fair pricing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full" variant="secondary">
              <Link href="/dashboard/shop/government">
                Explore Government Portals <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="relative h-40 w-full mb-4">
                <Image src="https://placehold.co/600x400.png" alt="Private Marketplace" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="market stall" />
            </div>
            <CardTitle>Private Marketplace</CardTitle>
            <CardDescription>
              Browse a wide variety of products from different sellers. Find competitive prices and a larger selection of brands and items.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
             <Button asChild className="w-full">
              <Link href="/dashboard/shop/marketplace">
                <Store className="mr-2 h-4 w-4" /> Go to Marketplace
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
