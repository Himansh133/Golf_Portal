-- Golf Charity Subscription Platform Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  selected_charity_id uuid,
  charity_percentage integer default 10 check (charity_percentage >= 10 and charity_percentage <= 100),
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'cancelled', 'lapsed')),
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_renewed_at timestamptz,
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scores table
create table public.scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 45),
  played_date date not null,
  created_at timestamptz default now()
);

-- Charities table
create table public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  website text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Draws table
create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  draw_date date not null,
  draw_type text default 'random' check (draw_type in ('random', 'algorithmic')),
  status text default 'pending' check (status in ('pending', 'simulated', 'published')),
  winning_numbers integer[] default '{}',
  prize_pool_total numeric(10,2) default 0,
  jackpot_rollover numeric(10,2) default 0,
  created_at timestamptz default now(),
  published_at timestamptz
);

-- Draw entries (user participation)
create table public.draw_entries (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scores integer[] not null,
  created_at timestamptz default now(),
  unique(draw_id, user_id)
);

-- Winners table
create table public.winners (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_type text not null check (match_type in ('3-match', '4-match', '5-match')),
  matched_numbers integer[] default '{}',
  prize_amount numeric(10,2) default 0,
  proof_url text,
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz default now(),
  verified_at timestamptz
);

-- Foreign key for charity selection
alter table public.profiles
  add constraint fk_charity
  foreign key (selected_charity_id)
  references public.charities(id)
  on delete set null;

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;

-- Profiles: users can read/update own, admins can read all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Scores: users manage own
create policy "Users can view own scores" on public.scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on public.scores for insert with check (auth.uid() = user_id);
create policy "Users can delete own scores" on public.scores for delete using (auth.uid() = user_id);
create policy "Admins can manage all scores" on public.scores for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Charities: public read, admin write
create policy "Anyone can view charities" on public.charities for select using (true);
create policy "Admins can manage charities" on public.charities for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Draws: public read published, admin all
create policy "Anyone can view published draws" on public.draws for select using (status = 'published');
create policy "Admins can manage draws" on public.draws for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Draw entries: users own, admin all
create policy "Users can view own entries" on public.draw_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries" on public.draw_entries for insert with check (auth.uid() = user_id);
create policy "Admins can manage entries" on public.draw_entries for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Winners: users see own, admin all
create policy "Users can view own wins" on public.winners for select using (auth.uid() = user_id);
create policy "Admins can manage winners" on public.winners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
