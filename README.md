# Lumina Portfolio & Admin Dashboard

This project is a React SPA built with Tailwind CSS and Framer Motion. It mimics the behavior of a Next.js App + Supabase backend.

## 1. Supabase Setup

Run the following SQL in your Supabase SQL Editor to create the necessary tables and security policies.

```sql
-- 1. Create Profiles Table (to store admin details linked to auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Products Table
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  price numeric not null,
  image_url text not null,
  purchase_link text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Service Inquiries Table
create table services_inquiries (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  email text not null,
  message text not null,
  service_type text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --- ROW LEVEL SECURITY (RLS) ---

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table projects enable row level security;
alter table products enable row level security;
alter table services_inquiries enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- PROJECTS & PRODUCTS POLICIES (Public Read, Admin Write)
create policy "Public projects are viewable by everyone" 
  on projects for select using (true);
  
create policy "Public products are viewable by everyone" 
  on products for select using (true);

-- Ideally, restrict this to specific admin emails, but for this demo, any authenticated user is an admin.
create policy "Admins can manage projects" 
  on projects for all using (auth.role() = 'authenticated');
  
create policy "Admins can manage products" 
  on products for all using (auth.role() = 'authenticated');

-- INQUIRIES POLICIES (Public Write, Admin Read)
create policy "Anyone can submit inquiry" 
  on services_inquiries for insert with check (true);
  
create policy "Admins can read inquiries" 
  on services_inquiries for select using (auth.role() = 'authenticated');

-- --- TRIGGERS ---

-- Automatically create a profile entry when a new user signs up via Supabase Auth
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
```

## 2. Environment Variables

Create a `.env` file (or configure your deployment settings) with:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

If these are missing, the app runs in **Mock Mode**.
**Mock Credentials:**
Email: `admin@lumina.com`
Password: `admin`
