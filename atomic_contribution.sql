-- Atomic Contribution Transaction (RPC)
create or replace function public.make_contribution(
  p_user_id uuid,
  p_group_id uuid,
  p_amount numeric
) returns jsonb as $$
declare
  v_wallet_id uuid;
  v_current_balance numeric;
begin
  -- 1. Lock the wallet row to prevent race conditions
  select id, balance into v_wallet_id, v_current_balance
  from public.wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'Wallet not found for user';
  end if;

  -- 2. Check balance
  if v_current_balance < p_amount then
    raise exception 'Insufficient wallet balance. Have %, need %', v_current_balance, p_amount;
  end if;

  -- 3. Deduct from wallet
  update public.wallets
  set balance = balance - p_amount,
      updated_at = now()
  where id = v_wallet_id;

  -- 4. Create ledger entry
  insert into public.ledger_entries (group_id, amount, entry_type)
  values (p_group_id, p_amount, 'contribution');

  return jsonb_build_object('success', true, 'new_balance', v_current_balance - p_amount);
end;
$$ language plpgsql security definer;
