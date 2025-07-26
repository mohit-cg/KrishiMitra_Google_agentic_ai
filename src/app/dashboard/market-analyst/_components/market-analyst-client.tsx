
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeMarketPrices, type AnalyzeMarketPricesOutput } from '@/ai/flows/analyze-market-prices';
import { generateSpeech } from '@/ai/flows/text-to-speech';
import { Bot, LineChart, Mic, TrendingUp, Volume2, Square, Pause, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/language-context';

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export function MarketAnalystClient() {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalyzeMarketPricesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [activeAudio, setActiveAudio] = useState<{ id: 'recommendation' | 'analysis'; isPlaying: boolean } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    
    // Set language for speech recognition
    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
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
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const playAudio = async (text: string, id: 'recommendation' | 'analysis') => {
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
        description: t('toast.couldNotGenerateAudioAnalysis'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      toast({
        title: t('toast.emptyQuery'),
        description: t('toast.enterMarketQuestion'),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    setActiveAudio(null);
    if (audioRef.current) {
        audioRef.current.pause();
    }


    try {
      const analysisResult = await analyzeMarketPrices({ query, language });
      if (analysisResult.recommendation === "Service Unavailable") {
        setError(analysisResult.analysis);
        setResult(null);
      } else {
        setResult(analysisResult);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = t('toast.errorAnalyzingMarket');
      setError(errorMessage);
      toast({
        title: t('toast.analysisFailed'),
        description: errorMessage,
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
          <CardTitle>{t('marketAnalyst.client.askTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder={t('marketAnalyst.client.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isLoading || isRecording} className="flex-1">
                {isLoading ? t('marketAnalyst.client.analyzing') : t('marketAnalyst.client.getAnalysis')}
              </Button>
               <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={isLoading}>
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span className="sr-only">{isRecording ? t('marketAnalyst.client.stopRecording') : t('marketAnalyst.client.useVoice')}</span>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">{t('marketAnalyst.client.resultTitle')}</h2>
        {isLoading && <LoadingSkeleton />}
        {error && !isLoading && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('toast.analysisFailed')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {result && !isLoading && !error && (
          <div className="space-y-4">
            <Alert>
              <div className="flex justify-between items-center w-full">
                <div className='flex-1'>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>{t('marketAnalyst.client.recommendation')}</AlertTitle>
                  </div>
                  <AlertDescription className='pl-6'>{result.recommendation}</AlertDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => playAudio(result.recommendation, 'recommendation')} disabled={isGeneratingSpeech}>
                    {activeAudio?.id === 'recommendation' && activeAudio.isPlaying ? <Pause className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                </Button>
              </div>
            </Alert>
            <Alert>
              <div className="flex justify-between items-center w-full">
                <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                        <LineChart className="h-4 w-4" />
                        <AlertTitle>{t('marketAnalyst.client.marketAnalysis')}</AlertTitle>
                    </div>
                    <AlertDescription className='pl-6'>{result.analysis}</AlertDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => playAudio(result.analysis, 'analysis')} disabled={isGeneratingSpeech}>
                     {activeAudio?.id === 'analysis' && activeAudio.isPlaying ? <Pause className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                </Button>
              </div>
            </Alert>
          </div>
        )}
        {!result && !isLoading && !error && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardContent>
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('marketAnalyst.client.resultPlaceholder')}</p>
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
