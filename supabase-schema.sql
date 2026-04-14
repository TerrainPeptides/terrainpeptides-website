-- Terrain Peptides: Supabase schema
-- Note: this includes the columns your existing UI/checkout flows already use,
-- while also including the columns you requested explicitly.

-- PRODUCTS
create table if not exists public.products (
  id text primary key,
  slug text unique,
  name text not null,
  category text,
  description text,
  overview text,
  hidden boolean not null default false,
  price_cents integer not null default 0,
  dosage text,
  purity text,
  molecular_weight text,
  sequence text,
  image_url text,
  coa_url text,
  vial_count integer default 1,
  stock_level integer,
  in_stock boolean not null default true,
  featured boolean not null default false,
  research_studies text,
  research_benefits text[] null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products disable row level security;

-- ORDERS + ORDER ITEMS (needed for existing checkout/admin UI)
create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  customer_email text not null,
  customer_name text,
  status text not null,
  total numeric not null default 0, -- dollars
  tracking_number text,
  referral_code text,
  discount_code text,
  payment_method text,
  payment_status text,
  stripe_session_id text,
  crypto_address text,
  subtotal numeric,
  discount numeric,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders disable row level security;

create table if not exists public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  quantity integer not null default 1,
  price numeric not null default 0, -- dollars
  created_at timestamptz not null default now()
);
alter table public.order_items disable row level security;

-- REVIEWS (existing UI called these \"vouches\")
create table if not exists public.reviews (
  id text primary key,
  reviewer_name text not null,
  rating integer not null,
  body text not null,
  verified boolean not null default false,
  approved boolean not null default false,
  product_id text null,
  created_at timestamptz not null default now()
);
alter table public.reviews disable row level security;

-- REFERRAL CODES (keep extra fields used by current UI)
create table if not exists public.referral_codes (
  id text primary key,
  code text not null unique,
  discount_percent integer not null default 0,
  created_at timestamptz not null default now(),
  max_uses integer null,
  current_uses integer not null default 0,
  expires_at timestamptz null,
  active boolean not null default true
);
alter table public.referral_codes disable row level security;

-- DISCOUNT CODES
create table if not exists public.discount_codes (
  id text primary key,
  code text not null unique,
  discount_percent integer not null default 0,
  expires_at timestamptz null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.discount_codes disable row level security;

-- ADMIN MESSAGES (contact submissions) for /api/admin/messages
create table if not exists public.messages (
  id text primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages disable row level security;

-- NEWSLETTER SUBSCRIPTIONS
create table if not exists public.newsletter_subscriptions (
  id text primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscriptions disable row level security;

-- USER ADDRESSES (saved shipping addresses, keyed by auth email)
create table if not exists public.user_addresses (
  id text primary key,
  user_email text not null,
  first_name text not null,
  last_name text not null,
  country text not null default 'United States',
  address1 text not null,
  address2 text,
  city text not null,
  postal_code text not null,
  province text,
  phone text,
  created_at timestamptz not null default now()
);
create index if not exists user_addresses_email_idx on public.user_addresses(user_email);
alter table public.user_addresses disable row level security;

-- STORAGE
-- Create bucket \"product-images\" in Supabase dashboard (Storage) and mark it public.
-- This is not SQL-managed in most Supabase setups.

