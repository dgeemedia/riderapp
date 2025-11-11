# mypadifood-backend (starter)
Minimal Express + Socket.io starter for rider tracking.
- Run: `npm install` then `npm run dev`
- OTP sending is logged to backend console in this starter. Wire an SMS provider in /index.js where indicated.
- API:
  - POST /api/auth/otp { phone }
  - POST /api/auth/verify { phone, code } -> { token, rider }
  - POST /api/riders/location (Bearer token) { lat, lng, accuracy }
  - GET /api/admin/riders
- WebSockets:
  - Riders connect with socket auth: { token }
  - Admin connect with socket auth: { role: 'admin' }
