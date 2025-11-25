import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.COMPOSIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    // Get connected integrations
    const response = await fetch(
      "https://backend.composio.dev/api/v2/integrations",
      {
        headers: {
          "X-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Composio API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      integrations: data.items || data,
      googleCalendarConnected: data.items?.some((i: any) =>
        i.appName?.toLowerCase() === 'googlecalendar' ||
        i.name?.toLowerCase().includes('google') && i.name?.toLowerCase().includes('calendar')
      )
    });
  } catch (error) {
    console.error("Error listing connections:", error);
    return NextResponse.json(
      { error: "Failed to list connections", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
