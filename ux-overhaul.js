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
shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>,
'panel-left-close':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 9l-3 3 3 3"/>',
'panel-left-open':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M12 9l3 3-3 3"/>',
'chevron-down':'<path d="m6 9 6 6 6-6"/>','chevron-up':'<path d="m6 15 6-6 6 6"/>'
};return '<svg '+common+'>'+ (p[name]||p.house)+'</svg>'}
function labelize(b,id){const t=(b.textContent||paths[id]||id).trim();b.textContent='';const ic=document.createElement('span');ic.className='ux-nav-icon';ic.innerHTML=svg(icons[id]||'house');const l=document.createElement('span');l.className='ux-nav-label';l.textContent=t;b.append(ic,l);b.dataset.uxTitle=t;b.title=t;b.setAttribute('aria-label',t)}
function initShell(){
 const nav=$('#mainNav'),head=$('.topbar'),app=$('.app'),main=$('.app>.page');if(!nav||!head||!app||!main||$('#uxSidebar'))return;
 const aside=document.createElement('aside');aside.id='uxSidebar';aside.className='ux-sidebar';aside.setAttribute('aria-label','التنقل الرئيسي');
 const brand=document.createElement('div');brand.className='ux-side-brand';brand.innerHTML='<img src="Our-School-Space.png" alt="شعار مساحتنا المدرسية"><strong>مساحتنا المدرسية</strong><button type="button" class="ux-brand-collapse" aria-label="طي الشريط" title="طي الشريط">'+svg('panel-left-close')+'</button>';aside.append(brand);
 const settings=nav.querySelector('[data-nav="settings"]'),admin=nav.querySelector('[data-nav="admin"]');
 const bottom=document.createElement('div');bottom.className='ux-side-bottom';
 Array.from(nav.querySelectorAll('[data-nav]')).forEach(b=>labelize(b,b.dataset.nav));
 // Expandable schedule submenu: the parent opens the schedule; child links select its view.
 const scheduleButton=nav.querySelector('[data-nav="schedule"]');
 if(scheduleButton&&!nav.querySelector('.ux-schedule-subnav')){
  scheduleButton.classList.add('ux-nav-parent');
  const arrow=document.createElement('span');arrow.className='ux-nav-chevron';arrow.innerHTML=svg('chevron-down');arrow.setAttribute('aria-hidden','true');scheduleButton.append(arrow);
  const sub=document.createElement('div');sub.className='ux-schedule-subnav';sub.hidden=true;sub.setAttribute('role','group');sub.setAttribute('aria-label','أقسام الجدول');
  [['day','اليوم'],['week','الأسبوع'],['month','الشهر']].forEach(([mode,title])=>{
   const child=document.createElement('button');child.type='button';child.dataset.scheduleMode=mode;child.textContent=title;
   child.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.go==='function')window.go('schedule');if(typeof window.setScheduleMode==='function')window.setScheduleMode(mode);sub.querySelectorAll('button').forEach(x=>{const on=x===child;x.classList.toggle('active',on);x.setAttribute('aria-current',on?'page':'false')})});
   sub.append(child);
  });
  const syncSub=()=>{const open=!sub.hidden;scheduleButton.classList.toggle('submenu-open',open);scheduleButton.setAttribute('aria-expanded',String(open));arrow.innerHTML=svg(open?'chevron-up':'chevron-down')};
  scheduleButton.addEventListener('click',()=>{sub.hidden=!sub.hidden;syncSub()});
  nav.querySelectorAll('[data-nav]:not([data-nav="schedule"])').forEach(b=>b.addEventListener('click',()=>{sub.hidden=true;syncSub()}));
  scheduleButton.insertAdjacentElement('afterend',sub);syncSub();
  const syncScheduleMode=mode=>sub.querySelectorAll('[data-schedule-mode]').forEach(x=>{const on=x.dataset.scheduleMode===mode;x.classList.toggle('active',on);x.setAttribute('aria-current',on?'page':'false')});
  const activeMode=()=>{const active=document.querySelector('#swDay.active,#swWeek.active,#swMonth.active');return active?.id==='swWeek'?'week':active?.id==='swMonth'?'month':'day'};
  syncScheduleMode(activeMode());
  if(typeof window.setScheduleMode==='function'&&!window.__uxScheduleModeWrapped){
   const originalSetScheduleMode=window.setScheduleMode;
   window.setScheduleMode=function(mode){const result=originalSetScheduleMode.apply(this,arguments);syncScheduleMode(mode);return result};
   window.__uxScheduleModeWrapped=true;
  }
 }
 if(settings)bottom.append(settings);if(admin)bottom.append(admin);
 aside.append(nav,bottom);
 const collapse=brand.querySelector('.ux-brand-collapse');const syncCollapse=()=>{const closed=aside.classList.contains('collapsed');collapse.setAttribute('aria-label',closed?'توسيع الشريط':'طي الشريط');collapse.title=closed?'توسيع الشريط':'طي الشريط';collapse.innerHTML=svg(closed?'panel-left-open':'panel-left-close')};collapse.addEventListener('click',()=>{aside.classList.toggle('collapsed');app.classList.toggle('ux-collapsed',aside.classList.contains('collapsed'));syncCollapse();try{localStorage.setItem('masahatuna-sidebar-collapsed',aside.classList.contains('collapsed')?'1':'0')}catch(e){}});
 head.after(aside);
 try{if(localStorage.getItem('masahatuna-sidebar-collapsed')==='1'){aside.classList.add('collapsed');app.classList.add('ux-collapsed')}}catch(e){}syncCollapse();
 const actions=$('.top-actions');if(actions){
  const search=document.createElement('button');search.type='button';search.className='ux-search-trigger';search.title='بحث موحّد';search.setAttribute('aria-label','بحث موحّد');search.innerHTML=svg('search');search.addEventListener('click',openSearch);actions.prepend(search);
  const account=$('#accountName');if(account){account.classList.add('ux-account');account.setAttribute('aria-label','الحساب والملف الشخصي');account.title='الملف الشخصي';const setAvatar=()=>{const name=(typeof user==='function'&&user()?.name)||'';const avatar=name?name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join(''):'؟';if(account.textContent!==avatar)account.textContent=avatar};setAvatar();new MutationObserver(setAvatar).observe(account,{childList:true,characterData:true,subtree:true})}
 }

 const mobile=document.createElement('nav');mobile.className='ux-mobile-nav';mobile.setAttribute('aria-label','التنقل السريع');
 const items=[['home','الرئيسية'],['schedule','الجدول'],['tasks','المهام'],['calendar','التقويم']];
 items.forEach(([id,title])=>{const b=document.createElement('button');b.type='button';b.dataset.mobileNav=id;b.innerHTML=svg(icons[id])+'<span>'+title+'</span>';b.addEventListener('click',()=>window.go(id));mobile.append(b)});
 const more=document.createElement('button');more.type='button';more.className='ux-more';more.innerHTML=svg('list-checks')+'<span>المزيد</span>';mobile.append(more);document.body.append(mobile);
 const moreMenu=document.createElement('div');moreMenu.className='ux-more-menu';moreMenu.setAttribute('role','menu');moreMenu.setAttribute('aria-label','بقية أقسام الموقع');
 Array.from(nav.querySelectorAll('[data-nav]')).filter(b=>!['home','schedule','tasks','calendar'].includes(b.dataset.nav)).forEach(source=>{const id=source.dataset.nav,title=paths[id]||source.textContent.trim(),b=document.createElement('button');b.type='button';b.dataset.moreNav=id;b.innerHTML=svg(icons[id]||'house')+'<span>'+title+'</span>';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();moreMenu.classList.remove('open');window.go(id)});moreMenu.append(b)});
 document.body.append(moreMenu);
 const syncActive=()=>{const active=nav.querySelector('[data-nav].active')?.dataset.nav;mobile.querySelectorAll('[data-mobile-nav]').forEach(b=>b.classList.toggle('active',b.dataset.mobileNav===active));moreMenu.querySelectorAll('[data-more-nav]').forEach(b=>b.classList.toggle('active',b.dataset.moreNav===active));const staff=!!(window.isStaff&&isStaff());const ab=moreMenu.querySelector('[data-more-nav="admin"]');if(ab)ab.classList.toggle('hidden',!staff);const sourceAdmin=nav.querySelector('[data-nav="admin"]');if(sourceAdmin)sourceAdmin.classList.toggle('hidden',!staff)};
 new MutationObserver(syncActive).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});syncActive();
 const positionMoreMenu=()=>{
  const r=more.getBoundingClientRect(),w=Math.min(260,window.innerWidth-20);
  const left=Math.max(10,Math.min(window.innerWidth-w-10,r.left+r.width/2-w/2));
  moreMenu.style.left=left+'px';moreMenu.style.right='auto';
  moreMenu.style.bottom=Math.max(10,window.innerHeight-r.top+8)+'px';
 };
 const toggleMore=force=>{
  const open=force===undefined?!moreMenu.classList.contains('open'):!!force;
  moreMenu.classList.toggle('open',open);more.setAttribute('aria-expanded',String(open));
  const createFab=$('#uxCreateFab');if(createFab)createFab.style.visibility=open?'hidden':'';
  if(open)positionMoreMenu();
 };
 more.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleMore()});
 window.addEventListener('resize',()=>{if(moreMenu.classList.contains('open'))positionMoreMenu()});
 window.addEventListener('scroll',()=>{if(moreMenu.classList.contains('open'))positionMoreMenu()},true);
 document.addEventListener('click',e=>{if(!moreMenu.contains(e.target)&&!more.contains(e.target))toggleMore(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMore(false)});
 window.toggleMenu=toggleMore;
 const hamburger=$('.topbar .menu-btn');if(hamburger)hamburger.remove();const overlay=$('#navOverlay');if(overlay)overlay.remove();
 // Floating create menu: single entry point for task and note creation.
 document.querySelectorAll('#home .hero button[onclick*="openTask"],#tasks .hero button[onclick*="openTask"]').forEach(b=>b.remove());
 if(!$('#uxCreateFab')){
  const fab=document.createElement('button');fab.id='uxCreateFab';fab.type='button';fab.className='task-fab';fab.setAttribute('aria-label','إنشاء جديد');fab.setAttribute('aria-expanded','false');fab.innerHTML='<span aria-hidden="true">+</span>';document.body.append(fab);
  const menu=document.createElement('div');menu.id='uxCreateMenu';menu.className='ux-create-menu';menu.hidden=true;menu.innerHTML='<button type="button" data-create="task">＋ إنشاء مهمة</button><button type="button" data-create="note">▤ إنشاء ملاحظة</button>';document.body.append(menu);
  const close=()=>{menu.hidden=true;fab.setAttribute('aria-expanded','false');fab.classList.remove('is-open')};
  fab.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;fab.setAttribute('aria-expanded',String(opening));fab.classList.toggle('is-open',opening)});
  menu.querySelector('[data-create="task"]').addEventListener('click',()=>{close();if(typeof window.openTask==='function')window.openTask()});
  menu.querySelector('[data-create="note"]').addEventListener('click',()=>{close();if(!window.user||!window.user()){if(typeof window.openProfile==='function')window.openProfile();return}window.go('notes');setTimeout(()=>document.querySelector('#uxNewNote')?.click(),180)});
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!fab.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 }
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
 bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','إجراءات المهام المحددة');const toggle=document.createElement('button');toggle.type='button';toggle.className='ux-toolbar-toggle';toggle.textContent='تصغير';toggle.setAttribute('aria-expanded','true');toggle.addEventListener('click',()=>{bar.classList.toggle('ux-collapsed');const closed=bar.classList.contains('ux-collapsed');toggle.textContent=closed?'توسيع':'تصغير';toggle.setAttribute('aria-expanded',String(!closed))});bar.append(toggle);
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
  const before=$('#settingsBox');if(before)delete before.dataset.uxCategories;
  base();
  const box=$('#settingsBox');if(!box||box.dataset.uxCategories)return;
  const cards=Array.from(box.children).filter(x=>x.tagName==='SECTION');
  if(!cards.length)return;
  const reorder=document.createElement('section');reorder.className='card ux-reorder-section';reorder.innerHTML='<h3>ترتيب الأقسام</h3><p class="muted">رتّبي الأقسام بالطريقة التي تناسبك. يُحفظ الترتيب لحسابك على هذا الجهاز.</p><ol class="ux-reorder-list" id="uxSectionOrderList"></ol><button type="button" class="btn secondary" id="uxResetSectionOrder">إعادة الترتيب الافتراضي</button>';
  box.append(reorder);cards.push(reorder);
  const names=['الإشعارات والأصوات','المظهر وسهولة القراءة','التطبيق','ترتيب الأقسام'];
  const categories=document.createElement('div');categories.className='ux-settings-categories';categories.setAttribute('aria-label','فئات الإعدادات');
  const categoryInfo=[
   ['bell','إدارة التنبيهات والأصوات وتفضيلات أنواع الإشعارات'],
   ['palette','الثيم وألوان الهوية وحجم الخط والتباين وإمكانية الوصول'],
   ['smartphone','تحديث التطبيق وتثبيته عند دعم الجهاز'],
   ['arrow-up-down','ترتيب أقسام الموقع وإعادتها إلى الترتيب الافتراضي']
  ];
  const categoryIcons={bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',palette:'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 .8-2.8H17a4 4 0 0 0 4-4c0-4.1-4-7.5-9-7.5Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/>',smartphone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>','arrow-up-down':'<path d="m7 7 5-5 5 5M12 2v14m5 1-5 5-5-5"/>'};
  cards.forEach((card,i)=>{card.classList.add('ux-settings-card');card.hidden=true;const b=document.createElement('button');b.type='button';b.className='ux-settings-category';b.innerHTML='<span class="ux-settings-category-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+(categoryIcons[categoryInfo[i]?.[0]]||'')+'</svg></span><span class="ux-settings-category-copy"><strong>'+names[i]+'</strong><small>'+categoryInfo[i][1]+'</small></span><span class="ux-settings-category-arrow" aria-hidden="true">←</span>';b.addEventListener('click',()=>select(i));categories.append(b)});
  box.prepend(categories);
  const extra=document.createElement('section');extra.className='card ux-accessibility-extra';extra.innerHTML='<h3>إمكانية الوصول</h3><div class="ux-access-actions"><button type="button" data-font="-">تصغير الخط</button><button type="button" data-font="+">تكبير الخط</button><button type="button" data-font="0">الحجم الافتراضي</button></div><label class="ux-setting-toggle"><span>تقليل الحركة والانتقالات</span><input type="checkbox" id="uxReduceMotion"></label>';
  box.append(extra);
  extra.querySelectorAll('[data-font]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.font;const v=n==='0'?100:Math.max(85,Math.min(150,(Number(prefs.font)||100)+(n==='+'?5:-5)));setFont(v);const r=box.querySelector('input[type="range"]');if(r)r.value=v}));
  const rm=extra.querySelector('#uxReduceMotion');try{rm.checked=localStorage.getItem('masahatuna-reduce-motion')==='1'}catch(e){};document.documentElement.classList.toggle('ux-reduce-motion',rm.checked);rm.addEventListener('change',()=>{document.documentElement.classList.toggle('ux-reduce-motion',rm.checked);try{localStorage.setItem('masahatuna-reduce-motion',rm.checked?'1':'0')}catch(e){}});
  const back=document.createElement('button');back.type='button';back.className='btn secondary ux-settings-back';back.textContent='→ جميع فئات الإعدادات';back.addEventListener('click',showCategories);box.prepend(back);
  function showCategories(){categories.hidden=false;back.hidden=true;cards.forEach(c=>c.hidden=true);extra.hidden=true;reorder.hidden=true}
  function select(i){categories.hidden=true;back.hidden=false;cards.forEach((c,n)=>c.hidden=n!==i);extra.hidden=i!==1;reorder.hidden=i!==3;try{localStorage.setItem('masahatuna-settings-tab',String(i))}catch(e){}}
  const nav=document.getElementById('mainNav'),moreMenu=document.querySelector('.ux-more-menu');
  const originalOrder=nav?Array.from(nav.querySelectorAll(':scope > [data-nav]')).map(b=>b.dataset.nav):[];
  const accountKey=()=>{try{return 'masahatuna-section-order-v1-'+((window.auth&&auth.currentUser&&auth.currentUser.uid)||'guest')}catch(e){return 'masahatuna-section-order-v1-guest'}};
  const readOrder=()=>{try{const a=JSON.parse(localStorage.getItem(accountKey())||'[]');return Array.isArray(a)?a:[]}catch(e){return []}};
  const applyOrder=order=>{
   if(!nav)return;const nodes=new Map(Array.from(nav.querySelectorAll(':scope > [data-nav]')).map(b=>[b.dataset.nav,b]));
   const ids=[...order.filter(id=>nodes.has(id)),...originalOrder.filter(id=>nodes.has(id)&&!order.includes(id))];
   ids.forEach(id=>nav.append(nodes.get(id)));
   if(moreMenu){const clones=new Map(Array.from(moreMenu.querySelectorAll('[data-more-nav]')).map(b=>[b.dataset.moreNav,b]));ids.filter(id=>clones.has(id)).forEach(id=>moreMenu.append(clones.get(id)))}
  };
  const renderOrder=()=>{
   const list=reorder.querySelector('#uxSectionOrderList');if(!list||!nav)return;
   const ids=Array.from(nav.querySelectorAll(':scope > [data-nav]')).map(b=>b.dataset.nav);
   list.innerHTML=ids.map((id,i)=>'<li draggable="true" data-order-id="'+id+'"><span class="ux-reorder-grip" aria-hidden="true">⠿</span><span>'+((paths[id])||id)+'</span><button type="button" data-up aria-label="تحريك لأعلى" '+(i===0?'disabled':'')+'>↑</button><button type="button" data-down aria-label="تحريك لأسفل" '+(i===ids.length-1?'disabled':'')+'>↓</button></li>').join('');
   let drag=null;
   list.querySelectorAll('[data-order-id]').forEach(li=>{
    li.addEventListener('dragstart',()=>{drag=li.dataset.orderId;li.classList.add('dragging')});
    li.addEventListener('dragend',()=>{li.classList.remove('dragging');drag=null;saveOrder()});
    li.addEventListener('dragover',e=>{e.preventDefault();if(!drag||drag===li.dataset.orderId)return;const all=Array.from(list.children),from=all.findIndex(x=>x.dataset.orderId===drag),to=all.indexOf(li);if(from<to)li.after(all[from]);else li.before(all[from])});
    li.querySelector('[data-up]').addEventListener('click',()=>move(li.dataset.orderId,-1));
    li.querySelector('[data-down]').addEventListener('click',()=>move(li.dataset.orderId,1));
   });
  };
  const saveOrder=()=>{const ids=Array.from(reorder.querySelectorAll('[data-order-id]')).map(x=>x.dataset.orderId);applyOrder(ids);try{localStorage.setItem(accountKey(),JSON.stringify(ids))}catch(e){}renderOrder()};
  const move=(id,delta)=>{const ids=Array.from(reorder.querySelectorAll('[data-order-id]')).map(x=>x.dataset.orderId),i=ids.indexOf(id),j=i+delta;if(j<0||j>=ids.length)return;[ids[i],ids[j]]=[ids[j],ids[i]];applyOrder(ids);try{localStorage.setItem(accountKey(),JSON.stringify(ids))}catch(e){}renderOrder()};
  reorder.querySelector('#uxResetSectionOrder').addEventListener('click',()=>{try{localStorage.removeItem(accountKey())}catch(e){}applyOrder(originalOrder);renderOrder()});
  applyOrder(readOrder());renderOrder();
  showCategories();box.dataset.uxCategories='1';
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

/* Private notes — private per-user Firestore collection, read-only preview and explicit editing. */
(function(){
const $=s=>document.querySelector(s);
let notes=[],notesUid=null,notesUnsub=null,activeNote=null,saveTimer=null,notesQuery='',sortMode='updated',editing=false,history=[],historyAt=-1,notesReady=false,openDetailRequested=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const owner=()=>typeof auth!=='undefined'&&auth?.currentUser?auth.currentUser.uid:null;
const plain=html=>{const d=document.createElement('div');d.innerHTML=html||'';return (d.innerText||d.textContent||'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()};
const stamp=v=>v?new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';
function stop(){if(notesUnsub){try{notesUnsub()}catch(e){}}notesUnsub=null;notesUid=null;notes=[];activeNote=null;editing=false;clearTimeout(saveTimer)}
function sorted(){return notes.slice().sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||(sortMode==='created'?(b.createdAt||0)-(a.createdAt||0):(b.updatedAt||0)-(a.updatedAt||0)))}
function visible(){return sorted().filter(n=>!notesQuery||(n.title+' '+plain(n.body)+' '+(n.category||'')).toLowerCase().includes(notesQuery.toLowerCase()))}
function start(){
 const uid=owner(),root=$('#notesApp');if(!root)return;
 if(!uid){stop();root.innerHTML='<div class="empty">الملاحظات الشخصية تتطلب تسجيل الدخول، وهي غير متاحة في وضع الزائرة.<br><button class="btn primary" onclick="showAuth(\'login\')">تسجيل الدخول</button></div>';return}
 if(!cloud||typeof db==='undefined'||!db){root.innerHTML='<div class="notice">تعذر الاتصال الآمن بالمزامنة. لم يتم حفظ الملاحظات محلياً.</div>';return}
 if(notesUid===uid&&notesUnsub){renderList();return}
 stop();notesUid=uid;notesReady=false;root.innerHTML='<div class="empty">جارٍ تحميل ملاحظاتك الخاصة…</div>';
 notesUnsub=db.collection('users').doc(uid).collection('notes').onSnapshot(snap=>{
  notes=snap.docs.map(d=>({id:d.id,...d.data()}));
  if(activeNote&&!notes.some(n=>n.id===activeNote)){activeNote=null;editing=false}
  if(!notesReady){notesReady=true;renderApp()}else{renderList()}
 },err=>{root.innerHTML='<div class="notice">'+(err&&err.code==='permission-denied'?'قواعد Firestore لا تسمح بالوصول إلى ملاحظاتك.':'تعذر تحميل الملاحظات. تحققي من الاتصال والصلاحيات.')+'</div>'});
}
function renderApp(){
 const root=$('#notesApp');if(!root)return;
 const cats=[...new Set(notes.map(n=>n.category).filter(Boolean))];
 root.innerHTML='<div class="ux-notes-toolbar"><input id="uxNoteSearch" type="search" placeholder="ابحثي في ملاحظاتك"><select id="uxNoteSort" aria-label="ترتيب الملاحظات"><option value="updated">آخر تعديل</option><option value="created">الأحدث إنشاءً</option></select><button type="button" class="btn primary" id="uxNewNote">＋ ملاحظة جديدة</button></div><div class="ux-notes-workspace"><section class="ux-notes-board"><div class="ux-notes-categories" id="uxNoteCategories"></div><div class="ux-notes-grid" id="uxNoteList"></div></section><section class="ux-note-detail" id="uxNoteEditor" aria-label="تفاصيل الملاحظة"></section></div>';
 $('#uxNoteSearch').value=notesQuery;$('#uxNoteSearch').addEventListener('input',e=>{notesQuery=e.target.value;renderList()});
 $('#uxNoteSort').value=sortMode;$('#uxNoteSort').addEventListener('change',e=>{sortMode=e.target.value;renderList()});
 $('#uxNewNote').addEventListener('click',createNote);
 renderList();
}
function renderList(){
 const list=$('#uxNoteList');if(!list)return;const arr=visible(),cats=[...new Set(notes.map(n=>n.category).filter(Boolean))];
 const catBox=$('#uxNoteCategories');if(catBox)catBox.innerHTML='<button type="button" data-cat="">الكل</button>'+cats.map(c=>'<button type="button" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('')+'<button type="button" id="uxAddCategory">＋ تصنيف</button>';
 catBox?.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{notesQuery=b.dataset.cat;$('#uxNoteSearch').value=notesQuery;renderList()}));
 $('#uxAddCategory')?.addEventListener('click',()=>{const c=prompt('اسم التصنيف الجديد');if(!c?.trim())return;const n=notes.find(x=>x.id===activeNote);if(n){n.category=c.trim();saveMeta(n,{category:n.category})}else toast('أنشئي ملاحظة أولاً ثم اختاري تصنيفها.')});
 list.innerHTML=arr.length?arr.map(n=>'<button type="button" class="ux-note-card '+(n.id===activeNote?'active':'')+'" data-note="'+esc(n.id)+'" style="--note-bg:'+safeColor(n.color)+';--note-ink:'+noteInk(n.color)+'"><strong>'+(n.pinned?'◆ ':'')+esc(n.title||'ملاحظة بلا عنوان')+'</strong><span class="ux-note-preview">'+esc(plain(n.body).slice(0,110)||'لا يوجد محتوى بعد')+'</span><small>أُنشئت: '+stamp(n.createdAt)+'</small><small>آخر تعديل: '+stamp(n.updatedAt)+'</small>'+(n.category?'<em>'+esc(n.category)+'</em>':'')+'</button>').join(''):'<div class="empty">لا توجد ملاحظات بعد. أنشئي ملاحظتك الأولى.</div>';
 list.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{flushSave();activeNote=b.dataset.note;editing=false;openDetailRequested=true;renderList();renderEditor()}));
 renderEditor();
}
function safeColor(c){const allowed=['#F5F1E8','#E7F0FF','#D8CBEA','#B7CDBD','#F7D6CC','#FFFFFF'];const value=String(c||'').toUpperCase();return allowed.includes(value)?value:'#FFFFFF'}
function noteInk(){return '#26334A'}
function paletteButtons(current){return [['#F5F1E8','عاجي'],['#E7F0FF','أزرق هادئ'],['#D8CBEA','لافندر'],['#B7CDBD','أخضر هادئ'],['#F7D6CC','مرجاني'],['#FFFFFF','أبيض']].map(([c,n])=>'<button type="button" class="ux-note-swatch" data-note-color="'+c+'" title="'+n+'" aria-label="'+n+'" aria-pressed="'+(safeColor(current)===c)+'" style="background:'+c+'"></button>').join('')}
function svgPencil(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z"/></svg>'}
function renderEditor(){
 const el=$('#uxNoteEditor');if(!el)return;const n=notes.find(x=>x.id===activeNote);
 if(!n){el.hidden=true;el.innerHTML='';el.classList.remove('mobile-open');return}
 el.hidden=false;el.classList.toggle('mobile-open',true);
 if(!editing){
  el.innerHTML='<div class="ux-note-detail-head"><div><h2>'+esc(n.title||'ملاحظة بلا عنوان')+'</h2><small>أُنشئت '+stamp(n.createdAt)+' · آخر تعديل '+stamp(n.updatedAt)+'</small></div><button type="button" class="ux-note-edit-icon" id="uxEditNote" aria-label="تعديل الملاحظة" title="تعديل">'+svgPencil()+'</button><button type="button" class="icon-btn" id="uxCloseNote" aria-label="إغلاق">×</button></div><div class="ux-note-read" style="--note-bg:'+safeColor(n.color)+';--note-ink:'+noteInk()+'">'+(sanitize(n.body||'')||'<p class="muted">لا يوجد محتوى بعد.</p>')+'</div><div class="ux-note-detail-actions"><button type="button" class="btn secondary" id="uxPinNote">'+(n.pinned?'إلغاء التثبيت':'تثبيت')+'</button><button type="button" class="btn danger" id="uxDeleteNote">حذف</button></div>';
  $('#uxEditNote').onclick=()=>{editing=true;history=[];historyAt=-1;renderEditor()};
  $('#uxCloseNote').onclick=()=>{openDetailRequested=false;activeNote=null;editing=false;renderList()};
  $('#uxPinNote').onclick=()=>updateMeta({pinned:!n.pinned});$('#uxDeleteNote').onclick=deleteNote;return;
 }
 el.innerHTML='<div class="ux-note-detail-head"><input id="uxNoteTitle" maxlength="140" placeholder="عنوان الملاحظة" value="'+esc(n.title||'')+'"><button type="button" class="btn primary" id="uxDoneEdit">تم</button><button type="button" class="icon-btn" id="uxCloseNote" aria-label="إغلاق">×</button></div><div class="ux-note-meta-row"><input id="uxNoteCategory" maxlength="40" placeholder="التصنيف" value="'+esc(n.category||'')+'"><div class="ux-note-palette" aria-label="اختاري خلفية من هوية الموقع">'+paletteButtons(n.color)+'</div></div><div class="ux-note-toolbar" role="toolbar" aria-label="تنسيق النص"><button type="button" data-cmd="undo" title="تراجع">↶</button><button type="button" data-cmd="redo" title="إعادة">↷</button><button type="button" data-cmd="bold"><b>B</b></button><button type="button" data-cmd="italic"><i>I</i></button><button type="button" data-cmd="formatBlock" data-value="H2">عنوان</button><button type="button" data-cmd="insertUnorderedList">قائمة</button><button type="button" data-cmd="insertOrderedList">ترقيم</button><button type="button" data-link="1">رابط</button></div><div id="uxNoteBody" class="ux-note-body" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="اكتبي ملاحظتك هنا…">'+sanitize(n.body||'')+'</div><div class="ux-note-status" id="uxNoteStatus">يُحفظ تلقائياً · '+stamp(n.updatedAt)+'</div>';
 const body=$('#uxNoteBody');body.style.background=safeColor(n.color);body.style.color=noteInk();history=[body.innerHTML];historyAt=0;
 const push=()=>{const v=body.innerHTML;if(history[historyAt]!==v){history=history.slice(0,historyAt+1);history.push(v);if(history.length>80)history.shift();historyAt=history.length-1}};
 body.addEventListener('input',()=>{push();scheduleSave()});
 $('#uxNoteTitle').addEventListener('input',scheduleSave);$('#uxNoteCategory').addEventListener('input',scheduleSave);el.querySelectorAll('[data-note-color]').forEach(b=>b.addEventListener('click',()=>{n.color=b.dataset.noteColor;el.querySelectorAll('[data-note-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));body.style.background=n.color;body.style.color=noteInk();scheduleSave()}));
 el.querySelectorAll('[data-cmd]').forEach(b=>b.addEventListener('click',()=>{body.focus();if(b.dataset.cmd==='undo'||b.dataset.cmd==='redo'){historyAt=Math.max(0,Math.min(history.length-1,historyAt+(b.dataset.cmd==='undo'?-1:1)));body.innerHTML=history[historyAt]||'';scheduleSave();return}document.execCommand(b.dataset.cmd,false,b.dataset.value||null);push();scheduleSave()}));
 el.querySelector('[data-link]').onclick=()=>{const url=prompt('أدخلي رابطاً يبدأ بـ https://');if(!url||!/^https?:\/\//i.test(url))return;body.focus();document.execCommand('createLink',false,url);push();scheduleSave()};
 $('#uxDoneEdit').onclick=async()=>{await flushSave();editing=false;renderList()};
 $('#uxCloseNote').onclick=async()=>{await flushSave();openDetailRequested=false;activeNote=null;editing=false;renderList()};
}
function sanitize(html){
 const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html'),allowed=new Set(['B','STRONG','I','EM','U','P','BR','UL','OL','LI','H2','H3','BLOCKQUOTE','A']);
 function clean(node){let out='';node.childNodes.forEach(ch=>{if(ch.nodeType===3){out+=esc(ch.nodeValue);return}if(ch.nodeType!==1)return;let tag=ch.tagName;if(tag==='DIV')tag='P';if(!allowed.has(tag)){out+=clean(ch);return}if(tag==='A'){const href=ch.getAttribute('href')||'';if(!/^https?:\/\//i.test(href)){out+=clean(ch);return}out+='<a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">'+clean(ch)+'</a>';return}out+='<'+tag.toLowerCase()+'>'+clean(ch)+'</'+tag.toLowerCase()+'>'});return out}
 return clean(doc.body.firstChild).replace(/<p>\s*<\/p>/g,'<p><br></p>');
}
function scheduleSave(){const st=$('#uxNoteStatus');if(st)st.textContent='جارٍ حفظ التغييرات…';clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,700)}
async function flushSave(){
 clearTimeout(saveTimer);const n=notes.find(x=>x.id===activeNote);if(!n||!editing||!owner()||owner()!==notesUid)return;
 const title=$('#uxNoteTitle'),body=$('#uxNoteBody'),cat=$('#uxNoteCategory');
 if(title)n.title=title.value;if(body)n.body=sanitize(body.innerHTML);if(cat)n.category=cat.value;n.color=safeColor(n.color);n.updatedAt=Date.now();
 try{await db.collection('users').doc(notesUid).collection('notes').doc(n.id).set({ownerUid:notesUid,title:n.title||'',body:n.body||'',category:n.category||'',color:n.color||'#ffffff',pinned:!!n.pinned,createdAt:n.createdAt||Date.now(),updatedAt:n.updatedAt});const st=$('#uxNoteStatus');if(st)st.textContent='تم الحفظ تلقائياً · '+stamp(n.updatedAt);renderListCardsOnly()}catch(e){const st=$('#uxNoteStatus');if(st)st.textContent='تعذر الحفظ؛ تحققي من قواعد Firestore والاتصال.'}
}
function renderListCardsOnly(){const list=$('#uxNoteList');if(!list)return;const arr=visible();list.innerHTML=arr.map(n=>'<button type="button" class="ux-note-card '+(n.id===activeNote?'active':'')+'" data-note="'+esc(n.id)+'" style="--note-bg:'+safeColor(n.color)+'"><strong>'+esc(n.title||'ملاحظة بلا عنوان')+'</strong><span class="ux-note-preview">'+esc(plain(n.body).slice(0,110))+'</span><small>آخر تعديل: '+stamp(n.updatedAt)+'</small></button>').join('');list.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{flushSave();activeNote=b.dataset.note;editing=false;renderList()})}
async function createNote(){
 if(!owner()||owner()!==notesUid)return;const btn=$('#uxNewNote');if(btn)btn.disabled=true;
 const id=typeof uid==='function'?uid('note'):('note_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)),now=Date.now();
 try{await db.collection('users').doc(notesUid).collection('notes').doc(id).set({ownerUid:notesUid,title:'',body:'',category:'',color:'#FFFFFF',pinned:false,createdAt:now,updatedAt:now});activeNote=id;editing=true;openDetailRequested=true;history=[];historyAt=-1}
 catch(e){toast(e&&e.code==='permission-denied'?'قواعد Firestore تمنع إنشاء الملاحظات حالياً.':'تعذر إنشاء الملاحظة.');}
 finally{if(btn)btn.disabled=false}
}
async function updateMeta(patch){const n=notes.find(x=>x.id===activeNote);if(!n)return;const updatedAt=Date.now();try{await db.collection('users').doc(notesUid).collection('notes').doc(n.id).update({...patch,updatedAt});Object.assign(n,patch,{updatedAt});renderList()}catch(e){toast('تعذر تحديث الملاحظة. تحققي من صلاحيات Firestore.')}}
async function saveMeta(n,patch){await updateMeta(patch)}
async function deleteNote(){const n=notes.find(x=>x.id===activeNote);if(!n||!confirm('حذف هذه الملاحظة نهائياً؟'))return;try{await db.collection('users').doc(notesUid).collection('notes').doc(n.id).delete();activeNote=null;editing=false}catch(e){toast('تعذر حذف الملاحظة. تحققي من صلاحيات Firestore.')}}
function watch(){const page=$('#notes');if(page&&!page.classList.contains('hidden'))start();else if(!owner()&&notesUnsub)stop()}
function wrapGo(){if(typeof window.go!=='function'||window.go.__notesWrapped)return;const base=window.go;const wrapped=function(id){if(id==='notes'){activeNote=null;editing=false;openDetailRequested=false}const r=base.apply(this,arguments);if(id==='notes')setTimeout(()=>{start();const detail=$('#uxNoteEditor');if(detail)detail.classList.remove('mobile-open')},0);return r};wrapped.__notesWrapped=true;window.go=wrapped}
function wrapRender(){if(typeof window.render!=='function'||window.render.__notesWrapped)return;const base=window.render;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(watch,0);return r};wrapped.__notesWrapped=true;window.render=wrapped}
function boot(){wrapGo();wrapRender();watch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();