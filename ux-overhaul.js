/* Masahatuna UX overhaul — progressive shell and unified search.
   Existing page logic, Firebase state and permission checks remain authoritative. */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const icons={home:'house',schedule:'calendar-days',calendar:'calendar-range',tasks:'list-checks',activities:'images',info:'megaphone',books:'book-open',family:'users',tools:'wrench',settings:'sliders-horizontal',guide:'map-pin',admin:'shield'};
const paths={home:'الرئيسية',schedule:'الجدول',calendar:'التقويم',tasks:'المهام',activities:'أنشطتنا',info:'الإعلانات',books:'الكتب',family:'الأسرة الصفية',tools:'الأدوات',settings:'الإعدادات',guide:'دليل الموقع',admin:'الإدارة'};
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
  const account=$('#accountName');if(account){account.classList.add('ux-account');account.setAttribute('aria-label','الحساب والملف الشخصي');account.title='الملف الشخصي';const setAvatar=()=>{const name=(window.user&&user()?.name)||'';account.textContent=name?name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join(''):'؟'};setAvatar();new MutationObserver(setAvatar).observe(account,{childList:true,characterData:true,subtree:true})}
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
 add(window.data?.tasks?.filter(t=>me&&t.profileId===me.id),'المهام','tasks','title','subject');
 add(window.data?.announcements,'الإعلانات','info','title','content');
 add(window.data?.projects,'الأنشطة','activities','title','description');
 add(window.data?.activities,'الأنشطة','activities','title','description');
 add(window.data?.events,'التقويم','calendar','title','description');
 add(window.data?.books,'الكتب','books','title','description');
 add(window.data?.links,'الأدوات','tools','title','description');
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
