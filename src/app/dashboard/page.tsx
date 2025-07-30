
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Cloud,
  HeartPulse,
  LineChart,
  Banknote,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  Sun,
  CloudRain,
  CloudSun,
  ShoppingCart,
  Users,
  BookOpen,
  Wallet,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getWeatherForecast, type GetWeatherForecastOutput } from "@/ai/flows/get-weather-forecast";
import { recommendCrops, type RecommendCropsOutput } from "@/ai/flows/recommend-crops";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/language-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const iconMap = {
  Cloud,
  Sun,
  CloudRain,
  CloudSun,
  Wind,
  Droplets,
};

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const { t, language } = useTranslation();
  const [weatherData, setWeatherData] = useState<GetWeatherForecastOutput | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendCropsOutput | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const quickLinks = [
    {
      title: t('nav.cropDoctor'),
      description: t('dashboard.quickLinks.cropDoctor'),
      href: "/dashboard/crop-doctor",
      icon: HeartPulse,
    },
    {
      title: t('nav.cropRecommender'),
      description: t('dashboard.quickLinks.cropRecommender'),
      href: "/dashboard/crop-recommender",
      icon: Leaf,
    },
    {
      title: t('nav.marketAnalyst'),
      description: t('dashboard.quickLinks.marketAnalyst'),
      href: "/dashboard/market-analyst",
      icon: LineChart,
    },
    {
      title: t('nav.govtSchemes'),
      description: t('dashboard.quickLinks.govtSchemes'),
      href: "/dashboard/schemes",
      icon: Banknote,
    },
    {
      title: t('nav.tracker'),
      description: t('dashboard.quickLinks.tracker'),
      href: "/dashboard/tracker",
      icon: Wallet,
    },
    {
      title: t('nav.eLearning'),
      description: t('dashboard.quickLinks.eLearning'),
      href: "/dashboard/learn",
      icon: BookOpen,
    },
  ];

  useEffect(() => {
    const getCurrentSeason = () => {
        const month = new Date().getMonth(); // 0-11
        if (month >= 5 && month <= 9) return 'kharif'; // June to October
        if (month >= 10 || month <= 2) return 'rabi'; // November to March
        return 'zaid'; // April, May
    };

    const fetchDashboardData = async () => {
      const city = userProfile?.location?.split(',')[0] || "Pune";
      
      setLoadingWeather(true);
      setLoadingRecommendations(true);

      const weatherPromise = getWeatherForecast({ city });
      const recommendationsPromise = recommendCrops({
          location: userProfile?.location || "Pune, Maharashtra",
          farmType: 'irrigated',
          landSize: '1 acre',
          season: getCurrentSeason(),
          language: language,
      });

      const [weatherResult, recommendationsResult] = await Promise.allSettled([
        weatherPromise,
        recommendationsPromise,
      ]);

      if (weatherResult.status === 'fulfilled') {
        setWeatherData(weatherResult.value);
      } else {
        console.error("Failed to fetch weather", weatherResult.reason);
      }
      setLoadingWeather(false);

      if (recommendationsResult.status === 'fulfilled') {
        setRecommendations(recommendationsResult.value);
      } else {
        console.error("Failed to fetch recommendations", recommendationsResult.reason);
      }
      setLoadingRecommendations(false);
    };
    
    if (userProfile) {
        fetchDashboardData();
    }
  }, [userProfile, language]);
  
  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName] || Cloud;
    return <IconComponent className="h-8 w-8 text-secondary-foreground" />;
  };
  
  const displayName = user?.displayName?.split(' ')[0] || t('dashboard.farmer');

  return (
    <div className="flex-1 space-y-6">
      <div className="pt-5">
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.welcome', { name: displayName })}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {quickLinks.map((link) => (
          <Link href={link.href} key={link.href} className="group">
            <Card className="h-full transition-all duration-300 group-hover:bg-secondary/50 group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{link.title}</CardTitle>
                  <link.icon className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.currentWeather')}</CardTitle>
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center sm:space-x-4">
                        {loadingWeather ? (
                        <div className="flex items-center space-x-4 w-full">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="space-y-2 pl-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                        ) : weatherData ? (
                            <>
                                {getIcon(weatherData.current.icon as keyof typeof iconMap)}
                                <div className="text-center sm:text-left mt-2 sm:mt-0">
                                    <div className="text-3xl font-bold">{weatherData.current.temperature}</div>
                                    <p className="text-sm text-muted-foreground">
                                    {t(`weather.conditions.${weatherData.current.condition}`)} in {weatherData.city}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-4 mt-2 sm:mt-0">
                                    <div className="flex items-center gap-1">
                                        <Wind className="h-4 w-4" /> <span>{weatherData.current.wind}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Droplets className="h-4 w-4" /> <span>{weatherData.current.humidity}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                        <p className="text-sm text-muted-foreground">{t('dashboard.weatherUnavailable')}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                           <Icons.sprout className="h-6 w-6 text-primary"/>
                           <CardTitle>{t('dashboard.recommendations.title')}</CardTitle>
                        </div>
                        <CardDescription>{t('dashboard.recommendations.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {loadingRecommendations ? (
                             Array.from({length: 2}).map((_, i) => (
                                <Card key={i} className="flex items-center gap-4 p-4">
                                    <Skeleton className="h-20 w-20 rounded-lg"/>
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-1/2"/>
                                        <Skeleton className="h-4 w-full"/>
                                        <Skeleton className="h-4 w-3/4"/>
                                    </div>
                                </Card>
                             ))
                        ) : recommendations && recommendations.recommendations.length > 0 ? (
                           recommendations.recommendations.slice(0,2).map(rec => (
                            <Card key={rec.cropName} className="overflow-hidden">
                                <div className="flex items-start gap-4 p-4">
                                    <Image src={`https://placehold.co/100x100.png`} alt={rec.cropName} width={80} height={80} className="rounded-lg object-cover" data-ai-hint={rec.imageHint}/>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base">{rec.cropName}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{rec.reasoning}</p>
                                        <Button asChild size="sm" variant="secondary" className="text-xs">
                                            <Link href={`/dashboard/learn?q=${encodeURIComponent(rec.cropName)}`}>
                                                Learn More <ArrowRight className="ml-1 h-3 w-3"/>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                           ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4 md:col-span-2">{t('dashboard.recommendations.unavailable')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                         <CardDescription>Important updates and alerts for your farm.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                            <Icons.wheat className="h-12 w-12 mb-4"/>
                            <p className="font-semibold">No new notifications</p>
                            <p className="text-sm">Check back later for updates on weather, market prices, and more.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
