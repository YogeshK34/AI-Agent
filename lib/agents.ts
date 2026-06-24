/*eslint-disable*/
import { tool } from 'ai';
import { z } from 'zod';

type CalendarEvent = {
  title: string;
  status: string;
  start: string;
  end: string;
  link: string;
};

type CalendarResult = {
  success: boolean;
  resultsFound: number;
  events: CalendarEvent[];
  message: string | null;
  error: string | null;
};

export const calendarSearchTool = tool({
  description: "Search the user's private Google Calendar for specific events.",
  inputSchema: z.object({
    query: z.string().describe('The search keyword or event name to look for (e.g., "Meeting", "Dentist").'),
    timeMin: z.string().optional().describe('The start date in ISO format (e.g., 2026-06-24T00:00:00Z). Defaults to today if not provided.'),
    timeMax: z.string().optional().describe('The end date in ISO format (e.g., 2026-06-31T00:00:00Z).'),
  }),

  execute: async (input): Promise<CalendarResult> => {
    const { query, timeMin, timeMax } = input;
    try {
      // 1. Validate environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Missing Google OAuth credentials (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN) in .env");
      }

      // 2. HTTP Request to refresh the temporary Access Token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(`Failed to refresh access token: ${tokenData.error_description || tokenData.error}`);
      }

      const accessToken = tokenData.access_token;

      // 3. Construct the Google Calendar List Events HTTP URL
      const baseUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

      const queryParams = new URLSearchParams({
        q: query,
        timeMin: timeMin || new Date().toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '10',
      });

      if (timeMax) {
        queryParams.append('timeMax', timeMax);
      }

      // 4. HTTP Request to fetch the calendar data using the new Access Token
      const calendarResponse = await fetch(`${baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      const calendarData = await calendarResponse.json();

      if (!calendarResponse.ok) {
        throw new Error(`Google Calendar API Error: ${calendarData.error?.message || 'Unknown error'}`);
      }

      // 5. Parse and map results into a clean, LLM-friendly structure
      const events = calendarData.items || [];

      if (events.length === 0) {
        return {
          success: true,
          resultsFound: 0,
          events: [],
          message: `No events found matching "${query}".`,
          error: null,
        };
      }

      const cleanedEvents: CalendarEvent[] = events.map((event: any) => ({
        title: event.summary || 'Untitled Event',
        status: event.status,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        link: event.htmlLink,
      }));

      return {
        success: true,
        resultsFound: cleanedEvents.length,
        events: cleanedEvents,
        message: null,
        error: null,
      };

    } catch (error: any) {
      console.error("Calendar Tool Error:", error);
      return {
        success: false,
        resultsFound: 0,
        events: [],
        message: null,
        error: error.message,
      };
    }
  }
});