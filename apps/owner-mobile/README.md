# ApnaRooms Owner Mobile

Expo + React Native Android app for ApnaRooms property owners. This app is focused on owner onboarding, listing submission, admin approval status, and realtime availability control.

## Run

```bash
cd apps/owner-mobile
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
