
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
import { recommendCrops, type RecommendCropsOutput, type RecommendCropsInput } from '@/ai/flows/recommend-crops';
import { Bot, Leaf, Droplets, Sun, Sparkles, AlertCircle, ArrowRight, Mic, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Re-define schema here as it cannot be exported from a 'use server' file.
const RecommendCropsInputClientSchema = z.object({
  location: z.string().min(1, "Location is required."),
  farmType: z.enum(['irrigated', 'rainfed']),
  landSize: z.string().min(1, "Land size is required."),
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
      landSize: '2 acres',
      cropPreference: '',
      language: language,
    }
  });

  useEffect(() => {
    if (userProfile?.location) {
      setValue('location', userProfile.location);
    }
  }, [userProfile, setValue]);

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
      const recommendationResult = await recommendCrops({...data, language});
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

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
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
                            <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-secondary cursor-pointer">
                                <RadioGroupItem value="irrigated" id="irrigated" />
                                <Droplets className="h-4 w-4 text-blue-500"/>
                                {t('cropRecommender.client.irrigated')}
                            </Label>
                             <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-secondary cursor-pointer">
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
                <Input id="landSize" {...register('landSize')} placeholder="e.g., 5 acres"/>
                 <Button type="button" variant={recordingField === 'landSize' ? "destructive" : "outline"} size="icon" onClick={() => handleMicClick('landSize')} disabled={!!recordingField}>
                    {recordingField === 'landSize' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              {errors.landSize && <p className="text-xs text-destructive">{errors.landSize.message}</p>}
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
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t('cropRecommender.client.gettingRecommendations') : t('cropRecommender.client.getRecommendations')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4 font-headline">{t('cropRecommender.client.resultsTitle')}</h2>
        {isLoading && <LoadingSkeleton />}
        
        {result?.recommendations && !isLoading && (
          <div className="space-y-4">
             <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{t('cropRecommender.client.topPicks')}</AlertTitle>
              <AlertDescription>
                {t('cropRecommender.client.topPicksDescription')}
              </AlertDescription>
            </Alert>
            {result.recommendations.map((rec, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 relative min-h-[150px]">
                        <Image src="https://placehold.co/400x300.png" alt={rec.cropName} layout="fill" objectFit="cover" data-ai-hint={rec.imageHint}/>
                    </div>
                    <div className="sm:w-2/3 flex flex-col">
                        <CardHeader>
                            <CardTitle>{rec.cropName}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                        </CardContent>
                        <CardFooter>
                           <Button asChild size="sm">
                                <Link href={`/dashboard/learn?q=${encodeURIComponent(rec.cropName)}`}>
                                   {t('cropRecommender.client.learnMore')} <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                           </Button>
                        </CardFooter>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardContent>
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
      <Card>
        <div className="flex flex-col sm:flex-row">
            <Skeleton className="sm:w-1/3 min-h-[150px]" />
            <div className="sm:w-2/3 p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-28 mt-2" />
            </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col sm:flex-row">
            <Skeleton className="sm:w-1/3 min-h-[150px]" />
            <div className="sm:w-2/3 p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-28 mt-2" />
            </div>
        </div>
      </Card>
    </div>
);

    