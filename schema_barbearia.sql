
create extension if not exists btree_gist;

-- BARBEIROS
create table barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- SERVIÇOS
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,                       -- Cabelo, Barba, Química, Combos
  price numeric(10,2) not null,
  duration_minutes int not null check (duration_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- HORÁRIOS DE TRABALHO (weekday: 0 = domingo ... 6 = sábado)
create table work_schedules (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references barbers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

-- CLIENTES
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

-- AGENDAMENTOS
create table appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references barbers(id),
  service_id uuid not null references services(id),
  client_id uuid not null references clients(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- mesmo barbeiro não pode ter dois horários sobrepostos
  constraint no_double_booking exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelled')
);

-- SEGURANÇA (RLS)
alter table barbers enable row level security;
alter table services enable row level security;
alter table work_schedules enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;

-- Qualquer pessoa pode ver serviços e barbeiros ativos
create policy "Serviços públicos" on services
  for select to anon, authenticated using (active);

create policy "Barbeiros públicos" on barbers
  for select to anon, authenticated using (active);

-- DADOS DE TESTE
insert into barbers (name) values ('Barbeiro Teste');

insert into services (name, category, price, duration_minutes) values
  ('Corte', 'Cabelo', 35, 30),
  ('Barba', 'Barba', 25, 30),
  ('Corte + barba + pigmentação', 'Combos', 60, 60);

