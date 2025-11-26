import { NextResponse } from "next/server";
import { MCPCalendarClient } from "@/lib/mcp-client";
import OpenAI from "openai";
import { Meeting, CalendarData } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function GET() {
  let client: MCPCalendarClient | null = null;

  try {
    // Check if we should use mock data (for demo purposes)
    const useMockData = process.env.USE_MOCK_DATA === "true";

    if (useMockData) {
      console.log("Using mock calendar data for demonstration");
      return NextResponse.json(getMockCalendarData());
    }

    // Initialize MCP client
    client = new MCPCalendarClient();
    await client.connect();

    // Get current time
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch calendar events using Composio REST API
    // Action name from environment variable or default
    const actionName = process.env.COMPOSIO_ACTION_NAME || "GOOGLECALENDAR_LIST_EVENTS";

    console.log(`Calling Composio action: ${actionName}`);

    const eventsResult = await client.callTool(actionName, {
      calendar_id: "primary",
      timeMin: oneWeekAgo.toISOString(),
      timeMax: oneWeekLater.toISOString(),
      max_results: 20,
      single_events: true,
      order_by: "startTime",
    });

    // Parse the events from MCP response
    const events = parseEventsFromMCP(eventsResult);

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

    // Generate AI summaries for past meetings if OpenAI is configured
    if (process.env.OPENAI_API_KEY) {
      for (const meeting of pastTop5) {
        try {
          meeting.aiSummary = await generateAISummary(meeting);
        } catch (error) {
          console.error("Failed to generate AI summary:", error);
          // Continue without summary
        }
      }
    }

    const calendarData: CalendarData = {
      upcoming: upcomingTop5,
      past: pastTop5,
    };

    return NextResponse.json(calendarData);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch meetings from Google Calendar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Clean up MCP client
    if (client) {
      await client.disconnect();
    }
  }
}

function parseEventsFromMCP(mcpResult: any): Meeting[] {
  try {
    console.log("[Parser] Parsing MCP result...");
    let eventsData;

    // Handle MCP protocol response with content array
    if (mcpResult.content && Array.isArray(mcpResult.content)) {
      console.log(`[Parser] Found ${mcpResult.content.length} content items`);

      // Find text content in MCP response
      const textContent = mcpResult.content.find((c: any) => c.type === "text");
      if (textContent && textContent.text) {
        console.log("[Parser] Found text content, parsing JSON...");
        eventsData = JSON.parse(textContent.text);
      } else {
        // Maybe it's already parsed
        eventsData = mcpResult.content[0];
      }
    }
    // Handle direct JSON string
    else if (typeof mcpResult === "string") {
      console.log("[Parser] Got string response, parsing...");
      eventsData = JSON.parse(mcpResult);
    }
    // Handle direct object
    else {
      console.log("[Parser] Got direct object");
      eventsData = mcpResult;
    }

    // Extract items from various possible structures
    const items =
      eventsData?.items || // Direct Google Calendar format
      eventsData?.data?.items || // Composio wrapper
      eventsData?.data?.responseData?.items || // Nested Composio format
      eventsData?.responseData?.items || // Alternative format
      [];

    console.log(`[Parser] Found ${items.length} calendar events`);

    if (!Array.isArray(items)) {
      console.error("[Parser] Items is not an array:", typeof items);
      return [];
    }

    if (items.length === 0) {
      console.log("[Parser] No items found in response");
      console.log("[Parser] Full eventsData:", JSON.stringify(eventsData, null, 2));
      return [];
    }

    return items.map((event: any) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;

      // Calculate duration in minutes
      let duration = 0;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        duration = Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60)
        );
      }

      // Extract attendees
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

async function generateAISummary(meeting: Meeting): Promise<string> {
  try {
    const prompt = `Generate a brief, professional summary for this past meeting:
Title: ${meeting.title}
Duration: ${meeting.duration} minutes
Attendees: ${meeting.attendees.join(", ") || "No attendees listed"}
${meeting.description ? `Description: ${meeting.description}` : ""}

Provide a 1-2 sentence summary that captures the likely purpose and outcome of this meeting.`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes meetings. Provide concise, professional summaries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "No summary available";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "AI summary unavailable";
  }
}

function getMockCalendarData(): CalendarData {
  const now = new Date();

  return {
    upcoming: [
      {
        id: "mock-1",
        title: "Team Standup",
        start: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        attendees: ["john@company.com", "sarah@company.com", "mike@company.com"],
        description: "Daily team standup to discuss progress and blockers",
      },
      {
        id: "mock-2",
        title: "Client Presentation",
        start: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        attendees: ["client@example.com", "you@company.com"],
        description: "Q4 roadmap presentation to client stakeholders",
      },
      {
        id: "mock-3",
        title: "Sprint Planning",
        start: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 50 * 60 * 60 * 1000).toISOString(),
        duration: 120,
        attendees: ["dev-team@company.com"],
        description: "Planning for the next 2-week sprint",
      },
      {
        id: "mock-4",
        title: "1:1 with Manager",
        start: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 72.5 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        attendees: ["manager@company.com"],
        description: "Weekly one-on-one sync",
      },
      {
        id: "mock-5",
        title: "Product Demo",
        start: new Date(now.getTime() + 96 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 96.75 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        attendees: ["product@company.com", "engineering@company.com"],
        description: "Demo of new features to product team",
      },
    ],
    past: [
      {
        id: "mock-6",
        title: "Architecture Review",
        start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        attendees: ["tech-leads@company.com", "architects@company.com"],
        description: "Review of microservices architecture proposal",
        aiSummary:
          "Discussed the proposed microservices architecture and identified potential scalability issues. Team agreed to prototype the solution before full implementation.",
      },
      {
        id: "mock-7",
        title: "Customer Feedback Session",
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() - 23.5 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        attendees: ["customer-success@company.com"],
        description: "Gathering feedback on recent product updates",
        aiSummary:
          "Collected valuable feedback on the new dashboard UI. Customers requested better export functionality and mobile responsiveness improvements.",
      },
      {
        id: "mock-8",
        title: "Security Audit Meeting",
        start: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() - 46.5 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        attendees: ["security@company.com", "devops@company.com"],
        description: "Quarterly security audit and compliance review",
        aiSummary:
          "Completed Q4 security audit with minor findings. Action items assigned for updating dependencies and implementing additional logging for compliance.",
      },
      {
        id: "mock-9",
        title: "Marketing Campaign Kickoff",
        start: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() - 71 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        attendees: ["marketing@company.com", "design@company.com"],
        description: "Launch planning for winter campaign",
        aiSummary:
          "Aligned on campaign timeline and creative direction. Design team to deliver mockups by end of week, with campaign launch scheduled for next month.",
      },
      {
        id: "mock-10",
        title: "Bug Triage",
        start: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() - 95.5 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        attendees: ["qa@company.com", "dev-team@company.com"],
        description: "Weekly bug triage and prioritization",
        aiSummary:
          "Triaged 15 bugs, prioritized 3 critical issues for immediate fix. Remaining bugs scheduled for upcoming sprints based on severity.",
      },
    ],
  };
}
