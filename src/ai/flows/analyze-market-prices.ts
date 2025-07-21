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
  query: z.string().describe('The user query about market prices, can be voice or text. Should include crop and location.'),
});
export type AnalyzeMarketPricesInput = z.infer<typeof AnalyzeMarketPricesInputSchema>;

const AnalyzeMarketPricesOutputSchema = z.object({
  recommendation: z.string().describe('The recommendation on whether to sell or wait.'),
  analysis: z.string().describe('The analysis of market trends, citing specific prices.'),
});
export type AnalyzeMarketPricesOutput = z.infer<typeof AnalyzeMarketPricesOutputSchema>;

// Mock prices - in a real app this would come from an API call
const mockPriceData: Record<string, Record<string, number>> = {
  tomato: {
    pune: 25,
    mumbai: 30,
    bangalore: 22,
  },
  onion: {
    pune: 15,
    mumbai: 18,
    bangalore: 12,
  },
};

const getMarketPriceTool = ai.defineTool(
  {
    name: 'getMarketPrice',
    description: 'Gets the current market price for a specific crop in a specific city.',
    inputSchema: z.object({
      crop: z.string().describe("The crop to get the price for, e.g., 'tomato', 'onion'."),
      city: z.string().describe("The city to get the price in, e.g., 'Pune', 'Mumbai'."),
    }),
    outputSchema: z.object({
      price: z.number().describe('The price of the crop in the specified city, in INR per kg.'),
    }),
  },
  async ({ crop, city }) => {
    // In a real application, you would use process.env.MARKET_DATA_API_KEY to call a real API here.
    // For now, we'll use mock data.
    const cityKey = city.toLowerCase();
    const cropKey = crop.toLowerCase();
    const price = mockPriceData[cropKey]?.[cityKey] || (Math.random() * 20 + 10); // fallback to random
    return { price: parseFloat(price.toFixed(2)) };
  }
);


export async function analyzeMarketPrices(input: AnalyzeMarketPricesInput): Promise<AnalyzeMarketPricesOutput> {
  return analyzeMarketPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketPricesPrompt',
  input: {schema: AnalyzeMarketPricesInputSchema},
  output: {schema: AnalyzeMarketPricesOutputSchema},
  tools: [getMarketPriceTool],
  prompt: `You are a market analyst providing advice to farmers in India.

  A farmer has the following query: "{{query}}".
  
  First, use the getMarketPrice tool to find the current price for the specified crop and city.
  
  Then, provide a recommendation on whether to sell or wait. 
  
  Finally, provide a brief analysis of the market trends, incorporating the real-time price you fetched. For example, if the price is high, you could say "With tomato prices currently at ₹{price} in {city}, it's a good time to sell."`,
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
