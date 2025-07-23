
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
  condition: z.string().describe('The weather condition localization key (e.g., "sunny", "partlyCloudy").'),
  icon: z.enum(['CloudSun', 'Sun', 'CloudRain', 'Cloud', 'Wind', 'Droplets']).describe('An icon representing the condition.'),
});

const GetWeatherForecastOutputSchema = z.object({
  city: z.string().describe('The city of the forecast.'),
  current: z.object({
    temperature: z.string().describe('The current temperature.'),
    condition: z.string().describe('The current weather condition localization key.'),
    wind: z.string().describe('The current wind speed.'),
    humidity: z.string().describe('The current humidity level.'),
    icon: z.enum(['CloudSun', 'Sun', 'CloudRain', 'Cloud', 'Wind', 'Droplets']).describe('An icon representing the current condition.'),
  }),
  forecast: z.array(DailyForecastSchema).length(7).describe('A 7-day weather forecast.'),
});
export type GetWeatherForecastOutput = z.infer<
  typeof GetWeatherForecastOutputSchema
>;

// Map condition keys to icons
const conditionMap: Record<string, 'CloudSun' | 'Sun' | 'CloudRain' | 'Cloud'> = {
    sunny: 'Sun',
    partlyCloudy: 'CloudSun',
    cloudy: 'Cloud',
    showers: 'CloudRain',
    rainy: 'CloudRain',
    humidAndCloudy: 'Cloud',
    thunderstorms: 'CloudRain',
};


const mockWeatherData: Record<string, GetWeatherForecastOutput> = {
  pune: {
    city: 'Pune',
    current: { temperature: '31°C', condition: 'partlyCloudy', wind: '12 km/h', humidity: '55%', icon: 'CloudSun' },
    forecast: [
      { day: 'Today', temp: '31°C', condition: 'partlyCloudy', icon: 'CloudSun' },
      { day: 'Tuesday', temp: '32°C', condition: 'sunny', icon: 'Sun' },
      { day: 'Wednesday', temp: '30°C', condition: 'rainy', icon: 'CloudRain' },
      { day: 'Thursday', temp: '33°C', condition: 'sunny', icon: 'Sun' },
      { day: 'Friday', temp: '29°C', condition: 'showers', icon: 'CloudRain' },
      { day: 'Saturday', temp: '31°C', condition: 'cloudy', icon: 'Cloud' },
      { day: 'Sunday', temp: '32°C', condition: 'partlyCloudy', icon: 'CloudSun' },
    ],
  },
  mumbai: {
    city: 'Mumbai',
    current: { temperature: '32°C', condition: 'humidAndCloudy', wind: '18 km/h', humidity: '75%', icon: 'Cloud' },
    forecast: [
      { day: 'Today', temp: '32°C', condition: 'humidAndCloudy', icon: 'Cloud' },
      { day: 'Tuesday', temp: '33°C', condition: 'thunderstorms', icon: 'CloudRain' },
      { day: 'Wednesday', temp: '31°C', condition: 'cloudy', icon: 'Cloud' },
      { day: 'Thursday', temp: '34°C', condition: 'sunny', icon: 'Sun' },
      { day: 'Friday', temp: '32°C', condition: 'showers', icon: 'CloudRain' },
      { day: 'Saturday', temp: '32°C', condition: 'cloudy', icon: 'Cloud' },
      { day: 'Sunday', temp: '33°C', condition: 'partlyCloudy', icon: 'CloudSun' },
    ],
  },
};

const generateRandomForecast = (city: string): GetWeatherForecastOutput => {
  const conditions = Object.keys(conditionMap);
  const randomConditionKey = () => conditions[Math.floor(Math.random() * conditions.length)];
  
  const forecast: z.infer<typeof DailyForecastSchema>[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    const dayName = i === 0 
      ? 'Today' 
      : futureDate.toLocaleDateString('en-US', { weekday: 'long' });

    const condition = randomConditionKey();
    const icon = conditionMap[condition];
    
    forecast.push({
      day: dayName,
      temp: `${Math.floor(Math.random() * 15) + 20}°C`,
      condition,
      icon,
    });
  }
  
  const currentConditionKey = forecast[0].condition;
  const currentIcon = conditionMap[currentConditionKey];

  return {
    city: city.charAt(0).toUpperCase() + city.slice(1),
    current: {
      temperature: `${Math.floor(Math.random() * 15) + 20}°C`,
      condition: currentConditionKey,
      wind: `${Math.floor(Math.random() * 15) + 5} km/h`,
      humidity: `${Math.floor(Math.random() * 50) + 40}%`,
      icon: currentIcon,
    },
    forecast: forecast as z.infer<typeof GetWeatherForecastOutputSchema>['forecast'],
  };
}


const fetchWeatherForCity = async ({ city }: GetWeatherForecastInput) => {
  // In a real app, this would call a weather API.
  // For now, we return mock data, with a fallback to random data for other cities.
  const cityKey = city.toLowerCase();
  return mockWeatherData[cityKey] || generateRandomForecast(city);
};

const weatherTool = ai.defineTool(
  {
    name: 'fetchWeatherForCity',
    description: 'Fetches the weather forecast for a given city.',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: GetWeatherForecastOutputSchema,
  },
  fetchWeatherForCity
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
  },
  async (input) => {
    // Directly call the tool's implementation function to avoid LLM loops.
    // The LLM isn't needed here since we just want to fetch data.
    return await fetchWeatherForCity(input);
  }
);
