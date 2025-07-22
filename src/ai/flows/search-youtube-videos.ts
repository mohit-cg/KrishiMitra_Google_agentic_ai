'use server';

/**
 * @fileOverview Searches for YouTube videos based on a query.
 *
 * - searchYoutubeVideos - A function that returns a list of relevant YouTube videos.
 * - SearchYoutubeVideosInput - The input type for the searchYoutubeVideos function.
 * - SearchYoutubeVideosOutput - The return type for the searchYoutubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Since we cannot use a real YouTube API without keys, 
// these are some real, relevant video IDs to make the results more realistic.
const sampleVideoIds = [
  "qAxqR5_p_vE", "x9yIM0he_gE", "3-v8-zQ_d-Q", "k2v_q_A-k6E", "yF4N2j-e6es", "z43_L7xQuA4"
];


const VideoSchema = z.object({
  videoId: z.string().describe(`The unique identifier for the YouTube video. Pick one from this list: ${sampleVideoIds.join(', ')}`),
  title: z.string().describe('A relevant and engaging title for the video.'),
  description: z.string().describe('A brief, informative description of the video content.'),
  duration: z.string().describe('The video duration in MM:SS format.'),
  thumbnailUrl: z.string().url().describe("A URL for the video thumbnail, e.g., 'https://placehold.co/600x400.png'."),
});


export const SearchYoutubeVideosInputSchema = z.object({
  query: z.string().describe('The user\'s search query for farming-related video tutorials.'),
});
export type SearchYoutubeVideosInput = z.infer<typeof SearchYoutubeVideosInputSchema>;

export const SearchYoutubeVideosOutputSchema = z.object({
  videos: z.array(VideoSchema).describe('A list of 3-6 relevant YouTube video search results.'),
});
export type SearchYoutubeVideosOutput = z.infer<typeof SearchYoutubeVideosOutputSchema>;

export async function searchYoutubeVideos(
  input: SearchYoutubeVideosInput
): Promise<SearchYoutubeVideosOutput> {
  return searchYoutubeVideosFlow(input);
}

const searchYoutubeVideosPrompt = ai.definePrompt({
  name: 'searchYoutubeVideosPrompt',
  input: {schema: SearchYoutubeVideosInputSchema},
  output: {schema: SearchYoutubeVideosOutputSchema},
  prompt: `You are a helpful assistant for farmers in India. A farmer is searching for video tutorials on the E-Learning Hub.

  Based on their query, generate a list of 3 to 6 highly relevant, plausible YouTube video search results. 
  
  For each video, provide a unique videoId selected from the provided list, a compelling title, a short description, a duration, and a placeholder thumbnail URL.
  
  User Query: "{{query}}"`,
});

const searchYoutubeVideosFlow = ai.defineFlow(
  {
    name: 'searchYoutubeVideosFlow',
    inputSchema: SearchYoutubeVideosInputSchema,
    outputSchema: SearchYoutubeVideosOutputSchema,
  },
  async input => {
    const {output} = await searchYoutubeVideosPrompt(input);
    return output!;
  }
);
