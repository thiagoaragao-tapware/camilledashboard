/* ==========================================================================
   LifeOS — script.js
   Vanilla JS app. No backend, no frameworks. All state lives in localStorage
   under the key STORAGE_KEY. The file is organized in sections:
     1. Constants & helpers
     2. Default seed data
     3. Storage load / save
     4. Generic modal system
     5. Render functions per view
     6. Event bindings
     7. Assistant (local NLU simulation)
     8. Init
   ========================================================================== */

/* -------------------------------------------------------------------------
   1. CONSTANTS & HELPERS
   ------------------------------------------------------------------------- */
const STORAGE_KEY = 'lifeos_data_v1';

const WEEKDAYS_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
const WEEKDAYS_FULL  = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
// JS Date.getDay(): 0=Sunday..6=Saturday. We remap to 0=Monday..6=Sunday.
function jsDayToAppDay(jsDay) { return jsDay === 0 ? 6 : jsDay - 1; }

const CATEGORY_META = {
  thiago:     { label: 'Thiago',     class: 'thiago' },
  camille:    { label: 'Camille',    class: 'camille' },
  casa:       { label: 'Casa',       class: 'casa' },
  trabalho:   { label: 'Trabalho',   class: 'trabalho' },
  faculdade:  { label: 'Faculdade',  class: 'faculdade' },
  projetos:   { label: 'Projetos',   class: 'projetos' }
};

const ICON_COLORS = ['green', 'blue', 'orange', 'red', 'pink', 'purple', 'yellow', 'gray'];

function fmtMoney(n) {
  const sign = n < 0 ? '-' : '';
  return sign + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
}
function uid() { return Math.random().toString(36).slice(2, 10); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* -------------------------------------------------------------------------
   2. DEFAULT SEED DATA — mirrors the reference dashboard
   ------------------------------------------------------------------------- */
function defaultData() {
  return {
    profile: { name1: 'Thiago', name2: 'Camille', savePercent: 35 },

    finance: {
      weeklyIncome: 1308,
      rent: { amount: 1160, day: 17 },
      fixedExpenses: [
        { id: uid(), name: 'Cartão de crédito', amount: 220, day: 20, icon: '💳', color: 'blue' },
        { id: uid(), name: 'Faculdade', amount: 150, day: 25, icon: '🎓', color: 'purple' },
        { id: uid(), name: 'Internet', amount: 90, day: 5, icon: '📶', color: 'orange' }
      ],
      variableExpenses: [
        { id: uid(), name: 'Mercado', amount: 180, date: '2026-07-06', icon: '🛒', color: 'green' },
        { id: uid(), name: 'Gasolina', amount: 70, date: '2026-07-07', icon: '⛽', color: 'orange' },
        { id: uid(), name: 'Lazer - cinema', amount: 60, date: '2026-07-05', icon: '🎬', color: 'pink' }
      ],
      categories: [
        { id: uid(), name: 'Moradia', icon: '🏠', color: 'red', amount: 1160, period: 'mês', percent: 65 },
        { id: uid(), name: 'Alimentação', icon: '🍔', color: 'yellow', amount: 180, period: 'semana', percent: 18 },
        { id: uid(), name: 'Transporte', icon: '🚌', color: 'blue', amount: 70, period: 'semana', percent: 7 },
        { id: uid(), name: 'Lazer', icon: '🎮', color: 'purple', amount: 60, period: 'semana', percent: 5 },
        { id: uid(), name: 'Outros', icon: '📦', color: 'gray', amount: 40, period: 'semana', percent: 5 }
      ]
    },

    tasks: [
      { id: uid(), title: 'Revisar plano financeiro da semana', time: '09:00', day: 6, category: 'trabalho', priority: 'alta', done: false, recurring: true },
      { id: uid(), title: 'Organizar tarefas da casa', time: '10:30', day: 6, category: 'casa', priority: 'media', done: false, recurring: true },
      { id: uid(), title: 'Treino (superior)', time: '18:00', day: 6, category: 'thiago', priority: 'media', done: false, recurring: true },
      { id: uid(), title: 'Planejar refeições da semana', time: '19:30', day: 6, category: 'casa', priority: 'media', done: false, recurring: true },
      { id: uid(), title: 'Ler 20 páginas', time: '21:30', day: 6, category: 'thiago', priority: 'baixa', done: false, recurring: true },
      { id: uid(), title: 'Estudar para a faculdade', time: '', day: 0, category: 'faculdade', priority: 'alta', done: false, recurring: false },
      { id: uid(), title: 'Enviar relatório para chefe', time: '', day: 0, category: 'trabalho', priority: 'alta', done: false, recurring: false },
      { id: uid(), title: 'Limpar banheiro', time: '', day: 1, category: 'casa', priority: 'baixa', done: false, recurring: false },
      { id: uid(), title: 'Fazer compras do mercado', time: '', day: 2, category: 'casa', priority: 'media', done: false, recurring: true },
      { id: uid(), title: 'Revisar gastos da semana', time: '', day: 2, category: 'trabalho', priority: 'media', done: false, recurring: true },
      { id: uid(), title: 'Criar conteúdo para marca', time: '', day: 3, category: 'projetos', priority: 'media', done: false, recurring: false },
      { id: uid(), title: 'Lavar roupa', time: '', day: 3, category: 'casa', priority: 'baixa', done: false, recurring: true }
    ],

    routine: {
      0: [{ id: uid(), title: 'Trabalho', time: '09:00', done: false, icon: '💼' }, { id: uid(), title: 'Estudo', time: '19:00', done: false, icon: '📚' }],
      1: [{ id: uid(), title: 'Trabalho', time: '09:00', done: false, icon: '💼' }, { id: uid(), title: 'Treino', time: '18:00', done: false, icon: '🏋️' }],
      2: [{ id: uid(), title: 'Trabalho', time: '09:00', done: false, icon: '💼' }, { id: uid(), title: 'Limpeza', time: '17:00', done: false, icon: '🧹' }],
      3: [{ id: uid(), title: 'Trabalho', time: '09:00', done: false, icon: '💼' }, { id: uid(), title: 'Projeto pessoal', time: '14:00', done: false, icon: '🎨' }],
      4: [{ id: uid(), title: 'Trabalho', time: '09:00', done: false, icon: '💼' }, { id: uid(), title: 'Treino', time: '18:00', done: false, icon: '🏋️' }],
      5: [{ id: uid(), title: 'Mercado', time: '10:00', done: false, icon: '🛒' }, { id: uid(), title: 'Lazer', time: '19:00', done: false, icon: '🎬' }],
      6: [
        { id: uid(), title: 'Planejar semana', time: '09:00', done: false, icon: '🗓️' },
        { id: uid(), title: 'Mercado', time: '10:00', done: false, icon: '🛒' },
        { id: uid(), title: 'Lavar roupa', time: '11:00', done: false, icon: '👕' },
        { id: uid(), title: 'Projeto pessoal', time: '14:00', done: false, icon: '🎨' },
        { id: uid(), title: 'Treino', time: '18:00', done: false, icon: '🏋️' }
      ]
    },

    goals: [
      { id: uid(), title: 'Guardar $5.000 para visto', icon: '💰', color: 'green', current: 3100, target: 5000 },
      { id: uid(), title: 'Comprar MacBook', icon: '💻', color: 'blue', current: 3200, target: 8000 },
      { id: uid(), title: 'Organizar Parisi', icon: '📁', color: 'purple', current: 70, target: 100 },
      { id: uid(), title: 'Criar marca de roupa', icon: '👕', color: 'orange', current: 25, target: 100 },
      { id: uid(), title: 'Melhorar inglês', icon: '💬', color: 'pink', current: 60, target: 100 },
      { id: uid(), title: 'Treinar 4x por semana', icon: '🏃', color: 'red', current: 75, target: 100 }
    ],

    meals: {
      weekLabel: '6 – 12 de jul',
      days: [
        { day: 'Segunda', meal: 'Frango grelhado, arroz, feijão e salada' },
        { day: 'Terça', meal: 'Macarrão com carne moída e salada' },
        { day: 'Quarta', meal: 'Omelete com legumes e batata doce' },
        { day: 'Quinta', meal: 'Frango ao molho, arroz e legumes' },
        { day: 'Sexta', meal: 'Lasanha de frango e salada' },
        { day: 'Sábado', meal: 'Livre — pedir ou cozinhar juntos' },
        { day: 'Domingo', meal: 'Churrasco em casa' }
      ]
    },

    shoppingList: [
      { id: uid(), name: 'Frango', done: false },
      { id: uid(), name: 'Arroz', done: false },
      { id: uid(), name: 'Feijão', done: false },
      { id: uid(), name: 'Ovos', done: false },
      { id: uid(), name: 'Tomate', done: false },
      { id: uid(), name: 'Alface', done: false },
      { id: uid(), name: 'Batata doce', done: false },
      { id: uid(), name: 'Banana', done: false }
    ],

    basicIngredients: ['Sal', 'Azeite', 'Alho', 'Cebola', 'Pimenta', 'Arroz', 'Feijão', 'Macarrão'],

    assistantLog: [
      { role: 'bot', text: 'Olá! Posso te ajudar com finanças, tarefas e planejamento. É só digitar em linguagem natural.' }
    ],

    reports: {
      history: [] // filled by assistant / usage over time: {week, spent, saved}
    }
  };
}

let DATA = null;

/* -------------------------------------------------------------------------
   3. STORAGE
   ------------------------------------------------------------------------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Falha ao carregar dados salvos, usando padrão.', e); }
  return defaultData();
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}

/* -------------------------------------------------------------------------
   4. GENERIC MODAL SYSTEM
   ------------------------------------------------------------------------- */
const modalOverlay = () => document.getElementById('modalOverlay');
let currentModalOnSave = null;

function openModal({ title, fields, onSave, saveLabel }) {
  document.getElementById('modalTitle').textContent = title;
  const body = document.getElementById('modalBody');
  body.innerHTML = '';
  const row = el('<div class="form-row"></div>');

  fields.forEach(f => {
    const label = document.createElement('label');
    label.style.minWidth = '100%';
    if (f.half) label.style.minWidth = 'calc(50% - 7px)';
    label.textContent = f.label;
    let input;
    if (f.type === 'select') {
      input = document.createElement('select');
      (f.options || []).forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        if (opt.value === f.value) o.selected = true;
        input.appendChild(o);
      });
    } else if (f.type === 'textarea') {
      input = document.createElement('textarea');
      input.value = f.value || '';
    } else {
      input = document.createElement('input');
      input.type = f.type || 'text';
      input.value = f.value !== undefined && f.value !== null ? f.value : '';
      if (f.min !== undefined) input.min = f.min;
      if (f.max !== undefined) input.max = f.max;
    }
    input.dataset.key = f.key;
    label.appendChild(input);
    row.appendChild(label);
  });
  body.appendChild(row);

  document.getElementById('modalSaveBtn').textContent = saveLabel || 'Salvar';
  currentModalOnSave = () => {
    const values = {};
    row.querySelectorAll('[data-key]').forEach(inp => {
      values[inp.dataset.key] = inp.type === 'number' ? parseFloat(inp.value || '0') : inp.value;
    });
    onSave(values);
  };
  modalOverlay().classList.add('open');
}
function closeModal() { modalOverlay().classList.remove('open'); currentModalOnSave = null; }

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  document.getElementById('modalSaveBtn').addEventListener('click', () => {
    if (currentModalOnSave) currentModalOnSave();
    closeModal();
  });
  modalOverlay().addEventListener('click', (e) => { if (e.target === modalOverlay()) closeModal(); });
});

function confirmDelete(message, cb) {
  if (window.confirm(message)) cb();
}

/* -------------------------------------------------------------------------
   5. RENDER — shared row builders
   ------------------------------------------------------------------------- */
function taskRow(task, { showActions = true } = {}) {
  const meta = CATEGORY_META[task.category] || { label: task.category, class: 'casa' };
  const row = el(`
    <div class="row ${task.done ? 'done' : ''}">
      <button class="checkbox ${task.done ? 'checked' : ''}" data-toggle-task="${task.id}">${task.done ? '✓' : ''}</button>
      <div class="row-body">
        <div class="row-title">${task.title}</div>
        <div class="row-sub">${task.time ? task.time + ' · ' : ''}${WEEKDAYS_FULL[task.day]}</div>
      </div>
      <span class="priority-dot priority-${task.priority}" title="Prioridade ${task.priority}"></span>
      <span class="tag ${meta.class}">${meta.label}</span>
      ${showActions ? `<div class="row-actions">
        <button data-edit-task="${task.id}">✎</button>
        <button data-del-task="${task.id}">🗑</button>
      </div>` : ''}
    </div>
  `);
  return row;
}

function expenseRow(item, kind) {
  const dateInfo = kind === 'fixed' ? `Todo dia ${item.day}` : (item.date || '');
  return el(`
    <div class="row">
      <div class="row-icon bg-${item.color || 'gray'}">${item.icon || '💳'}</div>
      <div class="row-body">
        <div class="row-title">${item.name}</div>
        <div class="row-sub">${dateInfo}</div>
      </div>
      <div class="row-side">${fmtMoney(item.amount)}</div>
      <div class="row-actions">
        <button data-edit-expense="${item.id}" data-kind="${kind}">✎</button>
        <button data-del-expense="${item.id}" data-kind="${kind}">🗑</button>
      </div>
    </div>
  `);
}

function shoppingRow(item) {
  return el(`
    <div class="row ${item.done ? 'done' : ''}">
      <button class="checkbox ${item.done ? 'checked' : ''}" data-toggle-shop="${item.id}">${item.done ? '✓' : ''}</button>
      <div class="row-body"><div class="row-title">${item.name}</div></div>
      <div class="row-actions"><button data-del-shop="${item.id}">🗑</button></div>
    </div>
  `);
}

function goalRowCompact(goal) {
  const pct = clamp(Math.round((goal.current / goal.target) * 100), 0, 100);
  const isMoney = goal.target > 100 || goal.title.toLowerCase().includes('guardar') || goal.title.toLowerCase().includes('macbook') || goal.title.toLowerCase().includes('$');
  return el(`
    <div class="goal-row">
      <div class="goal-row-top">
        <div class="row-icon bg-${goal.color}">${goal.icon}</div>
        <div class="row-title">${goal.title}</div>
        <div class="row-side">${pct}%</div>
      </div>
      <div class="goal-row-track"><div class="goal-row-fill bg-${goal.color}" style="width:${pct}%;background:var(--${goal.color});"></div></div>
      ${isMoney && goal.target > 100 ? `<div class="goal-row-sub">${fmtMoney(goal.current)} / ${fmtMoney(goal.target)}</div>` : ''}
    </div>
  `);
}

/* -------------------------------------------------------------------------
   5b. RENDER — Início (home)
   ------------------------------------------------------------------------- */
function todayAppDay() { return jsDayToAppDay(new Date().getDay()); }

function render() {
  renderHeader();
  renderHome();
  renderFinanceiro();
  renderTarefas();
  renderRotina();
  renderMetas();
  renderAlimentacao();
  renderRelatorios();
  renderConfig();
}

function renderHeader() {
  document.getElementById('greeting').textContent = `Bom dia, ${DATA.profile.name1}! 👋`;
  const now = new Date();
  const dayName = WEEKDAYS_FULL[todayAppDay()];
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('todayDate').textContent = `${dayName}, ${dateStr}`;
  document.getElementById('todayPill').textContent = dayName.split('-')[0];
}

function computeFinanceSummary() {
  const f = DATA.finance;
  const income = f.weeklyIncome;
  const weeklyVariableSpent = f.variableExpenses.reduce((s, e) => s + e.amount, 0);
  // approximate weekly share of monthly fixed costs (rent + fixed expenses) / ~4.33 weeks
  const monthlyFixed = f.rent.amount + f.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const weeklyFixedShare = monthlyFixed / 4.33;
  const spent = weeklyVariableSpent; // "gastos" card mirrors variable/weekly spending like the reference
  const recommendedSave = income * (DATA.profile.savePercent / 100);
  const saved = Math.max(0, Math.min(recommendedSave, income - spent - weeklyFixedShare));
  const available = Math.max(0, income - spent - saved);
  const budgetUsedPct = clamp(Math.round(((spent + weeklyFixedShare) / income) * 100), 0, 100);
  return { income, spent, saved, available, budgetUsedPct, weeklyFixedShare, monthlyFixed, recommendedSave };
}

function renderHome() {
  const s = computeFinanceSummary();

  // Hoje
  const todayTasks = DATA.tasks.filter(t => t.day === todayAppDay());
  const todayList = document.getElementById('todayTasksList');
  todayList.innerHTML = '';
  if (todayTasks.length === 0) todayList.appendChild(el('<p class="muted small">Nenhuma tarefa para hoje.</p>'));
  todayTasks.slice(0, 6).forEach(t => todayList.appendChild(taskRow(t, { showActions: false })));

  // Week strip (home)
  renderWeekStrip('weekStrip', renderHomeDayRoutine);
  renderHomeDayRoutine(todayAppDay());

  // Home tasks list + tabs
  renderHomeTaskTabs();

  // Meals preview
  document.getElementById('mealWeekLabel').textContent = DATA.meals.weekLabel;
  const homeMeals = document.getElementById('homeMealsList');
  homeMeals.innerHTML = '';
  DATA.meals.days.slice(0, 5).forEach(m => {
    homeMeals.appendChild(el(`<div class="row"><div class="row-body"><div class="row-title">${m.day}</div><div class="row-sub">${m.meal}</div></div></div>`));
  });

  // Assistant chips
  const chipTexts = [
    `Recebi $${DATA.finance.weeklyIncome} essa semana, gastei $${DATA.finance.categories[1]?.amount || 180} no mercado e $${DATA.finance.categories[2]?.amount || 70} de gasolina.`,
    `Tenho que pagar $${DATA.finance.rent.amount} de aluguel dia ${DATA.finance.rent.day}.`,
    'Planeje minha semana considerando faculdade e treino.'
  ];
  ['assistantChips', 'assistantChipsBottom'].forEach(id => {
    const wrap = document.getElementById(id);
    wrap.innerHTML = '';
    chipTexts.forEach(txt => {
      const c = el(`<div class="chip">${txt}</div>`);
      c.addEventListener('click', () => runAssistant(txt));
      wrap.appendChild(c);
    });
  });

  // Finance summary card
  document.getElementById('homeIncome').textContent = fmtMoney(s.income);
  document.getElementById('budgetPercent').textContent = s.budgetUsedPct + '%';
  const ring = document.getElementById('budgetRingFg');
  const circumference = 2 * Math.PI * 37;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference * (1 - s.budgetUsedPct / 100);
  ring.setAttribute('stroke', s.budgetUsedPct > 90 ? '#ef4444' : (s.budgetUsedPct > 70 ? '#f59e0b' : '#22c55e'));

  const bar = document.getElementById('financeBar');
  const spentPct = clamp((s.spent / s.income) * 100, 0, 100);
  const savedPct = clamp((s.saved / s.income) * 100, 0, 100);
  bar.innerHTML = `<span style="width:${spentPct}%;background:var(--red);"></span><span style="width:${savedPct}%;background:var(--green);"></span>`;
  document.getElementById('homeSpent').textContent = fmtMoney(s.spent);
  document.getElementById('homeSaved').textContent = fmtMoney(s.saved);
  document.getElementById('homeAvailable').textContent = fmtMoney(s.available);

  const catList = document.getElementById('homeCategoryList');
  catList.innerHTML = '';
  DATA.finance.categories.forEach(c => {
    catList.appendChild(el(`
      <div class="cat-row">
        <div class="row-icon bg-${c.color}" style="width:28px;height:28px;font-size:13px;">${c.icon}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-amount">${fmtMoney(c.amount)} / ${c.period}</div>
        <div class="cat-percent">${c.percent}%</div>
      </div>
    `));
  });

  // Middle tasks list (secondary view of tasks like the reference "Tarefas" middle card)
  const midList = document.getElementById('tasksMiddleList');
  midList.innerHTML = '';
  DATA.tasks.filter(t => !t.done).slice(0, 6).forEach(t => midList.appendChild(taskRow(t, { showActions: false })));

  // Assistant chat
  renderAssistantChat();

  // Payments
  const payList = document.getElementById('paymentsList');
  payList.innerHTML = '';
  getUpcomingPayments().slice(0, 5).forEach(p => {
    payList.appendChild(el(`
      <div class="row">
        <div class="row-icon bg-${p.color}">${p.icon}</div>
        <div class="row-body"><div class="row-title">${p.name}</div><div class="row-sub">${p.day} ${monthShort()}</div></div>
        <div class="row-side">${fmtMoney(p.amount)}</div>
      </div>
    `));
  });

  // Goals
  const goalsList = document.getElementById('goalsList');
  goalsList.innerHTML = '';
  DATA.goals.slice(0, 6).forEach(g => goalsList.appendChild(goalRowCompact(g)));

  // Shopping list (home)
  const shopHome = document.getElementById('shoppingListHome');
  shopHome.innerHTML = '';
  DATA.shoppingList.slice(0, 8).forEach(item => shopHome.appendChild(shoppingRow(item)));

  // Insights
  renderInsights();
}

function monthShort() {
  return new Date().toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function getUpcomingPayments() {
  const list = [
    { name: 'Aluguel', amount: DATA.finance.rent.amount, day: DATA.finance.rent.day, icon: '🏠', color: 'red' }
  ];
  DATA.finance.fixedExpenses.forEach(e => list.push({ name: e.name, amount: e.amount, day: e.day, icon: e.icon, color: e.color }));
  return list.sort((a, b) => a.day - b.day);
}

function renderWeekStrip(containerId, onSelectDay) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  const today = todayAppDay();
  WEEKDAYS_SHORT.forEach((label, idx) => {
    const cell = el(`<div class="day-cell ${idx === (wrap._selected ?? today) ? 'active' : ''}"><span>${label}</span><strong>${dateForDay(idx).getDate()}</strong></div>`);
    cell.addEventListener('click', () => {
      wrap._selected = idx;
      [...wrap.children].forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      if (onSelectDay) onSelectDay(idx);
    });
    wrap.appendChild(cell);
  });
}
function dateForDay(appDayIdx) {
  const now = new Date();
  const currentAppDay = jsDayToAppDay(now.getDay());
  const diff = appDayIdx - currentAppDay;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d;
}

function renderHomeDayRoutine(dayIdx) {
  const list = document.getElementById('weekRoutineList');
  list.innerHTML = '';
  const items = DATA.routine[dayIdx] || [];
  if (items.length === 0) list.appendChild(el('<p class="muted small">Nenhum item planejado.</p>'));
  items.forEach(item => {
    list.appendChild(el(`
      <div class="row ${item.done ? 'done' : ''}">
        <button class="checkbox ${item.done ? 'checked' : ''}" data-toggle-routine="${dayIdx}:${item.id}">${item.done ? '✓' : ''}</button>
        <div class="row-body"><div class="row-title">${item.icon || ''} ${item.title}</div></div>
        <div class="row-side">${item.time || ''}</div>
      </div>
    `));
  });
}

let homeTaskFilter = 'Todas';
function renderHomeTaskTabs() {
  const tabsWrap = document.getElementById('taskTabsHome');
  const cats = ['Todas', 'Thiago', 'Camille', 'Casa', 'Trabalho', 'Faculdade', 'Projetos'];
  tabsWrap.innerHTML = '';
  cats.forEach(c => {
    const btn = el(`<button class="tab-btn ${homeTaskFilter === c ? 'active' : ''}">${c}</button>`);
    btn.addEventListener('click', () => { homeTaskFilter = c; renderHomeTaskTabs(); });
    tabsWrap.appendChild(btn);
  });
  const list = document.getElementById('homeTasksList');
  list.innerHTML = '';
  const filtered = homeTaskFilter === 'Todas' ? DATA.tasks : DATA.tasks.filter(t => CATEGORY_META[t.category]?.label === homeTaskFilter);
  filtered.slice(0, 7).forEach(t => list.appendChild(taskRow(t)));
}

function renderInsights() {
  const s = computeFinanceSummary();
  const foodCat = DATA.finance.categories.find(c => c.name.toLowerCase().includes('aliment'));
  const foodPct = foodCat ? foodCat.percent : 0;
  document.getElementById('insightsText').textContent =
    `Você está gastando ${foodPct}% com alimentação esta semana. Orçamento em uso: ${s.budgetUsedPct}%. Continue assim! 👏`;
  const bars = document.getElementById('insightsBars');
  bars.innerHTML = '';
  const values = [30, 45, 25, 60, 40, 90, 35];
  const max = Math.max(...values);
  values.forEach(v => {
    bars.appendChild(el(`<div class="bar ${v === max ? 'peak' : ''}" style="height:${(v / max) * 100}%"></div>`));
  });
}

function renderAssistantChat() {
  const chat = document.getElementById('homeAssistantChat');
  chat.innerHTML = '';
  DATA.assistantLog.slice(-6).forEach(msg => {
    chat.appendChild(el(`<div class="chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}">${msg.text}</div>`));
  });
  chat.scrollTop = chat.scrollHeight;
}

/* -------------------------------------------------------------------------
   5c. RENDER — Financeiro
   ------------------------------------------------------------------------- */
function renderFinanceiro() {
  const s = computeFinanceSummary();
  document.getElementById('finIncomeVal').textContent = fmtMoney(s.income);
  document.getElementById('finAvailableVal').textContent = fmtMoney(s.available);
  document.getElementById('finRecommendedVal').textContent = fmtMoney(s.recommendedSave);

  const alertBox = document.getElementById('finAlert');
  if (s.budgetUsedPct >= 90) {
    alertBox.classList.remove('hidden');
    alertBox.textContent = `⚠️ Atenção: você já usou ${s.budgetUsedPct}% do orçamento semanal. Considere reduzir gastos variáveis.`;
  } else if (s.spent > s.income * 0.5) {
    alertBox.classList.remove('hidden');
    alertBox.textContent = `⚠️ Seus gastos variáveis já passam de 50% da renda semanal.`;
  } else {
    alertBox.classList.add('hidden');
  }

  const fixedList = document.getElementById('fixedExpensesList');
  fixedList.innerHTML = '';
  DATA.finance.fixedExpenses.forEach(e => fixedList.appendChild(expenseRow(e, 'fixed')));

  const varList = document.getElementById('variableExpensesList');
  varList.innerHTML = '';
  DATA.finance.variableExpenses.forEach(e => varList.appendChild(expenseRow(e, 'variable')));

  document.getElementById('rentAmount').textContent = fmtMoney(DATA.finance.rent.amount);
  document.getElementById('rentDay').textContent = `Dia ${DATA.finance.rent.day}`;

  const splitWrap = document.getElementById('splitBars');
  splitWrap.innerHTML = '';
  const splits = [
    { label: 'Moradia (aluguel)', value: DATA.finance.rent.amount, color: 'red', of: s.income * 4.33 },
    { label: 'Guardado (meta)', value: s.saved, color: 'green', of: s.income },
    { label: 'Gastos variáveis', value: s.spent, color: 'orange', of: s.income },
    { label: 'Disponível', value: s.available, color: 'blue', of: s.income }
  ];
  splits.forEach(sp => {
    const pct = clamp(Math.round((sp.value / sp.of) * 100), 0, 100);
    splitWrap.appendChild(el(`
      <div class="split-row">
        <div class="split-row-top"><span>${sp.label}</span><strong>${fmtMoney(sp.value)}</strong></div>
        <div class="split-track"><div class="split-fill" style="width:${pct}%;background:var(--${sp.color});"></div></div>
      </div>
    `));
  });

  const finGoals = document.getElementById('finGoalsList');
  finGoals.innerHTML = '';
  DATA.goals.forEach(g => finGoals.appendChild(goalRowCompact(g)));
}

/* -------------------------------------------------------------------------
   5d. RENDER — Tarefas
   ------------------------------------------------------------------------- */
let taskFilterFull = 'Todas';
function renderTarefas() {
  const tabsWrap = document.getElementById('taskTabsFull');
  const cats = ['Todas', 'Thiago', 'Camille', 'Casa', 'Trabalho', 'Faculdade', 'Projetos'];
  tabsWrap.innerHTML = '';
  cats.forEach(c => {
    const btn = el(`<button class="tab-btn ${taskFilterFull === c ? 'active' : ''}">${c}</button>`);
    btn.addEventListener('click', () => { taskFilterFull = c; renderTarefas(); });
    tabsWrap.appendChild(btn);
  });
  const list = document.getElementById('fullTasksList');
  list.innerHTML = '';
  const filtered = taskFilterFull === 'Todas' ? DATA.tasks : DATA.tasks.filter(t => CATEGORY_META[t.category]?.label === taskFilterFull);
  if (filtered.length === 0) list.appendChild(el('<p class="muted small">Nenhuma tarefa nesta categoria.</p>'));
  filtered.forEach(t => list.appendChild(taskRow(t)));
}

/* -------------------------------------------------------------------------
   5e. RENDER — Rotina
   ------------------------------------------------------------------------- */
let routineSelectedDay = todayAppDay();
function renderRotina() {
  const strip = document.getElementById('weekStripFull');
  strip._selected = routineSelectedDay;
  renderWeekStrip('weekStripFull', (idx) => { routineSelectedDay = idx; renderRotinaDay(); });
  renderRotinaDay();
}
function renderRotinaDay() {
  document.getElementById('routineDayLabel').textContent = WEEKDAYS_FULL[routineSelectedDay];
  const list = document.getElementById('routineDayList');
  list.innerHTML = '';
  const items = DATA.routine[routineSelectedDay] || [];
  if (items.length === 0) list.appendChild(el('<p class="muted small">Nenhum item planejado para este dia.</p>'));
  items.forEach(item => {
    const row = el(`
      <div class="row ${item.done ? 'done' : ''}">
        <button class="checkbox ${item.done ? 'checked' : ''}" data-toggle-routine="${routineSelectedDay}:${item.id}">${item.done ? '✓' : ''}</button>
        <div class="row-body"><div class="row-title">${item.icon || ''} ${item.title}</div></div>
        <div class="row-side">${item.time || ''}</div>
        <div class="row-actions"><button data-del-routine="${routineSelectedDay}:${item.id}">🗑</button></div>
      </div>
    `);
    list.appendChild(row);
  });
}

/* -------------------------------------------------------------------------
   5f. RENDER — Metas
   ------------------------------------------------------------------------- */
function renderMetas() {
  const wrap = document.getElementById('fullGoalsList');
  wrap.innerHTML = '';
  DATA.goals.forEach(g => {
    const pct = clamp(Math.round((g.current / g.target) * 100), 0, 100);
    const isMoney = g.target > 100;
    wrap.appendChild(el(`
      <div class="goal-card">
        <div class="goal-top">
          <div class="goal-icon bg-${g.color}">${g.icon}</div>
          <div class="goal-title">${g.title}</div>
          <div class="goal-percent">${pct}%</div>
        </div>
        <div class="goal-track"><div class="goal-fill" style="width:${pct}%;background:var(--${g.color});"></div></div>
        <div class="goal-sub">${isMoney ? fmtMoney(g.current) + ' / ' + fmtMoney(g.target) : pct + '% concluído'}</div>
        <div class="goal-actions">
          <button class="btn-outline" data-progress-goal="${g.id}">+ Progresso</button>
          <button class="btn-outline" data-edit-goal="${g.id}">Editar</button>
          <button class="btn-outline" data-del-goal="${g.id}">Excluir</button>
        </div>
      </div>
    `));
  });
}

/* -------------------------------------------------------------------------
   5g. RENDER — Alimentação
   ------------------------------------------------------------------------- */
function renderAlimentacao() {
  const list = document.getElementById('fullMealsList');
  list.innerHTML = '';
  DATA.meals.days.forEach((m, idx) => {
    list.appendChild(el(`
      <div class="row">
        <div class="row-body"><div class="row-title">${m.day}</div><div class="row-sub">${m.meal}</div></div>
        <div class="row-actions"><button data-edit-meal="${idx}">✎</button></div>
      </div>
    `));
  });

  const shop = document.getElementById('fullShoppingList');
  shop.innerHTML = '';
  if (DATA.shoppingList.length === 0) shop.appendChild(el('<p class="muted small">Lista vazia. Adicione itens ou gere automaticamente.</p>'));
  DATA.shoppingList.forEach(item => shop.appendChild(shoppingRow(item)));

  const basics = document.getElementById('basicIngredients');
  basics.innerHTML = '';
  DATA.basicIngredients.forEach(ing => basics.appendChild(el(`<span>${ing}</span>`)));
}

/* -------------------------------------------------------------------------
   5h. RENDER — Relatórios
   ------------------------------------------------------------------------- */
function renderRelatorios() {
  const s = computeFinanceSummary();
  document.getElementById('repTotalGasto').textContent = fmtMoney(s.spent);
  document.getElementById('repTotalGuardado').textContent = fmtMoney(s.saved);
  document.getElementById('repTasksDone').textContent = DATA.tasks.filter(t => t.done).length + ' / ' + DATA.tasks.length;
  const goalsAvg = Math.round(DATA.goals.reduce((sum, g) => sum + clamp(g.current / g.target, 0, 1), 0) / DATA.goals.length * 100);
  document.getElementById('repGoalsAvg').textContent = goalsAvg + '%';

  const bars = document.getElementById('reportBars');
  bars.innerHTML = '';
  const cats = DATA.finance.categories;
  const max = Math.max(...cats.map(c => c.amount), 1);
  cats.forEach(c => {
    const h = (c.amount / max) * 100;
    bars.appendChild(el(`
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;justify-content:flex-end;height:100%;">
        <div class="bar ${c.amount === max ? 'peak' : ''}" style="width:70%;height:${h}%;"></div>
        <span class="tiny muted">${c.name}</span>
      </div>
    `));
  });
  bars.style.alignItems = 'flex-end';

  const doneTasks = DATA.tasks.filter(t => t.done).length;
  document.getElementById('weeklySummaryText').textContent =
    `Esta semana vocês receberam ${fmtMoney(s.income)}, gastaram ${fmtMoney(s.spent)} e guardaram ${fmtMoney(s.saved)}. ` +
    `${doneTasks} de ${DATA.tasks.length} tarefas foram concluídas e o progresso médio das metas está em ${goalsAvg}%.`;
}

/* -------------------------------------------------------------------------
   5i. RENDER — Configurações
   ------------------------------------------------------------------------- */
function renderConfig() {
  document.getElementById('cfgName1').value = DATA.profile.name1;
  document.getElementById('cfgName2').value = DATA.profile.name2;
  document.getElementById('cfgSavePercent').value = DATA.profile.savePercent;
}

/* -------------------------------------------------------------------------
   6. EVENT BINDINGS
   ------------------------------------------------------------------------- */
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewName);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === viewName));
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindEvents() {
  // Sidebar navigation (works for any element with data-view, including link buttons in cards)
  document.body.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-view]');
    if (navEl) switchView(navEl.dataset.view);
  });

  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('open');
  });
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
  });

  // Delegate: task toggle / edit / delete
  document.body.addEventListener('click', (e) => {
    const toggleId = e.target.closest('[data-toggle-task]')?.dataset.toggleTask;
    if (toggleId) { toggleTask(toggleId); return; }

    const editId = e.target.closest('[data-edit-task]')?.dataset.editTask;
    if (editId) { editTask(editId); return; }

    const delId = e.target.closest('[data-del-task]')?.dataset.delTask;
    if (delId) { confirmDelete('Excluir esta tarefa?', () => { DATA.tasks = DATA.tasks.filter(t => t.id !== delId); saveData(); render(); }); return; }

    const toggleShop = e.target.closest('[data-toggle-shop]')?.dataset.toggleShop;
    if (toggleShop) { const it = DATA.shoppingList.find(i => i.id === toggleShop); if (it) { it.done = !it.done; saveData(); render(); } return; }

    const delShop = e.target.closest('[data-del-shop]')?.dataset.delShop;
    if (delShop) { DATA.shoppingList = DATA.shoppingList.filter(i => i.id !== delShop); saveData(); render(); return; }

    const toggleRoutine = e.target.closest('[data-toggle-routine]')?.dataset.toggleRoutine;
    if (toggleRoutine) {
      const [day, id] = toggleRoutine.split(':');
      const item = (DATA.routine[day] || []).find(i => i.id === id);
      if (item) { item.done = !item.done; saveData(); render(); }
      return;
    }
    const delRoutine = e.target.closest('[data-del-routine]')?.dataset.delRoutine;
    if (delRoutine) {
      const [day, id] = delRoutine.split(':');
      DATA.routine[day] = (DATA.routine[day] || []).filter(i => i.id !== id);
      saveData(); render();
      return;
    }

    const editExpenseId = e.target.closest('[data-edit-expense]');
    if (editExpenseId) { editExpense(editExpenseId.dataset.editExpense, editExpenseId.dataset.kind); return; }
    const delExpenseId = e.target.closest('[data-del-expense]');
    if (delExpenseId) {
      const kind = delExpenseId.dataset.kind;
      const id = delExpenseId.dataset.delExpense;
      confirmDelete('Excluir este gasto?', () => {
        if (kind === 'fixed') DATA.finance.fixedExpenses = DATA.finance.fixedExpenses.filter(x => x.id !== id);
        else DATA.finance.variableExpenses = DATA.finance.variableExpenses.filter(x => x.id !== id);
        saveData(); render();
      });
      return;
    }

    const editGoalId = e.target.closest('[data-edit-goal]')?.dataset.editGoal;
    if (editGoalId) { editGoal(editGoalId); return; }
    const delGoalId = e.target.closest('[data-del-goal]')?.dataset.delGoal;
    if (delGoalId) { confirmDelete('Excluir esta meta?', () => { DATA.goals = DATA.goals.filter(g => g.id !== delGoalId); saveData(); render(); }); return; }
    const progressGoalId = e.target.closest('[data-progress-goal]')?.dataset.progressGoal;
    if (progressGoalId) { addGoalProgress(progressGoalId); return; }

    const editMealIdx = e.target.closest('[data-edit-meal]')?.dataset.editMeal;
    if (editMealIdx !== undefined && editMealIdx !== null && e.target.closest('[data-edit-meal]')) { editMeal(parseInt(editMealIdx)); return; }
  });

  // Quick add buttons
  document.getElementById('quickAddTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('addExpenseBtn').addEventListener('click', () => openExpenseModal('variable'));
  document.getElementById('addRoutineBtn').addEventListener('click', () => openRoutineModal());
  document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal());
  document.getElementById('addMealBtn').addEventListener('click', () => editMeal(0));
  document.getElementById('addShopBtn').addEventListener('click', () => openShoppingModal());
  document.getElementById('addShopHomeBtn').addEventListener('click', () => openShoppingModal());
  document.getElementById('genShoppingListBtn').addEventListener('click', generateShoppingList);
  document.getElementById('generateWeekBtn').addEventListener('click', generateWeekPlan);
  document.getElementById('editIncomeBtn').addEventListener('click', openIncomeModal);
  document.getElementById('editRentBtn').addEventListener('click', openRentModal);
  document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    confirmDelete('Isso vai apagar todos os dados salvos e restaurar o exemplo. Continuar?', () => {
      DATA = defaultData(); saveData(); render(); showToast('Dados restaurados.');
    });
  });

  // Assistant form
  document.getElementById('assistantForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('assistantInput');
    const text = input.value.trim();
    if (!text) return;
    runAssistant(text);
    input.value = '';
  });
  document.getElementById('fabTalkBtn').addEventListener('click', () => {
    switchView('inicio');
    setTimeout(() => document.getElementById('assistantInput').focus(), 300);
  });
  document.getElementById('micBtn').addEventListener('click', () => {
    showToast('Reconhecimento de voz não disponível nesta demonstração — digite sua mensagem.');
  });
}

/* -------------------------------------------------------------------------
   6b. TASK CRUD
   ------------------------------------------------------------------------- */
function toggleTask(id) {
  const t = DATA.tasks.find(x => x.id === id);
  if (t) { t.done = !t.done; saveData(); render(); }
}
function openTaskModal(existing) {
  openModal({
    title: existing ? 'Editar tarefa' : 'Nova tarefa',
    fields: [
      { key: 'title', label: 'Título', type: 'text', value: existing?.title },
      { key: 'time', label: 'Horário', type: 'time', value: existing?.time, half: true },
      { key: 'day', label: 'Dia da semana', type: 'select', half: true, value: existing?.day ?? todayAppDay(),
        options: WEEKDAYS_FULL.map((d, i) => ({ value: i, label: d })) },
      { key: 'category', label: 'Categoria', type: 'select', half: true, value: existing?.category || 'casa',
        options: Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label })) },
      { key: 'priority', label: 'Prioridade', type: 'select', half: true, value: existing?.priority || 'media',
        options: [{ value: 'alta', label: 'Alta' }, { value: 'media', label: 'Média' }, { value: 'baixa', label: 'Baixa' }] }
    ],
    onSave: (v) => {
      if (!v.title) { showToast('Dê um título para a tarefa.'); return; }
      if (existing) {
        Object.assign(existing, { title: v.title, time: v.time, day: parseInt(v.day), category: v.category, priority: v.priority });
      } else {
        DATA.tasks.push({ id: uid(), title: v.title, time: v.time, day: parseInt(v.day), category: v.category, priority: v.priority, done: false, recurring: false });
      }
      saveData(); render(); showToast('Tarefa salva.');
    }
  });
}
function editTask(id) { openTaskModal(DATA.tasks.find(t => t.id === id)); }

/* -------------------------------------------------------------------------
   6c. EXPENSE / INCOME / RENT CRUD
   ------------------------------------------------------------------------- */
function openExpenseModal(kind, existing) {
  const fields = [
    { key: 'name', label: 'Nome', type: 'text', value: existing?.name },
    { key: 'amount', label: 'Valor ($)', type: 'number', value: existing?.amount, half: true }
  ];
  if (kind === 'fixed') fields.push({ key: 'day', label: 'Dia do mês', type: 'number', value: existing?.day, half: true, min: 1, max: 31 });
  else fields.push({ key: 'date', label: 'Data', type: 'date', value: existing?.date, half: true });

  openModal({
    title: existing ? 'Editar gasto' : (kind === 'fixed' ? 'Novo gasto fixo' : 'Novo gasto variável'),
    fields,
    onSave: (v) => {
      if (!v.name || !v.amount) { showToast('Preencha nome e valor.'); return; }
      const icon = kind === 'fixed' ? '📌' : '🛍️';
      const color = ICON_COLORS[Math.floor(Math.random() * ICON_COLORS.length)];
      if (existing) {
        Object.assign(existing, kind === 'fixed'
          ? { name: v.name, amount: v.amount, day: parseInt(v.day) || 1 }
          : { name: v.name, amount: v.amount, date: v.date });
      } else {
        const item = kind === 'fixed'
          ? { id: uid(), name: v.name, amount: v.amount, day: parseInt(v.day) || 1, icon, color }
          : { id: uid(), name: v.name, amount: v.amount, date: v.date, icon, color };
        DATA.finance[kind === 'fixed' ? 'fixedExpenses' : 'variableExpenses'].push(item);
      }
      saveData(); render(); showToast('Gasto salvo.');
    }
  });
}
function editExpense(id, kind) {
  const list = kind === 'fixed' ? DATA.finance.fixedExpenses : DATA.finance.variableExpenses;
  openExpenseModal(kind, list.find(x => x.id === id));
}
function openIncomeModal() {
  openModal({
    title: 'Editar renda semanal',
    fields: [{ key: 'income', label: 'Renda semanal ($)', type: 'number', value: DATA.finance.weeklyIncome }],
    onSave: (v) => { DATA.finance.weeklyIncome = v.income; saveData(); render(); showToast('Renda atualizada.'); }
  });
}
function openRentModal() {
  openModal({
    title: 'Editar aluguel',
    fields: [
      { key: 'amount', label: 'Valor ($)', type: 'number', value: DATA.finance.rent.amount, half: true },
      { key: 'day', label: 'Dia de pagamento', type: 'number', value: DATA.finance.rent.day, half: true, min: 1, max: 31 }
    ],
    onSave: (v) => { DATA.finance.rent = { amount: v.amount, day: parseInt(v.day) }; saveData(); render(); showToast('Aluguel atualizado.'); }
  });
}

/* -------------------------------------------------------------------------
   6d. ROUTINE CRUD
   ------------------------------------------------------------------------- */
function openRoutineModal() {
  openModal({
    title: 'Novo item de rotina',
    fields: [
      { key: 'title', label: 'Atividade', type: 'text' },
      { key: 'time', label: 'Horário', type: 'time', half: true },
      { key: 'day', label: 'Dia', type: 'select', half: true, value: routineSelectedDay, options: WEEKDAYS_FULL.map((d, i) => ({ value: i, label: d })) }
    ],
    onSave: (v) => {
      if (!v.title) { showToast('Dê um nome para a atividade.'); return; }
      const day = parseInt(v.day);
      if (!DATA.routine[day]) DATA.routine[day] = [];
      DATA.routine[day].push({ id: uid(), title: v.title, time: v.time, done: false, icon: '⭐' });
      saveData(); render(); showToast('Item adicionado à rotina.');
    }
  });
}

/* -------------------------------------------------------------------------
   6e. GOALS CRUD
   ------------------------------------------------------------------------- */
function openGoalModal(existing) {
  openModal({
    title: existing ? 'Editar meta' : 'Nova meta',
    fields: [
      { key: 'title', label: 'Título da meta', type: 'text', value: existing?.title },
      { key: 'current', label: 'Progresso atual', type: 'number', value: existing?.current ?? 0, half: true },
      { key: 'target', label: 'Meta (alvo)', type: 'number', value: existing?.target ?? 100, half: true },
      { key: 'color', label: 'Cor', type: 'select', value: existing?.color || 'blue', half: true,
        options: ICON_COLORS.map(c => ({ value: c, label: c })) },
      { key: 'icon', label: 'Ícone (emoji)', type: 'text', value: existing?.icon || '🎯', half: true }
    ],
    onSave: (v) => {
      if (!v.title) { showToast('Dê um título para a meta.'); return; }
      if (existing) Object.assign(existing, { title: v.title, current: v.current, target: v.target, color: v.color, icon: v.icon });
      else DATA.goals.push({ id: uid(), title: v.title, current: v.current, target: v.target, color: v.color, icon: v.icon || '🎯' });
      saveData(); render(); showToast('Meta salva.');
    }
  });
}
function editGoal(id) { openGoalModal(DATA.goals.find(g => g.id === id)); }
function addGoalProgress(id) {
  const g = DATA.goals.find(x => x.id === id);
  if (!g) return;
  openModal({
    title: `Adicionar progresso — ${g.title}`,
    fields: [{ key: 'amount', label: 'Quanto adicionar', type: 'number', value: 0 }],
    onSave: (v) => { g.current = clamp(g.current + (v.amount || 0), 0, g.target); saveData(); render(); showToast('Progresso atualizado! 🎉'); }
  });
}

/* -------------------------------------------------------------------------
   6f. MEALS + SHOPPING LIST
   ------------------------------------------------------------------------- */
function editMeal(idx) {
  const m = DATA.meals.days[idx] || { day: 'Segunda', meal: '' };
  openModal({
    title: `Refeição — ${m.day}`,
    fields: [{ key: 'meal', label: 'Descrição da refeição', type: 'textarea', value: m.meal }],
    onSave: (v) => { DATA.meals.days[idx] = { day: m.day, meal: v.meal }; saveData(); render(); showToast('Refeição atualizada.'); }
  });
}
function openShoppingModal() {
  openModal({
    title: 'Adicionar item',
    fields: [{ key: 'name', label: 'Item', type: 'text' }],
    onSave: (v) => {
      if (!v.name) return;
      DATA.shoppingList.push({ id: uid(), name: v.name, done: false });
      saveData(); render(); showToast('Item adicionado à lista.');
    }
  });
}
function generateShoppingList() {
  // Build a shopping list automatically based on planned meals' key ingredients (simple keyword extraction)
  const keywords = ['frango', 'arroz', 'feijão', 'macarrão', 'carne moída', 'ovos', 'batata doce', 'legumes', 'salada', 'tomate', 'alface', 'queijo', 'molho'];
  const found = new Set(DATA.shoppingList.map(i => i.name.toLowerCase()));
  let added = 0;
  DATA.meals.days.forEach(m => {
    keywords.forEach(k => {
      if (m.meal.toLowerCase().includes(k) && !found.has(k)) {
        DATA.shoppingList.push({ id: uid(), name: k.charAt(0).toUpperCase() + k.slice(1), done: false });
        found.add(k);
        added++;
      }
    });
  });
  saveData(); render();
  showToast(added > 0 ? `${added} item(ns) adicionados automaticamente.` : 'Lista já está completa com base nas refeições.');
}

/* -------------------------------------------------------------------------
   6g. PLANNER — "Gerar semana"
   ------------------------------------------------------------------------- */
function generateWeekPlan() {
  const s = computeFinanceSummary();
  const pendingTasks = DATA.tasks.filter(t => !t.done);
  const topGoal = [...DATA.goals].sort((a, b) => (a.current / a.target) - (b.current / b.target))[0];

  const suggestions = [];
  suggestions.push(`💰 Você tem ${fmtMoney(s.available)} disponíveis esta semana — priorize gastos essenciais e evite compras por impulso.`);
  if (s.budgetUsedPct >= 80) suggestions.push('⚠️ O orçamento semanal já está apertado. Considere adiar gastos não essenciais.');
  if (pendingTasks.length > 0) {
    const highPriority = pendingTasks.filter(t => t.priority === 'alta');
    if (highPriority.length) suggestions.push(`📌 Priorize ${highPriority.length} tarefa(s) de alta prioridade: ${highPriority.slice(0, 3).map(t => t.title).join(', ')}.`);
  }
  if (topGoal) suggestions.push(`🎯 A meta "${topGoal.title}" está com menor progresso (${Math.round((topGoal.current / topGoal.target) * 100)}%) — considere dedicar um tempo a ela esta semana.`);
  suggestions.push('🏋️ Reserve pelo menos 4 dias para treino, conforme sua meta de frequência.');
  suggestions.push('🛒 Faça compras do mercado no início da semana para aproveitar o planejamento de refeições.');

  const wrap = document.getElementById('plannerSuggestions');
  wrap.innerHTML = '';
  suggestions.forEach(s2 => wrap.appendChild(el(`<div class="row"><div class="row-body"><div class="row-title">${s2}</div></div></div>`)));
  showToast('Semana gerada com sugestões personalizadas! ✨');
}

/* -------------------------------------------------------------------------
   6h. CONFIG
   ------------------------------------------------------------------------- */
function saveConfig() {
  DATA.profile.name1 = document.getElementById('cfgName1').value || 'Thiago';
  DATA.profile.name2 = document.getElementById('cfgName2').value || 'Camille';
  DATA.profile.savePercent = clamp(parseInt(document.getElementById('cfgSavePercent').value) || 35, 0, 100);
  saveData(); render(); showToast('Configurações salvas.');
}

/* -------------------------------------------------------------------------
   7. ASSISTANT — local NLU simulation (regex/keyword based, no external API)
   ------------------------------------------------------------------------- */
function pushChat(role, text) {
  DATA.assistantLog.push({ role, text });
  if (DATA.assistantLog.length > 40) DATA.assistantLog = DATA.assistantLog.slice(-40);
}

function extractMoney(text) {
  const m = text.match(/\$?\s?(\d+[.,]?\d*)/);
  if (!m) return null;
  return parseFloat(m[1].replace(',', '.'));
}

function runAssistant(text) {
  pushChat('user', text);
  const lower = text.toLowerCase();
  let reply = null;

  // "Recebi $X essa semana" (income) — also parse extra "gastei $Y ..." clauses in same sentence
  if (/recebi/.test(lower)) {
    const val = extractMoney(lower);
    if (val) { DATA.finance.weeklyIncome = val; reply = `Renda semanal atualizada para ${fmtMoney(val)}.`; }
  }

  // "gastei $X no/de <categoria>"
  const gastoMatches = [...lower.matchAll(/gastei\s+\$?\s?(\d+[.,]?\d*)\s*(?:no|na|em|de)?\s*([a-zçãõáéíóú\s]*)/g)];
  if (gastoMatches.length) {
    gastoMatches.forEach(m => {
      const amount = parseFloat(m[1].replace(',', '.'));
      let place = (m[2] || '').trim().split(/\se\s|,|\./)[0].trim();
      if (!place) place = 'Gasto';
      place = place.charAt(0).toUpperCase() + place.slice(1);
      DATA.finance.variableExpenses.push({ id: uid(), name: place, amount, date: new Date().toISOString().slice(0, 10), icon: '💸', color: 'orange' });
    });
    reply = (reply ? reply + ' ' : '') + `Registrei ${gastoMatches.length} gasto(s) variável(is).`;
  }

  // "pagar $X de aluguel dia D"
  if (/aluguel/.test(lower) && /pagar|paguei/.test(lower)) {
    const val = extractMoney(lower);
    const dayMatch = lower.match(/dia\s+(\d{1,2})/);
    const day = dayMatch ? parseInt(dayMatch[1]) : DATA.finance.rent.day;
    if (val) DATA.finance.rent = { amount: val, day };
    reply = (reply ? reply + ' ' : '') + `Aluguel configurado: ${fmtMoney(DATA.finance.rent.amount)} no dia ${DATA.finance.rent.day}.`;
  } else if (/pagar|paguei/.test(lower) && /dia\s+\d{1,2}/.test(lower) && /\$|\d+/.test(lower)) {
    // generic bill: "Tenho que pagar $150 de faculdade dia 25"
    const val = extractMoney(lower);
    const dayMatch = lower.match(/dia\s+(\d{1,2})/);
    const nameMatch = lower.match(/de\s+([a-zçãõáéíóú\s]+?)(?:\s+dia|\s*$)/);
    if (val && dayMatch) {
      DATA.finance.fixedExpenses.push({ id: uid(), name: nameMatch ? (nameMatch[1].trim().charAt(0).toUpperCase() + nameMatch[1].trim().slice(1)) : 'Conta', amount: val, day: parseInt(dayMatch[1]), icon: '📌', color: 'orange' });
      reply = (reply ? reply + ' ' : '') + `Novo pagamento fixo adicionado: ${fmtMoney(val)} no dia ${dayMatch[1]}.`;
    }
  }

  // "adicione tarefa: X" or "criar tarefa X"
  const taskMatch = lower.match(/(?:adicione|adicionar|criar)\s+tarefa[:\s]+(.*)/);
  if (taskMatch) {
    const title = taskMatch[1].trim();
    if (title) {
      DATA.tasks.push({ id: uid(), title: title.charAt(0).toUpperCase() + title.slice(1), time: '', day: todayAppDay(), category: 'casa', priority: 'media', done: false, recurring: false });
      reply = (reply ? reply + ' ' : '') + `Tarefa "${title}" adicionada.`;
    }
  }

  // "adicione X na lista de compras"
  const shopMatch = lower.match(/adicion[ea]\s+([a-zçãõáéíóú\s]+?)\s+(?:na|à|a)\s+lista de compras/);
  if (shopMatch) {
    const item = shopMatch[1].trim();
    DATA.shoppingList.push({ id: uid(), name: item.charAt(0).toUpperCase() + item.slice(1), done: false });
    reply = (reply ? reply + ' ' : '') + `"${item}" adicionado à lista de compras.`;
  }

  // "planeje minha semana"
  if (/planeje|planejar/.test(lower) && /semana/.test(lower)) {
    generateWeekPlan();
    reply = (reply ? reply + ' ' : '') + 'Gerei sugestões para sua semana — veja na aba Planejador.';
  }

  if (!reply) {
    reply = 'Entendi parcialmente sua mensagem. Tente algo como: "Recebi $1300 essa semana", "Gastei $50 no mercado", "Pagar $150 de faculdade dia 25" ou "Planeje minha semana".';
  }

  pushChat('bot', reply);
  saveData();
  render();
  showToast('Assistente atualizado os dados. ✨');
}

/* -------------------------------------------------------------------------
   8. INIT
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  DATA = loadData();
  bindEvents();
  render();
});
