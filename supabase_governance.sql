-- TrustLedger Governance System schema

-- 1. Proposals Table
create table public.proposals (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  proposer_id uuid references auth.users(id) not null,
  type text not null check (type in ('edit_group', 'delete_group')),
  payload jsonb default '{}'::jsonb not null,
  status text not null default 'active' check (status in ('active', 'passed', 'rejected', 'executed')),
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null
);

-- 2. Votes Table
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references public.proposals(id) on delete cascade not null,
  voter_id uuid references auth.users(id) not null,
  vote boolean not null, -- true for approve, false for reject
  created_at timestamptz default now() not null,
  unique(proposal_id, voter_id) -- Prevent double voting
);

-- Enable RLS (Optional depending on your setup, but good practice)
alter table public.proposals enable row level security;
alter table public.votes enable row level security;

-- Policies (Basic)
create policy "Allow read on proposals" on proposals for select using (true);
create policy "Allow insert on proposals" on proposals for insert with check (auth.uid() = proposer_id);
create policy "Allow update on proposals" on proposals for update using (true);

create policy "Allow read on votes" on votes for select using (true);
create policy "Allow insert on votes" on votes for insert with check (auth.uid() = voter_id);
