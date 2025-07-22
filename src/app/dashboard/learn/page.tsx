
"use client";

import { useState, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Film, Mic, PlayCircle, Search, Square } from "lucide-react";
import { toast } from '@/hooks/use-toast';


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

const videos = [
    {
        title: "Video Guide to Pruning Tomato Plants",
        description: "A step-by-step visual guide on how to properly prune your tomato plants for better growth and yield.",
        image: "https://placehold.co/600x400.png",
        hint: "tomato plant pruning",
        duration: "12:45"
    },
    {
        title: "Setting Up a Home Vermicompost Bin",
        description: "Learn how to create and manage your own vermicompost system with this easy-to-follow video tutorial.",
        image: "https://placehold.co/600x400.png",
        hint: "vermicompost bin",
        duration: "08:22"
    },
    {
        title: "Identifying Common Nutrient Deficiencies",
        description: "This video helps you visually identify common nutrient deficiencies in your plants and how to correct them.",
        image: "https://placehold.co/600x400.png",
        hint: "plant nutrient deficiency",
        duration: "15:30"
    }
];

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function LearnPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const handleMicClick = () => {
        if (!SpeechRecognition) {
          toast({
            title: "Browser Not Supported",
            description: "Your browser does not support voice recognition.",
            variant: "destructive",
          });
          return;
        }
    
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';
    
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
        recognition.onerror = (event) => toast({ title: "Voice Recognition Error", description: event.error, variant: "destructive" });
        recognition.onend = () => setIsRecording(false);
    
        recognition.start();
      };

    const filteredArticles = useMemo(() => {
        if (!searchQuery) return articles;
        return articles.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const filteredVideos = useMemo(() => {
        if (!searchQuery) return videos;
        return videos.filter(video => 
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">E-Learning Hub</h1>
      <p className="text-muted-foreground mb-4">
        Expand your knowledge with our collection of farming guides and tutorials.
      </p>

      <div className="mb-8 flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search for articles or videos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick}>
            {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            <span className="sr-only">{isRecording ? "Stop Recording" : "Start Voice Search"}</span>
          </Button>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="articles">Articles & Guides</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredArticles.map((article, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-video relative">
                    <Image src={article.image} alt={article.title} layout="fill" objectFit="cover" data-ai-hint={article.hint}/>
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
             {filteredArticles.length === 0 && <p>No articles found matching your search.</p>}
          </div>
        </TabsContent>
        <TabsContent value="videos">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredVideos.map((video, index) => (
              <Card key={index} className="flex flex-col group">
                <CardHeader className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <Image src={video.image} alt={video.title} layout="fill" objectFit="cover" data-ai-hint={video.hint} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="h-16 w-16 text-white/80"/>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{video.duration}</div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-lg font-semibold">{video.title}</CardTitle>
                  <CardDescription className="mt-2">{video.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild variant="destructive" className="w-full">
                    <Link href="#">
                      Watch Now <Film className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
             {filteredVideos.length === 0 && <p>No videos found matching your search.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
