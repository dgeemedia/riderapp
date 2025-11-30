// backend/controllers/call.controller.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Twilio token generation (keeps using twilio SDK as before)
const { AccessToken } = (() => {
  try {
    const twilio = require('twilio');
    return twilio.jwt || {};
  } catch (e) {
    return {};
  }
})();

exports.twilioTokenForClient = async (req, res) => {
  try {
    const identity = req.body.identity || `admin_${req.adminId || 'anon'}_${Date.now()}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;
    if (!accountSid || !apiKey || !apiSecret) return res.status(500).json({ error: 'Twilio not configured' });

    // lazy require so missing twilio doesn't crash the server at startup
    const Twilio = require('twilio');
    const AccessTokenLocal = Twilio.jwt.AccessToken;
    const VoiceGrant = AccessTokenLocal.VoiceGrant;

    const token = new AccessTokenLocal(accountSid, apiKey, apiSecret, { ttl: 3600 });
    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID || undefined,
      incomingAllow: true
    });
    token.addGrant(grant);
    token.identity = identity;
    return res.json({ token: token.toJwt(), identity });
  } catch (err) {
    console.error('twilio token error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

// Agora token endpoint — defensive and lazy require
exports.agoraTokenForCall = async (req, res) => {
  try {
    // If app id / cert not provided, return friendly error
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(501).json({ error: 'Agora not configured (AGORA_APP_ID / AGORA_APP_CERTIFICATE missing).' });
    }

    // Try to load an available token-builder package lazily.
    // There are a few naming variations on npm. Try common names in order.
    let tokenPkg = null;
    const tryPkgs = [
      'agora-access-token',         // common package name
      '@agora/rtc-token-builder',   // some org-scoped names
      '@agora/token-builder',
      'agora-token'                 // fallback guess
    ];
    for (const name of tryPkgs) {
      try {
        tokenPkg = require(name);
        break;
      } catch (e) {
        // ignore
      }
    }

    if (!tokenPkg) {
      return res.status(501).json({
        error: 'Agora token builder package not installed. Install one of: "agora-access-token" or "@agora/rtc-token-builder" and restart.'
      });
    }

    // tokenPkg might expose different names depending on package:
    const RtcTokenBuilder = tokenPkg.RtcTokenBuilder || tokenPkg.buildTokenWithUid || tokenPkg.buildTokenWithAccount || tokenPkg;
    const RtcRole = tokenPkg.RtcRole || tokenPkg.Role || { PUBLISHER: 1 };

    // use a safe fallback: if module exposes RtcTokenBuilder.buildTokenWithUid use that
    const channelName = req.body.channel || `call_${uuidv4()}`;
    const uid = typeof req.body.uid === 'number' ? req.body.uid : 0;
    const expireTime = 3600;
    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTs + expireTime;

    let token;
    if (typeof tokenPkg.buildTokenWithUid === 'function') {
      // e.g. @agora/rtc-token-builder style
      token = tokenPkg.buildTokenWithUid(appId, appCertificate, channelName, uid, RtcRole.PUBLISHER || 1, privilegeExpiredTs);
    } else if (typeof tokenPkg.RtcTokenBuilder === 'object' && typeof tokenPkg.RtcTokenBuilder.buildTokenWithUid === 'function') {
      token = tokenPkg.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, RtcRole.PUBLISHER || 1, privilegeExpiredTs);
    } else if (typeof RtcTokenBuilder === 'function' && typeof RtcTokenBuilder.buildTokenWithUid === 'function') {
      token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, RtcRole.PUBLISHER || 1, privilegeExpiredTs);
    } else {
      return res.status(501).json({ error: 'Installed Agora package was found but does not export the expected builder function. Please install a supported package.' });
    }

    return res.json({ token, channelName, uid });
  } catch (err) {
    console.error('agora token error', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.createCallRecord = async (req, res) => {
  try {
    const { caller_type, caller_id, callee_type, callee_id, channel } = req.body;
    const ins = await db.query(
      'INSERT INTO calls (caller_type, caller_id, callee_type, callee_id, channel, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [caller_type, caller_id, callee_type, callee_id, channel, 'initiated']
    );
    return res.json({ ok: true, call: ins.rows[0] });
  } catch (err) {
    console.error('createCallRecord', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
};
