
'use server';

/**
 * @fileOverview Provides weather forecast data for a given city.
 *
 * - getWeatherForecast - A function that fetches current weather and a 7-day forecast.
 * - GetWeatherForecastInput - The input type for the getWeatherForecast function.
 * - GetWeatherForecastOutput - The return type for the getWeatherForecast function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetWeatherForecastInputSchema = z.object({
  city: z.string().describe('The city for which to get the weather forecast.'),
});
export type GetWeatherForecastInput = z.infer<
  typeof GetWeatherForecastInputSchema
>;

const DailyForecastSchema = z.object({
  day: z.string().describe('The day of the week (e.g., "Tuesday").'),
  temp: z.string().describe('The temperature (e.g., "32°C").'),
  condition: z.string().describe('The weather condition (e.g., "Sunny").'),
  icon: z.enum(['CloudSun', 'Sun', 'CloudRain', 'Cloud', 'Wind', 'Droplets']).describe('An icon representing the condition.'),
});

const GetWeatherForecastOutputSchema = z.object({
  city: z.string().describe('The city of the forecast.'),
  current: z.object({
    temperature: z.string().describe('The current temperature.'),
    condition: z.string().describe('The current weather condition.'),
    wind: z.string().describe('The current wind speed.'),
    humidity: z.string().describe('The current humidity level.'),
    icon: z.enum(['CloudSun', 'Sun', 'CloudRain', 'Cloud', 'Wind', 'Droplets']).describe('An icon representing the current condition.'),
  }),
  forecast: z.array(DailyForecastSchema).length(7).describe('A 7-day weather forecast.'),
});
export type GetWeatherForecastOutput = z.infer<
  typeof GetWeatherForecastOutputSchema
>;

const mockWeatherData: Record<string, GetWeatherForecastOutput> = {
  pune: {
    city: 'Pune',
    current: { temperature: '31°C', condition: 'Partly Cloudy', wind: '12 km/h', humidity: '55%', icon: 'CloudSun' },
    forecast: [
      { day: 'Today', temp: '31°C', condition: 'Partly Cloudy', icon: 'CloudSun' },
      { day: 'Tuesday', temp: '32°C', condition: 'Sunny', icon: 'Sun' },
      { day: 'Wednesday', temp: '30°C', condition: 'Rainy', icon: 'CloudRain' },
      { day: 'Thursday', temp: '33°C', condition: 'Sunny', icon: 'Sun' },
      { day: 'Friday', temp: '29°C', condition: 'Showers', icon: 'CloudRain' },
      { day: 'Saturday', temp: '31°C', condition: 'Cloudy', icon: 'Cloud' },
      { day: 'Sunday', temp: '32°C', condition: 'Partly Cloudy', icon: 'CloudSun' },
    ],
  },
  mumbai: {
    city: 'Mumbai',
    current: { temperature: '32°C', condition: 'Humid & Cloudy', wind: '18 km/h', humidity: '75%', icon: 'Cloud' },
    forecast: [
      { day: 'Today', temp: '32°C', condition: 'Humid & Cloudy', icon: 'Cloud' },
      { day: 'Tuesday', temp: '33°C', condition: 'Thunderstorms', icon: 'CloudRain' },
      { day: 'Wednesday', temp: '31°C', condition: 'Cloudy', icon: 'Cloud' },
      { day: 'Thursday', temp: '34°C', condition: 'Sunny', icon: 'Sun' },
      { day: 'Friday', temp: '32°C', condition: 'Showers', icon: 'CloudRain' },
      { day: 'Saturday', temp: '32°C', condition: 'Cloudy', icon: 'Cloud' },
      { day: 'Sunday', temp: '33°C', condition: 'Partly Cloudy', icon: 'CloudSun' },
    ],
  },
};

const weatherTool = ai.defineTool(
  {
    name: 'fetchWeatherForCity',
    description: 'Fetches the weather forecast for a given city.',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: GetWeatherForecastOutputSchema,
  },
  async ({ city }) => {
    // In a real app, this would call a weather API.
    // For now, we return mock data.
    const cityKey = city.toLowerCase();
    return mockWeatherData[cityKey] || mockWeatherData['pune'];
  }
);


export async function getWeatherForecast(
  input: GetWeatherForecastInput
): Promise<GetWeatherForecastOutput> {
  return getWeatherForecastFlow(input);
}


const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: GetWeatherForecastOutputSchema,
    tools: [weatherTool]
  },
  async ({ city }) => {
     const llmResponse = await ai.generate({
      prompt: `Get the weather for ${city}.`,
      tools: [weatherTool],
      toolChoice: "required",
    });

    const toolResponse = llmResponse.toolRequest?.output;

    if (!toolResponse) {
      throw new Error('Failed to get weather data from tool.');
    }
    
    return toolResponse as GetWeatherForecastOutput;
  }
);
