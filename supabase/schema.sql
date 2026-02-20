create extension if not exists "pgcrypto";

do $$ begin
  create type plate_status as enum ('draft','active','disabled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('paid','awaiting_profile','ready_to_engrave','engraved','shipped','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_type as enum ('contact','emergency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_channel as enum ('email','sms');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_status as enum ('queued','sent','failed');
exception when duplicate_object then null; end $$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.plates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  status plate_status not null default 'draft',
  contact_enabled boolean not null default true,
  emergency_enabled boolean not null default true,
  preferred_contact_channel delivery_channel not null default 'email',
  created_at timestamptz not null default now()
);

create table if not exists public.plate_profiles (
  plate_id uuid primary key references public.plates(id) on delete cascade,
  caravan_name text not null,
  bio text,
  owner_photo_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  plate_id uuid not null references public.plates(id) on delete cascade,
  name text not null,
  relationship text,
  phone text,
  email text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  plate_id uuid references public.plates(id) on delete set null,
  status order_status not null default 'paid',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_total_cents integer,
  currency text default 'aud',
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postcode text,
  shipping_country text,
  created_at timestamptz not null default now()
);

create table if not exists public.plate_designs (
  plate_id uuid primary key references public.plates(id) on delete cascade,
  text_line_1 text not null,
  text_line_2 text,
  logo_url text,
  qr_url text not null,
  laser_pack_zip_url text,
  proof_preview_url text,
  proof_approved boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  plate_id uuid not null references public.plates(id) on delete cascade,
  type alert_type not null,
  reporter_name text,
  reporter_phone text,
  reporter_email text,
  message text not null,
  geo_lat double precision,
  geo_lng double precision,
  geo_accuracy_m double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  contact_id uuid references public.emergency_contacts(id) on delete set null,
  channel delivery_channel not null,
  recipient text not null,
  status delivery_status not null default 'queued',
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_alerts_plate on public.alerts(plate_id);
create index if not exists idx_contacts_plate on public.emergency_contacts(plate_id);
create index if not exists idx_orders_plate on public.orders(plate_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_plate_profiles_updated on public.plate_profiles;
create trigger trg_plate_profiles_updated
before update on public.plate_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_plate_designs_updated on public.plate_designs;
create trigger trg_plate_designs_updated
before update on public.plate_designs
for each row execute function public.set_updated_at();
