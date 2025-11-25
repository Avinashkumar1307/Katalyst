# Deployment Guide - Vercel

This guide covers deploying the Katalyst Calendar app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Composio API key (from [app.composio.dev](https://app.composio.dev))
- OpenAI API key (optional, for AI summaries)
- Google Calendar connected to Composio

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Katalyst Calendar app"

# Add remote repository
git remote add origin https://github.com/your-username/katalyst-calendar.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel

#### Method A: Using Vercel Dashboard

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `katalyst-calendar` repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   - `COMPOSIO_API_KEY` → your Composio API key
   - `OPENAI_API_KEY` → your OpenAI API key
   - `GOOGLE_CALENDAR_USER_ID` → your email

6. Click "Deploy"

#### Method B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? katalyst-calendar
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add COMPOSIO_API_KEY
vercel env add OPENAI_API_KEY
vercel env add GOOGLE_CALENDAR_USER_ID

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables in Vercel

If you deployed via dashboard, you can add/edit environment variables:

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add each variable:
   - Key: `COMPOSIO_API_KEY`
   - Value: (paste your key)
   - Environments: Production, Preview, Development

4. Repeat for `OPENAI_API_KEY` and `GOOGLE_CALENDAR_USER_ID`

### 4. Verify Deployment

1. Visit your deployment URL (e.g., `https://katalyst-calendar.vercel.app`)
2. Test the login flow
3. Check that meetings load correctly
4. Verify AI summaries appear on past meetings

## Important Considerations

### MCP Server in Production

The current implementation uses `npx` to run the Composio MCP server. This works in Vercel's Node.js runtime but has considerations:

**Pros**:
- No additional setup required
- MCP server runs on-demand
- Serverless-friendly

**Cons**:
- Cold start latency (first request may be slow)
- Requires Node.js runtime (not Edge runtime)

**Alternative Approach**:
If you experience issues, consider:
1. Using Composio's REST API directly instead of MCP
2. Self-hosting an MCP server
3. Using Vercel Edge Functions with a different architecture

### Runtime Configuration

Ensure your Vercel project uses Node.js runtime:

**vercel.json** (already included):
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs"
}
```

### Environment Variables

- Variables are encrypted at rest in Vercel
- Use separate keys for development/production
- Never commit `.env` file to git (already in `.gitignore`)

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For all pull requests and other branches

To disable auto-deployment:
1. Project Settings → Git
2. Adjust branch deployment settings

## Custom Domain

To add a custom domain:

1. Project Settings → Domains
2. Enter your domain (e.g., `calendar.yourdomain.com`)
3. Follow DNS configuration instructions
4. Vercel handles SSL certificates automatically

## Monitoring & Logs

### View Logs

1. Go to your project in Vercel
2. Deployments → (select deployment)
3. Click "View Function Logs"

Or use CLI:
```bash
vercel logs [deployment-url]
```

### Analytics

Vercel provides built-in analytics:
1. Project → Analytics
2. View visitor metrics, page performance, etc.

## Performance Optimization

### Enable Caching

Add cache headers in API route:

```typescript
// In src/app/api/meetings/route.ts
return NextResponse.json(calendarData, {
  headers: {
    'Cache-Control': 'private, max-age=60, s-maxage=60'
  }
});
```

### Edge Caching

For better performance:
1. Consider adding Redis caching layer
2. Use Vercel KV or Upstash Redis
3. Cache calendar responses for 5-10 minutes

## Rollback

If a deployment has issues:

1. Go to Deployments tab
2. Find previous working deployment
3. Click "⋯" → "Promote to Production"

Or use CLI:
```bash
vercel rollback
```

## Troubleshooting Deployment Issues

### Build Fails

Check build logs for errors:
- TypeScript errors
- Missing dependencies
- Environment variable issues

### API Routes Return 500

1. Check Function Logs in Vercel dashboard
2. Verify environment variables are set
3. Check MCP server connection

### MCP Connection Timeout

If requests timeout:
1. Increase serverless function timeout (Pro plan)
2. Consider alternative MCP hosting
3. Use Composio REST API as fallback

### No Meetings Display

1. Verify Composio API key in Vercel env vars
2. Check Google Calendar is still connected to Composio
3. Review function logs for errors

## Security Best Practices

1. **API Keys**: Only store in environment variables
2. **Authentication**: Implement real OAuth before production
3. **CORS**: Configure if adding external integrations
4. **Rate Limiting**: Add rate limiting to API routes
5. **Logging**: Don't log sensitive information

## Cost Considerations

### Vercel Free Tier Includes:
- 100GB bandwidth/month
- 100 hours serverless function execution
- Automatic SSL
- Global CDN

### Potential Costs:
- OpenAI API calls (per request)
- Composio API (check their pricing)
- Vercel overages (if exceeding free tier)

**Optimization Tips**:
- Cache API responses
- Use cheaper OpenAI models (gpt-4o-mini)
- Limit meeting fetch count
- Add usage analytics

## Next Steps

After deployment:
1. Test all functionality
2. Set up monitoring/alerts
3. Configure custom domain
4. Share the demo!

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Composio Docs](https://docs.composio.dev)
- [MCP Documentation](https://modelcontextprotocol.io)

---

Need help? Check the main README.md or open a GitHub issue.
