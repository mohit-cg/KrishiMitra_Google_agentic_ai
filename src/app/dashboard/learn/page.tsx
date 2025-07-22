
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Film, Mic, PlayCircle, Search, Square, X, Info, ExternalLink } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { searchYoutubeVideos, type SearchYoutubeVideosOutput } from '@/ai/flows/search-youtube-videos';
import { summarizeArticle, type SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const articles = [
  {
    title: "Mastering Drip Irrigation",
    description: "A comprehensive guide to setting up and maintaining drip irrigation systems for maximizing water efficiency and boosting crop yields. Covers component selection, layout planning, and troubleshooting common issues.",
    image: "https://placehold.co/600x400.png",
    hint: "drip irrigation system",
  },
  {
    title: "Integrated Pest Management (IPM)",
    description: "Explore sustainable, eco-friendly strategies to manage pests. This guide covers biological controls, cultural practices, and the targeted use of pesticides to protect your crops and the environment.",
    image: "https://placehold.co/600x400.png",
    hint: "crop pest insect",
  },
  {
    title: "Soil Health and Nutrition",
    description: "Unlock the secrets to rich, fertile soil. This article delves into the fundamentals of soil science, including composition, pH balance, and how to enrich your soil for healthier, more productive plants.",
    image: "https://placehold.co/600x400.png",
    hint: "healthy soil farm",
  },
  {
    title: "Advanced Composting Techniques",
    description: "Learn to transform farm waste into 'black gold'. This guide details various composting methods, including hot and cold composting, vermicomposting, and how to create balanced compost piles.",
    image: "https://placehold.co/600x400.png",
    hint: "compost pile farm",
  },
  {
    title: "Understanding Crop Rotation",
    description: "Discover the benefits of strategic crop rotation, including improved soil fertility, pest and disease cycle disruption, and increased biodiversity. Includes sample rotation plans for common crops.",
    image: "https://placehold.co/600x400.png",
    hint: "crop rotation diagram",
  },
  {
    title: "Basics of Organic Farming",
    description: "An essential introduction to the core principles and practices of organic agriculture. Covers certification, natural fertilization, weed control, and marketing organic produce for sustainable farming.",
    image: "https://placehold.co/600x400.png",
    hint: "organic vegetables farm",
  },
];

const initialVideos: Video[] = [
    {
        title: "Video Guide to Pruning Tomato Plants",
        description: "A step-by-step visual guide on how to properly prune your tomato plants for better growth and yield.",
        thumbnailUrl: "https://placehold.co/600x400.png",
        duration: "12:45",
        videoId: "g-v3a3jK_4s",
        hint: "tomato plant pruning"
    },
    {
        title: "Setting Up a Home Vermicompost Bin",
        description: "Learn how to create and manage your own vermicompost system with this easy-to-follow video tutorial.",
        thumbnailUrl: "https://placehold.co/600x400.png",
        duration: "08:22",
        videoId: "N8_B-g4g_a4",
        hint: "vermicompost bin"
    },
    {
        title: "Identifying Common Nutrient Deficiencies",
        description: "This video helps you visually identify common nutrient deficiencies in your plants and how to correct them.",
        thumbnailUrl: "https://placehold.co/600x400.png",
        duration: "15:30",
        videoId: "o-rp3f_It2k",
        hint: "plant nutrient deficiency"
    }
];


type Video = SearchYoutubeVideosOutput['videos'][0] & { hint?: string };

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function LearnPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("articles");
    const [videoResults, setVideoResults] = useState<Video[]>(initialVideos);
    const [isSearchingVideos, setIsSearchingVideos] = useState(false);
    const [summarizedArticle, setSummarizedArticle] = useState<SummarizeArticleOutput | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);


    useEffect(() => {
        const handleSearch = async () => {
          if (searchQuery.trim() === '') {
             if (activeTab === 'videos') setVideoResults(initialVideos); // Reset to initial videos if search is cleared
             setSummarizedArticle(null); // Clear summarized article
             return;
          }

          if (activeTab === 'videos') {
            setIsSearchingVideos(true);
            setVideoResults([]); // Clear previous results
            try {
              const result = await searchYoutubeVideos({ query: searchQuery });
              setVideoResults(result.videos);
            } catch (error) {
              console.error("Video search failed", error);
              toast({ title: "Video Search Failed", description: "Could not retrieve video tutorials.", variant: "destructive" });
              setVideoResults(initialVideos); // Restore initial videos on error
            } finally {
              setIsSearchingVideos(false);
            }
          } else if (activeTab === 'articles') {
            setIsSummarizing(true);
            setSummarizedArticle(null);
            try {
                const result = await summarizeArticle({query: searchQuery});
                setSummarizedArticle(result);
            } catch (error) {
                console.error("Article summarization failed", error);
                toast({ title: "Summarization Failed", description: "Could not summarize an article from the web.", variant: "destructive" });
            } finally {
                setIsSummarizing(false);
            }
          }
        };

        const debounceTimer = setTimeout(handleSearch, 800);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, activeTab]);


    const handleMicClick = () => {
        if (!SpeechRecognition) {
          toast({ title: "Browser Not Supported", description: "Your browser does not support voice recognition.", variant: "destructive" });
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

    const playVideo = (videoId: string) => {
        setPlayingVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
       {playingVideoUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPlayingVideoUrl(null)}>
          <div className="relative aspect-video bg-black w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={playingVideoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-10 right-0 text-white hover:text-white"
              onClick={() => setPlayingVideoUrl(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
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

      <Tabs defaultValue="articles" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="articles">Articles & Guides</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
            {(isSummarizing || summarizedArticle) && (
              <div className="my-6">
                <h3 className="text-xl font-bold mb-4 font-headline">Web Search Result</h3>
                {isSummarizing ? (
                  <SummarizeSkeletonCard />
                ) : summarizedArticle ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{summarizedArticle.title}</CardTitle>
                      <CardDescription>AI-generated summary from a web source.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{summarizedArticle.summary}</p>
                    </CardContent>
                    <CardFooter>
                       <Button asChild>
                            <Link href={summarizedArticle.sourceUrl} target="_blank" rel="noopener noreferrer">
                                Read Full Article <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                  </Card>
                ) : null}
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredArticles.length > 0 ? (
                filteredArticles.map((article, index) => (
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
                        <Button asChild className="w-full">
                            <Link href={`https://www.google.com/search?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
                                Read More <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                ))
            ) : !searchQuery ? (
                 articles.map((article, index) => (
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
                        <Button asChild className="w-full">
                            <Link href={`https://www.google.com/search?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
                                Read More <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="md:col-span-2 lg:col-span-3">
                   <NoArticlesFoundAlert query={searchQuery} />
                </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="videos">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isSearchingVideos ? (
                Array.from({length: 3}).map((_, index) => <VideoSkeletonCard key={index} />)
            ) : videoResults.length > 0 ? (
                videoResults.map((video, index) => (
                  <Card key={index} className="flex flex-col group">
                    <CardHeader className="p-0">
                      <button onClick={() => playVideo(video.videoId)} className="block aspect-video relative overflow-hidden rounded-t-lg w-full">
                        <Image src={video.thumbnailUrl} alt={video.title} layout="fill" objectFit="cover" data-ai-hint={video.hint || "youtube thumbnail"} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="h-16 w-16 text-white/80"/>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{video.duration}</div>
                      </button>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-lg font-semibold">{video.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm">{video.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button onClick={() => playVideo(video.videoId)} variant="destructive" className="w-full">
                          Watch Now <Film className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
                <div className="md:col-span-2 lg:col-span-3">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Videos Found</AlertTitle>
                        <AlertDescription>
                            Your search for "{searchQuery}" did not return any videos. Please try a different search term.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const NoArticlesFoundAlert = ({ query }: { query: string }) => (
    <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Matching Guides Found</AlertTitle>
        <AlertDescription>
            Your search for "{query}" did not match any of our existing guides. Check the Web Search Result above for a summary from the web.
        </AlertDescription>
    </Alert>
);

const SummarizeSkeletonCard = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-40" />
      </CardFooter>
    </Card>
  );

const VideoSkeletonCard = () => (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );


    

    
