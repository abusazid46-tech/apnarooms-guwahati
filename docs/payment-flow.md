# Razorpay Token Booking Flow

1. Tenant clicks book on a property.
2. Frontend calls `POST /api/bookings`.
3. Frontend calls `POST /api/payments/create-order`.
4. Backend creates a Razorpay order.
5. Frontend opens Razorpay Checkout.
6. Frontend sends the payment result to `POST /api/payments/verify`.
7. Backend verifies the signature.
8. Razorpay webhook updates the final payment status.

Never mark a booking confirmed from the frontend alone.
