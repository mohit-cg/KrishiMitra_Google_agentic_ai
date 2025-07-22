// diagnose-crop-disease.ts
'use server';

/**
 * @fileOverview Diagnoses crop diseases from an image and provides solutions with local product links.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropdisease function.
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
  documentationLink: z.string().optional().describe('A search engine link to find relevant documentation.'),
  youtubeLink: z.string().optional().describe('A YouTube search link to find a relevant visual guide.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

// This is a new internal-only schema that the prompt will output.
// We will then transform this into the final output schema.
const InternalDiagnoseCropDiseaseOutputSchema = z.object({
    diagnosis: z.string().describe('The diagnosis of the crop disease.'),
    solutions: z.string().describe('Suggested solutions with local product links.'),
    documentationSearchQuery: z.string().optional().describe('A search query to find a relevant documentation or article.'),
    youtubeSearchQuery: z.string().optional().describe('A search query for a relevant YouTube video for a visual guide.'),
});


const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {schema: DiagnoseCropDiseaseInputSchema},
  output: {schema: InternalDiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in diagnosing crop diseases. Analyze the provided image of the crop and provide a diagnosis of any diseases present. Also, suggest solutions with local product links that can help the farmer.

Instead of providing URLs, generate a concise and effective search query for both a documentation article and a YouTube video that would help the user find more information. For example, for "tomato blight", a good YouTube search query would be "how to treat tomato early blight".

Crop Image: {{media url=photoDataUri}}`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const {output: internalOutput} = await prompt(input);
    if (!internalOutput) {
        throw new Error("Failed to get a diagnosis from the AI model.");
    }
    
    // Construct search URLs from the generated queries
    const documentationLink = internalOutput.documentationSearchQuery 
      ? `https://www.google.com/search?q=${encodeURIComponent(internalOutput.documentationSearchQuery)}`
      : undefined;
      
    const youtubeLink = internalOutput.youtubeSearchQuery
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(internalOutput.youtubeSearchQuery)}`
      : undefined;

    return {
        diagnosis: internalOutput.diagnosis,
        solutions: internalOutput.solutions,
        documentationLink,
        youtubeLink,
    };
  }
);
