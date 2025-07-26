
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

const RecommendCropsInputSchema = z.object({
  location: z.string().describe("The user's location (e.g., district, state)."),
  farmType: z.enum(['irrigated', 'rainfed']).describe('The type of farm (irrigated or rainfed/dry).'),
  landSize: z.string().describe('The size of the land (e.g., "2 acres").'),
  soilType: z.string().optional().describe('The type of soil (e.g., "black soil", "red soil").'),
  waterSource: z.string().optional().describe('The primary source of water (e.g., "borewell", "canal", "rain-only").'),
  season: z.string().optional().describe('The current farming season (e.g., "Kharif", "Rabi").'),
  previousCrop: z.string().optional().describe('The crop grown in the previous season.'),
  budget: z.string().optional().describe('The approximate budget for cultivation.'),
  cropPreference: z.string().optional().describe('Any specific crop preference the user might have.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type RecommendCropsInput = z.infer<typeof RecommendCropsInputSchema>;

const RecommendedCropSchema = z.object({
    cropName: z.string().describe("The name of the recommended crop."),
    reasoning: z.string().describe("The detailed reasoning for recommending this crop, considering location, climate, soil, market demand, and water needs."),
    imageHint: z.string().describe("Two or three specific keywords for a relevant image of the crop, e.g., 'pearl millet farm', 'ripe cotton crop', 'sugarcane field'."),
});

const RecommendCropsOutputSchema = z.object({
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
  prompt: `You are an expert agricultural advisor in India. Your task is to recommend 2-3 profitable and suitable crops for a farmer based on their specific inputs.

  The farmer's preferred language is {{language}}. All of your text output (cropName, reasoning) MUST be in this language.

  Farmer's Details:
  - Location: {{location}}
  - Farm Type: {{farmType}}
  - Land Size: {{landSize}}
  - Soil Type: {{#if soilType}}{{soilType}}{{else}}Not specified{{/if}}
  - Water Source: {{#if waterSource}}{{waterSource}}{{else}}Not specified{{/if}}
  - Season: {{#if season}}{{season}}{{else}}Not specified{{/if}}
  - Previous Crop: {{#if previousCrop}}{{previousCrop}} (Suggest crops that are good for rotation){{else}}Not specified{{/if}}
  - Budget: {{#if budget}}{{budget}}{{else}}Not specified{{/if}}
  - Farmer's Crop Preference: {{#if cropPreference}}{{cropPreference}}{{else}}None{{/if}}

  Your recommendations must be well-reasoned. For each recommended crop, provide the following:
  1.  **cropName**: The name of the crop.
  2.  **reasoning**: A detailed explanation. Justify your choice by considering all the farmer's details provided above. Analyze how the location's climate, soil type, water source, season, budget, and crop rotation principles make the crop a suitable choice. Also factor in general market demand. If the farmer had a preference, address it in your reasoning.
  3.  **imageHint**: Two or three specific keywords for a relevant image of the crop. For example, for a pearl millet recommendation, the hint could be "pearl millet farm". For cotton, it could be "ripe cotton crop".

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
    try {
        const {output} = await recommendCropsPrompt(input);
        // Ensure output is not null, and recommendations is an array.
        // Return a default empty array if the output is not as expected.
        return output || { recommendations: [] };
    } catch (error) {
        console.error("Error in recommendCropsFlow: ", error);
        // Return a friendly error response within the expected schema
        return { recommendations: [] };
    }
  }
);
