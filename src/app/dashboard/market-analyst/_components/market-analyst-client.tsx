
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeMarketPrices, type AnalyzeMarketPricesOutput } from '@/ai/flows/analyze-market-prices';
import { generateSpeech } from '@/ai/flows/text-to-speech';
import { Bot, LineChart, Mic, TrendingUp, Volume2, Square } from 'lucide-react';
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup audio object URL
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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

  const playAudio = (text: string) => {
    if (isSpeaking) {
      // Logic to stop audio would go here if we were using an Audio element directly
      setIsSpeaking(false);
      if(audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      return;
    }

    setIsSpeaking(true);
    generateSpeech(text)
      .then(response => {
        if(response.media) {
            const audio = new Audio(response.media);
            audio.play();
            audio.onended = () => {
                setIsSpeaking(false);
                setAudioUrl(null); // Clean up after playing
            };
            // To allow stopping, we'd need to manage the audio element in state.
            // For simplicity, we'll just let it play out.
        } else {
            setIsSpeaking(false);
        }
      })
      .catch(error => {
        console.error("Speech generation failed", error);
        toast({
          title: "Speech Generation Failed",
          description: "Could not generate audio for the analysis.",
          variant: "destructive",
        });
        setIsSpeaking(false);
      });
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
    setAudioUrl(null);
    if(isSpeaking) setIsSpeaking(false);

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
                <Button variant="ghost" size="icon" onClick={() => playAudio(result.recommendation)} disabled={isSpeaking}>
                    <Volume2 className="h-5 w-5 text-accent"/>
                </Button>
              </div>
            </Alert>
            <Alert>
              <div className="flex justify-between items-center w-full">
                <div>
                    <AlertTitle>Market Analysis</AlertTitle>
                    <AlertDescription>{result.analysis}</AlertDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => playAudio(result.analysis)} disabled={isSpeaking}>
                    <Volume2 className="h-5 w-5"/>
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
