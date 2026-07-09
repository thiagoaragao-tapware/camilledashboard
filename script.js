const defaultData = {
  finance: { income: 1308, spent: 432, saved: 476, free: 400 },
  categories: [
    { name: 'Moradia', value: 1160, note: '/ mês', percent: 65, color: 'var(--red)' },
    { name: 'Alimentação', value: 180, note: '/ semana', percent: 18, color: 'var(--orange)' },
    { name: 'Transporte', value: 70, note: '/ semana', percent: 7, color: 'var(--blue)' },
    { name: 'Lazer', value: 60, note: '/ semana', percent: 5, color: 'var(--purple)' }
  ],
  payments: [
    { name: 'Aluguel', date: '17 mai', amount: 1160, icon: '⌂' },
    { name: 'Cartão de crédito', date: '20 mai', amount: 220, icon: '▣' },
    { name: 'Faculdade', date: '25 mai', amount: 150, icon: '▰' }
  ],
  tasks: [
    { title: 'Revisar plano financeiro da semana', time: '09:00', category: 'Financeiro', done: false, color: 'var(--green)' },
    { title: 'Organizar tarefas da casa', time: '10:30', category: 'Casa', done: false, color: 'var(--blue)' },
    { title: 'Treino superior', time: '18:00', category: 'Treino', done: false, color: 'var(--purple)' },
    { title: 'Planejar refeições da semana', time: '19:30', category: 'Alimentação', done: false, color: 'var(--orange)' },
    { title: 'Estudar para a faculdade', time: '21:30', category: 'Trabalho', done: false, color: 'var(--blue)' }
  ],
  goals: [
    { name: 'Guardar $5.000 para visto', progress: 62, current: 3100, target: 5000 },
    { name: 'Comprar MacBook', progress: 40, current: 3200, target: 8000 },
    { name: 'Organizar Parisi', progress: 70, current: 70, target: 100 },
    { name: 'Criar marca de roupa', progress: 25, current: 25, target: 100 },
    { name: 'Melhorar inglês', progress: 60, current: 60, target: 100 }
  ],
  shopping: ['Frango', 'Arroz', 'Feijão', 'Ovos', 'Tomate', 'Alface', 'Batata doce', 'Banana'],
  meals: [
    ['Segunda', 'Frango grelhado, arroz, feijão e salada'],
    ['Terça', 'Macarrão com carne moída e salada'],
    ['Quarta', 'Omelete com legumes e batata doce'],
    ['Quinta', 'Frango ao molho, arroz e legumes'],
    ['Sexta', 'Lasanha de frango e salada']
  ]
};

let data = JSON.parse(localStorage.getItem('lifeos-data')) || defaultData;
let modalMode = '';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => '$' + Number(n || 0).toLocaleString('en-AU');

function save(){ localStorage.setItem('lifeos-data', JSON.stringify(data)); render(); }

function renderDate(){
  const now = new Date();
  $('#todayDate').textContent = now.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric'});
  const hour = now.getHours();
  $('#greeting').textContent = `${hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'}, Thiago! 👋`;
}

function renderHome(){
  const f = data.finance;
  $('#weeklyIncome').textContent = money(f.income);
  $('#spentAmount').textContent = money(f.spent);
  $('#savedAmount').textContent = money(f.saved);
  $('#freeAmount').textContent = money(f.free);
  const percent = Math.round((f.spent / Math.max(f.income, 1)) * 100);
  $('#budgetPercent').textContent = percent + '%';
  $('#spentBar').style.width = (f.spent / f.income * 100) + '%';
  $('#savedBar').style.width = (f.saved / f.income * 100) + '%';
  $('#freeBar').style.width = (f.free / f.income * 100) + '%';

  $('#todayTasks').innerHTML = data.tasks.slice(0,5).map((t,i)=> taskRow(t,i,true)).join('');
  $('#allTasks').innerHTML = data.tasks.map((t,i)=> taskRow(t,i,false)).join('');
  $('#paymentsList').innerHTML = data.payments.map(p => `<div class="payment-row"><div class="left"><span class="circle" style="background:#eef2ff;color:#3159c9">${p.icon}</span><div><div class="item-title">${p.name}</div><div class="item-sub">${p.date}</div></div></div><strong>${money(p.amount)}</strong></div>`).join('');
  $('#goalsList').innerHTML = data.goals.map((g,i)=> goalRow(g,i)).join('');
  $('#shoppingList').innerHTML = data.shopping.map((s,i)=> `<label class="shop-row"><span class="left"><input type="checkbox" data-shop="${i}"><span>${s}</span></span><button onclick="removeShopping(${i})">×</button></label>`).join('');
  $('#mealsList').innerHTML = data.meals.map(m => `<div class="meal-row"><strong>${m[0]}</strong><span>${m[1]}</span></div>`).join('');
  $('#categoryRows').innerHTML = data.categories.map(c => `<div class="category-row"><span>${c.name}</span><strong style="color:${c.color}">${money(c.value)} <small>${c.note}</small></strong><small>${c.percent}%</small></div>`).join('');
  $('#routineList').innerHTML = data.tasks.slice(0,5).map(t => `<div class="routine-row"><span>${t.title}</span><small>${t.time}</small><span class="check"></span></div>`).join('');
  $('#weekStrip').innerHTML = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map((d,i)=> `<div class="day ${i===6?'active':''}"><small>${d}</small><strong>${12+i}</strong></div>`).join('');
  $('#insightText').textContent = f.spent > f.income * .5 ? 'Atenção: seus gastos já passaram de 50% da renda semanal.' : 'Você está mantendo os gastos sob controle esta semana. Ótimo trabalho.';
}

function taskRow(t,i,short){
  return `<div class="task-row"><div class="left"><span class="circle" style="background:${t.color}">${iconFor(t.category)}</span><div><div class="item-title">${t.title}</div><div class="item-sub">${t.time} · ${t.category}</div></div></div><button class="check ${t.done?'done':''}" onclick="toggleTask(${i})"></button></div>`;
}
function iconFor(cat){ return cat==='Casa'?'⌂':cat==='Financeiro'?'$':cat==='Treino'?'⌁':cat==='Alimentação'?'🍴':'▣'; }
function goalRow(g,i){ return `<div class="goal-row"><div><div class="item-title">${g.name}</div><div class="item-sub">${money(g.current)} / ${money(g.target)}</div></div><strong>${g.progress}%</strong><div class="progress"><span style="width:${g.progress}%"></span></div><button onclick="removeGoal(${i})">×</button></div>`; }
function toggleTask(i){ data.tasks[i].done = !data.tasks[i].done; save(); }
function removeGoal(i){ data.goals.splice(i,1); save(); }
function removeShopping(i){ data.shopping.splice(i,1); save(); }

function renderPages(){
  $('#finance .page-card').innerHTML = `<h2>Financeiro</h2><p class="muted">Controle semanal com cálculo automático.</p><div class="form-grid"><label class="field">Renda semanal<input id="incomeInput" type="number" value="${data.finance.income}"></label><label class="field">Gastos da semana<input id="spentInput" type="number" value="${data.finance.spent}"></label><label class="field">Guardado<input id="savedInput" type="number" value="${data.finance.saved}"></label><label class="field">Disponível<input id="freeInput" type="number" value="${data.finance.free}"></label></div><button class="dark-btn" onclick="updateFinance()">Atualizar financeiro</button><h3>Próximos pagamentos</h3><div class="table">${data.payments.map(p=>`<div class="table-row"><strong>${p.name}</strong><span>${p.date}</span><strong>${money(p.amount)}</strong></div>`).join('')}</div>`;
  $('#tasks .page-card').innerHTML = `<h2>Tarefas</h2><p class="muted">Adicione, conclua e acompanhe tarefas.</p><button class="dark-btn" onclick="openModal('task')">+ Nova tarefa</button><div class="table" style="margin-top:18px">${data.tasks.map((t,i)=>`<div class="table-row"><span>${t.done?'✅':'○'} ${t.title}</span><span>${t.category}</span><button onclick="toggleTask(${i})">Alterar</button></div>`).join('')}</div>`;
  $('#routine .page-card').innerHTML = `<h2>Rotina</h2><p class="muted">Sua semana organizada por prioridade.</p><div class="table">${data.tasks.map(t=>`<div class="table-row"><strong>${t.time}</strong><span>${t.title}</span><span>${t.category}</span></div>`).join('')}</div>`;
  $('#goals .page-card').innerHTML = `<h2>Metas</h2><p class="muted">Acompanhe seus principais objetivos.</p><button class="dark-btn" onclick="openModal('goal')">+ Nova meta</button><div class="table" style="margin-top:18px">${data.goals.map((g,i)=>`<div class="table-row"><strong>${g.name}</strong><span>${g.progress}%</span><button onclick="removeGoal(${i})">Excluir</button></div>`).join('')}</div>`;
  $('#food .page-card').innerHTML = `<h2>Alimentação</h2><p class="muted">Refeições e lista de compras.</p><div class="form-grid"><div><h3>Refeições</h3>${data.meals.map(m=>`<p><strong>${m[0]}:</strong> ${m[1]}</p>`).join('')}</div><div><h3>Compras</h3>${data.shopping.map((s,i)=>`<p><button onclick="removeShopping(${i})">×</button> ${s}</p>`).join('')}<button class="dark-btn" onclick="openModal('shopping')">+ Item</button></div></div>`;
  $('#planner .page-card').innerHTML = `<h2>Planejador</h2><p class="muted">Gere uma semana baseada nas suas metas.</p><button class="dark-btn" onclick="planWeek()">Gerar semana</button><div id="planResult" style="margin-top:20px"></div>`;
  $('#reports .page-card').innerHTML = `<h2>Relatórios</h2><p class="muted">Resumo da sua semana.</p><div class="form-grid"><div class="card"><h3>${money(data.finance.spent)}</h3><p>Gasto total</p></div><div class="card"><h3>${money(data.finance.saved)}</h3><p>Total guardado</p></div><div class="card"><h3>${data.tasks.filter(t=>t.done).length}/${data.tasks.length}</h3><p>Tarefas concluídas</p></div><div class="card"><h3>${Math.round(data.goals.reduce((a,g)=>a+g.progress,0)/data.goals.length)}%</h3><p>Média das metas</p></div></div>`;
}
function updateFinance(){ data.finance.income=+$('#incomeInput').value; data.finance.spent=+$('#spentInput').value; data.finance.saved=+$('#savedInput').value; data.finance.free=+$('#freeInput').value; save(); }
function planWeek(){ $('#planResult').innerHTML = `<div class="table"><div class="table-row"><strong>Segunda</strong><span>Revisar dinheiro + organizar casa</span><span>Prioridade alta</span></div><div class="table-row"><strong>Quarta</strong><span>Mercado + marmitas</span><span>Controle de gasto</span></div><div class="table-row"><strong>Domingo</strong><span>Planejar semana + revisar metas</span><span>Rotina fixa</span></div></div>`; }

function openModal(mode){ modalMode = mode; $('#modalTitle').textContent = mode==='task'?'Nova tarefa':mode==='goal'?'Nova meta':'Novo item'; $('#modalInput').value=''; $('#modal').showModal(); }
$('#modalSave').addEventListener('click', e => { e.preventDefault(); const v = $('#modalInput').value.trim(); if(!v) return; if(modalMode==='task') data.tasks.push({title:v,time:'09:00',category:'Geral',done:false,color:'var(--blue)'}); if(modalMode==='goal') data.goals.push({name:v,progress:0,current:0,target:100}); if(modalMode==='shopping') data.shopping.push(v); $('#modal').close(); save(); });

function runAI(){
  const text = $('#aiCommand').value.toLowerCase(); let response = 'Entendi. Informação registrada.';
  const amount = (text.match(/\$?\s?(\d{2,5})/)||[])[1];
  if(text.includes('recebi') && amount){ data.finance.income = +amount; response = `Renda semanal atualizada para ${money(amount)}.`; }
  else if((text.includes('gastei') || text.includes('gasto')) && amount){ data.finance.spent += +amount; data.finance.free = Math.max(data.finance.income - data.finance.spent - data.finance.saved, 0); response = `Gasto de ${money(amount)} adicionado.`; }
  else if(text.includes('aluguel') && amount){ data.payments.unshift({name:'Aluguel',date:'17',amount:+amount,icon:'⌂'}); response = `Pagamento de aluguel de ${money(amount)} adicionado.`; }
  else if(text.includes('planeje')){ response = 'Sugestão: domingo revise finanças, segunda organize casa, quarta faça mercado, sexta confira pagamentos e sábado avance em um projeto pessoal.'; }
  $('#aiResponse').textContent = response; $('#aiCommand').value=''; save();
}

function bind(){
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
  $$('[data-page-jump]').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.pageJump)));
  $('#addTaskBtn').onclick=()=>openModal('task'); $('#addGoalBtn').onclick=()=>openModal('goal'); $('#addShoppingBtn').onclick=()=>openModal('shopping');
  $('#runCommand').onclick=runAI; $('#aiCommand').addEventListener('keydown',e=>{ if(e.key==='Enter') runAI(); });
  $$('.prompt-chips button').forEach(b=>b.onclick=()=>{ $('#aiCommand').value=b.textContent; runAI(); });
}
function showPage(id){ $$('.page').forEach(p=>p.classList.remove('active-page')); $('#'+id).classList.add('active-page'); $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===id)); window.scrollTo({top:0,behavior:'smooth'}); }
function render(){ renderDate(); renderHome(); renderPages(); }
render(); bind();
