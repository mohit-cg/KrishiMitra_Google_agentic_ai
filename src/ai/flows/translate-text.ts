
// translate-text.ts
'use server';
/**
 * @fileOverview Translates a given text into a specified language.
 *
 * - translateText - A function that handles the text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.enum(['en', 'hi', 'kn', 'bn', 'bho']).describe('The target language for translation (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  // If the input text is empty or whitespace, return it as is to avoid unnecessary API calls.
  if (!input.text.trim()) {
    return { translatedText: input.text };
  }
  return translateTextFlow(input);
}

const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate the following text to {{targetLanguage}}.

Text: "{{text}}"

Return only the translated text. Do not include any other explanations or context.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await translationPrompt(input);
      if (!output) {
        throw new Error("Translation output was empty.");
      }
      return output;
    } catch (error) {
      console.error(`Translation failed for text: "${input.text}" to ${input.targetLanguage}`, error);
      // Fallback: return the original text if translation fails for any reason.
      return { translatedText: input.text };
    }
  }
);
