create table if not exists public.plate_setup_tokens (
  token text primary key,
  plate_id uuid not null references public.plates(id) on delete cascade,
  email text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.plate_designs
  add column if not exists plate_width_mm integer default 60,
  add column if not exists plate_height_mm integer default 90,
  add column if not exists qr_size_mm integer default 40,
  add column if not exists hole_diameter_mm numeric default 4.2;

alter table public.plates
  add column if not exists sku text default 'CARASCAN_60x90';
