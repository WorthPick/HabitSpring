-- Profiles table
create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  health_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Meals table
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  meal_type text not null,
  name text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  created_at timestamptz not null default now()
);

-- Activities table
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null,
  minutes integer not null default 0,
  created_at timestamptz not null default now()
);

-- Water logs table
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_ml integer not null default 0,
  created_at timestamptz not null default now()
);

-- Health metrics table
create table if not exists public.health_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg numeric,
  steps integer,
  sleep_hours numeric,
  mood integer,
  blood_pressure text,
  recorded_at timestamptz not null default now()
);

-- Habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_name text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Optional community aggregation table
create table if not exists public.community_stats (
  id uuid primary key default gen_random_uuid(),
  region text,
  avg_water_liters numeric,
  avg_steps integer,
  active_users integer,
  generated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.activities enable row level security;
alter table public.water_logs enable row level security;
alter table public.health_metrics enable row level security;
alter table public.habits enable row level security;
alter table public.community_stats enable row level security;

create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can manage their own meals"
  on public.meals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own activities"
  on public.activities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own water logs"
  on public.water_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own health metrics"
  on public.health_metrics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own habits"
  on public.habits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Community stats are readable publicly"
  on public.community_stats
  for select
  using (true);
