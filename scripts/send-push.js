const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

const clean = s => String(s || '').replace(/\*\*|==|\*/g, '').replace(/^- /gm, '• ').replace(/\s+/g, ' ').trim().slice(0, 140);
const isLive = (n, now) => (!n.showAt || new Date(n.showAt) <= now) && (!n.expiresAt || new Date(n.expiresAt) >= now);

(async () => {
  // الإشعارات الآن مستندات منفصلة في مجموعة announcements
  const snap = await db.collection('announcements').get();
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const now = new Date();
  const live = all.filter(n => isLive(n, now));

  const metaRef = db.doc('meta/push');
  const meta = await metaRef.get();
  if (!meta.exists) {
    await metaRef.set({ sent: live.map(n => n.id) });
    return console.log('initialized, nothing sent');
  }

  // نحتفظ فقط بمعرّفات إشعارات ما زالت موجودة، فلا يُعاد إرسال إشعار قديم أبدًا
  const existing = new Set(all.map(n => n.id));
  const sent = new Set((meta.data().sent || []).filter(id => existing.has(id)));
  const fresh = live.filter(n => !sent.has(n.id));
  if (!fresh.length) {
    await metaRef.set({ sent: [...sent] });
    return console.log('no new notifications');
  }

  const tokens = (await db.collection('tokens').get()).docs.map(d => d.id);
  for (const n of fresh) {
    let ok = tokens.length === 0;
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      const res = await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        data: { title: (n.type ? '[' + n.type + '] ' : '') + (n.title || ''), body: clean(n.content), url: './' },
        webpush: { headers: { Urgency: 'high', TTL: '86400' } }
      });
      if (res.successCount > 0) ok = true;
      await Promise.all(res.responses.map((r, k) =>
        !r.success && /not-registered|invalid-registration/.test(r.error?.code || '')
          ? db.collection('tokens').doc(chunk[k]).delete() : null));
      console.log('sent', n.id, res.successCount, 'ok /', res.failureCount, 'failed');
    }
    // لا نعلّمه "مُرسلًا" إن فشل الإرسال لكل الأجهزة، ليُعاد المحاولة في الدورة التالية
    if (ok) sent.add(n.id);
    await metaRef.set({ sent: [...sent] });
  }
})().catch(e => { console.error(e); process.exit(1); });
