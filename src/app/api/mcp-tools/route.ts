import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.COMPOSIO_API_KEY;
    const mcpEndpoint = process.env.MCP_ENDPOINT;

    if (!apiKey || !mcpEndpoint) {
      return NextResponse.json(
        { error: "Missing COMPOSIO_API_KEY or MCP_ENDPOINT" },
        { status: 500 }
      );
    }

    // MCP tools/list call using JSON-RPC 2.0
    const rpcRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    };

    const response = await fetch(mcpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(rpcRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `MCP server error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    let rpcResponse;

    // Handle Server-Sent Events (SSE) response
    if (contentType?.includes("text/event-stream")) {
      const text = await response.text();
      console.log("Raw SSE response:", text);

      // Parse SSE format: "event: message\ndata: {...}\n\n"
      const lines = text.split("\n");
      const dataLine = lines.find((line) => line.startsWith("data: "));

      if (dataLine) {
        const jsonData = dataLine.substring(6); // Remove "data: " prefix
        rpcResponse = JSON.parse(jsonData);
      } else {
        throw new Error("No data in SSE response");
      }
    } else {
      // Regular JSON response
      rpcResponse = await response.json();
    }

    if (rpcResponse.error) {
      return NextResponse.json(
        {
          error: "MCP RPC Error",
          details: rpcResponse.error,
        },
        { status: 500 }
      );
    }

    const tools = rpcResponse.result?.tools || [];

    // Filter and format Google Calendar related tools
    const calendarTools = tools.filter((tool: any) =>
      tool.name?.toLowerCase().includes("calendar") ||
      tool.name?.toLowerCase().includes("event") ||
      tool.name?.toLowerCase().includes("google")
    );

    return NextResponse.json({
      totalTools: tools.length,
      calendarTools: calendarTools.map((t: any) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
      allToolNames: tools.map((t: any) => t.name),
    });
  } catch (error) {
    console.error("Error listing MCP tools:", error);
    return NextResponse.json(
      {
        error: "Failed to list MCP tools",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
