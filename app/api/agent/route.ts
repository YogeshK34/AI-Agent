import { generateText, stepCountIs, tool } from "ai";
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(request: Request) {
  const {prompt}: {prompt?: string} = await request.json();

  if (!prompt) {
    return new Response('Prompt is required', {status: 400});
  };

  const result = await generateText({
    model: 'openai/gpt-5',
    prompt,
    stopWhen: stepCountIs(5),
    tools: {
      weather: tool({
        description: 'Get weather for location provided by user',
        inputSchema: z.object({
          location: z.string().describe('The location to get weather for!')
        }),

        execute: async ({ location }) => {
          const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`)
          const geoData = await geo.json();
          const {latitude, longitude} = await geoData.results[0];

          const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`);
          const weatherData = await weather.json();

          return {
            location, 
            temperature: weatherData.current.temperature_2m
          };
        }
      })
    }
  });

  return Response.json({
    steps: result.steps,
    finalAnswer: result.text
  });
}