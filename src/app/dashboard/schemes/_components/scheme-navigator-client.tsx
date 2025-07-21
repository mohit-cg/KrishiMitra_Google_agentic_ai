"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateGovernmentSchemes, type NavigateGovernmentSchemesOutput } from '@/ai/flows/navigate-government-schemes';
import { Bot, CheckCircle, ExternalLink, Mic, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function SchemeNavigatorClient() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Find a Government Scheme</CardTitle>
          <CardDescription>Ask a question to find relevant schemes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="e.g., Tell me about PM-KISAN scheme"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Searching..." : "Find Scheme"}
              </Button>
               <Button type="button" variant="outline" size="icon" disabled={isLoading}>
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Use Voice</span>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Scheme Details</h2>
        {isLoading && <LoadingSkeleton />}
        {result && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>{result.schemeName}</CardTitle>
              <CardDescription>{result.answer}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertTitle>Eligibility</AlertTitle>
                <AlertDescription>{result.eligibility}</AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href={result.applicationLink} target="_blank">
                  Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardContent>
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Scheme details will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
);
