// diagnose-crop-disease.ts
'use server';

/**
 * @fileOverview Diagnoses crop diseases from an image and provides solutions with local product links.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the crop disease.'),
  solutions: z.string().describe('Suggested solutions with local product links.'),
  documentationLink: z.string().optional().describe('A link to a relevant documentation or article for more details.'),
  youtubeLink: z.string().optional().describe('A link to a relevant YouTube video for a visual guide.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {schema: DiagnoseCropDiseaseInputSchema},
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in diagnosing crop diseases. Analyze the provided image of the crop and provide a diagnosis of any diseases present. Also, suggest solutions with local product links that can help the farmer.

In addition to the solutions, provide a link to a detailed article or documentation for further reading, and a link to a helpful YouTube video that visually explains the solution or disease.

Crop Image: {{media url=photoDataUri}}`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
