/* ===========================================================
   PARISI — TAPWARE FINDER
   Application logic
   =========================================================== */

(function(){
  'use strict';

  const STORAGE_KEY = 'parisi_backstock_v1';

  /* ---------------- utilities ---------------- */

  function norm(s){
    return (s || '').toString().trim().toLowerCase();
  }

  function escapeHtml(s){
    return (s || '').toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* ---------------- search index ---------------- */
  // PRODUCTS comes from data.js — already filtered to items with location and/or shelf.

  function productHaystack(p){
    if(p._hay) return p._hay;
    const locs = p.locations.map(l => [l.location, l.shelf].filter(Boolean).join(' ')).join(' ');
    p._hay = norm([p.code, p.name, locs].join(' '));
    return p._hay;
  }

  function searchProducts(query){
    const q = norm(query);
    if(!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);

    const scored = [];
    for(const p of PRODUCTS){
      const codeNorm = norm(p.code);
      const hay = productHaystack(p);
      const matchesAll = terms.every(t => hay.indexOf(t) !== -1);
      if(!matchesAll) continue;

      let score = 3;
      if(codeNorm === q) score = 0;
      else if(codeNorm.startsWith(q)) score = 1;
      else if(codeNorm.indexOf(q) !== -1) score = 2;
      scored.push({ p, score });
    }
    scored.sort((a,b) => a.score - b.score || a.p.code.localeCompare(b.p.code));
    return scored.map(s => s.p);
  }

  function locSummary(p, limit){
    const parts = p.locations.slice(0, limit || 2).map(l => {
      if(l.location && l.shelf) return `${l.location} · ${l.shelf}`;
      if(l.location) return l.location;
      if(l.shelf) return l.shelf;
      return '';
    }).filter(Boolean);
    let out = parts.join(', ');
    if(p.locations.length > (limit || 2)) out += ` +${p.locations.length - (limit||2)}`;
    return out;
  }

  /* ---------------- view routing ---------------- */

  const views = {
    home: document.getElementById('view-home'),
    results: document.getElementById('view-results'),
    backstock: document.getElementById('view-backstock'),
  };

  function showView(name){
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[name].classList.add('active');
    window.scrollTo(0,0);
  }

  /* ---------------- suggestions ---------------- */

  function renderSuggestions(container, list, onPick){
    if(!list.length){
      container.innerHTML = '';
      container.hidden = true;
      return;
    }
    const shown = list.slice(0, 8);
    container.innerHTML = shown.map((p, i) => `
      <div class="suggestion-item" data-idx="${i}" role="option">
        <div class="sugg-top">
          <span class="sugg-code">${escapeHtml(p.code)}</span>
          <span class="sugg-loc">${escapeHtml(locSummary(p,1))}</span>
        </div>
        <div class="sugg-name">${escapeHtml(p.name)}</div>
      </div>
    `).join('');
    container.hidden = false;
    Array.from(container.querySelectorAll('.suggestion-item')).forEach(el => {
      el.addEventListener('click', () => onPick(shown[parseInt(el.dataset.idx,10)]));
    });
  }

  function hideSuggestions(container){
    container.hidden = true;
    container.innerHTML = '';
  }

  /* ---------------- home search wiring ---------------- */

  const homeInput = document.getElementById('search-input');
  const homeSuggestions = document.getElementById('suggestions');
  const homeForm = document.getElementById('search-form');

  homeInput.addEventListener('input', () => {
    const q = homeInput.value;
    if(norm(q).length < 1){ hideSuggestions(homeSuggestions); return; }
    const results = searchProducts(q);
    renderSuggestions(homeSuggestions, results, (p) => {
      hideSuggestions(homeSuggestions);
      homeInput.value = '';
      openProduct(p);
    });
  });

  homeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideSuggestions(homeSuggestions);
    runSearch(homeInput.value);
    homeInput.value = '';
  });

  document.addEventListener('click', (e) => {
    if(!homeForm.contains(e.target) && !homeSuggestions.contains(e.target)){
      hideSuggestions(homeSuggestions);
    }
  });

  document.getElementById('go-backstock').addEventListener('click', () => {
    renderBackstock();
    showView('backstock');
  });

  /* ---------------- compact search (results view) ---------------- */

  const compactInput = document.getElementById('search-input-compact');
  const compactSuggestions = document.getElementById('suggestions-compact');
  const compactForm = document.getElementById('search-form-compact');

  compactInput.addEventListener('input', () => {
    const q = compactInput.value;
    if(norm(q).length < 1){ hideSuggestions(compactSuggestions); return; }
    const results = searchProducts(q);
    renderSuggestions(compactSuggestions, results, (p) => {
      hideSuggestions(compactSuggestions);
      compactInput.value = '';
      openProduct(p);
    });
  });

  compactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideSuggestions(compactSuggestions);
    runSearch(compactInput.value);
    compactInput.value = '';
  });

  document.addEventListener('click', (e) => {
    if(!compactForm.contains(e.target) && !compactSuggestions.contains(e.target)){
      hideSuggestions(compactSuggestions);
    }
  });

  document.getElementById('back-from-results').addEventListener('click', () => showView('home'));
  document.getElementById('back-from-backstock').addEventListener('click', () => showView('home'));

  /* ---------------- results rendering ---------------- */

  const resultsCount = document.getElementById('results-count');
  const resultsBody = document.getElementById('results-body');

  function runSearch(query){
    const q = (query || '').trim();
    if(!q){ return; }
    const results = searchProducts(q);
    showView('results');

    if(results.length === 0){
      resultsCount.textContent = '0 PRODUCTS FOUND';
      resultsBody.innerHTML = `<div class="no-results">No products match “${escapeHtml(q)}”.<br>Try a code, name, location or shelf.</div>`;
      return;
    }

    if(results.length === 1){
      renderDetail(results[0]);
      resultsCount.textContent = '1 PRODUCT FOUND';
      return;
    }

    resultsCount.textContent = `${results.length} PRODUCTS FOUND`;
    resultsBody.innerHTML = results.map((p, i) => `
      <div class="result-row" data-idx="${i}">
        <div class="result-row-main">
          <div class="result-row-code">${escapeHtml(p.code)}</div>
          <div class="result-row-name">${escapeHtml(p.name)}</div>
        </div>
        <div class="result-row-loc">${escapeHtml(locSummary(p,1))}</div>
      </div>
    `).join('');
    Array.from(resultsBody.querySelectorAll('.result-row')).forEach(el => {
      el.addEventListener('click', () => {
        const p = results[parseInt(el.dataset.idx,10)];
        openProduct(p);
      });
    });
  }

  function openProduct(p){
    showView('results');
    resultsCount.textContent = '1 PRODUCT FOUND';
    renderDetail(p);
  }

  function renderDetail(p){
    const inStock = (p.stock || 0) > 0;
    const locsHtml = p.locations.map(l => `
      <div class="loc-block">
        <div class="loc-block-left">
          <div class="loc-field">
            <span class="loc-label">Location</span>
            <span class="loc-value ${l.location ? '' : 'dim'}">${l.location ? escapeHtml(l.location) : '—'}</span>
          </div>
          <div class="loc-field">
            <span class="loc-label">Shelf</span>
            <span class="loc-value ${l.shelf ? '' : 'dim'}">${l.shelf ? escapeHtml(l.shelf) : '—'}</span>
          </div>
        </div>
        ${l.qty ? `<div class="loc-qty">${escapeHtml(l.qty)} pcs</div>` : ''}
      </div>
    `).join('');

    const metaHtml = `
      <div class="meta-row">
        <div class="meta-item">
          <span class="meta-label">Available Stock</span>
          <span class="meta-value">${p.stock}</span>
        </div>
        ${p.section ? `<div class="meta-item"><span class="meta-label">Category / Section</span><span class="meta-value">${escapeHtml(p.section)}</span></div>` : ''}
      </div>
    `;

    resultsBody.innerHTML = `
      <div class="detail-card">
        <div class="detail-head">
          <div>
            <div class="detail-code">${escapeHtml(p.code)}</div>
            <div class="detail-name">${escapeHtml(p.name)}</div>
          </div>
          <span class="stock-pill ${inStock ? 'in' : 'out'}">${inStock ? 'In Stock' : 'No Stock'}</span>
        </div>
        <div class="detail-divider"></div>
        <div class="loc-grid">${locsHtml}</div>
        <div class="detail-divider"></div>
        ${metaHtml}
        <button id="add-backstock-btn" class="primary-btn">Back to Stock</button>
      </div>
    `;

    const btn = document.getElementById('add-backstock-btn');
    if(isInBackstock(p.code)) markAdded(btn);
    btn.addEventListener('click', () => {
      addToBackstock(p);
      markAdded(btn);
      showToast(`${p.code} added to Back to Stock`);
    });
  }

  function markAdded(btn){
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
  }

  /* ---------------- back to stock ---------------- */

  function loadBackstock(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function saveBackstock(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
  }

  function isInBackstock(code){
    return loadBackstock().some(i => i.code === code);
  }

  function addToBackstock(p){
    const list = loadBackstock();
    if(list.some(i => i.code === p.code)) return;
    // primary location = first entry with a location, else first entry
    const primary = p.locations.find(l => l.location) || p.locations[0];
    list.push({
      code: p.code,
      name: p.name,
      location: primary ? primary.location : null,
      shelf: primary ? primary.shelf : null,
      addedAt: Date.now()
    });
    saveBackstock(list);
  }

  function removeFromBackstock(code){
    const list = loadBackstock().filter(i => i.code !== code);
    saveBackstock(list);
    renderBackstock();
  }

  function renderBackstock(){
    const list = loadBackstock();
    const body = document.getElementById('backstock-body');

    if(!list.length){
      body.innerHTML = `<div class="bs-empty">No items yet.<br>Search a product and tap “Back to Stock” to add it here.</div>`;
      return;
    }

    const groups = new Map();
    for(const item of list){
      const key = item.location || 'NO LOCATION';
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    const sortedKeys = Array.from(groups.keys()).sort((a,b) => {
      if(a === 'NO LOCATION') return 1;
      if(b === 'NO LOCATION') return -1;
      return a.localeCompare(b);
    });

    body.innerHTML = sortedKeys.map(key => {
      const items = groups.get(key);
      const itemsHtml = items.map(item => `
        <div class="bs-item" data-code="${escapeHtml(item.code)}">
          <div class="bs-item-main">
            <div class="bs-item-code">${escapeHtml(item.code)}${item.shelf ? ` <span style="color:var(--text-faint)">· ${escapeHtml(item.shelf)}</span>` : ''}</div>
            <div class="bs-item-name">${escapeHtml(item.name)}</div>
          </div>
          <button class="bs-item-remove" aria-label="Remove ${escapeHtml(item.code)}">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6.4 4.98L4.98 6.4 10.59 12l-5.61 5.6 1.41 1.42L12 13.4l5.6 5.61 1.42-1.41L13.4 12l5.61-5.6-1.41-1.42L12 10.59z" fill="currentColor"/></svg>
          </button>
        </div>
      `).join('');
      return `
        <div class="bs-group">
          <div class="bs-group-header">
            <span class="bs-group-loc">${escapeHtml(key)}</span>
            <span class="bs-group-count">${items.length} item${items.length===1?'':'s'}</span>
          </div>
          ${itemsHtml}
        </div>
      `;
    }).join('');

    Array.from(body.querySelectorAll('.bs-item-remove')).forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.closest('.bs-item').dataset.code;
        removeFromBackstock(code);
      });
    });
  }

  document.getElementById('clear-backstock').addEventListener('click', () => {
    if(!loadBackstock().length) return;
    if(confirm('Remove all items from Back to Stock?')){
      saveBackstock([]);
      renderBackstock();
    }
  });

  /* ---------------- OCR ---------------- */

  const ocrModal = document.getElementById('ocr-modal');
  const ocrInput = document.getElementById('ocr-input');
  const ocrPreview = document.getElementById('ocr-preview');
  const ocrPlaceholder = document.getElementById('ocr-placeholder');
  const ocrStatus = document.getElementById('ocr-status');
  const ocrCaptureBtn = document.getElementById('ocr-capture-btn');

  function openOcr(){
    ocrModal.hidden = false;
    ocrStatus.textContent = '';
    ocrPreview.hidden = true;
    ocrPlaceholder.hidden = false;
    ocrCaptureBtn.textContent = 'Open Camera';
    ocrInput.value = '';
  }

  function closeOcr(){ ocrModal.hidden = true; }

  document.getElementById('ocr-btn').addEventListener('click', openOcr);
  document.getElementById('ocr-btn-compact').addEventListener('click', openOcr);
  document.getElementById('ocr-close').addEventListener('click', closeOcr);
  ocrPlaceholder.addEventListener('click', () => ocrInput.click());
  ocrCaptureBtn.addEventListener('click', () => ocrInput.click());

  // Clean OCR output: uppercase, strip whitespace, fix common O/0 confusion in numeric runs, keep dots/hyphens.
  function cleanOcrText(raw){
    let s = raw.toUpperCase().replace(/\s+/g, '');
    // keep only letters, digits, dots, hyphens
    s = s.replace(/[^A-Z0-9.\-]/g, '');
    // Replace O with 0 when surrounded by digits (numeric-looking runs)
    s = s.replace(/(\d)O(\d)/g, '$10$2');
    s = s.replace(/(\d)O(?=[.\-]|$)/g, '$10');
    s = s.replace(/^O(?=\d)/g, '0');
    return s;
  }

  function extractCandidateCode(text){
    // Product codes look like: LETTERS(.digits)*[-...] e.g. P2.00.B.50, EB.01-3HS, P2.01-2RF.02
    const lines = text.split(/\n+/).map(l => cleanOcrText(l)).filter(Boolean);
    let best = '';
    for(const line of lines){
      const matches = line.match(/[A-Z0-9]+(?:[.\-][A-Z0-9]+)+/g);
      if(matches){
        for(const m of matches){
          if(m.length > best.length) best = m;
        }
      }
    }
    if(!best && lines.length) best = lines[0];
    return best;
  }

  async function runOcr(imageSrc){
    ocrStatus.textContent = 'Reading code…';
    try{
      const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
      const code = extractCandidateCode(text);
      if(!code){
        ocrStatus.textContent = 'Could not read a code. Try again with better lighting.';
        return;
      }
      ocrStatus.textContent = `Detected: ${code}`;
      setTimeout(() => {
        closeOcr();
        const results = searchProducts(code);
        if(results.length === 1){
          openProduct(results[0]);
        } else if(results.length > 1){
          runSearch(code);
        } else {
          showView('home');
          homeInput.value = code;
          showToast(`No match for “${code}” — refine search`);
        }
      }, 500);
    }catch(err){
      ocrStatus.textContent = 'Scan failed. Please try again.';
    }
  }

  ocrInput.addEventListener('change', () => {
    const file = ocrInput.files && ocrInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      ocrPreview.src = reader.result;
      ocrPreview.hidden = false;
      ocrPlaceholder.hidden = true;
      ocrCaptureBtn.textContent = 'Retake';
      runOcr(reader.result);
    };
    reader.readAsDataURL(file);
  });

  /* ---------------- init ---------------- */

  showView('home');

  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

})();
