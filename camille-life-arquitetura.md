# Camille Life — Assistente Pessoal de Vida (Arquitetura Completa)

## 1. Conceito em uma frase
Não é um planner que a usuária preenche. É um app que **escuta, registra e organiza sozinho**, e a usuária só confirma ou conversa em linguagem natural. A interação principal não é "clicar em checkbox", é "mandar uma mensagem pra IA".

---

## 2. Arquitetura geral (camadas)

```
┌─────────────────────────────────────────────┐
│  FRONTEND (App/PWA)                          │
│  - Tela "Meu Dia" (home)                     │
│  - Módulos: Casa / Alimentação / Fitness /   │
│    Financeiro / Autocuidado                  │
│  - Chat flutuante com a IA (sempre acessível)│
└───────────────────┬───────────────────────────┘
                    │ REST/Realtime (Supabase JS ou API própria)
┌───────────────────▼───────────────────────────┐
│  BACKEND (API + Orquestração de IA)          │
│  - Auth                                      │
│  - Endpoints CRUD por módulo                 │
│  - "AI Router": recebe texto livre, decide   │
│    o que atualizar no banco                  │
│  - Cron jobs (insights, lembretes, sugestões)│
└───────────────────┬───────────────────────────┘
        ┌────────────┼─────────────┐
┌───────▼──────┐ ┌────▼────┐ ┌──────▼───────┐
│ Banco de     │ │ Claude  │ │ Storage      │
│ Dados        │ │ API     │ │ (fotos de    │
│ (Postgres)   │ │ (NLU +  │ │ evolução,    │
│              │ │ insights)│ │ recibos)     │
└──────────────┘ └─────────┘ └──────────────┘
```

**Ideia-chave técnica:** existe um único "ponto de entrada inteligente" — a mensagem da usuária. Toda frase digitada ou falada passa por uma função de IA (`interpretar_mensagem`) que decide em quais tabelas gravar. O app não tem "telas de cadastro", tem "telas de leitura" do que a IA já organizou.

---

## 3. Telas do app

### 3.1 Meu Dia (Home)
Layout em cards verticais, rolagem única, sem menus complicados:

1. **Header**: "Bom dia, Camille ☀️" + data + frase motivacional curta (opcional, gerada pela IA)
2. **Card "Agora"**: próximo item da rotina (ex: "17h — Treino de pernas")
3. **Card Hábitos do dia**: água, skincare, estudo — em formato de "pills" que marcam concluído com toque único
4. **Card Treino**: nome do treino programado + botão "concluí" (que dispara log automático)
5. **Card Alimentação**: refeições planejadas do dia (café, almoço, jantar) + status
6. **Card Casa**: 1–2 tarefas do dia (ex: "regar plantas") — nunca uma lista longa
7. **Card Autocuidado**: item do dia (ex: "hidratar cabelo")
8. **Card Financeiro resumido**: "Você já gastou R$X este mês, faltam R$Y da meta"
9. **Chat flutuante** (bolha fixa no canto): campo de texto sempre visível — "Me conta o que você fez hoje"

Regra de design: **nenhum card mostra mais que 3 itens**. Se tem mais, mostra "+2 outras" e some.

### 3.2 Casa
- Grade de cômodos (cards com ícone: cozinha, quarto, banheiro, sala)
- Toque no cômodo → mostra últimas limpezas + próxima sugerida
- Timeline simples: "Geladeira — limpa há 12 dias — sugestão: limpar em 18 dias"

### 3.3 Alimentação
- Semana em abas (Seg–Dom), cada dia com café/almoço/jantar
- Botão "O que tenho em casa?" → abre chat com a IA já contextualizado
- Lista de compras gerada automaticamente a partir do plano semanal
- Gasto de mercado do mês em destaque

### 3.4 Fitness
- Gráfico de evolução (peso/medidas) discreto no topo
- Calendário de treinos (visual tipo streak, não tabela)
- Galeria de fotos de evolução (grid simples)

### 3.5 Financeiro
- 3 números grandes no topo: **Entrou / Saiu / Disponível**
- Gráfico de categorias (rosca, poucas cores)
- Metas como barras de progresso simples

### 3.6 Autocuidado
- Calendário estilo "hábito visual" (dias marcados com ícones, não texto)
- Separado por frequência: diário / semanal / mensal

**Padrão visual sugerido:** fundo off-white/bege claro, cards com cantos bem arredondados, uma cor de destaque só (ex: terracota, rosa queimado ou lilás), tipografia serifada nos títulos + sans-serif no corpo, ícones lineares finos, muito espaço em branco, zero tabelas visíveis.

---

## 4. Banco de dados

Ver arquivo `schema.sql` anexo — Postgres (funciona nativamente no Supabase).

Tabelas principais:
- `users`
- `habits`, `habit_logs`
- `home_rooms`, `home_tasks`, `home_cleaning_log`
- `meals_plan`, `recipes`, `shopping_list`, `grocery_expenses`
- `workouts`, `workout_logs`, `body_measurements`, `progress_photos`
- `finance_transactions`, `finance_categories`, `finance_goals`
- `selfcare_calendar`
- `ai_messages` (histórico de conversa), `ai_insights` (sugestões geradas)

---

## 5. Funcionalidades da IA

### 5.1 Interpretação de linguagem natural (núcleo do produto)
Toda mensagem do usuário passa por uma chamada à API da Claude com **tool use / function calling**: a IA recebe o texto e devolve uma lista estruturada de ações (JSON), tipo:

```json
[
  { "action": "log_workout", "data": { "type": "pernas", "date": "hoje" } },
  { "action": "log_home_task", "data": { "task": "lavar roupa", "date": "hoje" } }
]
```
O backend recebe esse JSON e executa os inserts/updates correspondentes. A usuária nunca preenche formulário — ela só descreve o dia.

### 5.2 Sugestão de refeições
IA recebe lista de ingredientes disponíveis (informados por texto) + receitas salvas + preferências, e responde com 2–4 opções, priorizando o que evita desperdício.

### 5.3 Detecção de padrões (roda em background, ex: 1x por dia via cron)
Consulta os logs das últimas semanas e gera insights tipo:
- "Você está há 5 dias sem treinar. Ajustar rotina?"
- "Você limpa a casa aos domingos. Programar de novo?"
- "Seu gasto com mercado está 20% acima da média."

Esses insights vão para a tabela `ai_insights` e aparecem como notificações/cards sutis na Home — não como pop-up intrusivo.

### 5.4 Memória de longo prazo
Guardar preferências e fatos estáveis da usuária (ex: "não gosta de peixe", "treina de manhã") em uma tabela `user_memory` (chave/valor ou embeddings), injetada no prompt da IA a cada interação para dar contexto sem precisar reexplicar.

---

## 6. Stack de tecnologia recomendada (caminho mais simples)

| Camada | Recomendação | Por quê |
|---|---|---|
| Frontend | **Next.js (React) + Tailwind**, publicado como PWA instalável no celular | Um código só para web e "app" no celular, sem precisar de loja de app no início |
| Alternativa mobile nativa | Expo (React Native) se quiser app real na App Store/Play Store depois | Reaproveita boa parte da lógica do Next.js |
| Backend | **Supabase** (Postgres + Auth + Storage + Realtime + Edge Functions) | Evita construir backend do zero; já resolve login, banco e upload de fotos |
| IA | **API da Claude** (function calling para interpretar mensagens + geração de insights) | Já é o modelo que você está usando agora; ótimo para linguagem natural em português |
| Cron/Jobs | Supabase Edge Functions agendadas (ou Vercel Cron) | Para gerar insights diários automaticamente |
| Deploy | Vercel (frontend) + Supabase (backend/DB) | Grátis para começar, escala fácil |

Esse combo permite lançar um MVP funcional sozinha(o), sem precisar de equipe grande.

---

## 7. Roadmap sugerido de construção

1. **Semana 1–2:** Auth + estrutura do banco + tela "Meu Dia" com dados estáticos
2. **Semana 3–4:** Chat com IA conectado ao function calling, atualizando hábitos e treino
3. **Semana 5:** Módulo Casa + Autocuidado (mais simples, bom para validar o padrão)
4. **Semana 6–7:** Alimentação (planejamento + lista de compras)
5. **Semana 8:** Financeiro
6. **Semana 9:** Insights automáticos (cron) + polimento visual
