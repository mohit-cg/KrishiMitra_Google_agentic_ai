
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeMarketPrices, type AnalyzeMarketPricesOutput } from '@/ai/flows/analyze-market-prices';
import { generateSpeech } from '@/ai/flows/text-to-speech';
import { Bot, LineChart, Mic, TrendingUp, Volume2, Square, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export function MarketAnalystClient() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalyzeMarketPricesOutput | null>(null);
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
        title: "Browser Not Supported",
        description: "Your browser does not support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Set to Indian English for better accuracy

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event) => {
      toast({
        title: "Voice Recognition Error",
        description: event.error,
        variant: "destructive",
      });
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
      const response = await generateSpeech(text);
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
        title: "Speech Generation Failed",
        description: "Could not generate audio for the analysis.",
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
        title: "Empty Query",
        description: "Please enter your question about market prices.",
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
      const analysisResult = await analyzeMarketPrices({ query });
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the market data. Please try again.",
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
          <CardTitle>Ask Your Market Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="e.g., What are the chances of tomato prices increasing in the next week in Bangalore? Or click the mic to speak."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isLoading || isRecording} className="flex-1">
                {isLoading ? "Analyzing..." : "Get Analysis"}
              </Button>
               <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={isLoading}>
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span className="sr-only">{isRecording ? "Stop Recording" : "Use Voice"}</span>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Analysis Result</h2>
        {isLoading && <LoadingSkeleton />}
        {result && !isLoading && (
          <div className="space-y-4">
            <Alert className="border-accent text-accent-foreground">
              <div className="flex justify-between items-center w-full">
                <div>
                  <AlertTitle>Recommendation</AlertTitle>
                  <AlertDescription>{result.recommendation}</AlertDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => playAudio(result.recommendation, 'recommendation')} disabled={isGeneratingSpeech}>
                    {activeAudio?.id === 'recommendation' && activeAudio.isPlaying ? <Pause className="h-5 w-5 text-accent"/> : <Volume2 className="h-5 w-5 text-accent"/>}
                </Button>
              </div>
            </Alert>
            <Alert>
              <div className="flex justify-between items-center w-full">
                <div>
                    <AlertTitle>Market Analysis</AlertTitle>
                    <AlertDescription>{result.analysis}</AlertDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => playAudio(result.analysis, 'analysis')} disabled={isGeneratingSpeech}>
                     {activeAudio?.id === 'analysis' && activeAudio.isPlaying ? <Pause className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                </Button>
              </div>
            </Alert>
          </div>
        )}
        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardContent>
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Your market analysis will appear here.</p>
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
