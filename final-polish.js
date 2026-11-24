/* Final interaction polish for Masahatuna — additive, no Firebase/data changes. */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const mq=window.matchMedia('(max-width:900px)');
function activeSection(){return $('.view:not(.hidden)')?.id||'home'}
function closeCreateMenu(){
 const m=$('#uxCreateMenu'),f=$('#uxCreateFab');if(m){m.hidden=true;m.classList.remove('is-open')}if(f){f.classList.remove('is-open');f.setAttribute('aria-expanded','false')}
}
function polishNav(){
 const more=$('.ux-more');
 if(more){
  more.setAttribute('aria-label','المزيد من الأقسام');
  more.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg><span>المزيد</span>';
 }
 $$('.ux-sidebar .ux-side-bottom button').forEach(b=>{
  b.classList.add('ux-side-action');
  const title=b.dataset.uxTitle||b.getAttribute('aria-label')||b.textContent.trim();
  b.title=title;
 });
 const sync=()=>{
  const current=activeSection();
  $$('.ux-sidebar [data-nav],.ux-mobile-nav [data-mobile-nav],.ux-more-menu [data-more-nav]').forEach(b=>{
   const id=b.dataset.nav||b.dataset.mobileNav||b.dataset.moreNav;
   const on=id===current;b.classList.toggle('active',on);
   if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
 };
 sync();
 const nav=$('#mainNav');
 if(nav&&!nav.dataset.finalSync){nav.dataset.finalSync='1';new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']})}
}
function polishCreate(){
 // Remove any legacy create-task action; the single FAB menu is the only entry point.
 $$('button[onclick*="openTask"],button[onclick*="openTaskModal"],a[onclick*="openTask"]').forEach(b=>{
  if(!b.closest('#uxCreateMenu')&&!b.closest('#uxCreateFab'))b.remove();
 });
 const menu=$('#uxCreateMenu'),fab=$('#uxCreateFab');
 if(menu&&!menu.dataset.finalPolish){
  menu.dataset.finalPolish='1';
  const mo=new MutationObserver(()=>{if(!menu.hidden)requestAnimationFrame(()=>menu.classList.add('is-open'));else menu.classList.remove('is-open')});
  mo.observe(menu,{attributes:true,attributeFilter:['hidden']});
  menu.querySelectorAll('button').forEach(b=>b.addEventListener('click',closeCreateMenu));
 }
 if(fab){fab.style.bottom=mq.matches?'calc(96px + env(safe-area-inset-bottom))':'28px'}
}
function polishNotes(){
 const list=$('#uxNoteList');
 if(list&&!list.dataset.finalEmpty){
  list.dataset.finalEmpty='1';
  const mo=new MutationObserver(()=>{
   const empty=list.querySelector('.empty');
   if(empty&&$('#uxNoteSearch')?.value.trim())empty.textContent='لم نعثر على ملاحظات تطابق عبارة البحث. جرّبي كلمة أخرى.';
   else if(empty)empty.textContent='لا توجد ملاحظات بعد. أنشئي ملاحظتك الأولى.';
  });
  mo.observe(list,{childList:true,subtree:true});
 }
 const editor=$('#uxNoteEditor');
 if(editor&&!editor.dataset.finalClose){
  editor.dataset.finalClose='1';
  editor.addEventListener('click',e=>{
   const close=e.target.closest('#uxCloseNote');if(!close)return;
   if(!mq.matches){editor.classList.remove('desktop-open');editor.hidden=true}
  });
 }
}
function polishToolbar(){
 const bar=$('#taskList .sel-bar');
 if(bar){bar.classList.add('ux-floating-selection');bar.style.setProperty('--safe-bottom','env(safe-area-inset-bottom)')}
}
function scopedSearch(){
 const trigger=$('.ux-search-trigger');if(!trigger||trigger.dataset.finalSearch)return;trigger.dataset.finalSearch='1';
 trigger.addEventListener('click',e=>{
  const section=activeSection();if(section==='home')return;
  e.preventDefault();e.stopImmediatePropagation();
  const old=$('#uxScopedSearch');if(old)old.remove();
  const root=document.getElementById(section);if(!root)return;
  const layer=document.createElement('div');layer.id='uxScopedSearch';layer.className='ux-search-layer';
  const title=({tasks:'المهام',activities:'الأنشطة والمشاريع',projects:'المشاريع',info:'الإعلانات',books:'الكتب'})[section]||'هذا القسم';
  layer.innerHTML='<section class="ux-search-dialog" role="dialog" aria-modal="true" aria-label="البحث في '+title+'"><div class="ux-scoped-head"><strong>البحث في '+title+'</strong><button type="button" class="icon-btn" data-close aria-label="إغلاق">×</button></div><input type="search" placeholder="اكتبي كلمة للبحث..." autocomplete="off"><div class="ux-scoped-filters"><label>تصفية النتائج <select aria-label="نوع المحتوى"><option value="all">الكل</option><option value="text">يحتوي على نص</option></select></label></div><div class="ux-search-results"><p class="muted">اكتبي كلمة للبحث داخل هذا القسم فقط.</p></div></section>';
  document.body.append(layer);const input=layer.querySelector('input'),box=layer.querySelector('.ux-search-results');
  const close=()=>layer.remove();layer.querySelector('[data-close]').onclick=close;layer.addEventListener('click',ev=>{if(ev.target===layer)close()});
  const candidates=()=>Array.from(root.querySelectorAll('.task,.activity,.project-card,.notice-card,.book-card,[data-task-id],[data-id]')).filter(el=>!el.closest('.hero')&&!el.closest('.section-head'));
  input.addEventListener('input',()=>{
   const q=input.value.trim().toLocaleLowerCase('ar');if(!q){box.innerHTML='<p class="muted">اكتبي كلمة للبحث داخل هذا القسم فقط.</p>';return}
   const matches=candidates().filter(el=>el.innerText.toLocaleLowerCase('ar').includes(q)).slice(0,30);
   box.innerHTML=matches.length?matches.map((el,i)=>'<button type="button" class="ux-search-result" data-match="'+i+'"><span><strong>'+String(el.innerText.trim().slice(0,95)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</strong></span><span>↙</span></button>').join(''):'<div class="empty">لا توجد نتائج في هذا القسم.</div>';
   box.querySelectorAll('[data-match]').forEach(b=>b.onclick=()=>{matches[+b.dataset.match].scrollIntoView({behavior:'smooth',block:'center'});matches[+b.dataset.match].classList.add('ux-search-highlight');setTimeout(()=>matches[+b.dataset.match].classList.remove('ux-search-highlight'),1200);close()});
  });
  layer.addEventListener('keydown',ev=>{if(ev.key==='Escape')close()});input.focus();
 },true);
}
function layout(){
 polishNav();polishCreate();polishNotes();polishToolbar();
}
function boot(){
 layout();scopedSearch();
 window.addEventListener('resize',()=>{const f=$('#uxCreateFab');if(f)f.style.bottom=mq.matches?'calc(96px + env(safe-area-inset-bottom))':'28px'});
 // Re-apply only on explicit section changes, not on every DOM mutation.
 if(typeof window.go==='function'&&!window.go.__finalPolish){const base=window.go;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(layout,0);return r};wrapped.__finalPolish=true;window.go=wrapped}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();