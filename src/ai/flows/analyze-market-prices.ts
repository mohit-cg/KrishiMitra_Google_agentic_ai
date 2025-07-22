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

// Mock prices - in a real app this would come from an API call.
// This is an expanded, more realistic dataset.
const mockPriceData: Record<string, Record<string, number>> = {
  tomato: {
    pune: 28,
    mumbai: 35,
    bangalore: 25,
    delhi: 30,
    kolkata: 32,
    chennai: 27,
    lucknow: 26,
    jaipur: 29,
  },
  onion: {
    pune: 18,
    mumbai: 22,
    bangalore: 16,
    delhi: 20,
    nashik: 15,
    indore: 17,
    kolkata: 25,
    hyderabad: 19,
  },
  potato: {
    pune: 20,
    mumbai: 24,
    bangalore: 22,
    delhi: 18,
    kolkata: 19,
    lucknow: 15,
    agra: 14,
    shimla: 25,
  },
  wheat: {
    delhi: 2100,
    pune: 2300,
    ludhiana: 1950,
    kanpur: 2050,
    indore: 2000,
    mumbai: 2400,
  },
  rice: {
    kolkata: 3500,
    delhi: 3800,
    chennai: 3600,
    mumbai: 4000,
    lucknow: 3400,
    hyderabad: 3700,
  },
  sugarcane: {
    pune: 300,
    lucknow: 315,
    kolhapur: 320,
    meerut: 310,
  },
  cotton: {
    ahmedabad: 5500,
    mumbai: 5800,
    guntur: 5600,
    aurangabad: 5400,
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
      price: z.number().describe('The price of the crop in the specified city, in INR per kg (or per quintal for grains).'),
    }),
  },
  async ({ crop, city }) => {
    // In a real application, you would use process.env.MARKET_DATA_API_KEY to call a real API here.
    // For now, we'll use our expanded mock data.
    const cityKey = city.toLowerCase();
    const cropKey = crop.toLowerCase().replace(/\s+/g, ''); // a simple normalization
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
  
  First, use the getMarketPrice tool to find the current price for the specified crop and city. The tool will return price per kg for vegetables/fruits and price per quintal for grains like wheat and rice. Be mindful of this unit difference in your analysis.
  
  Then, provide a recommendation on whether to sell or wait. 
  
  Finally, provide a brief analysis of the market trends, incorporating the real-time price you fetched. For example, if the price is high, you could say "With tomato prices currently at ₹{price} per kg in {city}, it's a good time to sell." For grains, you might say "Wheat is trading at ₹{price} per quintal in {city}, which is a stable price. You could consider selling a portion of your stock."`,
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
