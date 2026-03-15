# Deploy to Vercel + Neon

## 1. Create Neon database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project (pick a region near you)
3. Copy the **pooled** connection string from Connection details
   - It looks like: `postgresql://user:password@ep-xxx.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`

## 2. Migrate data from local to Neon

If you have data in your local database:

```bash
# Set your Neon connection string
export NEON_DATABASE_URL="postgresql://user:password@ep-xxx.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run migration (requires pg_dump and psql - install Postgres client tools if needed)
chmod +x scripts/migrate-to-neon.sh
./scripts/migrate-to-neon.sh
```

If starting fresh (no local data):

```bash
export DATABASE_URL="your-neon-connection-string"
bun prisma migrate deploy
bun prisma db seed   # optional: seed demo data
```

## 3. Deploy to Vercel

### Option A: Vercel + Neon integration (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Before deploying, add Environment Variables:
   - `DATABASE_URL` = your Neon connection string
   - `AUTH_SECRET` = run `npx auth secret` to generate
   - `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` (optional, for Discord login)
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` (optional, for Google login)
4. Add `NEXTAUTH_URL` = your Vercel URL (e.g. `https://your-project.vercel.app`) for auth callbacks
5. Install [Neon Vercel integration](https://vercel.com/integrations/neon) for automatic `DATABASE_URL` linking (optional)
6. Deploy

### Option B: Manual setup

1. Push to GitHub
2. Import to Vercel
3. In Project Settings → Environment Variables, add:
   - `DATABASE_URL` (Neon pooled connection string)
   - `AUTH_SECRET` (required for NextAuth)
   - Auth provider vars if using login

## 4. Get your shareable link

After deployment, Vercel gives you:
- **Production**: `https://your-project.vercel.app`
- **Preview** (per branch/PR): `https://your-project-git-branch-username.vercel.app`

Share the production URL to let others use the app.
