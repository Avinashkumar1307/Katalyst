import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.COMPOSIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    // List all Google Calendar actions
    const response = await fetch(
      "https://backend.composio.dev/api/v2/actions?appNames=googlecalendar",
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

    // Filter to list-related actions
    const listActions = data.items?.filter((action: any) =>
      action.name?.toLowerCase().includes('list') ||
      action.name?.toLowerCase().includes('event')
    );

    return NextResponse.json({
      allActions: data.items?.map((a: any) => a.name),
      listActions: listActions?.map((a: any) => ({
        name: a.name,
        description: a.description
      }))
    });
  } catch (error) {
    console.error("Error listing actions:", error);
    return NextResponse.json(
      { error: "Failed to list actions", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
