# Switch from Mock Data to Real MCP Integration

Follow these steps to connect your app to Google Calendar via Composio MCP.

## Current Status
✅ Your app is working with mock data
⏳ Need to connect Google Calendar to Composio

## Step-by-Step Guide

### Step 1: Connect Google Calendar to Composio

1. **Visit Composio Dashboard**
   ```
   https://app.composio.dev
   ```

2. **Navigate to Apps/Integrations**
   - Look for "Apps" or "Integrations" in the sidebar
   - Or visit: https://app.composio.dev/apps

3. **Find Google Calendar**
   - Search for "Google Calendar" in the apps list
   - Click on it

4. **Click "Connect" or "Add Integration"**
   - You'll be redirected to Google OAuth
   - Grant the following permissions:
     - View events on all calendars
     - Create, edit, and delete events

5. **Complete OAuth Flow**
   - Sign in with your Google account
   - Click "Allow" to grant permissions
   - You should be redirected back to Composio

### Step 2: Verify Connection

After connecting, verify it worked:

1. **Check connections endpoint:**
   ```
   http://localhost:3000/api/connections
   ```

   You should see Google Calendar in the `integrations` list.

2. **Check available actions:**
   ```
   http://localhost:3000/api/actions
   ```

   Search the output for actions containing "GOOGLE" and "CALENDAR".

   Example actions you might see:
   - `GOOGLECALENDAR_LIST_EVENTS`
   - `GOOGLECALENDAR_GET_EVENTS`
   - `GOOGLECALENDAR_CREATE_EVENT`

### Step 3: Update Environment Variables

Once you know the correct action name from Step 2:

1. **Open your `.env` file**

2. **Update these variables:**
   ```env
   # Disable mock data
   USE_MOCK_DATA=false

   # Set the correct action name (from /api/actions output)
   COMPOSIO_ACTION_NAME=GOOGLECALENDAR_LIST_EVENTS
   ```

   Replace `GOOGLECALENDAR_LIST_EVENTS` with the actual action name you found.

3. **Save the file**

### Step 4: Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then start it again
npm run dev
```

### Step 5: Test Real Integration

1. **Visit the app:**
   ```
   http://localhost:3000
   ```

2. **Login with any email**

3. **You should now see:**
   - Your actual Google Calendar events
   - Real upcoming meetings
   - Real past meetings
   - AI summaries for past meetings

### Step 6: Check Logs

Watch the terminal for helpful debug output:

```
[MCP Client] Executing action: GOOGLECALENDAR_LIST_EVENTS
[MCP Client] Parameters: { ... }
[MCP Client] Response status: 200
[MCP Client] Success! Result type: object
Composio client connected successfully
Found 10 calendar events
```

## Troubleshooting

### Problem: "Action not found" error

**Solution:**
1. Check `/api/actions` for the exact action name
2. Update `COMPOSIO_ACTION_NAME` in `.env` with the correct name
3. Restart the server

### Problem: "Google Calendar not connected"

**Solution:**
1. Go to https://app.composio.dev/apps
2. Make sure Google Calendar shows as "Connected"
3. If not, click "Connect" and complete OAuth flow
4. Check `/api/connections` to verify

### Problem: "No events found"

**Possible causes:**
- Your calendar has no events in the date range (7 days past/future)
- The calendar you connected is different from the one with events
- Permission issues (re-authorize in Composio)

**Solution:**
1. Add some test events to your Google Calendar
2. Verify the date range in the code matches your events
3. Re-authorize Google Calendar in Composio if needed

### Problem: Still seeing mock data

**Solution:**
1. Verify `USE_MOCK_DATA=false` in `.env`
2. Restart the dev server completely
3. Hard refresh the browser (Ctrl+Shift+R)

## Alternative: Using Composio CLI

If the dashboard isn't working, use the CLI:

```bash
# Install Composio CLI
npm install -g composio-core

# Login to Composio
composio login

# Add Google Calendar integration
composio add googlecalendar

# This will open OAuth flow in browser
# Complete it and return to terminal

# List connected apps to verify
composio apps
```

You should see `googlecalendar` in the list.

## Checking Action Parameters

If you need to see what parameters an action accepts:

1. Visit: `http://localhost:3000/api/actions`
2. Find your action in the list
3. Note the required parameters

The app currently sends:
- `timeMin`: Start of date range
- `timeMax`: End of date range
- `maxResults`: 20 events max
- `singleEvents`: true (expand recurring events)
- `orderBy`: "startTime"

These should work with standard Google Calendar API actions.

## What the Code Does

When `USE_MOCK_DATA=false`:

1. **Connects to Composio** via REST API
2. **Calls the action** specified in `COMPOSIO_ACTION_NAME`
3. **Parses the response** (handles multiple response formats)
4. **Separates meetings** into upcoming/past
5. **Generates AI summaries** for past meetings (if OpenAI is configured)
6. **Returns formatted data** to the frontend

## Expected Response Format

Composio should return data in this structure:

```json
{
  "data": {
    "responseData": {
      "items": [
        {
          "id": "event123",
          "summary": "Meeting Title",
          "start": { "dateTime": "2025-11-25T10:00:00Z" },
          "end": { "dateTime": "2025-11-25T11:00:00Z" },
          "attendees": [
            { "email": "person@example.com" }
          ],
          "description": "Meeting description"
        }
      ]
    }
  }
}
```

The parsing function handles multiple formats automatically.

## Success Indicators

You'll know it's working when:

✅ No errors in browser console
✅ No errors in terminal
✅ Terminal shows: `Found X calendar events`
✅ Your real meetings appear in the UI
✅ Meeting times match your actual calendar
✅ AI summaries generate for past meetings

## Need Help?

If you're still stuck:

1. Share the output of `/api/connections`
2. Share the Google Calendar actions from `/api/actions`
3. Share any error messages from the terminal
4. Check Composio documentation: https://docs.composio.dev

---

**Remember**: The app is fully functional with mock data. Switching to real data should be seamless once Google Calendar is connected to Composio!
