// admin/pages/call-demo.js
import dynamic from 'next/dynamic';
const CallPanel = dynamic(() => import('../components/CallPanel'), { ssr: false });

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Call demo (Admin)</h1>
      <p>Make sure you have <code>admin_token</code> in localStorage (simulate admin authentication).</p>
      <CallPanel />
    </div>
  );
}
