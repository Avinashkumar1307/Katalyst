# Quick Setup Guide

This guide will help you get the Katalyst Calendar app running quickly.

## Option 1: Quick Demo (No External Services Required)

To test the UI and functionality without setting up Composio or OpenAI:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (even with placeholder values):
   ```bash
   COMPOSIO_API_KEY=demo
   OPENAI_API_KEY=demo
   GOOGLE_CALENDAR_USER_ID=demo@example.com
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000` and login with any email

**Note**: The app will show an error when trying to fetch meetings since the services aren't configured. This demonstrates the error handling UI.

## Option 2: Full Setup with Composio MCP

### Step 1: Get Composio API Key

1. Visit [https://app.composio.dev](https://app.composio.dev)
2. Sign up for a free account
3. Navigate to Settings → API Keys
4. Copy your API key

### Step 2: Connect Google Calendar to Composio

#### Using Composio CLI (Recommended):

```bash
# Install Composio CLI globally
npm install -g composio-core

# Login to Composio
composio login

# Add Google Calendar integration
composio add googlecalendar

# Follow the OAuth flow in your browser
# This will authorize Composio to access your Google Calendar
```

#### Using Composio Dashboard:

1. Go to [https://app.composio.dev/apps](https://app.composio.dev/apps)
2. Search for "Google Calendar"
3. Click "Connect"
4. Follow the OAuth authorization flow
5. Grant necessary calendar permissions

### Step 3: Get OpenAI API Key (Optional)

For AI meeting summaries:

1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (you won't see it again!)

### Step 4: Configure Environment Variables

Create `.env` file:

```env
COMPOSIO_API_KEY=your_actual_composio_key_here
OPENAI_API_KEY=your_actual_openai_key_here
GOOGLE_CALENDAR_USER_ID=your.email@gmail.com
```

### Step 5: Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Verifying Composio MCP Setup

### Check Connected Apps

```bash
composio apps
```

You should see `googlecalendar` in the list.

### Test Calendar Access

```bash
# List available actions
composio actions googlecalendar

# Test fetching events
composio actions run GOOGLECALENDAR_LIST_EVENTS '{
  "maxResults": 5,
  "orderBy": "startTime",
  "singleEvents": true,
  "timeMin": "'$(date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)'"
}'
```

## Troubleshooting

### "MCP Client Connection Failed"

This error occurs when:
- Composio API key is invalid
- Google Calendar isn't connected to Composio
- The Composio MCP server package name is incorrect

**Solutions**:
1. Verify your Composio API key
2. Run `composio apps` to check Google Calendar is connected
3. Check the package name in `src/lib/mcp-client.ts`
4. Ensure you have Node.js 18+ installed

### "No meetings displayed"

This happens when:
- Your calendar has no events in the 7-day window (past or future)
- The calendar permissions aren't set correctly

**Solutions**:
1. Add some calendar events
2. Check the date range in the code
3. Verify calendar permissions in Composio

### "OpenAI API Error"

If AI summaries fail:
- The app will still work, just without summaries
- Check your OpenAI API key
- Verify you have API credits

## Development Notes

### Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes (server-side)
│   └── page.tsx     # Main calendar page
├── components/       # React components
├── contexts/        # React contexts (Auth)
├── lib/             # Utilities (MCP client)
└── types/           # TypeScript types
```

### Key Files

- `src/lib/mcp-client.ts` - MCP client for Composio
- `src/app/api/meetings/route.ts` - API endpoint for fetching meetings
- `src/components/MeetingCard.tsx` - Meeting display component

### Making Changes

After making code changes:
1. The dev server auto-reloads
2. Check browser console for errors
3. Check terminal for server-side errors

## Deployment

See main README.md for Vercel deployment instructions.

## Getting Help

If you encounter issues:
1. Check the main README.md
2. Review Composio documentation: [https://docs.composio.dev](https://docs.composio.dev)
3. Check MCP SDK docs: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
