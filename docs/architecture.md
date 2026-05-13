# Architecture

The MVP uses a monorepo with a Next.js frontend, a Node.js API, PostgreSQL with Prisma, Firebase Auth and Storage, and Razorpay Checkout.

## Request Flow

1. User logs in with Firebase Auth.
2. Frontend sends Firebase ID token to the API.
3. API verifies token with Firebase Admin.
4. API syncs or loads the user from PostgreSQL.
5. Admin routes check the user's database role.

## Payment Flow

1. User creates a booking.
2. API creates a Razorpay order.
3. Frontend opens Razorpay Checkout.
4. API verifies Razorpay signature.
5. Webhook confirms final payment state.
