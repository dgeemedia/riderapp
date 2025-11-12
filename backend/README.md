# d-riders-backend (starter)
Minimal Express + Socket.io starter for rider tracking.

Quick start with pnpm:
1. cd backend
2. pnpm install
3. copy .env.example to .env and set JWT_SECRET
4. pnpm run dev

Notes:
- OTP sending is logged to backend console in this starter. Wire an SMS provider where indicated in index.js.
- API:
  - POST /api/auth/otp { phone }
  - POST /api/auth/verify { phone, code } -> { token, rider }
  - POST /api/riders/location (Bearer token) { lat, lng, accuracy }
  - GET /api/admin/riders
- WebSockets:
  - Riders connect with socket auth: { token }
  - Admin connect with socket auth: { role: 'admin' }
