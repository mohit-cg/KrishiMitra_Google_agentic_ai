
// diagnose-crop-disease.ts
'use server';

/**
 * @fileOverview Diagnoses crop diseases from an image and/or text description, and provides solutions.
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
    .optional()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('A text or voice-based description of the crop issue.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether or not the input is a plant or a plant-related issue.'),
  diagnosis: z.string().describe('The diagnosis of the crop disease.'),
  solutions: z.string().describe('Suggested solutions with local product links.'),
  documentationLink: z.string().optional().describe('A search engine link to find relevant documentation.'),
  youtubeLink: z.string().optional().describe('A YouTube search link to find a relevant visual guide.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  // Ensure that at least one of the inputs is provided.
  if (!input.photoDataUri && !input.description) {
    throw new Error('Either a photo or a description must be provided for diagnosis.');
  }
  return diagnoseCropDiseaseFlow(input);
}

// This is a new internal-only schema that the prompt will output.
// We will then transform this into the final output schema.
const InternalDiagnoseCropDiseaseOutputSchema = z.object({
    isPlant: z.boolean().describe('Whether or not the input is a plant or a plant-related issue.'),
    diagnosis: z.string().describe('The diagnosis of the crop disease. If it is not a plant, explain that here.'),
    solutions: z.string().describe('Suggested solutions with local product links. If not a plant, this can be empty.'),
    documentationSearchQuery: z.string().optional().describe('A concise and effective search query to find a relevant documentation or article. Only generate if it is a plant. Example: "how to treat tomato early blight".'),
    youtubeSearchQuery: z.string().optional().describe('A concise and effective search query for a relevant YouTube video for a visual guide. Only generate if it is a plant. Example: "visual guide to tomato early blight".'),
});


const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {schema: DiagnoseCropDiseaseInputSchema},
  output: {schema: InternalDiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in diagnosing crop diseases. Your task is to analyze the user's input, which could be an image, a text description, or both.

The user's preferred language is {{language}}. All of your text output (diagnosis, solutions) MUST be in this language.

- First, determine if the input relates to a plant issue.
- If an image is provided, analyze it. If it's not a plant, set 'isPlant' to false and explain this in the diagnosis.
- If only a description is provided, assume it's about a plant issue and set 'isPlant' to true.
- If both are provided, use the image as the primary evidence and the description as additional context.
- If the issue is plant-related, provide a clear diagnosis and suggest practical solutions.
- For solutions, generate concise search queries for a documentation article and a YouTube video for more help (e.g., "how to treat tomato early blight").

Analyze the following input:
{{#if photoDataUri}}
Crop Image: {{media url=photoDataUri}}
{{/if}}
{{#if description}}
Description: "{{description}}"
{{/if}}`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => {
    try {
        const {output: internalOutput} = await prompt(input);
        if (!internalOutput) {
            throw new Error("Failed to get a diagnosis from the AI model.");
        }
        
        // Construct search URLs from the generated queries only if it's a plant issue
        const documentationLink = internalOutput.isPlant && internalOutput.documentationSearchQuery 
        ? `https://www.google.com/search?q=${encodeURIComponent(internalOutput.documentationSearchQuery)}`
        : undefined;
        
        const youtubeLink = internalOutput.isPlant && internalOutput.youtubeSearchQuery
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(internalOutput.youtubeSearchQuery)}`
        : undefined;

        return {
            isPlant: internalOutput.isPlant,
            diagnosis: internalOutput.diagnosis,
            solutions: internalOutput.solutions,
            documentationLink,
            youtubeLink,
        };
    } catch (error) {
        console.error("Error in diagnoseCropDiseaseFlow: ", error);
        
        const friendlyErrorMessage = {
            en: "We encountered an error trying to diagnose the issue. The service may be temporarily unavailable. Please try again later.",
            hi: "समस्या का निदान करने का प्रयास करते समय हमें एक त्रुटि का सामना करना पड़ा। सेवा अस्थायी रूप से अनुपलब्ध हो सकती है। कृपया बाद में पुनः प्रयास करें।",
            kn: "ಸಮಸ್ಯೆಯನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಪ್ರಯತ್ನಿಸುವಾಗ ನಾವು ದೋಷವನ್ನು ಎದುರಿಸಿದ್ದೇವೆ. ಸೇವೆಯು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲದಿರಬಹುದು. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            bn: "সমস্যা নির্ণয় করার চেষ্টা করার সময় আমরা একটি ত্রুটির সম্মুখীন হয়েছি। পরিষেবা অস্থায়ীভাবে অনুপলব্ধ হতে পারে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
            bho: "समस्या के निदान करे के प्रयास में हमनी के एगो त्रुटि के सामना करे के पड़ल। सेवा अस्थायी रूप से अनुपलब्ध हो सकेला। कृपया बाद में फेर से कोसिस करीं।"
        };

        const message = friendlyErrorMessage[input.language as keyof typeof friendlyErrorMessage] || friendlyErrorMessage.en;

        return {
            isPlant: false,
            diagnosis: "Diagnosis Failed",
            solutions: message,
        };
    }
  }
);
