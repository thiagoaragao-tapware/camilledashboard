# LifeOS — Thiago & Camille

Dashboard pessoal para organizar rotina, finanças, tarefas, metas e alimentação de um casal. HTML + CSS + JavaScript puro, sem backend — todos os dados ficam salvos no `localStorage` do navegador.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex: `lifeos`).
2. Suba os três arquivos (`index.html`, `styles.css`, `script.js`) para a raiz do repositório.
3. Vá em **Settings → Pages**.
4. Em "Source", selecione a branch `main` e a pasta `/ (root)`.
5. Salve. Em alguns minutos o site estará disponível em `https://SEU-USUARIO.github.io/lifeos/`.

## Como usar localmente

Basta abrir o `index.html` em qualquer navegador — não precisa de servidor. Se preferir rodar um servidor local (para evitar restrições de alguns navegadores com `localStorage`), use:

```bash
python3 -m http.server 8000
```

e acesse `http://localhost:8000`.

## Funcionalidades

- **Início**: saudação, tarefas do dia, rotina da semana, resumo financeiro, próximos pagamentos, metas, lista de compras e insights.
- **Financeiro**: renda semanal, gastos fixos e variáveis, aluguel quinzenal, separação automática de dinheiro, disponível/guardado, alertas de orçamento.
- **Tarefas**: criar, concluir, priorizar e filtrar por Thiago, Camille, Casa, Trabalho, Faculdade e Projetos.
- **Rotina**: planejamento por dia da semana com checklist.
- **Metas**: barras de progresso, edição e registro de avanço.
- **Alimentação**: planejamento de refeições da semana + lista de compras (com geração automática a partir dos ingredientes das refeições).
- **Planejador**: botão "Gerar semana" que cria sugestões com base em tarefas pendentes, dinheiro disponível e metas.
- **Relatórios**: totais gastos/guardados, tarefas concluídas, evolução das metas, gráfico simples por categoria.
- **Assistente IA (local)**: campo de texto que interpreta frases como "Recebi $1300 essa semana", "Gastei $50 no mercado", "Tenho que pagar $150 de faculdade dia 25" ou "Planeje minha semana" — tudo processado localmente em JavaScript, sem API externa.

## Estrutura

```
index.html   → estrutura de todas as telas (SPA com troca de seção via JS)
styles.css   → todo o visual (tema claro, cards, sidebar, responsivo)
script.js    → estado, localStorage, renderização, CRUD e assistente
```

## Reset de dados

Em **Configurações → Restaurar dados de exemplo**, você pode limpar tudo e voltar aos dados de demonstração.
