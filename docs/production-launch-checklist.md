# Production Launch Checklist

Use this after the backend is live on Render and the frontend is live on Vercel.

## 1. Render CORS

Open Render dashboard, select the `apnarooms-guwahati` web service, then go to **Environment**.

Set:

```env
CORS_ORIGIN=https://apnarooms-guwahati-web.vercel.app
```

If you also want local development to work from the same backend:

```env
CORS_ORIGIN=http://localhost:3000,https://apnarooms-guwahati-web.vercel.app
```

Save changes and redeploy the service.

## 1.1 Vercel Backend URL

Open Vercel, select the frontend project, then set:

```env
NEXT_PUBLIC_API_BASE_URL=https://apnarooms-guwahati.onrender.com/api
```

Redeploy the frontend after changing this environment variable.

## 2. Admin User

Log in once at:

```text
https://apnarooms-guwahati-web.vercel.app/login
```

The first synced user becomes `ADMIN` automatically. If that did not happen, promote the account from a machine that has `DATABASE_URL` set to the production PostgreSQL external URL:

The easiest production fix is to add this Render backend environment variable, then redeploy and log in again:

```env
ADMIN_EMAILS=owner@example.com
```

Use the same email you use for Google/email login. Multiple admins can be comma-separated:

```env
ADMIN_EMAILS=owner@example.com,manager@example.com
```

```bash
pnpm db:promote-admin -- --email=owner@example.com
```

Phone and Firebase UID also work:

```bash
pnpm db:promote-admin -- --phone=+919876543210
pnpm db:promote-admin -- --uid=firebase_uid_here
```

## 3. Real Properties

Open:

```text
https://apnarooms-guwahati-web.vercel.app/admin/properties
```

Create each property with:

- Title
- Description
- Category
- Monthly rent
- Deposit
- Token amount
- Locality/city/address
- Amenities
- At least 3 uploaded photos or 3 image URLs
- `Published`, `Verified`, and `Available` enabled

For production testing, create at least one real published property here before testing booking and payment.

## 3.1 Cloudinary Image Uploads

Create a Cloudinary unsigned upload preset, then set these in Vercel:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Redeploy Vercel after saving. Admin property photo upload will use Cloudinary first. Image URLs can still be pasted manually.

## 4. Razorpay Test Booking

Open the frontend homepage, pick a published property, and click **Book**.

Use Razorpay test mode card:

```text
Card: 4111 1111 1111 1111
Expiry: any future date
CVV: any 3 digits
OTP: any 6 digits
```

After payment, verify:

- User dashboard shows booking as confirmed
- Admin bookings page shows the booking
- Admin payments page shows `PAID`

## 5. Razorpay Webhook

Open Razorpay Dashboard in test mode, then go to **Account & Settings** -> **Webhooks**.

Add endpoint:

```text
https://apnarooms-guwahati.onrender.com/api/payments/webhook
```

Select these events:

- `payment.captured`
- `payment.failed`
- `order.paid`

Copy the webhook secret into Render:

```env
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

Redeploy the Render service after saving the secret.
