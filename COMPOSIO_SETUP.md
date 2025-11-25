# Composio Google Calendar Setup Guide

## Current Status

The app is currently running in **MOCK DATA MODE** because Google Calendar actions are not available in your Composio account.

## Why Mock Data?

When checking available Composio actions at `/api/actions`, there are **no Google Calendar actions** in the list (like `GOOGLECALENDAR_LIST_EVENTS`). This means:

1. Google Calendar app is not connected to your Composio account
2. Or the integration needs to be enabled/configured

## Quick Test (Current Setup)

The app is currently using mock data to demonstrate the UI:

1. Visit: `http://localhost:3000`
2. Login with any email
3. You'll see sample meetings with AI summaries

This demonstrates all functionality except the actual Composio integration.

## Setting Up Real Google Calendar Integration

### Step 1: Check Composio Integrations

Visit this endpoint to see your connected apps:
```
http://localhost:3000/api/connections
```

### Step 2: Connect Google Calendar to Composio

1. Go to **https://app.composio.dev/apps**
2. Search for "Google Calendar"
3. Click **"Connect"** or **"Add Integration"**
4. Follow the OAuth flow to authorize Google Calendar access
5. Grant the necessary permissions:
   - Read calendar events
   - Write calendar events (if needed)

### Step 3: Verify Connection

After connecting, refresh the `/api/connections` endpoint and you should see Google Calendar in the list.

Also check `/api/actions` - you should now see actions like:
- `GOOGLECALENDAR_LIST_EVENTS`
- `GOOGLECALENDAR_CREATE_EVENT`
- etc.

### Step 4: Disable Mock Data

Once Google Calendar is connected, update your `.env` file:

```bash
# Change this line:
USE_MOCK_DATA=true

# To:
USE_MOCK_DATA=false
```

Then restart the dev server:
```bash
npm run dev
```

### Step 5: Test Real Integration

1. Visit `http://localhost:3000`
2. Login
3. You should now see your actual Google Calendar events!
4. AI summaries will be generated for past meetings

## Troubleshooting

### No Google Calendar Actions Available

**Problem**: `/api/actions` doesn't show `GOOGLECALENDAR_*` actions

**Solutions**:
1. Verify Google Calendar is connected at app.composio.dev
2. Check if you need to enable the Google Calendar app in your Composio workspace
3. Ensure your Composio API key has the right permissions

### Composio API Errors

**Problem**: Getting 400/401 errors from Composio API

**Solutions**:
1. Verify your `COMPOSIO_API_KEY` is correct
2. Check if the key has expired
3. Ensure you're using the v2 API endpoint

### "Tool not found" Error

**Problem**: Error saying `GOOGLECALENDAR_LIST_EVENTS` not found

**Solutions**:
1. The action name might be different in your Composio version
2. Check `/api/actions` to see the exact action names available
3. Update `src/app/api/meetings/route.ts` with the correct action name

## Alternative: Using Composio CLI

You can also connect Google Calendar using Composio's CLI:

```bash
# Install Composio CLI
npm install -g composio-core

# Login
composio login

# Add Google Calendar
composio add googlecalendar

# Follow the OAuth flow in your browser
```

After this, the actions should appear in your API.

## Current Implementation

The app uses Composio's REST API v2:

```typescript
// src/lib/mcp-client.ts
const response = await fetch(
  `https://backend.composio.dev/api/v2/actions/${toolName}/execute`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
    },
    body: JSON.stringify({
      entityId: "default",
      appName: "googlecalendar",
      input: args,
    }),
  }
);
```

## What's Working

✅ Next.js app with TypeScript and Tailwind
✅ Mock authentication system
✅ API routes structure
✅ Composio REST API integration (ready)
✅ OpenAI integration for summaries
✅ Responsive UI with meeting cards
✅ Loading and error states
✅ Mock data for demonstration

## What Needs Setup

⚠️ Google Calendar connection to Composio
⚠️ Proper OAuth flow (if required)
⚠️ Verify action names match Composio's current API

## Production Deployment

When deploying to Vercel:

1. Add environment variables:
   - `COMPOSIO_API_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_CALENDAR_USER_ID`
   - `USE_MOCK_DATA=false` (for production)

2. Ensure Google Calendar is connected in Composio dashboard

3. Test the `/api/connections` endpoint after deployment

## Support Resources

- Composio Documentation: https://docs.composio.dev
- Composio Dashboard: https://app.composio.dev
- Composio API Reference: https://docs.composio.dev/api-reference

## Next Steps

1. ✅ App is working with mock data
2. ⏳ Connect Google Calendar to Composio
3. ⏳ Verify action names
4. ⏳ Disable mock data
5. ⏳ Test with real calendar
6. ⏳ Deploy to Vercel

---

**Note**: The current setup demonstrates full UI/UX functionality. Once Google Calendar is connected to Composio, you just need to flip `USE_MOCK_DATA=false` and the app will work with real data!
