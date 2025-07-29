
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
    icon: z.enum(['Leaf', 'Sprout', 'Carrot', 'Wheat', 'Grape']).describe("A relevant Lucide icon name from the provided list for the crop. Use 'Leaf' as a default."),
    plantingDates: z.string().describe("Recommended planting date range for the specified season and location, e.g., 'June 15 - July 30'."),
    reasoning: z.string().min(1).describe("A short, one-sentence reason why this crop is a good choice, e.g., 'It is well-suited for your location's climate and has high market demand.'"),
    benefits: z.array(z.string()).min(2).max(3).describe("A list of 2-3 key benefits of growing this crop, e.g., 'High market demand', 'Drought resistant'."),
    imageHint: z.string().describe("Two or three specific keywords for a relevant image of the crop, e.g., 'pearl millet farm', 'ripe cotton crop', 'sugarcane field'."),
});

const RecommendCropsOutputSchema = z.object({
  recommendations: z.array(RecommendedCropSchema).length(3).describe('A list of exactly 3 recommended crops.'),
});
export type RecommendCropsOutput = z.infer<typeof RecommendCropsOutputSchema>;

export async function recommendCrops(input: RecommendCropsInput): Promise<RecommendCropsOutput> {
  return recommendCropsFlow(input);
}

const recommendCropsPrompt = ai.definePrompt({
  name: 'recommendCropsPrompt',
  input: {schema: RecommendCropsInputSchema},
  output: {schema: RecommendCropsOutputSchema},
  prompt: `You are an expert agricultural advisor in India. Your task is to recommend exactly 3 profitable and suitable crops for a farmer based on their specific inputs.

  The farmer's preferred language is {{language}}. All of your text output (cropName, reasoning, benefits) MUST be in this language.

  Farmer's Details:
  - Location: {{location}}
  - Farm Type: {{farmType}}
  - Land Size: {{landSize}}
  - Soil Type: {{#if soilType}}{{soilType}}{{else}}Not specified{{/if}}
  - Water Source: {{#if waterSource}}{{waterSource}}{{else}}Not specified{{/if}}
  - Season: {{#if season}}{{season}}{{else}}Not specified{{/if}}
  - Previous Crop: {{#if previousCrop}} (Suggest crops that are good for rotation with {{previousCrop}}){{else}}Not specified{{/if}}
  - Budget: {{#if budget}}{{budget}}{{else}}Not specified{{/if}}
  - Farmer's Crop Preference: {{#if cropPreference}}{{cropPreference}}{{else}}None{{/if}}

  Your recommendations must be well-reasoned and detailed. For each of the 3 recommended crops, provide the following:
  1.  **cropName**: The name of the crop.
  2.  **icon**: A relevant Lucide icon name from this list: ['Leaf', 'Sprout', 'Carrot', 'Wheat', 'Grape']. Use 'Leaf' as a generic default if none are a perfect fit. For example, for cotton or soybean, use 'Leaf'. For wheat or maize, use 'Wheat'. For vegetables, use 'Carrot'.
  3.  **plantingDates**: A specific, recommended planting date range for the farmer's location and season. For example, "June 15 - July 30".
  4.  **reasoning**: A short, one-sentence reason why this crop is a good choice based on the inputs provided. For example, "This crop is well-suited to your soil type and has strong market demand in your region."
  5.  **benefits**: A list of 2 or 3 key benefits for the farmer. These should be concise and compelling, such as "High market demand in your region", "Drought resistant, lower water needs", or "Improves soil nitrogen for next season".
  6.  **imageHint**: Two or three specific keywords for a relevant image of the crop. For example, for a pearl millet recommendation, the hint could be "pearl millet farm". For cotton, it could be "ripe cotton crop".

  Generate a list of exactly 3 diverse and practical crop recommendations.
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
      return output!;
    } catch (error) {
      console.error("Error in recommendCropsFlow, returning fallback.", error);
      // Return a fallback response that satisfies the schema
      const fallbackBenefits = [
          `Good market value in ${input.location}`,
          "Suitable for various soil types",
      ];

      return {
        recommendations: [
          {
            cropName: "Soybean",
            icon: "Leaf",
            plantingDates: "June - July",
            reasoning: "A robust and profitable Kharif crop suitable for many Indian climates.",
            benefits: fallbackBenefits,
            imageHint: "soybean field",
          },
          {
            cropName: "Cotton",
            icon: "Leaf",
            plantingDates: "May - June",
            reasoning: "High demand in the textile industry and grows well in drier conditions.",
            benefits: fallbackBenefits,
            imageHint: "ripe cotton crop",
          },
          {
            cropName: "Maize",
            icon: "Wheat",
            plantingDates: "June - July",
            reasoning: "A versatile crop used for both food and animal feed, with good yield potential.",
            benefits: fallbackBenefits,
            imageHint: "maize corn field",
          }
        ]
      }
    }
  }
);
