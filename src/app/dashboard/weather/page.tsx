
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cloud, Sun, CloudRain, CloudSun, Wind, Droplets, Search, ArrowLeft, Mic, Square } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getWeatherForecast, GetWeatherForecastOutput } from '@/ai/flows/get-weather-forecast';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';

const iconMap = {
  Cloud,
  Sun,
  CloudRain,
  CloudSun,
  Wind,
  Droplets,
};

const getIcon = (iconName: keyof typeof iconMap, className?: string) => {
  const IconComponent = iconMap[iconName] || Cloud;
  return <IconComponent className={className} />;
};

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export default function WeatherPage() {
  const { t, language } = useTranslation();
  const { userProfile } = useAuth();

  // Initialize state from userProfile if available
  const initialCity = userProfile?.location?.split(',')[0] || "Pune";
  const [city, setCity] = useState(initialCity);
  const [inputCity, setInputCity] = useState(initialCity);
  const [weatherData, setWeatherData] = useState<GetWeatherForecastOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // This effect runs when the component mounts and sets the initial city from the profile
    const profileCity = userProfile?.location?.split(',')[0] || "Pune";
    setCity(profileCity);
    setInputCity(profileCity);
  }, [userProfile]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city) return;
      setIsLoading(true);
      try {
        const data = await getWeatherForecast({ city });
        setWeatherData(data);
        if (data && data.city) {
         setInputCity(data.city); // Sync input with loaded data city
        }
      } catch (error) {
        toast({
          title: t('toast.errorFetchingWeather'),
          description: t('toast.couldNotRetrieveWeather'),
          variant: "destructive",
        });
        setWeatherData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeather();
  }, [city, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
    }
  };
  
  const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({
        title: t('toast.browserNotSupported'),
        description: t('toast.noVoiceSupport'),
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputCity(transcript);
      setCity(transcript); // Automatically trigger search
    };
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 font-headline">{t('weather.title')}</h1>
            <p className="text-muted-foreground">
                {t('weather.description')}
            </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input 
              placeholder={t('weather.enterCity')}
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              className="min-w-[150px] sm:min-w-[200px]"
            />
            <Button type="submit" size="icon" disabled={isLoading || isRecording}>
              <Search className="h-4 w-4"/>
            </Button>
          </form>
          <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={isLoading}>
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">{isRecording ? t('learn.stopRecording') : t('learn.startVoiceSearch')}</span>
          </Button>
           <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
                </Link>
            </Button>
        </div>
      </div>


      {isLoading ? (
        <WeatherSkeleton />
      ) : weatherData ? (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('weather.currentWeather')}</CardTitle>
              <CardDescription>{t('weather.rightNowIn', { city: weatherData.city })}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              {getIcon(weatherData.current.icon as keyof typeof iconMap, "h-24 w-24 text-accent")}
              <div>
                <p className="text-6xl font-bold">{weatherData.current.temperature}</p>
                <p className="text-muted-foreground">{t(`weather.conditions.${weatherData.current.condition}`, {defaultValue: weatherData.current.condition})}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center"><Wind className="mr-2 h-4 w-4" /> {t('weather.wind')}: {weatherData.current.wind}</p>
                <p className="flex items-center"><Droplets className="mr-2 h-4 w-4" /> {t('weather.humidity')}: {weatherData.current.humidity}</p>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4 font-headline">{t('weather.weeklyForecast')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weatherData.forecast.map((day, index) => (
                <Card key={index} className="text-center">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base sm:text-lg">{t(`weather.days.${day.day.toLowerCase()}`, {defaultValue: day.day})}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-2 p-4 pt-0">
                    {getIcon(day.icon as keyof typeof iconMap, "h-10 w-10 text-accent")}
                    <p className="text-xl font-semibold">{day.temp}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(`weather.conditions.${day.condition}`, {defaultValue: day.condition})}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">{t('weather.noData')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


const WeatherSkeleton = () => (
    <>
        <Card className="mb-8">
            <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="flex items-center space-x-8">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-16 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardContent>
        </Card>
        <div>
            <h2 className="text-2xl font-bold mb-4 font-headline">Weekly Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, index) => (
                    <Card key={index} className="text-center">
                        <CardHeader className="p-4">
                           <Skeleton className="h-6 w-1/2 mx-auto" />
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-2 p-4 pt-0">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-4 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </>
);
