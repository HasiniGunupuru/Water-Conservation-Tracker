const $ = (selector) => document.querySelector(selector);
const state = { entries: [], goal: 150 };
const today = localDate(new Date());
function localDate(date) { const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,'0'), d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function escapeText(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function showToast(message) { const toast=$('#toast'); toast.textContent=message; toast.classList.add('show'); window.setTimeout(()=>toast.classList.remove('show'),2600); }
async function api(path, options={}) {
  const response=await fetch(`/api${path}`, { ...options, headers:{'Content-Type':'application/json', ...(options.headers||{})} });
  const payload=await response.json().catch(()=>({error:'The server returned an invalid response.'}));
  if(!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}
function sum(entries) { return entries.reduce((total,e)=>total+Number(e.litres),0); }
function renderDashboard(summary) {
  $('#todayTotal').textContent=summary.todayLitres.toLocaleString(undefined,{maximumFractionDigits:1});
  $('#weekTotal').textContent=summary.weekLitres.toLocaleString(undefined,{maximumFractionDigits:1});
  $('#entryCount').textContent=summary.totalEntries.toLocaleString();
  const percent=state.goal ? summary.todayLitres/state.goal*100 : 0;
  $('#goalProgress').style.width=`${Math.min(percent,100)}%`;
  $('#goalCaption').textContent=percent<=100 ? `${Math.round(percent)}% of your ${state.goal} L daily target` : `${Math.round(percent-100)}% above your daily target`;
  $('#goalInput').value=state.goal;
  const chart=$('#weeklyChart'); chart.replaceChildren();
  const max=Math.max(1,...summary.daily.map(d=>d.litres));
  summary.daily.forEach((day,index)=>{
    const col=document.createElement('div'); col.className='chart-column';
    const space=document.createElement('div'); space.className='bar-space';
    const bar=document.createElement('div'); bar.className='bar'+(day.date===today?' today':''); bar.style.height=`${Math.max(3,day.litres/max*100)}%`; bar.title=`${day.date}: ${day.litres} litres`;
    const val=document.createElement('div'); val.className='bar-value'; val.textContent=day.litres ? `${Math.round(day.litres)}` : '—';
    space.append(bar); const label=document.createElement('div'); label.className='bar-label'; label.textContent=new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined,{weekday:'short'}); col.append(val,space,label); chart.append(col);
  });
}
function renderHistory() {
  const query=$('#searchInput').value.trim().toLowerCase(), activity=$('#activityFilter').value;
  const entries=state.entries.filter(e=>(!activity||e.activity===activity)&&(!query||e.activity.toLowerCase().includes(query)||(e.note||'').toLowerCase().includes(query)));
  const body=$('#historyRows'); body.replaceChildren();
  entries.forEach(entry=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${escapeText(entry.entry_date)}</td><td><span class="activity-pill">${escapeText(entry.activity)}</span></td><td>${escapeText(entry.note||'—')}</td><td>${Number(entry.litres).toLocaleString(undefined,{maximumFractionDigits:1})} L</td><td><button class="delete-btn" data-delete="${escapeText(entry.id)}" aria-label="Delete entry from ${escapeText(entry.entry_date)}">Delete</button></td>`;
    body.append(tr);
  });
  $('#emptyHistory').hidden=entries.length!==0;
  $('#historyState').textContent=`Showing ${entries.length} of ${state.entries.length} entries`;
}
async function refresh() {
  $('#historyState').textContent='Loading your records…';
  try {
    const [entriesResult,summaryResult,settingsResult]=await Promise.all([api('/entries'),api('/summary'),api('/settings')]);
    state.entries=entriesResult.data; state.goal=settingsResult.data.daily_goal_litres;
    renderDashboard(summaryResult.data); renderHistory();
  } catch(error) { $('#historyState').textContent=error.message; showToast(error.message); }
}
$('#entryDate').value=today; $('#entryDate').max=today;
$('#entryForm').addEventListener('submit',async event=>{
  event.preventDefault(); const button=event.currentTarget.querySelector('button[type=submit]'), message=$('#formMessage');
  message.textContent=''; message.className='form-message'; button.disabled=true; button.textContent='Saving…';
  const body={activity:$('#activity').value,litres:Number($('#litres').value),entry_date:$('#entryDate').value,note:$('#note').value.trim()};
  try { await api('/entries',{method:'POST',body:JSON.stringify(body)}); event.currentTarget.reset(); $('#entryDate').value=today; $('#entryDate').max=today; message.textContent='Water entry saved successfully.'; message.classList.add('success'); await refresh(); showToast('Water entry saved'); }
  catch(error){message.textContent=error.message;message.classList.add('error');}
  finally {button.disabled=false;button.innerHTML='Save water entry <span>→</span>';}
});
$('#saveGoal').addEventListener('click',async()=>{
  const goal=Number($('#goalInput').value);
  try {const result=await api('/settings',{method:'PUT',body:JSON.stringify({daily_goal_litres:goal})});state.goal=result.data.daily_goal_litres;await refresh();showToast('Daily target updated');}
  catch(error){showToast(error.message);}
});
$('#searchInput').addEventListener('input',renderHistory); $('#activityFilter').addEventListener('change',renderHistory);
$('#historyRows').addEventListener('click',async event=>{
  const button=event.target.closest('[data-delete]'); if(!button)return;
  if(!window.confirm('Delete this water entry? This cannot be undone.'))return;
  try {await api(`/entries/${encodeURIComponent(button.dataset.delete)}`,{method:'DELETE'});await refresh();showToast('Entry deleted');}
  catch(error){showToast(error.message);}
});
refresh();
