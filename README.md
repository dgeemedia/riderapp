# D Riders - Starter Pack (pnpm)
This starter pack contains three minimal starter projects:
- backend: Express + Socket.io (OTP in-memory), location endpoint, admin ping & riders list.
- admin: Next.js minimal dispatch board that connects to backend via socket.io.
- rider-expo: Expo React Native starter with phone OTP flow, socket.io, and location posting.

All projects use pnpm as the package manager. Basic process to run locally is below.

## Prerequisites
- Node.js (v18+ recommended)
- pnpm (install: `npm i -g pnpm`)
- For rider-expo: Expo CLI or use the Expo Go app

## Quick start (local)
1. Backend
   - cd backend
   - pnpm install
   - cp .env.example .env
   - edit .env and set JWT_SECRET
   - pnpm run dev
2. Admin
   - cd admin
   - pnpm install
   - set NEXT_PUBLIC_BACKEND if backend is remote (default http://localhost:4000)
   - pnpm run dev
3. Rider (Expo)
   - cd rider-expo
   - pnpm install
   - pnpm start
   - open with Expo Go or an emulator

## Notes
- This is a minimal starter: OTP codes are logged to the backend console. Wire SMS provider (Twilio/Termii) for production.
- Replace in-memory stores with Postgres/Redis for production.
- Add FCM/APNs for push notifications and proper background tracking configuration for production rider apps.

If you'd like, I can:
- Convert this to a full repo with Dockerfiles and postgres+redis setup.
- Wire Twilio OTP and configure FCM for push notifications.
