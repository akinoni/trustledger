import { supabase } from './supabase';

/**
 * Creates a new Savings Group and adds the creator as an admin membership.
 */
export async function createGroup(userId, groupData) {
  // 1. Insert the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([
      {
        name: groupData.name,
        contribution_amount: groupData.amount,
        payout_frequency: groupData.frequency.toLowerCase(),
        max_members: groupData.maxMembers,
        is_public: groupData.isPublic
      }
    ])
    .select()
    .single();

  if (groupError) throw groupError;

  // 2. Insert the creator as the admin in memberships
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert([
      {
        user_id: userId,
        group_id: group.id,
        role: 'admin', // Assumes 'member_role' has 'admin'
        payout_position: 1
      }
    ]);

  if (membershipError) throw membershipError;

  return group;
}

/**
 * Fetches active circles/groups for the user.
 */
export async function getUserGroups(userId) {
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      role,
      joined_at,
      payout_position,
      groups (
        id,
        name,
        contribution_amount,
        payout_frequency,
        max_members,
        status
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  // Soft-delete exclusion: don't return disbanded groups to the dashboard
  return data.filter(m => m.groups && m.groups.status !== 'disbanded');
}

/**
 * Fetches an aggregated global recent activity feed for the user.
 * Tracks: Signups, Created Circles, Joined Circles, and Ledger Payments.
 */
export async function getRecentActivity(userId) {
  const feed = [];

  try {
    // 1. Account Creation
    const { data: profile, error: pError } = await supabase.from('profiles').select('created_at').eq('id', userId).maybeSingle();
    if (profile) {
      feed.push({
        id: `welcome-${userId}`,
        entry_type: 'welcome',
        description: 'Welcome to TrustLedger 3MTT! Your secure savings journey begins.',
        created_at: profile.created_at
      });
    } else {
      feed.push({
        id: `welcome-${userId}`,
        entry_type: 'welcome',
        description: 'Welcome to TrustLedger 3MTT! Your secure savings journey begins.',
        created_at: new Date(Date.now() - 86400000).toISOString() // Fake an older timestamp if profile fetch fails
      });
    }

    // 2. Joining Circles
    const { data: memberships, error: mError } = await supabase
      .from('memberships')
      .select('id, created_at, group_id, groups(name)')
      .eq('user_id', userId);

    if (mError) console.error("Error fetching memberships for feed:", mError);

    if (memberships && memberships.length > 0) {
      memberships.forEach(m => {
        feed.push({
          id: `join-${m.id}`,
          entry_type: 'joined_circle',
          description: `Joined "${m.groups?.name || 'A Circle'}" as a member.`,
          created_at: m.created_at
        });
      });

      // 3. Ledger Entries (Payments for those circles)
      const groupIds = memberships.map(m => m.group_id);
      if (groupIds.length > 0) {
        const { data: ledger, error: lError } = await supabase
          .from('ledger_entries')
          .select(`id, amount, entry_type, created_at, groups ( name )`)
          .in('group_id', groupIds)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (lError) console.error("Error fetching ledger for feed:", lError);
        
        if (ledger) {
          ledger.forEach(l => {
            feed.push({
              id: `ledger-${l.id}`,
              entry_type: l.entry_type,
              amount: l.amount,
              groups: l.groups,
              description: l.entry_type === 'contribution' 
                ? `Paid ₦${parseFloat(l.amount).toLocaleString()} to "${l.groups?.name}"` 
                : `Received Payout from "${l.groups?.name}"`,
              created_at: l.created_at
            });
          });
        }
      }
    }

    // 4. Created Circles & Disbanded Circles
    const { data: createdGroups, error: cgError } = await supabase
      .from('groups')
      .select('id, name, created_at, updated_at, status')
      .eq('created_by', userId);
      
    if (cgError) console.error("Error fetching created groups for feed:", cgError);
      
    if (createdGroups) {
      createdGroups.forEach(g => {
        feed.push({
          id: `create-${g.id}`,
          entry_type: 'created_circle',
          description: `Successfully launched "${g.name}".`,
          created_at: g.created_at
        });

        if (g.status === 'disbanded') {
          feed.push({
            id: `disband-${g.id}`,
            entry_type: 'disbanded_circle',
            description: `Circle "${g.name}" was officially disbanded.`,
            created_at: g.updated_at || g.created_at
          });
        }
      });
    }

    // Sort unified feed by correct timestamps (Desc)
    feed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return feed.slice(0, 10);

  } catch (err) {
    console.error("Critical error building feed:", err);
    return []; // Return empty array so dashboard doesn't completely crash
  }
}

/**
 * Fetches all ledger entries specifically for a single group.
 */
export async function getGroupLedger(groupId) {
  const { data, error } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
    
  if (error) return [];
  return data;
}

/**
 * Fetches the user's wallet balance.
 */
export async function getWalletBalance(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return 0; // default to 0 if no wallet found
  }
  return parseFloat(data.balance) || 0;
}

/**
 * Funds the user's wallet (Simulated deposit MVP hook).
 */
export async function fundWallet(userId, amount) {
  // We use Postgres RPC or simply update. 
  // For MVP, we'll fetch current balance and add to it.
  // Warning: This is prone to race conditions. Real apps use SQL RPC (e.g. `increment_wallet`).
  
  const currentBalance = await getWalletBalance(userId);
  const newBalance = currentBalance + amount;

  const { data, error } = await supabase
    .from('wallets')
    .upsert([
      { user_id: userId, balance: newBalance, updated_at: new Date() }
    ], { onConflict: 'user_id' });

  if (error) throw error;
  
  // Optionally, log this in a `wallet_transactions` table if you create one later.
  return newBalance;
}

/**
 * Fetches all active groups that the user is NOT currently a member of.
 */
export async function getAvailableGroups(userId) {
  // 1. Get user's memberships
  const { data: myMemberships, error: memError } = await supabase
    .from('memberships')
    .select('group_id')
    .eq('user_id', userId);

  if (memError) throw memError;
  const myGroupIds = myMemberships ? myMemberships.map(m => m.group_id) : [];

  // 2. Fetch all public groups (excluding disbanded ones)
  const { data: allGroups, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .neq('is_public', false)
    .neq('status', 'disbanded')
    .order('created_at', { ascending: false });

  if (groupError) throw groupError;

  // 3. Filter out groups I'm already in
  return allGroups.filter(g => !myGroupIds.includes(g.id));
}

/**
 * Creates a new governance proposal for a group (must be Admin).
 */
export async function createProposal(groupId, proposerId, type, payload) {
  const { data, error } = await supabase
    .from('proposals')
    .insert([{
      group_id: groupId,
      proposer_id: proposerId,
      type: type,
      payload: payload
    }]);

  if (error) throw error;
  return data;
}

/**
 * Casts a vote on a proposal, checks threshold, and executes payload if 60% supermajority is reached.
 */
export async function castVote(proposalId, userId, groupId, voteValue) {
  // 1. Insert or update the vote
  const { error: insertError } = await supabase
    .from('votes')
    .upsert([{
      proposal_id: proposalId,
      voter_id: userId,
      vote: voteValue
    }], { onConflict: 'proposal_id,voter_id' });

  if (insertError) throw insertError;

  // 2. Evaluate status
  // Get active member count
  const { count: memberCount, error: memError } = await supabase
    .from('memberships')
    .select('id', { count: 'exact' })
    .eq('group_id', groupId);

  // Get total Approve votes
  const { count: approveCount, error: vError } = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('proposal_id', proposalId)
    .eq('vote', true);

  if (memError || vError) return;

  const threshold = Math.ceil(memberCount * 0.60); // 60% threshold

  if (approveCount >= threshold) {
    // 3. Pass and Execute the proposal
    const { data: proposal } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (proposal && proposal.status === 'active') {
      // Execute the payload
      if (proposal.type === 'edit_group') {
        await supabase.from('groups').update(proposal.payload).eq('id', groupId);
      } else if (proposal.type === 'delete_group') {
        // Soft-delete to preserve ledger history!
        await supabase.from('groups').update({ status: 'disbanded' }).eq('id', groupId);
      }

      // Mark as executed
      await supabase.from('proposals').update({ status: 'executed' }).eq('id', proposalId);
    }
  }
}

/**
 * Fetches active proposals for a specific group.
 */
export async function getActiveProposals(groupId) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*, votes(voter_id, vote)')
    .eq('group_id', groupId)
    .eq('status', 'active');
    
  if (error) return [];
  return data;
}

/**
 * Calculates a Trust Score (0-100) based on contribution history.
 */
export async function getUserTrustScore(userId) {
  try {
    // 1. Get all memberships for this user
    const { data: memberships } = await supabase
      .from('memberships')
      .select('group_id')
      .eq('user_id', userId);

    if (!memberships || memberships.length === 0) return 0;

    const groupIds = memberships.map(m => m.group_id);

    // 2. Count total contributions
    const { count: contributionCount } = await supabase
      .from('ledger_entries')
      .select('id', { count: 'exact' })
      .in('group_id', groupIds)
      .eq('entry_type', 'contribution');

    // Simple heuristic: 10 points per contribution, max 100
    const score = Math.min(100, (contributionCount || 0) * 10);
    return score;
  } catch (err) {
    console.error("Error calculating trust score:", err);
    return 0;
  }
}

/**
 * Executes an atomic wallet-to-wallet transfer via RPC.
 */
export async function transferFunds(senderId, receiverId, amount) {
  const { data, error } = await supabase.rpc('transfer_funds', {
    p_sender_id: senderId,
    p_receiver_id: receiverId,
    p_amount: amount
  });
  
  if (error) throw error;
  return data;
}

/**
 * Executes an atomic contribution to a circle via Postgres RPC.
 */
export async function makeContribution(userId, groupId, amount) {
  const { data, error } = await supabase.rpc('make_contribution', {
    p_user_id: userId,
    p_group_id: groupId,
    p_amount: amount
  });
  
  if (error) throw error;
  return data;
}
