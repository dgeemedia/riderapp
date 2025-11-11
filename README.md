# mypadifood-tracker-starter (Full-stack starter)
This archive contains three minimal starter projects:
- backend: Express + Socket.io, OTP endpoints, location endpoint (logs OTP to console for starter).
- admin: Next.js simple dashboard that connects to backend and shows riders & event log.
- rider-expo: Expo React Native app with OTP login, socket.io, and background location posting.

Quick start:
1. Backend:
   - cd backend
   - npm install
   - copy .env.example to .env and set JWT_SECRET
   - npm run dev
2. Admin (in another terminal):
   - cd admin
   - npm install
   - set NEXT_PUBLIC_BACKEND to backend address (default http://localhost:4000)
   - npm run dev
3. Rider:
   - cd rider-expo
   - npm install
   - start Expo and open on device/emulator. Set EXPO_PUBLIC_BACKEND if backend is remote.

This is a starter scaffold. You will need to:
- Wire SMS provider (Twilio/Termii) in backend index.js where OTP is generated.
- Persist riders and locations to a real DB.
- Implement authentication hardening and push notifications (FCM).
- Add background service config for Android and iOS if you need robust background tracking.

If you'd like, I can:
- Expand any part into a full repo with Dockerfiles, Postgres/Redis wiring, and sample deployment manifests.
- Implement Twilio OTP wiring and a Postgres schema.
