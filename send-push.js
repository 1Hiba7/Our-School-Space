const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const clean = s => String(s || '').replace(/\*\*|==|\*/g, '').replace(/^- /gm, '• ').replace(/\s+/g, ' ').trim().slice(0, 140);
(async () => {
  const main = await db.doc('school/main').get();
  if (!main.exists) return console.log('no data');
  const ann = JSON.parse(main.data().payload).announcements || [];
  const now = new Date();
  const live = ann.filter(n => (!n.showAt || new Date(n.showAt) <= now) && (!n.expiresAt || new Date(n.expiresAt) >= now));
  const metaRef = db.doc('meta/push'), meta = await metaRef.get();
  if (!meta.exists) { await metaRef.set({ sent: live.map(n => n.id) }); return console.log('initialized, nothing sent'); }
  const sent = new Set(meta.data().sent || []);
  const fresh = live.filter(n => !sent.has(n.id));
  if (!fresh.length) return console.log('no new notifications');
  const tokens = (await db.collection('tokens').get()).docs.map(d => d.id);
  for (const n of fresh) {
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      const res = await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        data: { title: (n.type ? '[' + n.type + '] ' : '') + n.title, body: clean(n.content), url: './' },
        webpush: { headers: { Urgency: 'high', TTL: '86400' } }
      });
      await Promise.all(res.responses.map((r, k) => !r.success && /not-registered|invalid-registration/.test(r.error?.code || '') ? db.collection('tokens').doc(chunk[k]).delete() : null));
      console.log('sent', n.id, res.successCount, 'ok /', res.failureCount, 'failed');
    }
    sent.add(n.id);
  }
  await metaRef.set({ sent: [...sent].slice(-500) });
})().catch(e => { console.error(e); process.exit(1); });
