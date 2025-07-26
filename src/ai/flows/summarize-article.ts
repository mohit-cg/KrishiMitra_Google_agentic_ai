
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
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const ArticleSummarySchema = z.object({
  title: z.string().describe('The title of the summarized article.'),
  summary: z.string().describe('A concise summary of the article found on the web.'),
  sourceUrl: z.string().describe('The URL of the source article.'),
  imageHint: z.string().describe("Two or three specific keywords for a relevant image, e.g., 'healthy soil farm', 'drip irrigation system', 'agricultural drone'."),
});


const SummarizeArticleOutputSchema = z.object({
  articles: z.array(ArticleSummarySchema).describe('A list of 2 to 3 summarized articles. This should be an empty array if the topic is not relevant.'),
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
  
  The farmer's preferred language is {{language}}. All of your text output (title, summary) MUST be in this language.

  Query: "{{query}}"
  
  1. First, determine if the query is related to agriculture, farming, crops, livestock, or a closely related topic. Set the 'relevance' field to 'related' or 'unrelated'.
  2. If the topic is unrelated, return an empty array for the 'articles' field.
  3. If the topic is relevant, find 2-3 of the best articles on the web for this topic.
  4. For each article, generate a realistic title.
  5. For each, write a concise, helpful summary.
  6. For each, provide a plausible, but not necessarily real, .com, .org, or .net URL as the source. For example: 'https://www.agrifarming.org/crop-rotation-benefits'.
  7. For each, provide a two or three word hint for a relevant image based on the article's topic. For example, for a crop rotation article, the hint could be "crop rotation diagram". For a soil health article, it could be "healthy farm soil".
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
