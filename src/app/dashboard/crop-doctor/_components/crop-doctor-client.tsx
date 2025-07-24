
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { diagnoseCropDisease, type DiagnoseCropDiseaseOutput, DiagnoseCropDiseaseInput } from '@/ai/flows/diagnose-crop-disease';
import { generateSpeech } from '@/ai/flows/text-to-speech';
import { Leaf, Lightbulb, Upload, Volume2, Pause, BookOpen, Youtube, FileUp, Mic, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/language-context';

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export function CropDoctorClient() {
  const { t, language } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [activeAudio, setActiveAudio] = useState<{ id: 'diagnosis' | 'solutions'; isPlaying: boolean } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Cleanup audio element and its event listeners
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
   const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', bn: 'bn-IN', bho: 'bho-IN' };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => setDescription(event.results[0][0].transcript);
    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            toast({ title: t('toast.noSpeechDetected'), description: t('toast.tryAgain'), variant: "destructive" });
        } else {
            toast({ title: t('toast.voiceError'), description: event.error, variant: "destructive" });
        }
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };


  const playAudio = async (text: string, id: 'diagnosis' | 'solutions') => {
    // If this audio is already playing, pause it
    if (activeAudio?.id === id && activeAudio.isPlaying) {
      audioRef.current?.pause();
      setActiveAudio({ ...activeAudio, isPlaying: false });
      return;
    }
    
    // If another audio is playing, pause it before starting the new one
    if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
    }
    
    // If we're resuming a paused audio
    if (activeAudio?.id === id && !activeAudio.isPlaying) {
        audioRef.current?.play();
        setActiveAudio({ ...activeAudio, isPlaying: true });
        return;
    }

    // Otherwise, generate new audio
    setIsGeneratingSpeech(true);
    setActiveAudio(null);
    try {
      const response = await generateSpeech({ text, language });
      if (response.media) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => {
            setActiveAudio((current) => current ? { ...current, isPlaying: false } : null);
          };
          audioRef.current.onpause = () => {
             setActiveAudio((current) => current ? { ...current, isPlaying: false } : null);
          };
          audioRef.current.onplay = () => {
            setActiveAudio((current) => current ? { ...current, isPlaying: true } : null);
          };
        }
        audioRef.current.src = response.media;
        audioRef.current.play();
        setActiveAudio({ id, isPlaying: true });
      }
    } catch (error) {
      console.error("Speech generation failed", error);
      toast({
        title: t('toast.speechGenerationFailed'),
        description: t('toast.couldNotGenerateAudio'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageData && !description.trim()) {
      toast({
        title: t('toast.noInput'),
        description: t('toast.provideImageOrDescription'),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setActiveAudio(null);
    if (audioRef.current) {
        audioRef.current.pause();
    }
    try {
      const requestData: DiagnoseCropDiseaseInput = {
        description: description.trim(),
        language,
      };
      if (imageData) {
        requestData.photoDataUri = imageData;
      }
      
      const diagnosisResult = await diagnoseCropDisease(requestData);
      setResult(diagnosisResult);
    } catch (error) {
      console.error(error);
      toast({
        title: t('toast.diagnosisFailed'),
        description: t('toast.errorAnalyzingImage'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('cropDoctor.client.uploadTitle')}</CardTitle>
          <CardDescription>{t('cropDoctor.client.uploadDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="crop-image">{t('cropDoctor.client.imageLabel')}</Label>
            <Input id="crop-image" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                <FileUp className="mr-2 h-4 w-4" />
                {imagePreview ? t('cropDoctor.client.changeFile') : t('cropDoctor.client.chooseFile')}
            </Button>
          </div>

          {imagePreview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <Image src={imagePreview} alt={t('cropDoctor.client.cropPreview')} layout="fill" objectFit="cover" />
            </div>
          )}
          
           <div className="space-y-2">
              <Label htmlFor="description">{t('cropDoctor.client.descriptionLabel')}</Label>
              <div className="relative">
                <Textarea
                    id="description"
                    placeholder={t('cropDoctor.client.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="pr-10"
                />
                <Button 
                    type="button" 
                    variant={isRecording ? "destructive" : "ghost"} 
                    size="icon" 
                    onClick={handleMicClick}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">{isRecording ? t('community.stopRecording') : t('community.startRecording')}</span>
                </Button>
              </div>
            </div>

          <Button onClick={handleSubmit} disabled={isLoading || (!imageData && !description.trim())} className="w-full">
            {isLoading ? t('cropDoctor.client.diagnosing') : t('cropDoctor.client.diagnoseButton')}
          </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">{t('cropDoctor.client.resultTitle')}</h2>
        {isLoading && <LoadingSkeleton />}
        {result && !isLoading && (
          <div className="space-y-4">
            <Alert>
              <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                     <Leaf className="h-4 w-4" />
                     <AlertTitle>{t('cropDoctor.client.diagnosis')}</AlertTitle>
                  </div>
                  <AlertDescription className="pl-6">{result.diagnosis}</AlertDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => playAudio(result.diagnosis, 'diagnosis')} disabled={isGeneratingSpeech}>
                    {activeAudio?.id === 'diagnosis' && activeAudio.isPlaying ? <Pause className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                </Button>
              </div>
            </Alert>
            <Alert>
               <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>{t('cropDoctor.client.solutions')}</AlertTitle>
                  </div>
                  <AlertDescription className="pl-6">
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: result.solutions.replace(/\n/g, '<br />') }} />
                  </AlertDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => playAudio(result.solutions.replace(/<[^>]*>?/gm, ''), 'solutions')} disabled={isGeneratingSpeech}>
                    {activeAudio?.id === 'solutions' && activeAudio.isPlaying ? <Pause className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                </Button>
              </div>
               {result.isPlant && (result.documentationLink || result.youtubeLink) && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                    {result.documentationLink && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={result.documentationLink} target="_blank" rel="noopener noreferrer">
                                <BookOpen className="mr-2 h-4 w-4"/>
                                {t('cropDoctor.client.readDocs')}
                            </Link>
                        </Button>
                    )}
                    {result.youtubeLink && (
                         <Button asChild variant="destructive" size="sm">
                            <Link href={result.youtubeLink} target="_blank" rel="noopener noreferrer">
                                <Youtube className="mr-2 h-4 w-4"/>
                                {t('cropDoctor.client.watchVideo')}
                            </Link>
                        </Button>
                    )}
                </div>
               )}
            </Alert>
          </div>
        )}
        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardContent>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('cropDoctor.client.resultPlaceholder')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
);

    