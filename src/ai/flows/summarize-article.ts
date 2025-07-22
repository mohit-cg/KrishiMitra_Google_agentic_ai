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
  title: z.string().optional().describe('The title of the summarized article.'),
  summary: z.string().optional().describe('A concise summary of the article found on the web.'),
  sourceUrl: z.string().optional().describe('The URL of the source article.'),
  error: z.string().optional().describe("An error message if the topic is not relevant, e.g., 'Please search for a topic related to agriculture.'"),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `You are an expert research assistant for farmers. Your first task is to determine if the user's query is related to agriculture, farming, crops, livestock, or any closely related topic.

  Query: "{{query}}"
  
  - If the query is NOT related to these topics, set the 'error' field in your output to "Please search for a topic related to agriculture." and leave the 'title', 'summary', and 'sourceUrl' fields empty.
  - If the query IS relevant, then proceed with the following steps and leave the 'error' field empty:
  
  Instructions for a relevant query:
  1.  Imagine you are searching the web for the best article on this topic.
  2.  Generate a realistic title for such an article.
  3.  Write a concise, helpful summary of the imagined article's key points.
  4.  Provide a plausible, but not necessarily real, .com, .org, or .net URL as the source. For example: 'https://www.agrifarming.org/crop-rotation-benefits'.
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
