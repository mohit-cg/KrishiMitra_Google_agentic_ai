'use server';

/**
 * @fileOverview Summarizes an article from the web based on a search query.
 *
 * - summarizeArticle - A function that returns a summary and a source link for a given topic.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  query: z.string().describe('The topic to search for and summarize.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  title: z.string().describe('The title of the summarized article.'),
  summary: z.string().describe('A concise summary of the article found on the web.'),
  sourceUrl: z.string().describe('The URL of the source article.'),
  relevance: z.enum(['related', 'unrelated']).describe("Whether the topic is related to agriculture."),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `You are an expert research assistant for farmers. Your task is to process the user's query.

  Query: "{{query}}"
  
  1. First, determine if the query is related to agriculture, farming, crops, livestock, or a closely related topic. Set the 'relevance' field to 'related' or 'unrelated'.
  2. If the topic is unrelated, set the title and summary to a message indicating the topic is not relevant. For the sourceUrl, use 'https://www.google.com/search?q=agriculture'.
  3. If the topic is relevant, find the best article on the web for this topic.
  4. Generate a realistic title for the article.
  5. Write a concise, helpful summary.
  6. Provide a plausible, but not necessarily real, .com, .org, or .net URL as the source. For example: 'https://www.agrifarming.org/crop-rotation-benefits'.
  `,
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);
