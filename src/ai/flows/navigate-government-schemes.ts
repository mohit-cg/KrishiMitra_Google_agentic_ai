
// This is an AI-powered function to help farmers navigate government schemes.
'use server';

/**
 * @fileOverview Helps farmers navigate government schemes by answering questions about them.
 *
 * - navigateGovernmentSchemes - A function that answers questions about government schemes.
 * - NavigateGovernmentSchemesInput - The input type for the navigateGovernmentSchemes function.
 * - NavigateGovernmentSchemesOutput - The return type for the navigateGovernmentSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NavigateGovernmentSchemesInputSchema = z.object({
  query: z.string().describe('The question about government schemes.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type NavigateGovernmentSchemesInput = z.infer<
  typeof NavigateGovernmentSchemesInputSchema
>;

const NavigateGovernmentSchemesOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about government schemes.'),
  schemeName: z.string().describe('The name of the scheme.'),
  eligibility: z.string().describe('The eligibility criteria for the scheme.'),
  applicationLink: z.string().describe('The link to apply for the scheme.'),
});
export type NavigateGovernmentSchemesOutput = z.infer<
  typeof NavigateGovernmentSchemesOutputSchema
>;

export async function navigateGovernmentSchemes(
  input: NavigateGovernmentSchemesInput
): Promise<NavigateGovernmentSchemesOutput> {
  return navigateGovernmentSchemesFlow(input);
}

const navigateGovernmentSchemesPrompt = ai.definePrompt({
  name: 'navigateGovernmentSchemesPrompt',
  input: {schema: NavigateGovernmentSchemesInputSchema},
  output: {schema: NavigateGovernmentSchemesOutputSchema},
  prompt: `You are an expert in Indian government schemes for farmers.
  
  The farmer's preferred language is {{language}}. All of your text output (answer, schemeName, eligibility) MUST be in this language.

  Answer the following question about government schemes:
  "{{query}}"

  Provide the answer, scheme name, eligibility criteria, and a valid application link.

  Make sure to fill out all fields in the output schema. Use the current year when specifying eligibility criteria.
  `,
});

const navigateGovernmentSchemesFlow = ai.defineFlow(
  {
    name: 'navigateGovernmentSchemesFlow',
    inputSchema: NavigateGovernmentSchemesInputSchema,
    outputSchema: NavigateGovernmentSchemesOutputSchema,
  },
  async input => {
    const {output} = await navigateGovernmentSchemesPrompt(input);
    return output!;
  }
);

    