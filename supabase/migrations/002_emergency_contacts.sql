create table emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  priority int default 0,
  created_at timestamptz default now()
);

alter table emergency_contacts enable row level security;

create policy "Pacient veu els seus contactes"
  on emergency_contacts for all
  using (auth.uid() = user_id);
