
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recommendCrops, type RecommendCropsOutput } from '@/ai/flows/recommend-crops';
import { Bot, Leaf, Droplets, Sun, Sparkles, ArrowRight, Mic, Square, CheckCircle, CalendarDays, Wheat, Carrot, Grape } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';


const iconMap = {
  Leaf: <Leaf className="h-8 w-8 text-primary" />,
  Sprout: <Icons.sprout className="h-8 w-8 text-primary" />,
  Carrot: <Carrot className="h-8 w-8 text-primary" />,
  Wheat: <Wheat className="h-8 w-8 text-primary" />,
  Grape: <Grape className="h-8 w-8 text-primary" />,
};
type CropIcon = keyof typeof iconMap;


// Cannot be imported from a 'use server' file.
const RecommendCropsInputClientSchema = z.object({
  location: z.string().min(1, "Location is required."),
  farmType: z.enum(['irrigated', 'rainfed']),
  landSize: z.string().min(1, "Land size is required."),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  season: z.string().optional(),
  previousCrop: z.string().optional(),
  budget: z.string().optional(),
  cropPreference: z.string().optional(),
  language: z.string(),
});

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

type RecommendationFormValues = z.infer<typeof RecommendCropsInputClientSchema>;

export function CropRecommenderClient() {
  const { t, language } = useTranslation();
  const { userProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendCropsOutput | null>(null);
  const [recordingField, setRecordingField] = useState<keyof RecommendationFormValues | null>(null);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<RecommendationFormValues>({
    resolver: zodResolver(RecommendCropsInputClientSchema),
    defaultValues: {
      location: '',
      farmType: 'irrigated',
      landSize: '',
      soilType: '',
      waterSource: '',
      season: 'kharif',
      previousCrop: '',
      budget: '',
      cropPreference: '',
      language: language,
    }
  });

  useEffect(() => {
    if (userProfile?.location) {
      setValue('location', userProfile.location);
    }
    setValue('language', language);
  }, [userProfile, setValue, language]);

  const handleMicClick = (field: keyof RecommendationFormValues) => {
    if (!SpeechRecognition) {
      toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setRecordingField(field);
    recognition.onresult = (event) => setValue(field, event.results[0][0].transcript);
    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            toast({ title: t('toast.noSpeechDetected'), description: t('toast.tryAgain'), variant: "destructive" });
        } else {
            toast({ title: t('toast.voiceError'), description: event.error, variant: "destructive" });
        }
    };
    recognition.onend = () => setRecordingField(null);

    recognition.start();
  };

  const onSubmit = async (data: RecommendationFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const recommendationResult = await recommendCrops(data);
      setResult(recommendationResult);
    } catch (error) {
      console.error(error);
      toast({
        title: t('toast.recommendationFailed'),
        description: t('toast.errorGeneratingRecommendation'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const soilTypes = ["black", "red", "loamy", "sandy", "clay"];
  const waterSources = ["borewell", "canal", "rain-only", "tank", "river"];
  const seasons = ["kharif", "rabi", "zaid"];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <Card className="lg:col-span-4 xl:col-span-3">
        <CardHeader>
          <CardTitle>{t('cropRecommender.client.formTitle')}</CardTitle>
          <CardDescription>{t('cropRecommender.client.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="location">{t('profile.location')}</Label>
              <Input id="location" {...register('location')} />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>

            <div>
                <Label>{t('cropRecommender.client.farmType')}</Label>
                <Controller
                    name="farmType"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-2">
                            <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-secondary cursor-pointer flex-1">
                                <RadioGroupItem value="irrigated" id="irrigated" />
                                <Droplets className="h-4 w-4 text-blue-500"/>
                                {t('cropRecommender.client.irrigated')}
                            </Label>
                             <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-secondary cursor-pointer flex-1">
                                <RadioGroupItem value="rainfed" id="rainfed" />
                                <Sun className="h-4 w-4 text-orange-500"/>
                                {t('cropRecommender.client.rainfed')}
                            </Label>
                        </RadioGroup>
                    )}
                />
            </div>
             <div>
              <Label htmlFor="landSize">{t('cropRecommender.client.landSize')}</Label>
              <div className="flex items-center gap-2">
                <Input id="landSize" {...register('landSize')} placeholder="e.g., 2 acres"/>
                 <Button type="button" variant={recordingField === 'landSize' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('landSize')} disabled={!!recordingField}>
                    {recordingField === 'landSize' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              {errors.landSize && <p className="text-xs text-destructive">{errors.landSize.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="soilType">{t('cropRecommender.client.soilType')}</Label>
                    <Controller name="soilType" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder={t('cropRecommender.client.selectSoilType')} /></SelectTrigger>
                            <SelectContent>
                                {soilTypes.map(type => <SelectItem key={type} value={type}>{t(`cropRecommender.client.soilTypes.${type}`)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                </div>
                <div>
                    <Label htmlFor="waterSource">{t('cropRecommender.client.waterSource')}</Label>
                    <Controller name="waterSource" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder={t('cropRecommender.client.selectWaterSource')} /></SelectTrigger>
                            <SelectContent>
                                {waterSources.map(type => <SelectItem key={type} value={type}>{t(`cropRecommender.client.waterSources.${type}`)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                </div>
            </div>

             <div>
                <Label htmlFor="season">{t('cropRecommender.client.currentSeason')}</Label>
                <Controller name="season" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select a season" /></SelectTrigger>
                        <SelectContent>
                            {seasons.map(type => <SelectItem key={type} value={type}>{t(`cropRecommender.client.seasons.${type}`)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )} />
            </div>

            <div>
              <Label htmlFor="previousCrop">{t('cropRecommender.client.previousCrop')}</Label>
               <div className="flex items-center gap-2">
                <Input id="previousCrop" {...register('previousCrop')} placeholder="e.g., Wheat"/>
                 <Button type="button" variant={recordingField === 'previousCrop' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('previousCrop')} disabled={!!recordingField}>
                    {recordingField === 'previousCrop' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>

             <div>
              <Label htmlFor="budget">{t('cropRecommender.client.budget')}</Label>
               <div className="flex items-center gap-2">
                <Input id="budget" {...register('budget')} placeholder="e.g., 10,000 INR"/>
                 <Button type="button" variant={recordingField === 'budget' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('budget')} disabled={!!recordingField}>
                    {recordingField === 'budget' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="cropPreference">{t('cropRecommender.client.cropPreference')}</Label>
               <div className="flex items-center gap-2">
                <Input id="cropPreference" {...register('cropPreference')} placeholder={t('cropRecommender.client.cropPreferencePlaceholder')}/>
                 <Button type="button" variant={recordingField === 'cropPreference' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('cropPreference')} disabled={!!recordingField}>
                    {recordingField === 'cropPreference' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full !mt-6">
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? t('cropRecommender.client.gettingRecommendations') : t('cropRecommender.client.getRecommendations')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-8 xl:col-span-9">
        <h2 className="text-2xl font-bold mb-4 font-headline">{t('cropRecommender.client.resultsTitle')}</h2>
        
        {result?.recommendations && !isLoading && (
          <div className="space-y-4">
             <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{t('cropRecommender.client.topPicks')}</AlertTitle>
              <AlertDescription>
                {t('cropRecommender.client.topPicksDescription')}
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {result.recommendations.map((rec, index) => (
                <Card key={index} className="overflow-hidden flex flex-col">
                    <div className="relative w-full h-40">
                        <Image src={`https://placehold.co/400x300.png`} alt={rec.cropName} layout="fill" objectFit="cover" data-ai-hint={rec.imageHint} />
                    </div>
                    <CardHeader className="flex flex-row items-start gap-4">
                        {iconMap[rec.icon as CropIcon] || iconMap.Leaf}
                        <div className='flex-1'>
                            <CardTitle>{rec.cropName}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <CalendarDays className="h-4 w-4" />
                                <span>{rec.plantingDates}</span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <h4 className="font-semibold mb-2">{t('cropRecommender.client.keyBenefits')}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {rec.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild size="sm" className="w-full">
                            <Link href={`/dashboard/learn?q=${encodeURIComponent(rec.cropName)}`}>
                                {t('cropRecommender.client.learnMore')} <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
          </div>
        )}

        {isLoading && <LoadingSkeleton />}

        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[50vh]">
            <CardContent className='p-0'>
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('cropRecommender.client.resultsPlaceholder')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {Array.from({length: 3}).map((_, index) => (
             <Card key={index} className="overflow-hidden flex flex-col">
                <Skeleton className="h-40 w-full" />
                <CardHeader className="flex flex-row items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className='flex-1 space-y-2'>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    <Skeleton className="h-5 w-1/3" />
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                     </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-9 w-full" />
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
);
