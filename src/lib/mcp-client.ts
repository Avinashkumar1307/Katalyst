/**
 * MCP Calendar Client using Composio MCP Server
 * This implements the Model Context Protocol for Google Calendar integration
 */
export class MCPCalendarClient {
  private apiKey: string = "";
  private connected = false;
  private mcpEndpoint: string = "";
  private requestId = 1;

  async connect() {
    try {
      this.apiKey = process.env.NEXT_PUBLIC_COMPOSIO_API_KEY || "ak_AKUWLxHzfTbXODjNltuN";
      this.mcpEndpoint = process.env.NEXT_PUBLIC_MCP_ENDPOINT || "";

      if (!this.apiKey) throw new Error("Missing NEXT_PUBLIC_COMPOSIO_API_KEY");
      if (!this.mcpEndpoint) throw new Error("Missing NEXT_PUBLIC_MCP_ENDPOINT");

      this.connected = true;
      console.log("MCP client connected successfully");
      console.log("Using MCP endpoint:", this.mcpEndpoint.substring(0, 50) + "...");
      return true;
    } catch (error) {
      console.error("Failed to connect MCP client:", error);
      throw error;
    }
  }

  async execute(prompt: string) {
    if (!this.connected) throw new Error("MCP client not connected");

    try {
      console.log(`[MCP Client] Executing prompt: "${prompt}"`);

      // Use the 'prompt' method for a high-level, compliant interaction
      const rpcRequest = {
        jsonrpc: "2.0",
        id: this.requestId++,
        method: "prompt",
        params: {
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
      };

      console.log(`[MCP Client] Sending JSON-RPC request:`, JSON.stringify(rpcRequest, null, 2));

      const response = await fetch(this.mcpEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(rpcRequest),
      });

      console.log(`[MCP Client] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[MCP Client] Error response:`, errorText);
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Authentication failed. Please check your COMPOSIO_API_KEY in .env file.`
          );
        }
        throw new Error(`MCP server error: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      let rpcResponse;

      if (contentType?.includes("text/event-stream")) {
        const text = await response.text();
        console.log(`[MCP Client] Raw SSE response (first 500 chars):`, text.substring(0, 500));
        const lines = text.split("\n");
        const dataLine = lines.find((line) => line.startsWith("data: "));
        if (dataLine) {
          const jsonData = dataLine.substring(6);
          rpcResponse = JSON.parse(jsonData);
          console.log(`[MCP Client] Parsed SSE response:`, JSON.stringify(rpcResponse, null, 2));
        } else {
          throw new Error("No data in SSE response");
        }
      } else {
        rpcResponse = await response.json();
        console.log(`[MCP Client] Raw JSON response:`, JSON.stringify(rpcResponse, null, 2));
      }

      if (rpcResponse.error) {
        console.error(`[MCP Client] RPC Error:`, rpcResponse.error);
        throw new Error(
          `MCP RPC Error: ${rpcResponse.error.message || JSON.stringify(rpcResponse.error)}`
        );
      }

      const result = rpcResponse.result;
      if (!result) {
        throw new Error("MCP response missing result");
      }

      console.log(`[MCP Client] Success! Received result from prompt.`);
      return result;
    } catch (error) {
      console.error("[MCP Client] Prompt execution error:", error);
      throw error;
    }
  }

  async disconnect() {
    this.connected = false;
    console.log("MCP client disconnected");
  }
}
