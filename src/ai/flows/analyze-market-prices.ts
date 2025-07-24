
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
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type AnalyzeMarketPricesInput = z.infer<typeof AnalyzeMarketPricesInputSchema>;

const AnalyzeMarketPricesOutputSchema = z.object({
  recommendation: z.string().describe('The recommendation on whether to sell or wait.'),
  analysis: z.string().describe('The analysis of market trends, citing specific prices.'),
});
export type AnalyzeMarketPricesOutput = z.infer<typeof AnalyzeMarketPricesOutputSchema>;


const PriceInfoSchema = z.object({
    crop: z.string().describe("The crop to get the price for, e.g., 'tomato', 'onion'."),
    city: z.string().describe("The city to get the price in, e.g., 'Pune', 'Mumbai'."),
});

// This is an internal-only prompt that extracts structured data from the user's unstructured query.
const extractPriceInfoPrompt = ai.definePrompt({
    name: 'extractPriceInfo',
    input: { schema: z.object({ query: z.string() }) },
    output: { schema: PriceInfoSchema },
    prompt: 'Extract the crop and city from the following user query: "{{query}}"',
});


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
    inputSchema: PriceInfoSchema,
    outputSchema: z.object({
      price: z.number().describe('The price of the crop in the specified city, in INR per kg (or per quintal for grains).'),
    }),
  },
  async ({ crop, city }) => {
    // In a real application, you would use process.env.MARKET_DATA_API_KEY to call a real API here.
    const cityKey = city.toLowerCase();
    const cropKey = crop.toLowerCase().replace(/\s+/g, '');
    const isGrain = ['wheat', 'rice', 'cotton'].includes(cropKey);
    
    // Use mock data or generate a plausible random price as a fallback
    const price = mockPriceData[cropKey]?.[cityKey] || 
        (isGrain 
            ? Math.floor(Math.random() * 1000) + 1500  // Plausible price for grains
            : Math.floor(Math.random() * 40) + 10       // Plausible price for vegetables
        );
    
    return { price: parseFloat(price.toFixed(2)) };
  }
);


export async function analyzeMarketPrices(input: AnalyzeMarketPricesInput): Promise<AnalyzeMarketPricesOutput> {
  return analyzeMarketPricesFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: {
    schema: z.object({
      query: z.string(),
      crop: z.string(),
      city: z.string(),
      price: z.number(),
      language: z.string(),
    }),
  },
  output: {schema: AnalyzeMarketPricesOutputSchema},
  prompt: `You are a market analyst providing advice to farmers in India.
  
  The farmer's preferred language is {{language}}. All of your text output (recommendation, analysis) MUST be in this language.

  A farmer has the following query: "{{query}}".
  
  The current price for {{crop}} in {{city}} is {{price}} INR.
  
  Based on this price and the user's query, provide a recommendation on whether to sell or wait. 
  
  Then, provide a brief analysis of the market situation. For vegetables/fruits, the price is per kg. For grains like wheat and rice, the price is per quintal. Be mindful of this unit difference.
  
  For example, if the price is high, you could say "With tomato prices currently at ₹{price} per kg in {city}, it's a good time to sell." For grains, you might say "Wheat is trading at ₹{price} per quintal in {city}, which is a stable price. You could consider selling a portion of your stock." If the requested language is Hindi, the response should be entirely in Hindi.`,
});

const analyzeMarketPricesFlow = ai.defineFlow(
  {
    name: 'analyzeMarketPricesFlow',
    inputSchema: AnalyzeMarketPricesInputSchema,
    outputSchema: AnalyzeMarketPricesOutputSchema,
  },
  async ({query, language}) => {
    try {
        // 1. Extract structured data (crop, city) from the user's query.
        const { output: priceInfo } = await extractPriceInfoPrompt({query});
        if (!priceInfo) {
            throw new Error("Could not determine the crop and city from your query.");
        }
        
        // 2. Call the tool to get the price for the extracted crop and city.
        const { price } = await getMarketPriceTool(priceInfo);

        // 3. Call the final analysis prompt with all the necessary information.
        const { output: analysisResult } = await analysisPrompt({
            query,
            ...priceInfo,
            price,
            language,
        });
        
        if (!analysisResult) {
            throw new Error("Analysis result was empty.");
        }

        return analysisResult;
    } catch (error) {
        console.error("Error in analyzeMarketPricesFlow: ", error);
        
        const friendlyErrorMessage = {
            en: "The market analysis service is currently overloaded. Please try again in a few moments.",
            hi: "बाजार विश्लेषण सेवा वर्तमान में ओवरलोड है। कृपया कुछ क्षण बाद पुनः प्रयास करें।",
            kn: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ ಸೇವೆ ಪ್ರಸ್ತುತ ಓವರ್‌ಲೋಡ್ ಆಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಲವು ಕ್ಷಣಗಳಲ್ಲಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            bn: "বাজার বিশ্লেষণ পরিষেবা বর্তমানে ওভারলোড। অনুগ্রহ করে কয়েক মুহূর্ত পরে আবার চেষ্টা করুন।",
            bho: "बाजार विश्लेषण सेवा अबही ओवरलोड बा। कुछ देर बाद फेर से कोसिस करीं।"
        };

        const message = friendlyErrorMessage[language as keyof typeof friendlyErrorMessage] || friendlyErrorMessage.en;
        
        // Return a user-friendly error message within the expected schema
        return {
            recommendation: "Service Unavailable",
            analysis: message,
        };
    }
  }
);

    