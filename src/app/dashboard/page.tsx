"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowUpRight,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { getWeatherForecast, type GetWeatherForecastOutput } from "@/ai/flows/get-weather-forecast";
import { Skeleton } from "@/components/ui/skeleton";

const quickLinks = [
  {
    title: "AI Crop Doctor",
    description: "Diagnose crop diseases instantly.",
    href: "/dashboard/crop-doctor",
    icon: HeartPulse,
  },
  {
    title: "Market Analyst",
    description: "Get real-time price analysis.",
    href: "/dashboard/market-analyst",
    icon: LineChart,
  },
  {
    title: "Scheme Navigator",
    description: "Find government schemes for you.",
    href: "/dashboard/schemes",
    icon: Banknote,
  },
];

const iconMap = {
  Cloud,
  Sun,
  CloudRain,
  CloudSun,
  Wind,
  Droplets,
};

export default function DashboardPage() {
  const [weatherData, setWeatherData] = useState<GetWeatherForecastOutput | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoadingWeather(true);
        const data = await getWeatherForecast({ city: "Pune" });
        setWeatherData(data);
      } catch (error) {
        console.error("Failed to fetch weather", error);
        // Handle error, maybe set default data
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, []);
  
  const getIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName] || Cloud;
    return <IconComponent className="h-6 w-6 text-accent" />;
  };

  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-3xl font-bold font-headline">Welcome, Farmer!</h1>
      <p className="text-muted-foreground">
        Here&apos;s a quick overview of your farm and market.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingWeather ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : weatherData ? (
              <>
                <div className="text-2xl font-bold">{weatherData.current.temperature}</div>
                <p className="text-xs text-muted-foreground">
                  {weatherData.current.condition} in {weatherData.city}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" /> <span>{weatherData.current.wind}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" /> <span>{weatherData.current.humidity}</span>
                  </div>
                </div>
              </>
            ) : (
               <p className="text-xs text-muted-foreground">Weather data unavailable.</p>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              7-Day Forecast
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-around items-center pt-2">
            {loadingWeather ? (
                Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-12 w-12" />)
            ) : weatherData ? (
              weatherData.forecast.slice(0, 4).map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {day.day.substring(0, 3)}
                  </span>
                  {getIcon(day.icon as keyof typeof iconMap)}
                  <span className="text-sm font-bold">{day.temp}</span>
                </div>
              ))
            ) : (
                <p className="text-xs text-muted-foreground">Forecast unavailable.</p>
            )}
            <Button variant="outline" size="sm" className="ml-4" asChild>
              <Link href="/dashboard/weather">View More</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62%</div>
            <p className="text-xs text-muted-foreground">
              Optimal for current crop
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.href}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <link.icon className="h-5 w-5 text-primary" />
                {link.title}
              </CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" asChild>
                <Link href={link.href}>
                  Proceed <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
