// backend/controllers/call.controller.js
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const fetch = require('node-fetch'); // if you need to call Expo push endpoint; install if missing
const admin = require('firebase-admin');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERTIFICATE;

// lazy load token pkg (you installed agora-token)
function loadAgoraPkg() {
  try { return require('agora-token'); } catch (e) { try { return require('@agora/rtc-token-builder'); } catch (e2) { return null; } }
}

// return Agora token (same logic as earlier)
exports.agoraTokenForCall = async (req, res) => {
  try {
    if (!AGORA_APP_ID || !AGORA_APP_CERT) return res.status(501).json({ error: 'Agora not configured' });

    const tokenPkg = loadAgoraPkg();
    if (!tokenPkg) return res.status(501).json({ error: 'Agora token library not installed (agora-token).' });

    const channel = req.body.channel || `call_${uuidv4()}`;
    const uid = typeof req.body.uid === 'number' ? req.body.uid : 0;
    const expirySec = Number(req.body.expirySec || 3600);
    const now = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = now + expirySec;

    let token;
    if (typeof tokenPkg.buildTokenWithUid === 'function') {
      token = tokenPkg.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERT, channel, uid, 1, privilegeExpiredTs);
    } else if (tokenPkg.RtcTokenBuilder && typeof tokenPkg.RtcTokenBuilder.buildTokenWithUid === 'function') {
      token = tokenPkg.RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERT, channel, uid, 1, privilegeExpiredTs);
    } else {
      return res.status(501).json({ error: 'Installed agora package does not expose expected builder.' });
    }

    return res.json({ ok: true, appId: AGORA_APP_ID, token, channel, uid, expires_in: expirySec });
  } catch (err) {
    console.error('agoraTokenForCall', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

// create call record and notify rider by socket + push
exports.notifyRider = async (req, res) => {
  // adminAuth expected; body: { callee_rider_id, caller_type, caller_id, channel (optional), meta }
  try {
    const { callee_rider_id, caller_type = 'admin', caller_id = null, channel = null, meta = {} } = req.body;
    if (!callee_rider_id) return res.status(400).json({ error: 'callee_rider_id required' });

    const callChannel = channel || `call_${uuidv4()}`;

    const ins = await db.query(
      'INSERT INTO calls (caller_type, caller_id, callee_type, callee_id, channel, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [caller_type, caller_id, 'rider', callee_rider_id, callChannel, 'initiated']
    );
    const call = ins.rows[0];

    // Notify rider via socket (if connected)
    // redis socket mapping stored as `socket:rider:<riderId>` earlier in server
    try {
      const socketId = await require('../redis').get(`socket:rider:${callee_rider_id}`);
      if (socketId && require('../server').io) {
        // If you export io in server.js (see NOTES below) we can emit using it.
        const io = require('../server').io;
        io.to('rider:' + callee_rider_id).emit('incoming_call', {
          callId: call.id,
          channel: callChannel,
          caller_type,
          caller_id,
          meta
        });
      }
    } catch (err) {
      console.warn('notifyRider socket emit failed', err?.message || err);
    }

    // Push notify: check rider_devices table for tokens
    try {
      const devs = (await db.query('SELECT * FROM rider_devices WHERE rider_id=$1', [callee_rider_id])).rows;
      for (const d of devs) {
        // if expo token (starts with ExponentPushToken) call Expo push
        if (d.push_token && d.push_token.startsWith('ExponentPushToken')) {
          // send Expo push
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: d.push_token,
              title: 'Incoming call',
              body: `Incoming call from ${caller_type}`,
              data: { callId: call.id, channel: callChannel }
            })
          });
        } else if (admin.apps.length && d.push_token) {
          // assume FCM token and send via firebase-admin
          await admin.messaging().send({
            token: d.push_token,
            notification: { title: 'Incoming call', body: `Incoming call from ${caller_type}` },
            data: { callId: call.id, channel: callChannel }
          });
        } else {
          // fallback: log
          console.log('No push method available for token', d.push_token);
        }
      }
    } catch (err) {
      console.warn('push notify error', err?.message || err);
    }

    return res.json({ ok: true, call });
  } catch (err) {
    console.error('notifyRider error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

// Serve a tiny Agora web client HTML; clients (admin web or rider webview) open this URL with query params
// GET /agora/client?appId=...&token=...&channel=...&uid=...
exports.serveAgoraClientHtml = async (req, res) => {
  const { appId, token, channel, uid } = req.query;
  if (!appId || !token || !channel) return res.status(400).send('appId, token, channel required');
  // Minimal HTML joining Agora using CDN of agora-rtc-sdk-ng
  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Agora Web Client</title>
    <style>body{font-family:Arial,sans-serif;margin:0;height:100vh} #local, #remote{width:49%; height:100vh; display:inline-block; vertical-align:top}</style>
    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.7.1.js"></script>
  </head>
  <body>
    <div id="local"></div><div id="remote"></div>
    <script>
      (async () => {
        const appId = ${JSON.stringify(appId)};
        const token = ${JSON.stringify(token)};
        const channel = ${JSON.stringify(channel)};
        const uid = ${Number(uid || 0)};

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.join(appId, channel, token, uid);

        const localTrackCamera = await AgoraRTC.createCameraVideoTrack();
        const localTrackMic = await AgoraRTC.createMicrophoneAudioTrack();
        localTrackCamera.play("local");
        await client.publish([localTrackCamera, localTrackMic]);

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            const playerContainer = document.getElementById("remote");
            playerContainer.innerHTML = "";
            user.videoTrack.play(playerContainer);
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        client.on("user-unpublished", (user) => {
          // handle cleanup
        });
      })();
    </script>
  </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
