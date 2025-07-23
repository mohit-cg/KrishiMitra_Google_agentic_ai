
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.weeklyForecast')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-around items-center pt-2 h-[120px]">
            {loadingWeather ? (
                Array.from({length: 7}).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-10" />
                  </div>
                ))
            ) : weatherData ? (
              weatherData.forecast.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-2 text-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t(`dashboard.days.${day.day.substring(0, 3).toLowerCase()}`)}
                  </span>
                  {getIcon(day.icon as keyof typeof iconMap)}
                  <span className="text-sm font-bold">{day.temp}</span>
                </div>
              ))
            ) : (
                <p className="text-xs text-muted-foreground">{t('dashboard.forecastUnavailable')}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.currentWeather')}</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[120px]">
            {loadingWeather ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : weatherData ? (
              <>
                <div className="text-3xl font-bold">{weatherData.current.temperature}</div>
                <p className="text-sm text-muted-foreground">
                  {weatherData.current.condition} in {weatherData.city}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" /> <span>{weatherData.current.wind}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" /> <span>{weatherData.current.humidity}</span>
                  </div>
                </div>
              </>
            ) : (
               <p className="text-sm text-muted-foreground">{t('dashboard.weatherUnavailable')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    