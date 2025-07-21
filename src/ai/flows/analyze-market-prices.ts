'use server';

/**
 * @fileOverview Market price analysis flow.
 *
 * - analyzeMarketPrices - Analyzes market prices and recommends whether to sell or wait.
 * - AnalyzeMarketPricesInput - The input type for the analyzeMarketPrices function.
 * - AnalyzeMarketPricesOutput - The return type for the analyzeMarketPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMarketPricesInputSchema = z.object({
  query: z.string().describe('The user query about market prices, can be voice or text.'),
});
export type AnalyzeMarketPricesInput = z.infer<typeof AnalyzeMarketPricesInputSchema>;

const AnalyzeMarketPricesOutputSchema = z.object({
  recommendation: z.string().describe('The recommendation on whether to sell or wait.'),
  analysis: z.string().describe('The analysis of market trends.'),
});
export type AnalyzeMarketPricesOutput = z.infer<typeof AnalyzeMarketPricesOutputSchema>;

export async function analyzeMarketPrices(input: AnalyzeMarketPricesInput): Promise<AnalyzeMarketPricesOutput> {
  return analyzeMarketPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketPricesPrompt',
  input: {schema: AnalyzeMarketPricesInputSchema},
  output: {schema: AnalyzeMarketPricesOutputSchema},
  prompt: `You are a market analyst providing advice to farmers.

  Analyze the following query about market prices and provide a recommendation on whether to sell or wait. Also, provide a brief analysis of the market trends.

  Query: {{{query}}}

  Recommendation:
  Analysis:`,
});

const analyzeMarketPricesFlow = ai.defineFlow(
  {
    name: 'analyzeMarketPricesFlow',
    inputSchema: AnalyzeMarketPricesInputSchema,
    outputSchema: AnalyzeMarketPricesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
