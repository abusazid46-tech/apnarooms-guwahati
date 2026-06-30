# ApnaRooms Tenant Mobile

Expo + React Native Android app for ApnaRooms tenants. This app is focused on property discovery, WhatsApp booking, checkout handoff, saved stays, and tenant bookings.

## Run

```bash
cd apps/mobile
pnpm install
pnpm start
```

## Android builds

```bash
pnpm prebuild:android
eas build -p android --profile preview
eas build -p android --profile production
```

Set `EXPO_PUBLIC_API_BASE_URL` if the backend URL changes.
