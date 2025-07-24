
'use server';
/**
 * @fileOverview Converts text to speech.
 * - generateSpeech - A function that takes text and returns audio.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import wav from 'wav';

// Define language-to-voice mapping
const voiceMap = {
  en: 'Achernar', // Female
  hi: 'Algenib', // Female - Changed from Miaplacidus
  kn: 'Schedar', // Female - Changed from Miaplacidus
  bn: 'Algenib', // Using Hindi female voice for Bangla as a fallback
  bho: 'Miaplacidus', // Using Hindi male voice for Bhojpuri as a fallback
};
type Language = keyof typeof voiceMap;


const TextToSpeechInputSchema = z.object({
    text: z.string().describe("The text to convert to speech."),
    language: z.string().describe("The language of the text (e.g., 'en', 'hi', 'kn', 'bn', 'bho').").optional().default('en'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;


// Output schema contains the media data URI
const TextToSpeechOutputSchema = z.object({
    media: z.string().describe("The generated audio as a data URI in WAV format."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// The exported wrapper function
export async function generateSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}


// Helper function to convert PCM buffer to WAV base64 string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// The Genkit flow definition
const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({text, language}) => {
    
    const selectedVoice = voiceMap[language as Language] || voiceMap.en;

    try {
        const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
            },
        },
        prompt: text,
        });

        if (!media) {
            console.warn('No media was returned from the text-to-speech model.');
            return { media: '' };
        }
        
        // The media URL is a data URI with base64 encoded PCM audio data.
        // We need to extract the base64 part and convert it to a WAV file.
        const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
        );
        
        const wavBase64 = await toWav(audioBuffer);

        return {
        media: 'data:audio/wav;base64,' + wavBase64,
        };
    } catch (error) {
        console.error("Error in text-to-speech flow:", error);
        // Return an empty media string to prevent the app from crashing
        return { media: '' };
    }
  }
);

    