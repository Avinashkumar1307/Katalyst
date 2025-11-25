"use client";

import { MCPCalendarClient } from "@/lib/mcp-client";
import { Meeting, CalendarData } from "@/types";

// This function will be responsible for all the logic that was in the API route
export async function fetchCalendarData(): Promise<CalendarData> {
  let client: MCPCalendarClient | null = null;

  try {
    // Check if we should use mock data
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
    if (useMockData) {
      console.log("Using mock calendar data for demonstration");
      return getMockCalendarData();
    }

    // Initialize MCP client
    client = new MCPCalendarClient();
    await client.connect();

    // Use a high-level prompt to get events, which is more compliant
    const eventsResult = await client.execute(
      "Get calendar events from primary calendar for the last 7 days and the next 7 days. Include single events only and order by start time."
    );

    // Parse the events from MCP response
    const events = parseEventsFromMCP(eventsResult);
    const now = new Date();

    // Separate upcoming and past meetings
    const upcomingMeetings: Meeting[] = [];
    const pastMeetings: Meeting[] = [];

    for (const event of events) {
      const eventStart = new Date(event.start);
      if (eventStart > now) {
        upcomingMeetings.push(event);
      } else {
        pastMeetings.push(event);
      }
    }

    // Limit to 5 each
    const upcomingTop5 = upcomingMeetings.slice(0, 5);
    const pastTop5 = pastMeetings.slice(0, 5).reverse();

    // Generate AI summaries by calling the new secure API route
    const summaryPromises = pastTop5.map(async (meeting) => {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(meeting),
        });
        if (!response.ok) {
          meeting.aiSummary = "AI summary unavailable.";
          return meeting;
        }
        const data = await response.json();
        meeting.aiSummary = data.summary;
        return meeting;
      } catch (error) {
        console.error("Failed to generate AI summary for a meeting:", error);
        meeting.aiSummary = "AI summary unavailable.";
        return meeting;
      }
    });

    const pastMeetingsWithSummaries = await Promise.all(summaryPromises);

    return {
      upcoming: upcomingTop5,
      past: pastMeetingsWithSummaries,
    };
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw new Error("Failed to fetch meetings. Check console for details.");
  } finally {
    if (client) {
      await client.disconnect();
    }
  }
}

function parseEventsFromMCP(mcpResult: any): Meeting[] {
  try {
    console.log("[Parser] Parsing MCP result...");
    let eventsData;

    if (mcpResult.content && Array.isArray(mcpResult.content)) {
      const textContent = mcpResult.content.find((c: any) => c.type === "text");
      if (textContent && textContent.text) {
        eventsData = JSON.parse(textContent.text);
      } else {
        eventsData = mcpResult.content[0];
      }
    } else if (typeof mcpResult === "string") {
      eventsData = JSON.parse(mcpResult);
    } else {
      eventsData = mcpResult;
    }

    const items =
      eventsData?.items ||
      eventsData?.data?.items ||
      eventsData?.data?.responseData?.items ||
      eventsData?.responseData?.items ||
      [];

    if (!Array.isArray(items)) return [];

    return items.map((event: any) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      let duration = 0;
      if (start && end) {
        duration = Math.round(
          (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)
        );
      }
      const attendees = event.attendees
        ? event.attendees.map((a: any) => a.email || a.displayName || "Unknown")
        : [];
      return {
        id: event.id || Math.random().toString(36),
        title: event.summary || "No Title",
        start: start || new Date().toISOString(),
        end: end || new Date().toISOString(),
        duration,
        attendees,
        description: event.description || "",
      };
    });
  } catch (error) {
    console.error("Error parsing events:", error);
    console.error("Response was:", JSON.stringify(mcpResult, null, 2));
    return [];
  }
}

function getMockCalendarData(): CalendarData {
  const now = new Date();
  return {
    upcoming: Array.from({ length: 5 }).map((_, i) => ({
      id: `mock-up-${i}`,
      title: `Upcoming Mock Meeting ${i + 1}`,
      start: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + ((i + 1) * 24 + 1) * 60 * 60 * 1000).toISOString(),
      duration: 60,
      attendees: ["mock@example.com"],
      description: "This is a mock meeting.",
    })),
    past: Array.from({ length: 5 }).map((_, i) => ({
      id: `mock-past-${i}`,
      title: `Past Mock Meeting ${i + 1}`,
      start: new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() - ((i + 1) * 24 - 1) * 60 * 60 * 1000).toISOString(),
      duration: 60,
      attendees: ["mock@example.com"],
      description: "This was a mock meeting.",
      aiSummary: "This is a mock AI summary.",
    })),
  };
}
