# ApnaRooms MVP

Production-ready starter structure for:

- Tenant website with property search
- Admin property manager
- Firebase Auth with Google and phone OTP
- Firebase Storage image uploads
- Razorpay token booking
- PostgreSQL database with Prisma
- Basic custom CRM foundation

## Apps

- `apps/web`: Next.js, React, TypeScript frontend
- `apps/api`: Node.js API backend
- `packages/db`: Prisma schema and Prisma client
- `packages/shared`: shared types, constants, and validators

## First Setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env` and fill credentials.
3. Create the PostgreSQL database.
4. Run `pnpm db:generate`.
5. Run `pnpm db:migrate`.
6. Start both apps with `pnpm dev`.

## Production Helpers

- Promote a logged-in user to admin: `pnpm db:promote-admin -- --email=owner@example.com`
- Seed starter launch properties: `pnpm db:seed-launch`
- Production checklist: `docs/production-launch-checklist.md`

## MVP Build Order

1. Firebase Google and phone OTP login
2. Public property listing and property detail pages
3. Admin property create/edit/delete
4. Firebase Storage image uploads
5. Razorpay order creation, checkout, verification, and webhook
6. User booking history
7. Admin bookings and CRM leads
