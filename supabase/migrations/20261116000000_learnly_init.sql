-- Learnly: accounts, plan, synced learning data and AI usage.

-- One row per user. The plan is written only by the server (Stripe webhook), never by the browser.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Create a profile automatically for every new account.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The learning data (lists, topics, cards, progress, plan, settings) as one JSON document per user.
create table public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "Users can read their own learning data"
  on public.app_state for select
  using (auth.uid() = user_id);

create policy "Users can create their own learning data"
  on public.app_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own learning data"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- AI generations per month, counted by the server for the Free plan limit.
create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null,
  count integer not null default 0,
  primary key (user_id, month)
);

alter table public.ai_usage enable row level security;

create policy "Users can read their own AI usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- Adds one generation and returns the new count. Called only by the AI function (service role).
create function public.increment_ai_usage(p_user uuid, p_month text)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.ai_usage (user_id, month, count) values (p_user, p_month, 1)
  on conflict (user_id, month) do update set count = public.ai_usage.count + 1
  returning count;
$$;

revoke execute on function public.increment_ai_usage(uuid, text) from public, anon, authenticated;
