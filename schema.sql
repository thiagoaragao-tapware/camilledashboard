-- CAMILLE LIFE — SCHEMA DO BANCO DE DADOS (Postgres / Supabase)

create extension if not exists "uuid-ossp";

-- =========================
-- USUÁRIA
-- =========================
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  created_at timestamptz default now()
);

-- memória de longo prazo (preferências, fatos estáveis)
create table user_memory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  key text not null,        -- ex: 'nao_gosta_de'
  value text not null,      -- ex: 'peixe'
  created_at timestamptz default now()
);

-- =========================
-- ROTINA / HÁBITOS
-- =========================
create table habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,            -- ex: 'beber agua', 'skincare'
  category text,                 -- ex: 'saude', 'estudo', 'casa'
  frequency text default 'daily',-- daily | weekly | monthly
  active boolean default true,
  created_at timestamptz default now()
);

create table habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  completed_at timestamptz default now(),
  note text
);

-- =========================
-- CASA
-- =========================
create table home_rooms (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null -- cozinha, quarto, banheiro...
);

create table home_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  room_id uuid references home_rooms(id) on delete cascade,
  name text not null,             -- 'limpar geladeira'
  frequency_days int default 30,  -- sugestão de recorrência
  last_done_at timestamptz,
  next_suggested_at timestamptz
);

create table home_cleaning_log (
  id uuid primary key default uuid_generate_v4(),
  home_task_id uuid references home_tasks(id) on delete cascade,
  done_at timestamptz default now()
);

-- =========================
-- ALIMENTAÇÃO
-- =========================
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  ingredients text[],
  instructions text,
  is_favorite boolean default false
);

create table meals_plan (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  meal_type text not null, -- cafe | almoco | jantar | lanche
  recipe_id uuid references recipes(id),
  status text default 'planejado' -- planejado | concluido
);

create table shopping_list (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  item text not null,
  quantity text,
  checked boolean default false,
  created_at timestamptz default now()
);

create table grocery_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  amount numeric(10,2) not null,
  date date default current_date,
  note text
);

-- =========================
-- FITNESS
-- =========================
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,      -- 'treino de pernas'
  scheduled_days text[],   -- ['mon','wed','fri']
  active boolean default true
);

create table workout_logs (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references workouts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  done_at timestamptz default now(),
  note text
);

create table body_measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date date default current_date,
  weight numeric(5,2),
  waist numeric(5,2),
  hip numeric(5,2),
  notes text
);

create table progress_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  photo_url text not null,
  taken_at date default current_date
);

-- =========================
-- FINANCEIRO
-- =========================
create table finance_categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,        -- 'carro', 'mercado', 'lazer'
  type text not null         -- 'entrada' | 'saida'
);

create table finance_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  category_id uuid references finance_categories(id),
  amount numeric(10,2) not null,
  type text not null,        -- 'entrada' | 'saida'
  date date default current_date,
  description text
);

create table finance_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  target_amount numeric(10,2) not null,
  current_amount numeric(10,2) default 0,
  deadline date
);

-- =========================
-- AUTOCUIDADO
-- =========================
create table selfcare_calendar (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  activity text not null,    -- 'cabelo', 'unhas', 'depilacao'
  frequency text not null,   -- daily | weekly | monthly
  last_done_at timestamptz,
  next_suggested_at timestamptz
);

-- =========================
-- IA — CONVERSA E INSIGHTS
-- =========================
create table ai_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  role text not null,        -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

create table ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null,        -- 'alerta_habito' | 'sugestao_rotina' | 'financeiro'
  message text not null,
  seen boolean default false,
  created_at timestamptz default now()
);
