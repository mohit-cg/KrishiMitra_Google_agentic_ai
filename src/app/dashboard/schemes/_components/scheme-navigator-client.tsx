
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateGovernmentSchemes, type NavigateGovernmentSchemesOutput } from '@/ai/flows/navigate-government-schemes';
import { Bot, CheckCircle, ExternalLink, Mic, Target, Search, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export function SchemeNavigatorClient() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<NavigateGovernmentSchemesOutput | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter your question about a government scheme.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const schemeResult = await navigateGovernmentSchemes({ query });
      setResult(schemeResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "Search Failed",
        description: "An error occurred while fetching scheme details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
       if (event.error === 'no-speech') {
        toast({
            title: "No Speech Detected",
            description: "Please try again and speak clearly into the microphone.",
            variant: "destructive",
        });
      } else {
        toast({
            title: "Voice Recognition Error",
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


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary"/>
            Find a Specific Scheme
        </CardTitle>
        <CardDescription>Use our AI assistant to get details on any government scheme by asking a question.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Textarea
            placeholder="e.g., Tell me about PM-KISAN scheme"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading || isRecording} className="flex-1">
              {isLoading ? "Searching..." : "Find Scheme"}
            </Button>
            <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={isLoading}>
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">{isRecording ? "Stop Recording" : "Use Voice"}</span>
            </Button>
          </div>
        </form>

        {isLoading && <LoadingSkeleton />}
        
        {result && !isLoading && (
            <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">{result.schemeName}</h3>
                <p className="text-sm text-muted-foreground mb-4">{result.answer}</p>
                <Alert className="mb-4">
                    <Target className="h-4 w-4" />
                    <AlertTitle>Eligibility</AlertTitle>
                    <AlertDescription>{result.eligibility}</AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                    <Link href={result.applicationLink} target="_blank" rel="noopener noreferrer">
                    Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        )}

        {!result && !isLoading && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <Bot className="mx-auto h-8 w-8 mb-2" />
                <p>Ask a question to see scheme details here.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

const LoadingSkeleton = () => (
    <div className="border-t pt-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
);
