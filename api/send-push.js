import webpush from 'web-push';

const { VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;

if (VITE_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:hive-notifications@example.com',
    VITE_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!VITE_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }

  const { subscriptions, title, body, tier } = req.body;
  if (!subscriptions?.length) return res.status(200).json({ sent: 0 });

  const payload = JSON.stringify({ title, body, tier, tag: `hive-push-${Date.now()}` });
  const options = {
    TTL: 86400,
    urgency: tier === 'urgent' ? 'high' : tier === 'moderate' ? 'normal' : 'low',
  };

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload, options))
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  res.status(200).json({ sent, failed });
}
