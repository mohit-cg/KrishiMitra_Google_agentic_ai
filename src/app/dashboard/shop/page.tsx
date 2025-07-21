import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const products = [
  { name: "Organic Fertilizer", price: "₹450", image: "https://placehold.co/400x400.png", hint: "fertilizer bag" },
  { name: "Pesticide Spray", price: "₹700", image: "https://placehold.co/400x400.png", hint: "pesticide bottle" },
  { name: "High-Yield Seeds", price: "₹1200", image: "https://placehold.co/400x400.png", hint: "seed packet" },
  { name: "Gardening Tools Set", price: "₹1500", image: "https://placehold.co/400x400.png", hint: "gardening tools" },
  { name: "Drip Irrigation Kit", price: "₹2500", image: "https://placehold.co/400x400.png", hint: "irrigation kit" },
  { name: "Soil Test Kit", price: "₹900", image: "https://placehold.co/400x400.png", hint: "soil test" },
  { name: "Protective Gloves", price: "₹250", image: "https://placehold.co/400x400.png", hint: "gloves" },
  { name: "Power Sprayer", price: "₹3500", image: "https://placehold.co/400x400.png", hint: "power sprayer" },
];

export default function ShopPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Krishi Store</h1>
      <p className="text-muted-foreground mb-8">
        Quality products for all your farming needs.
      </p>

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
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
