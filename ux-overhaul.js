/* Masahatuna UX overhaul — progressive shell and unified search.
   Existing page logic, Firebase state and permission checks remain authoritative. */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const icons={home:'house',schedule:'calendar-days',calendar:'calendar-range',tasks:'list-checks',notes:'book-open',activities:'images',info:'megaphone',books:'book-open',family:'users',tools:'wrench',settings:'sliders-horizontal',guide:'map-pin',admin:'shield'};
const paths={home:'الرئيسية',schedule:'الجدول',calendar:'التقويم',tasks:'المهام',notes:'ملاحظاتي',activities:'أنشطتنا',info:'الإعلانات',books:'الكتب',family:'الأسرة الصفية',tools:'الأدوات',settings:'الإعدادات',guide:'دليل الموقع',admin:'الإدارة'};
function svg(name){const common='width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';const p={
house:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
'calendar-days':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
'calendar-range':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h8"/>',
'list-checks':'<path d="m3 6 2 2 4-4M3 13l2 2 4-4M13 6h8M13 13h8M3 20h18"/>',
images:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
megaphone:'<path d="m3 11 18-5v12L3 13zM11 14l2 7H8l-2-8"/>',
'book-open':'<path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13h-5a4 4 0 0 0-4 3 4 4 0 0 0-4-3z"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
wrench:'<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 12l-2-2z"/>',
'sliders-horizontal':'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
'map-pin':'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>'
};return '<svg '+common+'>'+ (p[name]||p.house)+'</svg>'}
function labelize(b,id){const t=(b.textContent||paths[id]||id).trim();b.textContent='';const ic=document.createElement('span');ic.className='ux-nav-icon';ic.innerHTML=svg(icons[id]||'house');const l=document.createElement('span');l.className='ux-nav-label';l.textContent=t;b.append(ic,l);b.dataset.uxTitle=t;b.title=t;b.setAttribute('aria-label',t)}
function initShell(){
 const nav=$('#mainNav'),head=$('.topbar'),app=$('.app'),main=$('.app>.page');if(!nav||!head||!app||!main||$('#uxSidebar'))return;
 const aside=document.createElement('aside');aside.id='uxSidebar';aside.className='ux-sidebar';aside.setAttribute('aria-label','التنقل الرئيسي');
 const brand=document.createElement('div');brand.className='ux-side-brand';brand.innerHTML='<img src="Our-School-Space.png" alt=""><strong>مساحتنا المدرسية</strong>';aside.append(brand);
 const settings=nav.querySelector('[data-nav="settings"]'),admin=nav.querySelector('[data-nav="admin"]');
 const bottom=document.createElement('div');bottom.className='ux-side-bottom';
 Array.from(nav.querySelectorAll('[data-nav]')).forEach(b=>labelize(b,b.dataset.nav));
 if(settings)bottom.append(settings);if(admin)bottom.append(admin);
 aside.append(nav,bottom);
 const collapse=document.createElement('button');collapse.type='button';collapse.className='ux-collapse';collapse.innerHTML='⇤ <span class="ux-label">طيّ الشريط</span>';collapse.title='طيّ أو توسيع الشريط';collapse.addEventListener('click',()=>{aside.classList.toggle('collapsed');app.classList.toggle('ux-collapsed',aside.classList.contains('collapsed'));try{localStorage.setItem('masahatuna-sidebar-collapsed',aside.classList.contains('collapsed')?'1':'0')}catch(e){}});aside.append(collapse);
 head.after(aside);
 try{if(localStorage.getItem('masahatuna-sidebar-collapsed')==='1'){aside.classList.add('collapsed');app.classList.add('ux-collapsed')}}catch(e){}
 const actions=$('.top-actions');if(actions){
  const search=document.createElement('button');search.type='button';search.className='ux-search-trigger';search.title='بحث موحّد';search.setAttribute('aria-label','بحث موحّد');search.innerHTML=svg('search');search.addEventListener('click',openSearch);actions.prepend(search);
  const account=$('#accountName');if(account){account.classList.add('ux-account');account.setAttribute('aria-label','الحساب والملف الشخصي');account.title='الملف الشخصي';const setAvatar=()=>{const name=(typeof user==='function'&&user()?.name)||'';account.textContent=name?name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join(''):'؟'};setAvatar();new MutationObserver(setAvatar).observe(account,{childList:true,characterData:true,subtree:true})}
 }
 const mobile=document.createElement('nav');mobile.className='ux-mobile-nav';mobile.setAttribute('aria-label','التنقل السريع');
 const items=[['home','الرئيسية'],['schedule','الجدول'],['tasks','المهام'],['calendar','التقويم']];
 items.forEach(([id,title])=>{const b=document.createElement('button');b.type='button';b.dataset.mobileNav=id;b.dataset.icon='';b.innerHTML=svg(icons[id])+'<span>'+title+'</span>';b.addEventListener('click',()=>window.go(id));mobile.append(b)});
 const more=document.createElement('button');more.type='button';more.className='ux-more';more.innerHTML='<span>المزيد</span>';more.addEventListener('click',()=>window.toggleMenu());mobile.append(more);document.body.append(mobile);
 const syncActive=()=>{const active=nav.querySelector('[data-nav].active')?.dataset.nav;mobile.querySelectorAll('[data-mobile-nav]').forEach(b=>b.classList.toggle('active',b.dataset.mobileNav===active));const staff=!!(window.isStaff&&isStaff());const ab=nav.querySelector('[data-nav="admin"]');if(ab)ab.classList.toggle('hidden',!staff)};
 new MutationObserver(syncActive).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});syncActive();
 window.toggleMenu=function(force){const open=force===undefined?!aside.classList.contains('open'):!!force;aside.classList.toggle('open',open);const overlay=$('#navOverlay');if(overlay){overlay.classList.toggle('show',open);overlay.style.display=open?'block':''}document.body.classList.toggle('ux-menu-open',open)};
}
let layer=null,filter='all';
function searchable(){
 const out=[];const add=(arr,type,section,titleKey,descKey)=>{(Array.isArray(arr)?arr:[]).forEach(x=>{const title=x[titleKey]||x.title||x.name;if(!title)return;out.push({id:x.id,title:String(title),desc:String(x[descKey]||x.content||x.subject||''),type,section})})};
 const me=window.user&&user();
 add(typeof data!=='undefined'?data.tasks.filter(t=>me&&t.profileId===me.id):[],'المهام','tasks','title','subject');
 add(typeof data!=='undefined'?data.announcements:[],'الإعلانات','info','title','content');
 add(typeof data!=='undefined'?data.projects:[],'الأنشطة','activities','title','description');
 add(typeof data!=='undefined'?data.activities:[],'الأنشطة','activities','title','description');
 add(typeof data!=='undefined'?data.events:[],'التقويم','calendar','title','description');
 add(typeof data!=='undefined'?data.books:[],'الكتب','books','title','description');
 add(typeof data!=='undefined'?data.links:[],'الأدوات','tools','title','description');
 return out;
}
function openSearch(){
 if(layer)layer.remove();filter='all';layer=document.createElement('div');layer.className='ux-search-layer';layer.innerHTML='<section class="ux-search-dialog" role="dialog" aria-modal="true" aria-label="البحث في الموقع"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px"><strong>البحث في مساحتنا المدرسية</strong><button type="button" class="icon-btn" data-close aria-label="إغلاق">×</button></div><input type="search" placeholder="ابحثي عن مهمة أو إعلان أو نشاط..." autocomplete="off"><div class="ux-search-filters"><button class="active" data-filter="all">الكل</button><button data-filter="المهام">المهام</button><button data-filter="الإعلانات">الإعلانات</button><button data-filter="الأنشطة">الأنشطة</button><button data-filter="التقويم">التقويم</button><button data-filter="الكتب">الكتب</button></div><div class="ux-search-results"><p class="muted">ابدئي بكتابة كلمة للبحث في المحتوى المتاح لكِ.</p></div></section>';
 document.body.append(layer);const input=layer.querySelector('input');input.focus();layer.querySelector('[data-close]').onclick=()=>layer.remove();layer.addEventListener('click',e=>{if(e.target===layer)layer.remove()});
 layer.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;layer.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));runSearch(input.value)}));
 input.addEventListener('input',()=>runSearch(input.value));
 layer.addEventListener('keydown',e=>{if(e.key==='Escape')layer.remove()});
}
function runSearch(q){if(!layer)return;const box=layer.querySelector('.ux-search-results');q=(q||'').trim().toLocaleLowerCase('ar');if(!q){box.innerHTML='<p class="muted">ابدئي بكتابة كلمة للبحث في المحتوى المتاح لكِ.</p>';return}
 const found=searchable().filter(x=>(filter==='all'||x.type===filter)&&(x.title+' '+x.desc).toLocaleLowerCase('ar').includes(q)).slice(0,35);
 if(!found.length){box.innerHTML='<div class="empty">لا توجد نتائج مطابقة.</div>';return}
 box.innerHTML=found.map((x,i)=>'<button type="button" class="ux-search-result" data-result="'+i+'"><span><strong>'+escHtml(x.title)+'</strong><small>'+escHtml(x.type)+' · '+escHtml(x.desc.slice(0,110))+'</small></span><span aria-hidden="true">←</span></button>').join('');
 box.querySelectorAll('[data-result]').forEach(b=>b.addEventListener('click',()=>{const x=found[+b.dataset.result];layer.remove();window.go(x.section)}));
}
function escHtml(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function improveTaskToolbar(){
 const bar=$('#taskList .sel-bar');if(!bar||bar.dataset.uxReady)return;bar.dataset.uxReady='1';
 const count=bar.querySelector('strong');if(count)count.textContent=count.textContent.replace('تم تحديد','محدد');
 bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','إجراءات المهام المحددة');
}
function start(){initShell();improveTaskToolbar();const taskRoot=$('#taskList');if(taskRoot)new MutationObserver(improveTaskToolbar).observe(taskRoot,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* Settings: category navigation, admin directory and accessible toggles */
(function(){
const $=s=>document.querySelector(s);
function installSettings(){
 if(typeof window.renderSettings!=='function'||window.renderSettings.__uxWrapped)return;
 const base=window.renderSettings;
 const wrapped=function(){
  base();
  const box=$('#settingsBox');if(!box||box.dataset.uxCategories)return;
  const cards=Array.from(box.children).filter(x=>x.tagName==='SECTION');
  if(!cards.length)return;
  const names=['الإشعارات والأصوات','المظهر وسهولة القراءة','التطبيق'];
  const tabs=document.createElement('div');tabs.className='ux-settings-tabs';
  cards.forEach((card,i)=>{const b=document.createElement('button');b.type='button';b.textContent=names[i]||('إعدادات '+(i+1));b.addEventListener('click',()=>select(i));tabs.append(b);card.classList.add('ux-settings-card')});
  box.prepend(tabs);
  const extra=document.createElement('section');extra.className='card ux-accessibility-extra';extra.innerHTML='<h3>إمكانية الوصول</h3><div class="ux-access-actions"><button type="button" data-font="-">تصغير الخط</button><button type="button" data-font="+">تكبير الخط</button><button type="button" data-font="0">الحجم الافتراضي</button></div><label class="ux-setting-toggle"><span>تقليل الحركة والانتقالات</span><input type="checkbox" id="uxReduceMotion"></label>';
  box.append(extra);
  extra.querySelectorAll('[data-font]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.font;const v=n==='0'?100:Math.max(85,Math.min(150,(Number(prefs.font)||100)+(n==='+'?5:-5)));setFont(v);const r=box.querySelector('input[type="range"]');if(r)r.value=v}));
  const rm=extra.querySelector('#uxReduceMotion');try{rm.checked=localStorage.getItem('masahatuna-reduce-motion')==='1'}catch(e){};document.documentElement.classList.toggle('ux-reduce-motion',rm.checked);rm.addEventListener('change',()=>{document.documentElement.classList.toggle('ux-reduce-motion',rm.checked);try{localStorage.setItem('masahatuna-reduce-motion',rm.checked?'1':'0')}catch(e){}});
  function select(i){cards.forEach((c,n)=>c.hidden=n!==i);tabs.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===i));extra.hidden=i!==1;try{localStorage.setItem('masahatuna-settings-tab',String(i))}catch(e){}}
  let initial=0;try{initial=Math.max(0,Math.min(cards.length-1,Number(localStorage.getItem('masahatuna-settings-tab'))||0))}catch(e){};select(initial);box.dataset.uxCategories='1';
 };
 wrapped.__uxWrapped=true;window.renderSettings=wrapped;
}
function installAdmin(){
 if(typeof window.renderAdmin!=='function'||window.renderAdmin.__uxWrapped)return;
 const base=window.renderAdmin;
 const wrapped=function(){
  base();const panel=$('#adminPanel');if(!panel||panel.classList.contains('hidden')||panel.querySelector('.ux-admin-directory'))return;
  const tabs=Array.from(panel.querySelectorAll('.admin-tab'));if(!tabs.length)return;
  const names={overview:['نظرة عامة','ملخص حالة المنصة والإدارة'],notifications:['الإشعارات','إدارة التنبيهات والإعلانات'],users:['حسابات الطالبات','متابعة حسابات الطالبات'],supervisors:['المشرفات والصلاحيات','تعيين الأدوار وتحديد الصلاحيات'],schedule:['الجدول والدوام','إدارة الجداول وأيام الدوام والاستثناءات'],projects:['معرض المشاريع','متابعة المشاريع والمشاركات'],accounts:['الحسابات والأدوار','إدارة الحسابات والأدوار'],exams:['رزنامة الامتحانات','تنظيم مواعيد الامتحانات'],content:['الكتب والروابط والأسرة','إدارة محتوى الصف والخدمات']};
  const grid=document.createElement('div');grid.className='ux-admin-directory';
  tabs.forEach(t=>{const m=(t.getAttribute('onclick')||'').match(/adminTab\('([^']+)'\)/);if(!m)return;const key=m[1],info=names[key]||[t.textContent.trim(),'إدارة هذا القسم'];const b=document.createElement('button');b.type='button';b.className='ux-admin-card';b.innerHTML='<span class="ux-admin-icon">'+({overview:'◫',notifications:'◉',users:'♙',supervisors:'♧',schedule:'▦',projects:'▧',accounts:'◎',exams:'◷',content:'▤'}[key]||'◇')+'</span><strong>'+info[0]+'</strong><small>'+info[1]+'</small><span class="ux-admin-arrow">←</span>';b.addEventListener('click',()=>{window.adminTab(key);grid.classList.add('is-collapsed');let back=panel.querySelector('.ux-admin-back');if(!back){back=document.createElement('button');back.className='btn secondary ux-admin-back';back.textContent='← جميع أقسام الإدارة';back.addEventListener('click',()=>{grid.classList.remove('is-collapsed');back.remove()});panel.insertBefore(back,panel.querySelector('.admin-panel'))}});grid.append(b)});
  panel.insertBefore(grid,panel.firstChild);
 };
 wrapped.__uxWrapped=true;window.renderAdmin=wrapped;
}
function boot(){installSettings();installAdmin();if(typeof window.renderSettings==='function'&&$('#settings')&&!$('#settings').classList.contains('hidden'))window.renderSettings();if(typeof window.renderAdmin==='function'&&$('#admin')&&!$('#admin').classList.contains('hidden'))window.renderAdmin()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
const mo=new MutationObserver(()=>{installSettings();installAdmin()});if(document.body)mo.observe(document.body,{childList:true,subtree:true});
})();

/* Private notes — isolated under users/{uid}/notes; never fall back to shared/local storage. */
(function(){
const $=s=>document.querySelector(s);
let notes=[],notesUid=null,notesUnsub=null,activeNote=null,saveTimer=null,notesQuery='',sortMode='updated',notesError='';
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function owner(){return typeof auth!=='undefined'&&auth&&auth.currentUser?auth.currentUser.uid:null}
function stop(){if(notesUnsub){try{notesUnsub()}catch(e){}}notesUnsub=null;notesUid=null;notes=[];activeNote=null;clearTimeout(saveTimer)}
function start(){
 const uid=owner(),root=$('#notesApp');if(!root)return;
 if(!uid){stop();root.innerHTML='<div class="empty">الملاحظات الشخصية تتطلب تسجيل الدخول، وهي غير متاحة في وضع الزائرة.<br><button class="btn primary" onclick="showAuth(\'login\')">تسجيل الدخول</button></div>';return}
 if(!cloud||typeof db==='undefined'||!db){root.innerHTML='<div class="notice">تعذر الاتصال الآمن بالمزامنة. لم يتم حفظ الملاحظات محلياً.</div>';return}
 if(notesUid===uid&&notesUnsub){renderList();return}
 stop();delete root.dataset.uxNotesReady;notesUid=uid;root.innerHTML='<div class="empty">جارٍ تحميل ملاحظاتك الخاصة…</div>';
 notesUnsub=db.collection('users').doc(uid).collection('notes').onSnapshot(snap=>{
  notes=snap.docs.map(d=>({id:d.id,...d.data()}));
  if(activeNote&&!notes.some(n=>n.id===activeNote))activeNote=null;
  if(!activeNote&&notes.length)activeNote=sorted()[0].id;
  if(!root.dataset.uxNotesReady){renderApp();root.dataset.uxNotesReady='1'}else{renderList();}
 },err=>{notesError=err&&err.code==='permission-denied'?'قواعد Firestore لا تسمح بالوصول إلى مساحة الملاحظات بعد. يجب إضافة قاعدة الملاحظات الخاصة إلى قواعد المشروع.':'تعذر تحميل الملاحظات. تحققي من الاتصال والصلاحيات.';root.innerHTML='<div class="notice">'+esc(notesError)+'</div>'});
}
function sorted(){return notes.slice().sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||(sortMode==='created'?(b.createdAt||0)-(a.createdAt||0):(b.updatedAt||0)-(a.updatedAt||0)))}
function visible(){return sorted().filter(n=>!notesQuery||(n.title+' '+plain(n.body)+' '+(n.category||'')).toLowerCase().includes(notesQuery.toLowerCase()))}
function plain(html){const d=document.createElement('div');d.innerHTML=html||'';return d.textContent||''}
function renderApp(){const root=$('#notesApp');if(!root)return;root.innerHTML='<aside class="ux-notes-list"><div class="ux-notes-list-head"><input id="uxNoteSearch" type="search" placeholder="ابحثي في ملاحظاتك"><button type="button" class="btn primary" id="uxNewNote" aria-label="ملاحظة جديدة">+</button></div><div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 10px"><small class="muted">'+notes.length+' ملاحظة</small><select id="uxNoteSort" aria-label="ترتيب الملاحظات"><option value="updated">آخر تعديل</option><option value="created">الأحدث إنشاءً</option></select></div><div id="uxNoteList"></div></aside><section class="ux-note-editor" id="uxNoteEditor"></section>';$('#uxNoteSearch').value=notesQuery;$('#uxNoteSearch').addEventListener('input',e=>{notesQuery=e.target.value;renderList()});$('#uxNoteSort').value=sortMode;$('#uxNoteSort').addEventListener('change',e=>{sortMode=e.target.value;renderList()});$('#uxNewNote').addEventListener('click',createNote);renderList()}
function renderList(){const list=$('#uxNoteList');if(!list)return;const arr=visible();list.innerHTML=arr.length?arr.map(n=>'<button type="button" class="ux-note-item '+(n.id===activeNote?'active':'')+'" data-note="'+esc(n.id)+'"><strong>'+(n.pinned?'📌 ':'')+esc(n.title||'ملاحظة بلا عنوان')+'</strong><small>'+esc(plain(n.body).slice(0,76)||'لا يوجد محتوى بعد')+'</small></button>').join(''):'<div class="empty">لا توجد ملاحظات مطابقة.</div>';list.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{flushSave();activeNote=b.dataset.note;renderList();renderEditor()}));if(!activeNote&&arr.length){activeNote=arr[0].id;renderList()}const editor=$('#uxNoteEditor');if(!editor||!editor.contains(document.activeElement))renderEditor()}
function renderEditor(){const el=$('#uxNoteEditor');if(!el)return;const n=notes.find(x=>x.id===activeNote);if(!n){el.innerHTML='<div class="empty">اختاري ملاحظة أو أنشئي ملاحظة جديدة.</div>';return}
 el.innerHTML='<div class="ux-note-editor-head"><input id="uxNoteTitle" maxlength="140" placeholder="عنوان الملاحظة" value="'+esc(n.title||'')+'"><button class="btn secondary" id="uxPinNote">'+(n.pinned?'إلغاء التثبيت':'تثبيت')+'</button><button class="btn danger" id="uxDeleteNote">حذف</button></div><input id="uxNoteCategory" maxlength="40" placeholder="تصنيف اختياري" value="'+esc(n.category||'')+'" style="margin-bottom:8px"><div class="ux-note-toolbar" role="toolbar" aria-label="تنسيق النص"><button type="button" data-cmd="bold"><b>B</b></button><button type="button" data-cmd="italic"><i>I</i></button><button type="button" data-cmd="formatBlock" data-value="H2">عنوان</button><button type="button" data-cmd="insertUnorderedList">قائمة</button><button type="button" data-cmd="insertOrderedList">ترقيم</button><button type="button" data-link="1">رابط</button></div><div id="uxNoteBody" class="ux-note-body" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="اكتبي ملاحظتك هنا…">'+sanitize(n.body||'')+'</div><div class="ux-note-status" id="uxNoteStatus">يُحفظ تلقائياً في حسابك.</div>';
 $('#uxNoteTitle').addEventListener('input',scheduleSave);$('#uxNoteCategory').addEventListener('input',scheduleSave);$('#uxNoteBody').addEventListener('input',scheduleSave);
 el.querySelectorAll('[data-cmd]').forEach(b=>b.addEventListener('click',()=>{const body=$('#uxNoteBody');body.focus();document.execCommand(b.dataset.cmd,false,b.dataset.value||null);scheduleSave()}));
 el.querySelector('[data-link]').addEventListener('click',()=>{const url=prompt('أدخلي رابطاً يبدأ بـ https://');if(!url||!/^https?:\/\//i.test(url))return;$('#uxNoteBody').focus();document.execCommand('createLink',false,url);scheduleSave()});
 $('#uxPinNote').addEventListener('click',()=>updateMeta({pinned:!n.pinned}));$('#uxDeleteNote').addEventListener('click',deleteNote);
}
function sanitize(html){const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html'),allowed=new Set(['B','STRONG','I','EM','U','P','BR','UL','OL','LI','H2','H3','BLOCKQUOTE','A']);function clean(node){let out='';node.childNodes.forEach(ch=>{if(ch.nodeType===3){out+=esc(ch.nodeValue);return}if(ch.nodeType!==1)return;const tag=ch.tagName;if(!allowed.has(tag)){out+=clean(ch);return}if(tag==='A'){const href=ch.getAttribute('href')||'';if(!/^https?:\/\//i.test(href)){out+=clean(ch);return}out+='<a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">'+clean(ch)+'</a>';return}out+='<'+tag.toLowerCase()+'>'+clean(ch)+'</'+tag.toLowerCase()+'>'});return out}return clean(doc.body.firstChild)}
function scheduleSave(){const st=$('#uxNoteStatus');if(st)st.textContent='جارٍ حفظ التغييرات…';clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,650)}
async function flushSave(){clearTimeout(saveTimer);const n=notes.find(x=>x.id===activeNote);if(!n||!owner()||owner()!==notesUid)return;const title=$('#uxNoteTitle'),body=$('#uxNoteBody'),cat=$('#uxNoteCategory');if(title)n.title=title.value;if(body)n.body=sanitize(body.innerHTML);if(cat)n.category=cat.value;n.updatedAt=Date.now();try{await db.collection('users').doc(notesUid).collection('notes').doc(n.id).set({ownerUid:notesUid,title:n.title||'',body:n.body||'',category:n.category||'',pinned:!!n.pinned,createdAt:n.createdAt||Date.now(),updatedAt:n.updatedAt});const st=$('#uxNoteStatus');if(st)st.textContent='تم الحفظ تلقائياً';renderList()}catch(e){const st=$('#uxNoteStatus');if(st)st.textContent=e&&e.code==='permission-denied'?'تعذر الحفظ: راجعي قواعد أمان الملاحظات في Firestore.':'تعذر الحفظ؛ تحققي من الاتصال.'}}
async function createNote(){if(!owner()||owner()!==notesUid)return;const id=typeof uid==='function'?uid('note'):('note_'+Date.now());const n={id,title:'',body:'',category:'',pinned:false,createdAt:Date.now(),updatedAt:Date.now()};try{await db.collection('users').doc(notesUid).collection('notes').doc(id).set({ownerUid:notesUid,title:'',body:'',category:'',pinned:false,createdAt:n.createdAt,updatedAt:n.updatedAt});notes.unshift(n);activeNote=id;renderList()}catch(e){toast(e&&e.code==='permission-denied'?'قواعد Firestore تمنع إنشاء الملاحظات حالياً.':'تعذر إنشاء الملاحظة؛ تحققي من الاتصال.')}}
async function updateMeta(patch){const n=notes.find(x=>x.id===activeNote);if(!n)return;Object.assign(n,patch,{updatedAt:Date.now()});try{await db.collection('users').doc(notesUid).collection('notes').doc(n.id).update({...patch,updatedAt:n.updatedAt});renderList()}catch(e){toast('تعذر تحديث الملاحظة. تحققي من صلاحيات Firestore.')}}
async function deleteNote(){const n=notes.find(x=>x.id===activeNote);if(!n||!confirm('حذف هذه الملاحظة نهائياً؟'))return;try{await db.collection('users').doc(notesUid).collection('notes').doc(n.id).delete();notes=notes.filter(x=>x.id!==n.id);activeNote=sorted()[0]?.id||null;renderList()}catch(e){toast('تعذر حذف الملاحظة. تحققي من صلاحيات Firestore.')}}
function watch(){const page=$('#notes');if(page&&!page.classList.contains('hidden'))start();else if(!owner()&&notesUnsub)stop()}
function wrapGo(){if(typeof window.go!=='function'||window.go.__notesWrapped)return;const base=window.go;const wrapped=function(id){const r=base.apply(this,arguments);if(id==='notes')setTimeout(start,0);return r};wrapped.__notesWrapped=true;window.go=wrapped}
function wrapRender(){if(typeof window.render!=='function'||window.render.__notesWrapped)return;const base=window.render;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(watch,0);return r};wrapped.__notesWrapped=true;window.render=wrapped}
function boot(){wrapGo();wrapRender();watch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
