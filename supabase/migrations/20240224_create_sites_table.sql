-- Create sites table to track deployed Vercel projects
create table if not exists public.sites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  domain text not null,
  vercel_project_id text, -- Crucial for updates
  repo_name text,
  ga_id text
);

-- Enable RLS
alter table public.sites enable row level security;

-- Policy for anon/service role (adjust based on your auth model)
create policy "Enable all access for anon/service" on public.sites
  for all using (true) with check (true);

-- Index for performance
create index if not exists idx_sites_campaign_id on public.sites(campaign_id);
