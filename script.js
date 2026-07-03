const $ = (id) => document.getElementById(id);
const rawData = window.PARISI_DATA || [];
const data = rawData.map((item, index) => ({
  ...item,
  id: index,
  code: item.code || item.Product || item.CODE || '',
  description: item.description || item.category || item.name || '',
  searchText: [item.code,item.description,item.category,item.barcode,item.location,item.shelf,item.section,item.stockingStatus,item.availableStock].join(' ').toLowerCase()
}));
let query = '';
let filter = 'all';
let workMode = 'finder';
let results = data.slice(0, 40);
let selected = null;
let stream = null;
const LS_SCAN = 'parisi_backstock_v4';
const fmt = v => (v === undefined || v === null || String(v).trim() === '' ? '—' : String(v));
const esc = s => fmt(s).replace(/[&<>'"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const clean = s => String(s || '').replace(/'/g,"\\'").replace(/\n/g,' ');
function toast(text){ const t=$('toast'); t.textContent=text; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1400); }
function copyText(text){ navigator.clipboard?.writeText(text || ''); toast('Copied: ' + fmt(text)); window.event?.stopPropagation?.(); }
function highlight(text){ const safe = esc(text); if(!query.trim()) return safe; const q=query.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); return safe.replace(new RegExp(`(${q})`,'ig'),'<mark>$1</mark>'); }
function normalizeCode(s){
  return String(s||'').toUpperCase().replace(/\s+/g,'').replace(/[–—]/g,'-').replace(/O(?=\d)/g,'0').replace(/(?<=\d)O/g,'0').replace(/[,;]/g,'.').replace(/[^A-Z0-9.\-/]/g,'');
}
function passesFilter(p){return filter==='all'||(filter==='withLocation'&&p.location)||(filter==='withoutLocation'&&!p.location)||(filter==='withShelf'&&p.shelf)||(filter==='withoutShelf'&&!p.shelf)}
function score(p, q){
  if(!q) return 1; q=q.toLowerCase(); const nq=normalizeCode(q).toLowerCase(); let s=0;
  const code=(p.code||'').toLowerCase(), ncode=normalizeCode(p.code).toLowerCase(), desc=(p.description||'').toLowerCase();
  if(code===q||ncode===nq) s+=300; if(code.startsWith(q)||ncode.startsWith(nq)) s+=160; if(code.includes(q)||ncode.includes(nq)) s+=100;
  if((p.barcode||'').toLowerCase().includes(q)) s+=80; if((p.location||'').toLowerCase().includes(q)) s+=60; if((p.shelf||'').toLowerCase().includes(q)) s+=60;
  if(desc.includes(q)) s+=35; if(p.searchText.includes(q)) s+=15; return s;
}
function runSearch(){
  const q=query.trim().toLowerCase(); let arr=data.filter(p=>passesFilter(p));
  if(q){ arr=arr.map(p=>({...p,_score:score(p,q)})).filter(p=>p._score>0).sort((a,b)=>b._score-a._score||a.code.localeCompare(b.code)); }
  results=arr.slice(0,80); selected=results[0]||null; renderFeatured(); renderSuggestions(); renderResults(); renderStats();
}
function renderFeatured(){
  const el=$('featured');
  if(!selected){ el.className='featured empty-state'; el.innerHTML=`<span class="micro">NO RESULT</span><h2>Nenhum item encontrado</h2><p>Tente digitar menos caracteres ou use o OCR para ler o código impresso.</p>`; return; }
  const p=selected; el.className='featured';
  el.innerHTML=`<div><span class="micro">BEST MATCH</span><h2 class="product-code">${highlight(p.code)}</h2><p class="product-name">${highlight(p.description || p.category || 'No description')}</p><div class="tag-row"><span class="tag">Barcode: ${esc(p.barcode)}</span><span class="tag">Stock: ${esc(p.availableStock)}</span><span class="tag">Status: ${esc(p.stockingStatus || p.shelfStatus)}</span><span class="tag">Section: ${esc(p.section)}</span></div></div><div class="location-stack"><div class="location-box ${p.location?'':'missing'}"><span>Location</span><strong>${highlight(p.location || 'NO LOCATION')}</strong></div><div class="location-box ${p.shelf?'':'missing'}"><span>Shelf</span><strong>${highlight(p.shelf || 'NO SHELF')}</strong></div><div class="copy-row"><button onclick="copyText('${clean(p.code)}')">Copy Code</button><button onclick="copyText('${clean(p.location)}')">Copy Loc</button><button onclick="copyText('${clean(p.shelf)}')">Copy Shelf</button></div></div>`;
}
function renderSuggestions(){
  const box=$('suggestions'); const q=query.trim(); if(q.length<1){box.classList.add('hidden'); box.innerHTML=''; return;}
  const list=results.slice(0,8); if(!list.length){box.classList.add('hidden'); return;}
  box.classList.remove('hidden'); box.innerHTML=list.map(p=>`<div class="suggestion" onclick="selectProduct(${p.id})"><div><strong>${highlight(p.code)}</strong><br><small>${highlight(p.description || p.category || '')}</small></div><span class="mini-loc">${esc(p.location || 'NO LOC')}</span><span class="mini-shelf">${esc(p.shelf || 'NO SHELF')}</span></div>`).join('');
}
function renderResults(){
  $('results').innerHTML=results.slice(0,24).map(p=>`<article class="card" onclick="selectProduct(${p.id}, true)"><h3>${highlight(p.code)}</h3><p>${highlight(p.description || p.category || 'No description')}</p><div class="card-grid"><div><span>Location</span><strong>${highlight(p.location || '—')}</strong></div><div><span>Shelf</span><strong>${highlight(p.shelf || '—')}</strong></div></div></article>`).join('');
}
function renderStats(){ $('totalCount').textContent=data.length.toLocaleString(); $('resultCount').textContent=results.length.toLocaleString(); $('scanCount').textContent=getScanList().length; }
function selectProduct(id, detail=false){ const p=data.find(x=>x.id===id); if(!p)return; selected=p; query=p.code; $('searchInput').value=p.code; $('suggestions').classList.add('hidden'); renderFeatured(); if(workMode==='backstock') addToScanList(p); if(detail) showDetail(p); }
function showDetail(p){ $('detailContent').innerHTML=`<span class="micro">ITEM DETAILS</span><h2 class="product-code">${esc(p.code)}</h2><p>${esc(p.description||p.category)}</p><div class="card-grid"><div><span>Location</span><strong>${esc(p.location)}</strong></div><div><span>Shelf</span><strong>${esc(p.shelf)}</strong></div><div><span>Barcode</span><strong>${esc(p.barcode)}</strong></div><div><span>Stock</span><strong>${esc(p.availableStock)}</strong></div></div>`; $('detailDialog').showModal(); }
function getScanList(){ try{return JSON.parse(localStorage.getItem(LS_SCAN))||[]}catch{return[]} }
function setScanList(v){ localStorage.setItem(LS_SCAN, JSON.stringify(v)); renderScanList(); renderStats(); }
function addToScanList(p){ const list=getScanList(); const row={id:p.id, code:p.code, description:p.description||p.category, location:p.location, shelf:p.shelf, barcode:p.barcode, time:new Date().toLocaleTimeString()}; setScanList([row,...list].slice(0,200)); toast('Added to Back to Stock'); }
function renderScanList(){ const list=getScanList(); const el=$('scanList'); if(!list.length){el.className='scan-list empty'; el.textContent='Nenhum item escaneado ainda.'; return;} el.className='scan-list'; el.innerHTML=list.map((p,i)=>`<div class="scan-item"><div><h3>${esc(p.code)}</h3><p>${esc(p.description)}</p><p>Location: <b>${esc(p.location||'NO LOCATION')}</b> · Shelf: <b>${esc(p.shelf||'NO SHELF')}</b> · ${esc(p.time)}</p></div><div><div class="scan-loc">${esc(p.location||'—')}</div><button class="scan-remove" onclick="removeScan(${i})">Remove</button></div></div>`).join(''); }
function removeScan(i){ const list=getScanList(); list.splice(i,1); setScanList(list); }
function exportScanList(){ const list=getScanList(); const csv=['Code,Description,Location,Shelf,Barcode,Time',...list.map(p=>[p.code,p.description,p.location,p.shelf,p.barcode,p.time].map(x=>'"'+String(x||'').replace(/"/g,'""')+'"').join(','))].join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='parisi-back-to-stock.csv'; a.click(); }
async function startOCR(){
  $('ocrDialog').showModal(); $('ocrStatus').textContent='Opening camera...';
  try{ stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}}); $('camera').srcObject=stream; $('ocrStatus').textContent='Camera ready. Centralize the item code and tap Read Text.'; }
  catch(e){ $('ocrStatus').textContent='Camera error: '+e.message; }
}
function stopOCR(){ if(stream){stream.getTracks().forEach(t=>t.stop()); stream=null;} $('camera').srcObject=null; }
async function captureOCR(){
  const video=$('camera'), canvas=$('captureCanvas'), status=$('ocrStatus');
  if(!video.videoWidth){ status.textContent='Camera not ready yet.'; return; }
  canvas.width=video.videoWidth; canvas.height=video.videoHeight; canvas.getContext('2d').drawImage(video,0,0);
  status.textContent='Reading text... hold on.'; $('ocrCandidates').innerHTML='';
  try{
    const res=await Tesseract.recognize(canvas,'eng',{ logger:m=>{ if(m.status) status.textContent=`OCR: ${m.status} ${m.progress?Math.round(m.progress*100)+'%':''}`; }});
    const text=res.data.text || ''; const candidates=extractCandidates(text); status.textContent=candidates.length?`Found ${candidates.length} possible code(s).`:'No item code found. Try closer, more light, or less angle.';
    renderOcrCandidates(candidates);
  }catch(e){ status.textContent='OCR error: '+e.message; }
}
function extractCandidates(text){
  const raw=text.toUpperCase().replace(/\s+/g,' '); const matches=raw.match(/[A-Z0-9]{1,4}[.\-][A-Z0-9.\-\/]{3,}/g)||[];
  const expanded=[...matches, ...raw.split(/\s+/).filter(x=>x.includes('.')||x.includes('-'))].map(normalizeCode).filter(x=>x.length>=5);
  return [...new Set(expanded)].slice(0,8);
}
function renderOcrCandidates(cands){ const el=$('ocrCandidates'); el.innerHTML=cands.map(c=>`<div class="candidate" onclick="useOcrCandidate('${clean(c)}')"><strong>${esc(c)}</strong><br><small>Tap to search and add in Back to Stock mode</small></div>`).join(''); }
function useOcrCandidate(c){ query=c; $('searchInput').value=c; runSearch(); if(selected && workMode==='backstock') addToScanList(selected); stopOCR(); $('ocrDialog').close(); }
function setWorkMode(mode){ workMode=mode; document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.work===mode)); $('backstockPanel').classList.toggle('hidden',mode!=='backstock'); if(mode==='backstock') toast('Back to Stock mode'); }
$('searchInput').addEventListener('input', e=>{query=e.target.value; runSearch();});
$('clearBtn').onclick=()=>{query='';$('searchInput').value='';runSearch();};
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;runSearch();});
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setWorkMode(b.dataset.work));
$('scanTextBtn').onclick=startOCR; $('closeOcr').onclick=()=>{stopOCR();$('ocrDialog').close();}; $('stopCameraBtn').onclick=stopOCR; $('captureBtn').onclick=captureOCR;
$('addCurrentBtn').onclick=()=> selected ? addToScanList(selected) : toast('Search an item first'); $('clearListBtn').onclick=()=>setScanList([]); $('exportListBtn').onclick=exportScanList; $('closeDialog').onclick=()=>$('detailDialog').close();
window.selectProduct=selectProduct; window.copyText=copyText; window.removeScan=removeScan; window.useOcrCandidate=useOcrCandidate;
renderScanList(); runSearch();
