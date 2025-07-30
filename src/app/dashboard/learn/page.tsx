
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Film, Mic, PlayCircle, Search, Square, X, Info, ExternalLink, AlertCircle, SearchX, Youtube, ArrowLeft } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { searchYoutubeVideos, type SearchYoutubeVideosOutput } from '@/ai/flows/search-youtube-videos';
import { summarizeArticle, type SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/contexts/language-context';


const initialArticlesData = [
  {
    key: "dripIrrigation",
    hint: "farm drip irrigation",
  },
  {
    key: "ipm",
    hint: "insect on crop",
  },
  {
    key: "soilHealth",
    hint: "healthy farm soil",
  },
  {
    key: "composting",
    hint: "large compost pile",
  },
  {
    key: "cropRotation",
    hint: "crop rotation infographic",
  },
  {
    key: "organicFarming",
    hint: "organic vegetable basket",
  },
];

const initialVideosData: Video[] = [
    {
        title: "Video Guide to Pruning Tomato Plants",
        description: "A step-by-step visual guide on how to properly prune your tomato plants for better growth and yield.",
        duration: "12:45",
        videoId: "g-v3a3jK_4s",
        hint: "pruning tomato plant",
        thumbnailUrl: "https://placehold.co/600x400.png",
    },
    {
        title: "Setting Up a Home Vermicompost Bin",
        description: "Learn how to create and manage your own vermicompost system with this easy-to-follow video tutorial.",
        duration: "08:22",
        videoId: "N8_B-g4g_a4",
        hint: "worms in compost",
        thumbnailUrl: "https://placehold.co/600x400.png",
    },
    {
        title: "Identifying Common Nutrient Deficiencies",
        description: "This video helps you visually identify common nutrient deficiencies in your plants and how to correct them.",
        duration: "15:30",
        videoId: "o-rp3f_It2k",
        hint: "yellow plant leaf",
        thumbnailUrl: "https://placehold.co/600x400.png",
    }
];


type Video = SearchYoutubeVideosOutput['videos'][0] & { hint?: string };

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function LearnPage() {
    const { t, language } = useTranslation();

    const articles = useMemo(() => initialArticlesData.map(article => ({
        ...article,
        title: t(`learn.articles.${article.key}.title`),
        description: t(`learn.articles.${article.key}.description`),
    })), [t]);
    
    const initialVideos = useMemo(() => initialVideosData.map(video => ({
        ...video,
        // In a real app, video metadata would be fetched and translated.
        // For this demo, we'll keep the titles/descriptions in English.
    })), []);


    const [searchQuery, setSearchQuery] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("articles");
    const [videoResults, setVideoResults] = useState<Video[]>(initialVideos.map(v => ({...v, thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`})));
    const [isSearchingVideos, setIsSearchingVideos] = useState(false);
    const [summarizedArticle, setSummarizedArticle] = useState<SummarizeArticleOutput | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);


    useEffect(() => {
        const handleSearch = async () => {
          if (searchQuery.trim() === '') {
             if (activeTab === 'videos') setVideoResults(initialVideos.map(v => ({...v, thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}))); // Reset to initial videos if search is cleared
             setSummarizedArticle(null); // Clear summarized article
             return;
          }

          if (activeTab === 'videos') {
            setIsSearchingVideos(true);
            // We don't clear videoResults here to avoid a flash of "no results"
            try {
              const result = await searchYoutubeVideos({ query: searchQuery });
              setVideoResults(result.videos.map(v => ({...v, thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`})));
            } catch (error) {
              console.error("Video search failed", error);
              toast({ title: t('toast.videoSearchFailed'), description: t('toast.couldNotRetrieveVideos'), variant: "destructive" });
              setVideoResults(initialVideos.map(v => ({...v, thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}))); // Restore initial videos on error
            } finally {
              setIsSearchingVideos(false);
            }
          } else if (activeTab === 'articles') {
            setIsSummarizing(true);
            setSummarizedArticle(null);
            try {
                const result = await summarizeArticle({query: searchQuery, language});
                setSummarizedArticle(result);
            } catch (error) {
                console.error("Article summarization failed", error);
                toast({ title: t('toast.summarizationFailed'), description: t('toast.couldNotSummarize'), variant: "destructive" });
            } finally {
                setIsSummarizing(false);
            }
          }
        };

        // Debounce search to avoid excessive API calls
        const debounceTimer = setTimeout(handleSearch, 800);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, activeTab, initialVideos, t, language]);


    const handleMicClick = () => {
        if (!SpeechRecognition) {
          toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
          return;
        }
    
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
        recognition.lang = langMap[language] || 'en-IN';
    
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
        recognition.onerror = (event) => {
             if (event.error === 'no-speech') {
                toast({
                    title: t('toast.noSpeechDetected'),
                    description: t('toast.tryAgain'),
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t('toast.voiceError'),
                    description: event.error,
                    variant: "destructive",
                });
            }
        };
        recognition.onend = () => setIsRecording(false);
    
        recognition.start();
      };

    const filteredArticles = useMemo(() => {
        if (!searchQuery) return articles;
        return articles.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, articles]);

    const playVideo = (videoId: string) => {
        setPlayingVideoId(videoId);
    }

    const showNoLocalResultsMessage =
      searchQuery.trim() !== '' &&
      filteredArticles.length === 0 && 
      !isSummarizing && // don't show while summarizing
      (!summarizedArticle || summarizedArticle.articles.length === 0);
      
    const getYoutubeWatchUrl = (videoId: string | null): string => {
        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "https://www.youtube.com";
    }
    
    const getYoutubeEmbedUrl = (videoId: string | null): string => {
        if (!videoId) return "";
        const origin = typeof window !== 'undefined' ? window.location.origin : "";
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${origin}&enablejsapi=1`;
    }


  return (
    <>
      {playingVideoId && (
           <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setPlayingVideoId(null)}
          >
              <Card 
                className="w-full max-w-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="relative p-2">
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 z-10 bg-black/30 hover:bg-black/50 text-white hover:text-white"
                          onClick={() => setPlayingVideoId(null)}
                      >
                          <X className="h-4 w-4" />
                          <span className="sr-only">{t('learn.closePlayer')}</span>
                      </Button>
                      <div className="aspect-video">
                          <iframe
                              src={getYoutubeEmbedUrl(playingVideoId)}
                              title="YouTube video player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="w-full h-full rounded-md"
                          ></iframe>
                      </div>
                  </div>
                  <CardFooter className="p-2">
                       <Button asChild size="sm" className="w-full" variant="destructive">
                            <Link href={getYoutubeWatchUrl(playingVideoId)} target="_blank" rel="noopener noreferrer">
                                <Youtube className="mr-2 h-4 w-4" />
                                {t('learn.watchOnYoutube')}
                            </Link>
                        </Button>
                  </CardFooter>
              </Card>
          </div>
      )}
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
            <div>
                <h1 className="text-3xl font-bold mb-2 font-headline">{t('learn.title')}</h1>
                <p className="text-muted-foreground">
                    {t('learn.description')}
                </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
                </Link>
            </Button>
        </div>


        <div className="mb-8 flex items-center gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder={t('learn.searchPlaceholder')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick}>
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                <span className="sr-only">{isRecording ? t('learn.stopRecording') : t('learn.startVoiceSearch')}</span>
            </Button>
        </div>

        <Tabs defaultValue="articles" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="articles">{t('learn.tabs.articles')}</TabsTrigger>
            <TabsTrigger value="videos">{t('learn.tabs.videos')}</TabsTrigger>
            </TabsList>
            <TabsContent value="articles">
                {(isSummarizing || (summarizedArticle && summarizedArticle.articles.length > 0) || (summarizedArticle && summarizedArticle.relevance === 'unrelated')) && (
                <div className="my-6">
                    <h3 className="text-xl font-bold mb-4 font-headline">{t('learn.webSearchResults')}</h3>
                    {isSummarizing ? (
                    <div className="space-y-4">
                        <SummarizeSkeletonCard />
                        <SummarizeSkeletonCard />
                    </div>
                    ) : summarizedArticle ? (
                    summarizedArticle.relevance === 'unrelated' ? (
                        <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('learn.irrelevantTopic')}</AlertTitle>
                        <AlertDescription>{t('learn.irrelevantTopicMessage', { query: searchQuery })}</AlertDescription>
                        </Alert>
                    ) : summarizedArticle.articles.length > 0 ? (
                        <div className="space-y-4">
                            {summarizedArticle.articles.map((article, index) => (
                                <Card key={index}>
                                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                                        <div className="relative w-full sm:w-48 sm:h-32 shrink-0 aspect-video sm:aspect-auto">
                                            <Image 
                                                src={`https://placehold.co/600x400.png`} 
                                                alt={article.title} 
                                                layout="fill" 
                                                objectFit="cover" 
                                                className="rounded-md"
                                                data-ai-hint={article.imageHint}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{article.title}</CardTitle>
                                                <CardDescription className="mt-2 text-sm max-h-24 overflow-y-auto">{article.summary}</CardDescription>
                                            </div>
                                            <Button asChild className="w-full mt-4 sm:w-fit self-end">
                                                <Link href={`https://www.google.com/search?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
                                                    {t('learn.readFullArticle')} <ExternalLink className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : null
                    ) : null}
                </div>
                )}
                
                <h3 className="text-xl font-bold mt-8 mb-4 font-headline">{t('learn.ourGuides')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.length > 0 ? (
                    filteredArticles.map((article, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader className="p-0">
                        <div className="aspect-video relative">
                            <Image src={`https://placehold.co/600x400.png`} alt={article.title} layout="fill" objectFit="cover" data-ai-hint={article.hint} />
                        </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                        <CardTitle className="text-lg font-semibold">{article.title}</CardTitle>
                        <CardDescription className="mt-2 text-sm">{article.description}</CardDescription>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full">
                            <Link href={`https://www.google.com/search?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
                                {t('learn.readMore')} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                    ))
                ) : showNoLocalResultsMessage ? (
                    <div className="md:col-span-2 lg:col-span-3">
                    <NoArticlesFoundAlert query={searchQuery} />
                    </div>
                ) : null }
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
                            <Image src={video.thumbnailUrl} alt={video.title} layout="fill" objectFit="cover" data-ai-hint={video.hint}/>
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
                            {t('learn.watchNow')} <Film className="ml-2 h-4 w-4" />
                        </Button>
                        </CardFooter>
                    </Card>
                    ))
                ) : (
                    <div className="md:col-span-2 lg:col-span-3">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>{t('learn.noVideosFound')}</AlertTitle>
                            <AlertDescription>
                                {t('learn.noVideosFoundMessage', { query: searchQuery })}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

const NoArticlesFoundAlert = ({ query }: { query: string }) => {
    const { t } = useTranslation();
    return (
        <Alert variant="destructive">
            <SearchX className="h-4 w-4" />
            <AlertTitle>{t('learn.noArticlesFound')}</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
               <p>{t('learn.noArticlesFoundMessage', { query })}</p>
               <Button asChild variant="destructive" className="mt-2 w-fit">
                  <Link href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer">
                      {t('learn.searchOnGoogle')} <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
            </AlertDescription>
        </Alert>
    );
};

const SummarizeSkeletonCard = () => (
    <Card>
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <Skeleton className="relative w-full sm:w-48 sm:h-32 shrink-0 rounded-md" />
        <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-10 w-full sm:w-40 self-end" />
        </div>
      </div>
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
