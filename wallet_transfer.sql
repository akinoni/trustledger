-- Atomic Wallet-to-Wallet Transfer (RPC)
create or replace function public.transfer_funds(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount numeric
) returns jsonb as $$
declare
  v_sender_wallet_id uuid;
  v_receiver_wallet_id uuid;
  v_sender_balance numeric;
begin
  -- 1. Lock sender wallet
  select id, balance into v_sender_wallet_id, v_sender_balance
  from public.wallets
  where user_id = p_sender_id
  for update;

  if not found then
    raise exception 'Sender wallet not found';
  end if;

  if v_sender_balance < p_amount then
    raise exception 'Insufficient balance for transfer';
  end if;

  -- 2. Lock receiver wallet (or just update)
  select id into v_receiver_wallet_id
  from public.wallets
  where user_id = p_receiver_id
  for update;

  if not found then
    -- Auto-create wallet for receiver if it doesn't exist? 
    -- For safety in this MVP, let's assume they must have one.
    raise exception 'Receiver wallet not found';
  end if;

  -- 3. Perform atomic swap
  update public.wallets set balance = balance - p_amount where id = v_sender_wallet_id;
  update public.wallets set balance = balance + p_amount where id = v_receiver_wallet_id;

  -- 4. Record in a global activity log or ledger if needed
  -- For now, we'll return success to the API
  return jsonb_build_object('success', true, 'new_balance', v_sender_balance - p_amount);
end;
$$ language plpgsql security definer;
