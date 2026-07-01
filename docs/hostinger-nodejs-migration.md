# Hostinger Node.js Migration

This project can move the API from Render to Hostinger Node.js hosting without changing the app code architecture.

## What Moves

- Move `apps/api` from Render to Hostinger Node.js/Web Apps hosting.
- Keep the database on PostgreSQL, for example Supabase or the current external PostgreSQL provider.
- Keep the Next.js web frontend on Vercel unless you also plan to move the frontend separately.

Do not move the database to Hostinger MySQL unless the Prisma schema is intentionally migrated from PostgreSQL to MySQL.

## Hostinger App Settings

Deploy from the repository root, not from `apps/api`, because the API depends on workspace packages in `packages/db` and `packages/shared`.

The repository root now includes a Node entry file, `server.js`, so Hostinger's Git importer can detect it as a Node.js app. The root entry only starts the compiled API server from `apps/api/dist/server.js`.

Use these commands:

```text
Install command: pnpm install --frozen-lockfile --ignore-scripts
Build command: pnpm run hostinger:build
Start command: pnpm start
Node.js version: 22
```

The API already listens on `process.env.PORT`, which Hostinger should provide:

```ts
API_PORT: Number(process.env.PORT ?? process.env.API_PORT ?? 4000)
```

## Environment Variables

Set these in Hostinger for the Node.js app:

```env
DATABASE_URL=
CORS_ORIGIN=https://www.apnarooms.com,https://apnarooms.com
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
ADMIN_EMAILS=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Optional during first deployment only:

```env
HOSTINGER_SKIP_DB_SYNC=true
```

Hostinger cannot execute Prisma's native schema engine in the build sandbox, so API deployment skips `prisma db push`. Run schema sync separately from a local machine or another environment that can execute Prisma:

```text
pnpm db:push
```

## After Deployment

1. Open Hostinger's generated app URL and verify:

```text
https://HOSTINGER_APP_URL/health
```

Expected response:

```json
{"ok":true}
```

2. Update the frontend and mobile API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://HOSTINGER_APP_URL/api
EXPO_PUBLIC_API_BASE_URL=https://HOSTINGER_APP_URL/api
```

3. Update Razorpay webhook endpoint:

```text
https://HOSTINGER_APP_URL/api/payments/webhook
```

4. Redeploy the web frontend and rebuild mobile APKs after changing the API URL.
