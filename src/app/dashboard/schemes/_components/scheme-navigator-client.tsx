
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
import { useTranslation } from '@/contexts/language-context';

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export function SchemeNavigatorClient() {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<NavigateGovernmentSchemesOutput | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      toast({
        title: t('toast.emptyQuery'),
        description: t('toast.enterSchemeQuestion'),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const schemeResult = await navigateGovernmentSchemes({ query, language });
      setResult(schemeResult);
    } catch (error) {
      console.error(error);
      toast({
        title: t('toast.searchFailed'),
        description: t('toast.errorFetchingScheme'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary"/>
            {t('schemes.client.title')}
        </CardTitle>
        <CardDescription>{t('schemes.client.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Textarea
            placeholder={t('schemes.client.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading || isRecording} className="flex-1">
              {isLoading ? t('schemes.client.searching') : t('schemes.client.findScheme')}
            </Button>
            <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={isLoading}>
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">{isRecording ? t('schemes.client.stopRecording') : t('schemes.client.useVoice')}</span>
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
                    <AlertTitle>{t('schemes.client.eligibility')}</AlertTitle>
                    <AlertDescription>{result.eligibility}</AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                    <Link href={result.applicationLink} target="_blank" rel="noopener noreferrer">
                    {t('schemes.client.applyNow')} <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        )}

        {!result && !isLoading && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <Bot className="mx-auto h-8 w-8 mb-2" />
                <p>{t('schemes.client.resultPlaceholder')}</p>
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
