
'use server';
/**
 * @fileOverview Recommends crops based on user input.
 *
 * - recommendCrops - A function that handles the crop recommendation process.
 * - RecommendCropsInput - The input type for the recommendCrops function.
 * - RecommendCropsOutput - The return type for the recommendCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const RecommendCropsInputSchema = z.object({
  location: z.string().describe('The user\'s location (e.g., district, state).'),
  farmType: z.enum(['irrigated', 'rainfed']).describe('The type of farm (irrigated or rainfed/dry).'),
  landSize: z.string().describe('The size of the land (e.g., "2 acres").'),
  cropPreference: z.string().optional().describe('Any specific crop preference the user might have.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn").'),
});
export type RecommendCropsInput = z.infer<typeof RecommendCropsInputSchema>;

const RecommendedCropSchema = z.object({
    cropName: z.string().describe("The name of the recommended crop."),
    reasoning: z.string().describe("The detailed reasoning for recommending this crop, considering location, climate, soil, market demand, and water needs."),
    imageHint: z.string().describe("Two keywords for a relevant image of the crop, e.g., 'pearl millet'."),
});

export const RecommendCropsOutputSchema = z.object({
  recommendations: z.array(RecommendedCropSchema).min(2).max(3).describe('A list of 2-3 recommended crops.'),
});
export type RecommendCropsOutput = z.infer<typeof RecommendCropsOutputSchema>;

export async function recommendCrops(input: RecommendCropsInput): Promise<RecommendCropsOutput> {
  return recommendCropsFlow(input);
}

const recommendCropsPrompt = ai.definePrompt({
  name: 'recommendCropsPrompt',
  input: {schema: RecommendCropsInputSchema},
  output: {schema: RecommendCropsOutputSchema},
  prompt: `You are an expert agricultural advisor in India. Your task is to recommend 2-3 suitable crops for a farmer based on their specific inputs.

  The farmer's preferred language is {{language}}. All of your text output (cropName, reasoning) MUST be in this language.

  Farmer's Details:
  - Location: {{location}}
  - Farm Type: {{farmType}} (This indicates water availability)
  - Land Size: {{landSize}}
  - Optional Crop Preference: {{#if cropPreference}}{{cropPreference}}{{else}}None{{/if}}

  Your recommendations must be well-reasoned. For each recommended crop, provide the following:
  1.  **cropName**: The name of the crop.
  2.  **reasoning**: A detailed explanation. Justify your choice by considering the location's typical climate and soil, the crop's water requirements (especially in relation to the farm type), market demand, and suitability for the land size. If the user had a preference, address it in your reasoning.
  3.  **imageHint**: Two keywords for a relevant image of the crop.

  Generate a list of 2 to 3 diverse and practical crop recommendations.
  `,
});

const recommendCropsFlow = ai.defineFlow(
  {
    name: 'recommendCropsFlow',
    inputSchema: RecommendCropsInputSchema,
    outputSchema: RecommendCropsOutputSchema,
  },
  async input => {
    const {output} = await recommendCropsPrompt(input);
    return output!;
  }
);
