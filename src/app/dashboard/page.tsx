
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { getWeatherForecast, type GetWeatherForecastOutput } from "@/ai/flows/get-weather-forecast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/language-context";

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
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState<GetWeatherForecastOutput | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

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
    const fetchWeather = async () => {
      try {
        setLoadingWeather(true);
        // In a real app, user's location would be used here. Defaulting to Pune.
        const city = userProfile?.location?.split(',')[0] || "Pune";
        const data = await getWeatherForecast({ city });
        setWeatherData(data);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [userProfile]);
  
  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName] || Cloud;
    return <IconComponent className="h-8 w-8 text-secondary-foreground" />;
  };
  
  const displayName = user?.displayName?.split(' ')[0] || t('dashboard.farmer');

  return (
    <div className="flex-1 space-y-6">
      <div>
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
      
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.currentWeather')}</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
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
                    {getIcon(weatherData.current.icon as keyof typeof iconMap, "h-16 w-16 text-accent")}
                    <div>
                        <div className="text-3xl font-bold">{weatherData.current.temperature}</div>
                        <p className="text-sm text-muted-foreground">
                        {t(`weather.conditions.${weatherData.current.condition}`)} in {weatherData.city}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-4">
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
    </div>
  );
}
