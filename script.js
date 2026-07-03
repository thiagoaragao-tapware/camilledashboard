// Initialize Icons
lucide.createIcons();

// --- State Management ---
let db = [];
let filteredDb = [];
let recentSearches = JSON.parse(localStorage.getItem('parisi_recent')) || [];
let favorites = JSON.parse(localStorage.getItem('parisi_favorites')) || [];
let showOnlyFavorites = false;

// --- DOM Elements ---
const uploadInput = document.getElementById('csv-upload');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const filterLocation = document.getElementById('filter-location');
const filterShelf = document.getElementById('filter-shelf');
const filterStatus = document.getElementById('filter-status');
const exportBtn = document.getElementById('export-btn');
const resultsGrid = document.getElementById('results-grid');
const recentContainer = document.getElementById('recent-searches-container');
const recentTags = document.getElementById('recent-tags');
const navFavorites = document.getElementById('nav-favorites');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

// States
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const noResultsState = document.getElementById('no-results-state');

// Stats
const statTotal = document.getElementById('stat-total');
const statLocOk = document.getElementById('stat-loc-ok');
const statShelfOk = document.getElementById('stat-shelf-ok');
const statMissing = document.getElementById('stat-missing');

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  const savedData = localStorage.getItem('parisi_db');
  if (savedData) {
    try {
      db = JSON.parse(savedData);
      initSystem();
    } catch (e) {
      console.error('Failed to parse cached DB', e);
    }
  }
  renderRecentSearches();
});

// Keyboard Shortcut: '/' to focus search, 'Escape' to clear
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === 'Escape') {
    searchInput.value = '';
    handleSearch();
    searchInput.blur();
  }
});

// --- Data Upload & Parsing ---
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  emptyState.classList.add('hidden');
  noResultsState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  resultsGrid.innerHTML = '';

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      // Data mapping from Parisi specific columns
      db = results.data.map(row => {
        const code = (row['Product'] || '').trim();
        const loc = (row['Location/Shelf'] || '').trim();
        const shelf = (row['Column1'] || '').trim();
        // Calculate clean strings for searching
        return {
          id: code, // Assuming product code is unique identifier
          code: code,
          name: (row['Description'] || '').trim(),
          barcode: (row['Barcode (EAN)'] || '').trim(),
          location: loc,
          shelf: shelf,
          qty: (row['Qty'] || row['Available Stock'] || '0').trim(),
          status: (row['Status'] || '').trim(),
          section: (row['Section'] || '').trim(),
          // Pre-compute boolean flags for fast filtering
          hasLoc: loc !== '',
          hasShelf: shelf !== ''
        };
      });

      // Attempt to cache
      try {
        localStorage.setItem('parisi_db', JSON.stringify(db));
      } catch(err) {
        console.warn('Database too large for localStorage quota.');
      }

      initSystem();
      loadingState.classList.add('hidden');
      showToast('Database uploaded successfully!');
    }
  });
});

function initSystem() {
  emptyState.classList.add('hidden');
  
  // Enable Inputs
  searchInput.disabled = false;
  filterLocation.disabled = false;
  filterShelf.disabled = false;
  filterStatus.disabled = false;
  exportBtn.disabled = false;
  
  // Extract unique statuses for filter
  const statuses = [...new Set(db.map(i => i.status).filter(Boolean))];
  filterStatus.innerHTML = `<option value="all">🔄 All Statuses</option>` + 
    statuses.map(s => `<option value="${s}">📌 ${s}</option>`).join('');

  updateStats();
  handleSearch();
}

function updateStats() {
  const total = db.length;
  const locOk = db.filter(p => p.hasLoc).length;
  const shelfOk = db.filter(p => p.hasShelf).length;
  // Missing Action = either loc or shelf is missing
  const missing = db.filter(p => !p.hasLoc || !p.hasShelf).length;
  
  statTotal.textContent = total.toLocaleString();
  statLocOk.textContent = locOk.toLocaleString();
  statShelfOk.textContent = shelfOk.toLocaleString();
  statMissing.textContent = missing.toLocaleString();
}

// --- Core Search & Filter Engine ---
function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();
  const locFilter = filterLocation.value;
  const shelfFilter = filterShelf.value;
  const statusFilter = filterStatus.value;

  if (query) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }

  filteredDb = db.filter(p => {
    // 1. Favorites Toggle
    if (showOnlyFavorites && !favorites.includes(p.id)) return false;

    // 2. Text Matching
    let matchesQuery = true;
    if (query) {
      matchesQuery = 
        p.code.toLowerCase().includes(query) || 
        p.name.toLowerCase().includes(query) || 
        p.barcode.toLowerCase().includes(query) ||
        p.shelf.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query);
    }

    // 3. Dropdown Filters
    const matchesLoc = locFilter === 'all' || 
                      (locFilter === 'has' && p.hasLoc) || 
                      (locFilter === 'missing' && !p.hasLoc);

    const matchesShelf = shelfFilter === 'all' || 
                        (shelfFilter === 'has' && p.hasShelf) || 
                        (shelfFilter === 'missing' && !p.hasShelf);
                        
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesQuery && matchesLoc && matchesShelf && matchesStatus;
  });

  renderResults(query);
}

// Event Listeners for Filters
searchInput.addEventListener('input', () => {
  handleSearch();
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveRecentSearch(searchInput.value);
    searchInput.blur();
  }
});

[filterLocation, filterShelf, filterStatus].forEach(el => {
  el.addEventListener('change', handleSearch);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  handleSearch();
  searchInput.focus();
});

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterLocation.value = 'all';
  filterShelf.value = 'all';
  filterStatus.value = 'all';
  showOnlyFavorites = false;
  navFavorites.classList.remove('active');
  handleSearch();
});

navFavorites.addEventListener('click', (e) => {
  e.preventDefault();
  if (db.length === 0) return;
  showOnlyFavorites = !showOnlyFavorites;
  navFavorites.classList.toggle('active', showOnlyFavorites);
  handleSearch();
});

// --- Render Engine ---
function renderResults(query) {
  resultsGrid.innerHTML = '';
  
  if (filteredDb.length === 0) {
    noResultsState.classList.remove('hidden');
    return;
  }
  noResultsState.classList.add('hidden');

  // Performance: Limit DOM nodes for massive datasets, let user type to narrow down
  const toRender = filteredDb.slice(0, 150); 
  
  const fragment = document.createDocumentFragment();

  toRender.forEach(p => {
    const isFav = favorites.includes(p.id);
    const stockOut = p.qty === '0' || p.qty === 0 || p.qty === '';
    
    const card = document.createElement('div');
    card.className = `product-card ${isFav ? 'favorite' : ''}`;
    
    card.innerHTML = `
      <div class="card-header">
        <div class="product-code-group">
          <div class="product-code">
            ${highlightText(p.code, query)}
          </div>
          ${p.barcode ? `
            <div class="barcode-text" title="Barcode">
              <i data-lucide="barcode" style="width:14px;height:14px;"></i>
              ${highlightText(p.barcode, query)}
            </div>
          ` : ''}
        </div>
        <div class="card-actions">
          <button class="icon-btn action-copy" data-copy="${p.code}" title="Copy Code">
            <i data-lucide="copy" style="width:18px;height:18px;"></i>
          </button>
          <button class="icon-btn fav-btn ${isFav ? 'active' : ''}" data-id="${p.id}" title="Toggle Favorite">
            <i data-lucide="star" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </div>
      
      <div class="product-name" title="${p.name}">
        ${highlightText(p.name, query)}
      </div>

      <div class="card-data-grid">
        <!-- Location Row -->
        <div class="data-row">
          <div class="data-label-group">
            <div class="status-dot ${p.hasLoc ? 'dot-ok' : 'dot-missing'}"></div>
            <span class="data-label">Location</span>
          </div>
          <div class="data-value-group">
            ${p.hasLoc ? `
              <span class="data-value">${highlightText(p.location, query)}</span>
              <button class="icon-btn action-copy" data-copy="${p.location}" style="width:24px;height:24px;">
                <i data-lucide="copy" style="width:14px;height:14px;"></i>
              </button>
            ` : `<span class="data-value missing">NOT MAPPED</span>`}
          </div>
        </div>

        <!-- Shelf Row -->
        <div class="data-row">
          <div class="data-label-group">
            <div class="status-dot ${p.hasShelf ? 'dot-ok' : 'dot-missing'}"></div>
            <span class="data-label">Shelf</span>
          </div>
          <div class="data-value-group">
            ${p.hasShelf ? `
              <span class="data-value">${highlightText(p.shelf, query)}</span>
              <button class="icon-btn action-copy" data-copy="${p.shelf}" style="width:24px;height:24px;">
                <i data-lucide="copy" style="width:14px;height:14px;"></i>
              </button>
            ` : `<span class="data-value missing">NOT MAPPED</span>`}
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="stock-indicator">
          <span class="stock-label">Stock</span>
          <span class="stock-badge ${stockOut ? 'out' : ''}">${p.qty || '0'}</span>
        </div>
        ${p.status ? `<div class="status-badge">${p.status}</div>` : ''}
      </div>
    `;
    
    fragment.appendChild(card);
  });

  resultsGrid.appendChild(fragment);
  lucide.createIcons();
  attachCardEvents();
}

function highlightText(text, query) {
  if (!query || !text) return text;
  // Escape regex chars
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  return text.toString().replace(regex, '<mark class="highlight">$1</mark>');
}

// --- Card Interactions ---
function attachCardEvents() {
  // Copy Actions
  document.querySelectorAll('.action-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text);
      
      const icon = btn.querySelector('i');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check" class="text-emerald" style="width:100%;height:100%;"></i>';
      lucide.createIcons();
      showToast(`Copied: ${text}`);
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        lucide.createIcons();
      }, 1500);
    });
  });

  // Favorite Actions
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (favorites.includes(id)) {
        favorites = favorites.filter(fid => fid !== id);
        btn.classList.remove('active');
        btn.closest('.product-card').classList.remove('favorite');
      } else {
        favorites.push(id);
        btn.classList.add('active');
        btn.closest('.product-card').classList.add('favorite');
      }
      localStorage.setItem('parisi_favorites', JSON.stringify(favorites));
      
      // If filtering by favorites, refresh view to remove un-favorited items
      if (showOnlyFavorites) handleSearch();
    });
  });
}

// --- Utilities ---
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = msg;
  toast.classList.remove('hidden');
  
  // Trigger reflow for animation
  void toast.offsetWidth; 
  toast.classList.add('show');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// --- Recent Searches ---
function saveRecentSearch(query) {
  query = query.trim();
  if (!query || query.length < 2) return;
  
  // Remove if exists to push to front
  recentSearches = recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
  recentSearches.unshift(query);
  if (recentSearches.length > 6) recentSearches.pop();
  
  localStorage.setItem('parisi_recent', JSON.stringify(recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (recentSearches.length === 0) {
    recentContainer.classList.add('hidden');
    return;
  }
  recentContainer.classList.remove('hidden');
  recentTags.innerHTML = recentSearches.map(q => 
    `<span class="recent-tag">${q}</span>`
  ).join('');

  document.querySelectorAll('.recent-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.textContent;
      handleSearch();
    });
  });
}

// --- Export Function ---
exportBtn.addEventListener('click', () => {
  if (filteredDb.length === 0) {
    showToast("No data to export");
    return;
  }
  
  // Clean up format for export
  const exportData = filteredDb.map(p => ({
    'Product Code': p.code,
    'Description': p.name,
    'Barcode': p.barcode,
    'Location': p.location,
    'Shelf': p.shelf,
    'Qty': p.qty,
    'Status': p.status
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Parisi_Export_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("Export completed!");
});
