(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var palette={'جغرافيا':['#D8CBEA','🌍'],'فيزياء':['#DCE4FA','⚛️'],'عربي':['#F7DED4','📖'],'اللغة العربية':['#F7DED4','📖'],'دين':['#D9E9DD','☪️'],'التربية الإسلامية':['#D9E9DD','☪️'],'رياضيات':['#F7E6C9','📐'],'أحياء':['#D9E9DD','🧬'],'اللغة الإنجليزية':['#F6DFD5','🔤'],'كيمياء':['#DDE8F2','🧪'],'تلاوة':['#D9E9DD','📗'],'التلاوة والتجويد':['#D9E9DD','📗'],'المهارات الرقمية':['#DCE4FA','💻'],'فن':['#F2DDED','🎨'],'الفنون والحرف':['#F2DDED','🎨'],'رياضة':['#F7E6C9','🏅'],'التربية البدنية':['#F7E6C9','🏅']};
var selected=new Date(),mode='day',timer=null;
function iso(d){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function dayName(d){return new Intl.DateTimeFormat('ar-EG',{weekday:'long'}).format(d)}
function monthName(d){return new Intl.DateTimeFormat('ar-EG',{month:'long',year:'numeric'}).format(d)}
function formalSubject(s){return ({'دين':'التربية الإسلامية','تلاوة':'التلاوة والتجويد','رياضة':'التربية البدنية','فن':'الفنون والحرف','عربي':'اللغة العربية'})[s]||s}
function safe(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function lessonState(i,d){var n=new Date(),t=times[i];if(iso(d)<iso(n))return 'completed';if(iso(d)>iso(n)||!t)return 'upcoming';var m=n.getHours()*60+n.getMinutes(),a=Number(t[1].slice(0,2))*60+Number(t[1].slice(3)),b=Number(t[2].slice(0,2))*60+Number(t[2].slice(3));return m>=b?'completed':m>=a?'current':'upcoming'}
function dataForDay(d){var day=dayName(d),date=iso(d),att=attendance(day,date);return {day:day,date:date,attendance:att,lessons:att.working?timetableForDay(day,date):[]}}
function setMode(v){mode=v;try{scheduleMode=v;scheduleSelectedDate=new Date(selected);if(v==='month')scheduleMonth=new Date(selected.getFullYear(),selected.getMonth(),1)}catch(e){}render()}
function build(){
 var sec=$('schedule');if(!sec||$('scheduleRedesignHead'))return;
 var hero=sec.querySelector('.hero'),strip=$('scheduleDateStrip'),notice=$('scheduleNotice'),tools=sec.querySelector('.sched-tools'),month=$('monthView');
 var head=document.createElement('div');head.className='schedule-redesign-head';head.id='scheduleRedesignHead';
 head.innerHTML='<div><p class="eyebrow">خطتكِ الدراسية</p><h1>جدول الحصص</h1></div><div class="schedule-tabs" role="tablist" aria-label="طريقة عرض الجدول"><button type="button" data-mode="day" class="active" aria-selected="true">اليوم</button><button type="button" data-mode="week" aria-selected="false">الأسبوع</button><button type="button" data-mode="month" aria-selected="false">الشهر</button></div>';
 var panel=document.createElement('div');panel.id='scheduleDayPanel';panel.className='schedule-day-panel';
 var timeline=document.createElement('div');timeline.id='scheduleTimeline';timeline.className='schedule-timeline';
 var summary=document.createElement('aside');summary.id='scheduleSummary';summary.className='schedule-summary';panel.append(timeline,summary);
 if(month){month.id='scheduleMonthPanel';month.hidden=true}
 if(hero)hero.after(head);
 if(strip)head.after(strip);
 if(tools&&strip)strip.after(tools);
 if(notice&&tools)tools.after(notice);
 if(notice)notice.after(panel);
 else if(tools)tools.after(panel);
 if(month)panel.after(month);
 var legacyDay=$('lessonsView');if(legacyDay)legacyDay.classList.add('hidden');
 if(tools){var oldSwitch=tools.querySelector('.view-switch');if(oldSwitch)oldSwitch.hidden=true}
 head.querySelectorAll('[data-mode]').forEach(function(b){b.addEventListener('click',function(){setMode(b.dataset.mode)})});
}
function renderStrip(){
 var root=$('scheduleDateStrip');if(!root)return;var start=new Date(selected);start.setDate(start.getDate()-3);root.innerHTML='';
 for(var i=0;i<7;i++){var d=new Date(start);d.setDate(start.getDate()+i);var key=iso(d),b=document.createElement('button');b.type='button';b.className='schedule-date-chip'+(key===iso(selected)?' active':'');b.setAttribute('aria-pressed',key===iso(selected)?'true':'false');b.innerHTML='<small>'+dayName(d)+'</small><strong>'+d.getDate()+'</strong>';b.addEventListener('click',(function(date){return function(){selected=new Date(date+'T12:00:00');try{scheduleSelectedDate=new Date(selected)}catch(e){}var panel=$('scheduleDayPanel');if(panel){panel.classList.remove('fade-in');void panel.offsetWidth;panel.classList.add('fade-in')}render()}})(key));root.appendChild(b)}
}
function renderTimeline(){
 var root=$('scheduleTimeline'),sum=$('scheduleSummary');if(!root||!sum)return;var data=dataForDay(selected),today=iso(selected)===iso(new Date());
 if(!data.attendance.working){var why=data.attendance.holiday?.name||data.attendance.vacation?.name||data.attendance.exception?.reason||'لا يوجد دوام';root.innerHTML='<div class="empty">🌿 لا يوجد دوام مدرسي في هذا اليوم.<br><small>'+safe(why)+'</small></div>'}
 else{root.innerHTML=data.lessons.map(function(subject,i){var p=palette[subject]||['#E8EAF6','📚'],st=today?lessonState(i,selected):(iso(selected)<iso(new Date())?'completed':'upcoming'),t=times[i]||['','',''],label=st==='completed'?'مكتملة':st==='current'?'الحصة الحالية':'قادمة';return '<article class="timeline-row '+st+'"><div class="timeline-time"><small>الحصة '+(i+1)+'</small><br>'+safe(t[1])+'<br>—<br>'+safe(t[2])+'</div><div class="timeline-track"><span class="timeline-dot"></span></div><div class="timeline-card"><span class="timeline-subject-icon" style="background:'+p[0]+'">'+p[1]+'</span><div><h3>'+safe(formalSubject(subject))+'</h3><p>'+safe(teacher(subject))+'</p></div><span class="timeline-state">'+label+'</span></div></article>'}).join('')||'<div class="empty">لم تتم إضافة حصص لهذا اليوم.</div>'}
 var done=data.lessons.filter(function(x,i){return today?lessonState(i,selected)==='completed':iso(selected)<iso(new Date())}).length;
 var current=data.lessons.findIndex(function(x,i){return today&&lessonState(i,selected)==='current'}),next=data.lessons.find(function(x,i){return today&&lessonState(i,selected)==='upcoming'});
 sum.innerHTML='<div class="summary-dayline"><h2>'+safe(data.day)+'</h2><p>'+iso(selected)+'</p></div><strong class="summary-count">'+done+' / '+data.lessons.length+' حصص مكتملة</strong><span class="muted">إنجاز اليوم</span><div class="progress summary-progress"><i style="width:'+(data.lessons.length?done/data.lessons.length*100:0)+'%"></i></div><p class="summary-current"><b>الحصة الحالية:</b> '+(current>=0?safe(data.lessons[current]):today?'—':'—')+'</p><p class="summary-next"><b>الحصة القادمة:</b> '+(next?safe(next):'—')+'</p>';

}
function renderMonth(){
 var root=$('scheduleMonthPanel');if(!root)return;root.hidden=false;root.classList.remove('hidden');var y=selected.getFullYear(),m=selected.getMonth(),first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate(),heads=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
 var html='<div class="section-head"><button class="btn secondary" id="monthPrev">‹ السابق</button><h2 class="section-title">'+monthName(selected)+'</h2><button class="btn secondary" id="monthNext">التالي ›</button></div><div class="schedule-month-grid">'+heads.map(function(x){return '<div class="cal-head">'+x+'</div>'}).join('');
 for(var i=0;i<first;i++)html+='<div></div>';
 for(var d=1;d<=count;d++){var date=new Date(y,m,d,12),key=iso(date),a=attendance(dayName(date),key);html+='<button class="schedule-month-day '+(key===iso(new Date())?'today ':'')+(key===iso(selected)?'selected':'')+'" data-day="'+key+'">'+d+'<small>'+(a.working?'دوام':'عطلة')+'</small></button>'}
 root.innerHTML=html+'</div>';
 $('monthPrev').addEventListener('click',function(){selected=new Date(y,m-1,1,12);render()});$('monthNext').addEventListener('click',function(){selected=new Date(y,m+1,1,12);render()});
 root.querySelectorAll('[data-day]').forEach(function(b){b.addEventListener('click',function(){selected=new Date(b.dataset.day+'T12:00:00');setMode('day')})});
}
function render(){
 if(!$('scheduleRedesignHead'))return;
 var dayPanel=$('scheduleDayPanel');if(dayPanel&&mode==='day'){dayPanel.classList.remove('fade-in');void dayPanel.offsetWidth;dayPanel.classList.add('fade-in')}
 $('scheduleRedesignHead').querySelectorAll('[data-mode]').forEach(function(b){var active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});
 var isDay=mode==='day',isWeek=mode==='week',isMonth=mode==='month';
 $('scheduleDateStrip').hidden=!isDay;$('scheduleDateStrip').classList.toggle('hidden',!isDay);
 $('scheduleDayPanel').hidden=!isDay;$('scheduleDayPanel').classList.toggle('hidden',!isDay);
 var monthPanel=$('scheduleMonthPanel');if(monthPanel){monthPanel.hidden=!isMonth;monthPanel.classList.toggle('hidden',!isMonth)}
 $('weekView').classList.toggle('hidden',!isWeek);
 var legacyDay=$('lessonsView'),legacyMonth=$('monthView');if(legacyDay)legacyDay.classList.add('hidden');if(legacyMonth)legacyMonth.classList.add('hidden');
 renderStrip();if(isDay)renderTimeline();if(isMonth)renderMonth();if(isWeek)renderSchedule();
}
function fab(){if($('taskFab'))return;var b=document.createElement('button');b.id='taskFab';b.type='button';b.className='task-fab';b.textContent='+';b.title='إضافة مهمة';b.setAttribute('aria-label','إضافة مهمة جديدة');b.addEventListener('click',function(){openTask()});document.body.appendChild(b);var add=$('tasks')&&$('tasks').querySelector('.hero button[onclick*="openTask"]');if(add)add.hidden=true}
function decorateLessons(){['todayLessons','weekView','lessonsView','teachers'].forEach(function(id){var root=$(id);if(!root)return;root.querySelectorAll('.lesson,.cell,.soft').forEach(function(el){var target=el.querySelector('.sub')||el.querySelector('div[style*="font-size"]')||el.querySelector('strong');if(!target)return;var raw=target.textContent.trim(),label=formalSubject(raw);if(label!==raw)target.textContent=label;var p=palette[raw]||palette[label]||['#E8EAF6','📚'];el.style.setProperty('--lesson-color',p[0]);el.dataset.subjectIcon=p[1]})})}
function boot(){
 build();fab();decorateLessons();render();
 if($('home')&&window.MutationObserver)new MutationObserver(decorateLessons).observe($('home'),{childList:true,subtree:true});
 if(timer)clearInterval(timer);
 var notice=$('scheduleNotice');if(notice&&window.MutationObserver){var refreshQueued=false;new MutationObserver(function(){if(refreshQueued)return;refreshQueued=true;requestAnimationFrame(function(){refreshQueued=false;if($('scheduleRedesignHead'))render()})}).observe(notice,{childList:true,subtree:true,characterData:true})}
 timer=setInterval(function(){if($('schedule')&&!$('schedule').classList.contains('hidden')&&mode==='day'&&iso(selected)===iso(new Date()))renderTimeline()},30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();