# Supabase table SQL pour NovaDrop (à exécuter dans SQL Editor Supabase)

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  session_id text unique not null,
  email text,
  amount_total integer,
  currency text,
  items jsonb,
  status text
);

-- Index pour recherche rapide
create index if not exists idx_orders_session_id on orders(session_id);
