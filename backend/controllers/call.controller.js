// backend/controllers/call.controller.js
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERTIFICATE;

function nowSeconds() { return Math.floor(Date.now() / 1000); }

exports.agoraTokenForCall = async (req, res) => {
  try {
    if (!AGORA_APP_ID || !AGORA_APP_CERT) {
      return res.status(501).json({ error: 'Agora not configured (AGORA_APP_ID / AGORA_APP_CERTIFICATE).' });
    }

    // lazy require of the installed package (you installed agora-token)
    let tokenPkg;
    try {
      tokenPkg = require('agora-token');
    } catch (err) {
      // try alternate names (defensive)
      try { tokenPkg = require('@agora/rtc-token-builder'); } catch (e) { tokenPkg = null; }
    }
    if (!tokenPkg) {
      return res.status(501).json({ error: 'Agora token library not found. Install "agora-token".' });
    }

    // build channel name (if client supplied channel, use it)
    const channel = req.body.channel || `call_${uuidv4()}`;
    // choose uid: prefer numeric between clients; use 0 if you want server-generated account-based tokens
    let uid = 0;
    if (typeof req.body.uid === 'number') uid = req.body.uid;

    const expirySec = Number(req.body.expirySec || 3600);
    const privilegeExpiredTs = nowSeconds() + expirySec;

    // tokenPkg exports: RtcTokenBuilder.buildTokenWithUid or buildTokenWithAccount
    let token;
    // try common api
    if (typeof tokenPkg.buildTokenWithUid === 'function') {
      token = tokenPkg.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERT, channel, uid, 1 /* PUBLISHER */, privilegeExpiredTs);
    } else if (tokenPkg.RtcTokenBuilder && typeof tokenPkg.RtcTokenBuilder.buildTokenWithUid === 'function') {
      token = tokenPkg.RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERT, channel, uid, 1, privilegeExpiredTs);
    } else {
      return res.status(501).json({ error: 'Installed agora package does not provide token builder.' });
    }

    // return appId so client can initialize SDK easily
    return res.json({ ok: true, appId: AGORA_APP_ID, token, channel, uid, expires_in: expirySec });
  } catch (err) {
    console.error('agoraTokenForCall error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.twilioTokenForClient = async (req, res) => {
  try {
    const Twilio = require('twilio');
    const identity = req.body.identity || `user_${Date.now()}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;
    if (!accountSid || !apiKey || !apiSecret) return res.status(501).json({ error: 'Twilio not configured' });

    const AccessTokenLocal = Twilio.jwt.AccessToken;
    const VoiceGrant = AccessTokenLocal.VoiceGrant;

    const token = new AccessTokenLocal(accountSid, apiKey, apiSecret, { ttl: 3600 });
    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID || undefined,
      incomingAllow: true
    });
    token.addGrant(grant);
    token.identity = identity;

    return res.json({ ok: true, token: token.toJwt(), identity });
  } catch (err) {
    console.error('twilioTokenForClient error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.createCallRecord = async (req, res) => {
  try {
    const { caller_type, caller_id, callee_type, callee_id, channel } = req.body;
    const ins = await db.query(
      'INSERT INTO calls (caller_type, caller_id, callee_type, callee_id, channel, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [caller_type, caller_id, callee_type, callee_id, channel || null, 'initiated']
    );
    return res.json({ ok: true, call: ins.rows[0] });
  } catch (err) {
    console.error('createCallRecord', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};
