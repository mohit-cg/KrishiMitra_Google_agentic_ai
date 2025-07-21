"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeMarketPrices, type AnalyzeMarketPricesOutput } from '@/ai/flows/analyze-market-prices';
import { Bot, LineChart, Mic, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function MarketAnalystClient() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeMarketPricesOutput | null>(null);

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
              placeholder="e.g., What are the chances of tomato prices increasing in the next week in Bangalore?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Analyzing..." : "Get Analysis"}
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
        <h2 className="text-2xl font-bold mb-4 font-headline">Analysis Result</h2>
        {isLoading && <LoadingSkeleton />}
        {result && !isLoading && (
          <div className="space-y-4">
            <Alert className="border-accent text-accent-foreground">
              <TrendingUp className="h-4 w-4 text-accent" />
              <AlertTitle>Recommendation</AlertTitle>
              <AlertDescription>{result.recommendation}</AlertDescription>
            </Alert>
            <Alert>
              <LineChart className="h-4 w-4" />
              <AlertTitle>Market Analysis</AlertTitle>
              <AlertDescription>{result.analysis}</AlertDescription>
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
