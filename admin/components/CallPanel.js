// admin/components/CallPanel.js
import { useEffect, useRef, useState } from 'react';

// NOTE: we DO NOT import 'agora-rtc-sdk-ng' at top-level (that would run in Node/SSR).
// We'll dynamically import it inside joinAgora when running in the browser.

export default function CallPanel({ backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000' }) {
  const [riderId, setRiderId] = useState('');
  const [callLog, setCallLog] = useState([]);
  const localRef = useRef();
  const remoteRef = useRef();
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);

  useEffect(() => {
    return () => {
      // cleanup when component unmounts
      if (clientRef.current) clientRef.current.leave?.();
      for (const t of localTracksRef.current) t.close?.();
    };
  }, []);

  async function startCallToRider() {
    if (!riderId) return alert('Enter rider id');
    try {
      const notifyRes = await fetch(backend + '/api/call/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('admin_token') },
        body: JSON.stringify({ callee_rider_id: riderId, caller_type: 'admin', caller_id: 'admin' })
      });
      const notifyJson = await notifyRes.json();
      if (!notifyRes.ok) throw new Error(notifyJson.error || 'notify failed');

      const channel = notifyJson.call.channel;
      setCallLog(l => [`Notified rider ${riderId}`, ...l]);

      const tkRes = await fetch(backend + '/api/call/agora/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('admin_token') },
        body: JSON.stringify({ channel })
      });
      const tkJson = await tkRes.json();
      if (!tkRes.ok) throw new Error(tkJson.error || 'token fetch failed');

      await joinAgora(tkJson.appId, tkJson.token, tkJson.channel, tkJson.uid);
      setCallLog(l => [`Joined channel ${tkJson.channel}`, ...l]);
    } catch (err) {
      console.error(err);
      alert('Call error: ' + (err.message || err));
    }
  }

  async function joinAgora(appId, token, channel, uid = 0) {
    // Only import Agora on the client at time of use
    if (typeof window === 'undefined') {
      throw new Error('Agora must be used in the browser');
    }

    const AgoraModule = await import('agora-rtc-sdk-ng');
    const AgoraRTC = AgoraModule?.default || AgoraModule;

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    localTracksRef.current = [localAudioTrack, localVideoTrack];

    // play local preview
    localVideoTrack.play(localRef.current);

    await client.join(appId, channel, token, uid);
    await client.publish([localAudioTrack, localVideoTrack]);

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        user.videoTrack.play(remoteRef.current);
      }
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    });
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Call Panel (Admin)</h3>
      <div>
        <label>Rider ID: </label>
        <input value={riderId} onChange={e => setRiderId(e.target.value)} placeholder="rider id (uuid)" />
        <button onClick={startCallToRider} style={{ marginLeft: 8 }}>Call Rider</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div style={{ width: '50%' }}>
          <div>Local</div>
          <div ref={localRef} style={{ width: '100%', height: '300px', background: '#000' }} />
        </div>
        <div style={{ width: '50%' }}>
          <div>Remote</div>
          <div ref={remoteRef} style={{ width: '100%', height: '300px', background: '#000' }} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>Log</h4>
        <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
          {callLog.map((l, i) => <div key={i} style={{ fontSize: 12 }}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
