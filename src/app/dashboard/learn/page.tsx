import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const articles = [
  {
    title: "Mastering Drip Irrigation",
    description: "Learn how to set up and maintain a drip irrigation system for maximum water efficiency and crop yield.",
    image: "https://placehold.co/600x400.png",
    hint: "drip irrigation",
  },
  {
    title: "Integrated Pest Management",
    description: "A comprehensive guide to managing pests in a sustainable and environmentally friendly way.",
    image: "https://placehold.co/600x400.png",
    hint: "crop pest",
  },
  {
    title: "Soil Health and Nutrition",
    description: "Understand the basics of soil science and how to provide the right nutrients for your crops.",
    image: "https://placehold.co/600x400.png",
    hint: "healthy soil",
  },
  {
    title: "Advanced Composting Techniques",
    description: "Turn your farm waste into black gold with these advanced composting methods.",
    image: "https://placehold.co/600x400.png",
    hint: "compost pile",
  },
  {
    title: "Understanding Crop Rotation",
    description: "Discover the benefits of crop rotation for soil fertility and disease prevention.",
    image: "https://placehold.co/600x400.png",
    hint: "crop rotation",
  },
  {
    title: "Basics of Organic Farming",
    description: "An introductory course on the principles and practices of organic agriculture.",
    image: "https://placehold.co/600x400.png",
    hint: "organic farm",
  },
];

export default function LearnPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">E-Learning Hub</h1>
      <p className="text-muted-foreground mb-8">
        Expand your knowledge with our collection of farming guides and tutorials.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="p-0">
               <div className="aspect-video relative">
                <Image src={article.image} alt={article.title} layout="fill" objectFit="cover" data-ai-hint={article.hint} />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-semibold">{article.title}</CardTitle>
              <CardDescription className="mt-2">{article.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full">
                <Link href="#">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
