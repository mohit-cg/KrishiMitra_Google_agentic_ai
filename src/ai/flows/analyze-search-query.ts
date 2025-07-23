'use server';

/**
 * @fileOverview Analyzes a search query to determine if it is relevant to agriculture.
 *
 * - analyzeSearchQuery - A function that returns whether a query is agriculture-related.
 * - AnalyzeSearchQueryInput - The input type for the analyzeSearchQuery function.
 * - AnalyzeSearchQueryOutput - The return type for the analyzeSearchQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSearchQueryInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
});
export type AnalyzeSearchQueryInput = z.infer<typeof AnalyzeSearchQueryInputSchema>;

const AnalyzeSearchQueryOutputSchema = z.object({
  isRelevant: z.boolean().describe('Whether the query is relevant to agriculture, farming, crops, livestock, or related products.'),
});
export type AnalyzeSearchQueryOutput = z.infer<typeof AnalyzeSearchQueryOutputSchema>;


export async function analyzeSearchQuery(
  input: AnalyzeSearchQueryInput
): Promise<AnalyzeSearchQueryOutput> {
  return analyzeSearchQueryFlow(input);
}

const analyzeQueryPrompt = ai.definePrompt({
  name: 'analyzeSearchQueryPrompt',
  input: {schema: AnalyzeSearchQueryInputSchema},
  output: {schema: AnalyzeSearchQueryOutputSchema},
  prompt: `Analyze the following search query and determine if it is related to agriculture, farming, crops, livestock, or products used in these fields (like fertilizers, tools, seeds, etc.).
  
  Query: "{{query}}"
  
  Set 'isRelevant' to true if it is related, and false otherwise. For example, "tractor" is relevant, but "iPhone" is not.`,
});

const analyzeSearchQueryFlow = ai.defineFlow(
  {
    name: 'analyzeSearchQueryFlow',
    inputSchema: AnalyzeSearchQueryInputSchema,
    outputSchema: AnalyzeSearchQueryOutputSchema,
  },
  async input => {
    const {output} = await analyzeQueryPrompt(input);
    return output!;
  }
);
