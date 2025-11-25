# Katalyst Calendar - AI-Powered Meeting Intelligence

A lightweight web application that connects to Google Calendar using MCP (Model Context Protocol) via Composio, fetches past and upcoming meetings, and displays contextual data with AI-generated summaries.

## Features

- **Google Calendar Integration**: Fetch meetings using Composio MCP (not vanilla Calendar API)
- **Meeting Display**: View 5 upcoming and 5 past meetings with detailed information
- **AI Summaries**: Automatically generate summaries for past meetings using OpenAI
- **Mock Authentication**: Demo authentication system (production would use Google OAuth)
- **Responsive UI**: Clean, modern interface built with React and Tailwind CSS
- **Error Handling**: Comprehensive loading and error states

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Calendar Integration**: Composio MCP Server
- **MCP SDK**: @modelcontextprotocol/sdk
- **AI**: OpenAI GPT-4o-mini for meeting summaries
- **Date Handling**: date-fns

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Composio account with API access
- An OpenAI API key (for AI summaries)
- Google Calendar connected to your Composio account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Katalyst
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Composio API Key (Get from https://app.composio.dev)
COMPOSIO_API_KEY=your_composio_api_key_here

# OpenAI API Key (for AI summaries)
OPENAI_API_KEY=your_openai_api_key_here

# Google Calendar User ID (email address of the calendar to access)
GOOGLE_CALENDAR_USER_ID=your_email@gmail.com
```

### 4. Set Up Composio

1. Sign up at [https://app.composio.dev](https://app.composio.dev)
2. Get your API key from the dashboard
3. Connect your Google Calendar account:
   ```bash
   composio add googlecalendar
   ```
4. Follow the OAuth flow to authorize Google Calendar access

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
katalyst-calendar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── meetings/
│   │   │       └── route.ts          # API route for fetching meetings via MCP
│   │   ├── globals.css               # Global styles with Tailwind
│   │   ├── layout.tsx                # Root layout with AuthProvider
│   │   └── page.tsx                  # Main calendar page
│   ├── components/
│   │   ├── MeetingCard.tsx          # Meeting display component
│   │   ├── LoadingState.tsx         # Loading UI
│   │   ├── ErrorState.tsx           # Error handling UI
│   │   └── LoginPage.tsx            # Mock authentication page
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication context
│   ├── lib/
│   │   └── mcp-client.ts            # MCP client for Composio integration
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## How It Works

### MCP Integration

The application uses the Model Context Protocol (MCP) to communicate with Composio's Google Calendar integration:

1. **MCP Client** (`src/lib/mcp-client.ts`): Establishes a connection to the Composio MCP server
2. **API Route** (`src/app/api/meetings/route.ts`): Uses the MCP client to call the `GOOGLECALENDAR_LIST_EVENTS` tool
3. **Data Processing**: Parses the MCP response and separates meetings into upcoming and past
4. **AI Enhancement**: Generates summaries for past meetings using OpenAI

### Authentication Flow

The current implementation uses mock authentication for demo purposes:

1. User enters email on login page
2. Email is stored in localStorage
3. Main page checks authentication state before displaying calendar

**Production Consideration**: In a production environment, this would be replaced with Google OAuth 2.0 for secure authentication.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [https://vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `COMPOSIO_API_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_CALENDAR_USER_ID`
5. Deploy!

**Note**: Ensure the Composio MCP server can be accessed in the Vercel environment. The current implementation uses `npx` to run the MCP server, which works in Node.js runtime environments.

## Design Decisions & Tradeoffs

### 1. Mock Authentication vs. Full OAuth

**Decision**: Implemented mock authentication for the demo

**Tradeoff**:
- ✅ Faster development, meets time constraint
- ✅ Demonstrates authentication flow concept
- ❌ Not production-ready
- ❌ No actual user permission validation

**Production Path**: Implement NextAuth.js with Google OAuth provider

### 2. MCP Architecture

**Decision**: Use Composio MCP server instead of direct Google Calendar API

**Tradeoff**:
- ✅ Follows Model Context Protocol standard
- ✅ Abstracts API complexity
- ✅ Future-proof for AI agent integration
- ❌ Additional dependency
- ❌ Requires Composio account

### 3. Server-Side API Route vs. Client-Side Calls

**Decision**: Fetch calendar data through Next.js API route

**Tradeoff**:
- ✅ Keeps API keys secure (server-side only)
- ✅ Enables server-side caching if needed
- ✅ Better error handling
- ❌ Additional request layer

### 4. AI Summary Generation

**Decision**: Generate summaries only for past meetings

**Tradeoff**:
- ✅ Provides value-add feature
- ✅ Demonstrates AI integration
- ✅ More cost-effective (only past meetings)
- ❌ Requires OpenAI API key
- ❌ Additional latency

### 5. No Database Layer

**Decision**: Direct API calls without database persistence

**Tradeoff**:
- ✅ Simpler architecture
- ✅ Always fresh data
- ✅ No database setup required
- ❌ No caching
- ❌ Repeated API calls
- ❌ No offline capability

**Production Path**: Add Redis for caching or Supabase for persistence

## Assumptions

1. **Composio Setup**: Assumes user has already connected Google Calendar to Composio
2. **Calendar Access**: Assumes the provided email has calendar events to display
3. **Network**: Assumes stable connection to Composio and OpenAI APIs
4. **MCP Server**: Assumes `@composio/mcp-server-composio` is available via npx
5. **Time Zone**: All times displayed in user's local timezone
6. **Meeting Count**: Limited to 5 upcoming and 5 past meetings for demo purposes

## Known Limitations

1. **Authentication**: Mock auth is not secure for production
2. **Error Recovery**: Limited retry logic for API failures
3. **Rate Limiting**: No rate limit handling for API calls
4. **Caching**: No caching layer, fetches fresh data on each load
5. **Real-time Updates**: No websocket/polling for live calendar updates
6. **Mobile Optimization**: Basic responsive design, could be enhanced
7. **Accessibility**: Could add ARIA labels and keyboard navigation

## Future Enhancements

- [ ] Implement Google OAuth 2.0
- [ ] Add Supabase for data persistence and caching
- [ ] Implement real-time calendar updates
- [ ] Add meeting categorization and filtering
- [ ] Enhanced AI features (action items, sentiment analysis)
- [ ] Calendar event creation/editing
- [ ] Multi-calendar support
- [ ] Export functionality (PDF, CSV)
- [ ] Calendar analytics dashboard

## Troubleshooting

### MCP Connection Issues

If you encounter MCP connection errors:

1. Verify your Composio API key is correct
2. Ensure Google Calendar is connected to Composio:
   ```bash
   composio apps
   ```
3. Test the connection:
   ```bash
   composio triggers --entity-id default
   ```

### No Meetings Displayed

If meetings don't appear:

1. Check the date range (7 days past/future)
2. Verify your calendar has events in that range
3. Check browser console for API errors
4. Verify environment variables are loaded

### OpenAI Summary Errors

If AI summaries fail:

1. Verify your OpenAI API key
2. Check API quota/billing
3. The app will still work without summaries

## License

MIT

## Contact

For questions or issues, please open a GitHub issue or contact the development team.

---

Built with ❤️ for Katalyst
