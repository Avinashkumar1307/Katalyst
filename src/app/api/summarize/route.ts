import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Meeting } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const meeting = (await request.json()) as Meeting;

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting data is required" },
        { status: 400 }
      );
    }

    const summary = await generateAISummary(meeting);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
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
      model: "gpt-4o-mini",
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
