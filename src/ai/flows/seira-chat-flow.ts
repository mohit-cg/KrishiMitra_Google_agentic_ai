'use server';

/**
 * @fileOverview The main AI flow for the Seira chatbot assistant.
 *
 * - seiraChat - Analyzes user query to determine intent and entities.
 * - SeiraChatInput - The input type for the seiraChat function.
 * - SeiraChatOutput - The return type for the seiraChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeiraChatInputSchema = z.object({
  query: z.string().describe('The user\'s message to the chatbot.'),
  language: z.string().describe('The language of the user\'s query (e.g., "en", "hi", "kn").'),
});
export type SeiraChatInput = z.infer<typeof SeiraChatInputSchema>;


const SeiraChatOutputSchema = z.object({
  response: z.string().describe("A helpful, conversational response to the user's query, in their specified language."),
  intent: z.enum([
      'navigate_dashboard',
      'navigate_crop_doctor',
      'navigate_market_analyst',
      'navigate_schemes',
      'navigate_weather',
      'navigate_community',
      'navigate_shop',
      'navigate_learn',
      'navigate_tracker',
      'navigate_recommender',
      'navigate_profile',
      'navigate_settings',
      'query_market_prices',
      'query_schemes',
      'query_crop_recommendation',
      'general_question',
      'form_filling_help',
      'unknown'
  ]).describe("The user's primary goal or intent."),
  entities: z.object({
      crop: z.string().optional().describe("The crop name mentioned, e.g., 'tomato'."),
      city: z.string().optional().describe("The city name mentioned, e.g., 'pune'."),
      topic: z.string().optional().describe("The general topic mentioned, e.g., 'fertilizer'."),
  }).optional().describe("A map of extracted entities from the query."),
});
export type SeiraChatOutput = z.infer<typeof SeiraChatOutputSchema>;

export async function seiraChat(input: SeiraChatInput): Promise<SeiraChatOutput> {
  return seiraChatFlow(input);
}

const seiraPrompt = ai.definePrompt({
  name: 'seiraPrompt',
  input: {schema: SeiraChatInputSchema},
  output: {schema: SeiraChatOutputSchema},
  prompt: `You are Seira, a friendly and helpful AI farming assistant for KrishiMitra AI. Your goal is to understand what the user wants to do and provide a helpful response.

  The user is interacting with you in '{{language}}'. Your response must be in this language.

  Analyze the user's query: "{{query}}"

  Determine the user's intent from the following list:
  - navigate_dashboard: User wants to go to the main dashboard.
  - navigate_crop_doctor: User wants to use the crop diagnosis tool.
  - navigate_market_analyst: User wants to check market prices.
  - navigate_schemes: User wants to find government schemes.
  - navigate_weather: User wants to check the weather forecast.
  - navigate_community: User wants to visit the community forum.
  - navigate_shop: User wants to buy farming products.
  - navigate_learn: User wants to access learning materials.
  - navigate_tracker: User wants to manage their expenses.
  - navigate_recommender: User wants crop recommendations.
  - navigate_profile: User wants to see their profile.
  - navigate_settings: User wants to change settings.
  - query_market_prices: User is asking a specific question about market prices (e.g., "what is the price of onions?").
  - query_schemes: User is asking a specific question about a government scheme.
  - query_crop_recommendation: User is asking for a crop recommendation.
  - form_filling_help: User is asking for help on how to fill a form (e.g., "how do I enter my land size?").
  - general_question: The user has a general agricultural question that doesn't fit other categories.
  - unknown: The user's intent is unclear or not related to the app's functions.

  If the intent is to query something specific (like market prices), extract relevant entities (e.g., crop name, city).

  Based on the intent, formulate a helpful response. 
  - For navigation, confirm you understand and tell them you can take them there (e.g., "I can take you to the Crop Doctor page. Shall we go?").
  - For specific queries, provide a direct answer or state you are looking up the information.
  - For general questions, provide a friendly, helpful answer.
  - If the intent is unknown, politely say you can't help with that and list some things you can do.
  `,
});

const seiraChatFlow = ai.defineFlow(
  {
    name: 'seiraChatFlow',
    inputSchema: SeiraChatInputSchema,
    outputSchema: SeiraChatOutputSchema,
  },
  async input => {
    const {output} = await seiraPrompt(input);
    return output!;
  }
);
