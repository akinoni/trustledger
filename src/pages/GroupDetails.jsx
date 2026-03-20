import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Copy, UserPlus, Users, Loader2, Check, AlertTriangle, ThumbsUp, ThumbsDown, Trash2, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getActiveProposals, createProposal, castVote, makeContribution, getGroupLedger } from '../lib/api';

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [contributing, setContributing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupData = async () => {
      // Fetch group details
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
        
      setGroup(groupData);

      // Fetch members of this group
      const { data: memberData } = await supabase
        .from('memberships')
        .select('*, profiles!user_id(full_name)')
        .eq('group_id', id);
        
      if (memberData) setMembers(memberData);

      // Fetch proposals
      const props = await getActiveProposals(id);
      setProposals(props || []);

      // Fetch ledger
      const ledgerData = await getGroupLedger(id);
      setLedger(ledgerData || []);

      // Get user
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);

      setLoading(false);
    };

    if (id) fetchGroupData();
  }, [id]);

  const isAdmin = user && members.some(m => m.user_id === user.id && m.role === 'admin');

  const handleProposeDelete = async () => {
    if (!window.confirm("Are you sure you want to propose disbanding this circle? This requires 60% member approval to execute.")) return;
    try {
      await createProposal(id, user.id, 'delete_group', {});
      const props = await getActiveProposals(id);
      setProposals(props || []);
    } catch (err) {
      alert(err.message || "Failed to create proposal.");
    }
  };

  const handleVote = async (proposalId, voteValue) => {
    try {
      await castVote(proposalId, user.id, id, voteValue);
      // Refresh proposals and group in case it executed
      const props = await getActiveProposals(id);
      setProposals(props || []);
      
      const { data: groupData } = await supabase.from('groups').select('*').eq('id', id).single();
      if (!groupData) setGroup(null); // Group was deleted!
    } catch (err) {
      alert(err.message || "Failed to cast vote.");
    }
  };

  const handleContribution = async () => {
    if (!window.confirm(`Are you sure you want to securely transfer ₦${group.contribution_amount} from your wallet to this circle's ledger?`)) return;
    setContributing(true);
    try {
      await makeContribution(user.id, id, group.contribution_amount);
      // Briefly show success before navigating to timeline
      alert("Contribution successful! The ledger has been securely updated.");
      
      // Refresh ledger instantly
      const ledgerData = await getGroupLedger(id);
      setLedger(ledgerData || []);
    } catch(err) {
      if (err.message && err.message.includes('Insufficient')) {
        alert("Insufficient balance! Please Fund your Wallet before contributing.");
        navigate('/fund-wallet');
      } else {
        alert(err.message || 'Contribution failed securely. No money was moved.');
      }
    } finally {
      setContributing(false);
    }
  };

  const inviteCode = id;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Circle not found!</h2>
        <Link to="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto w-full flex flex-col pt-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 mb-6 self-start">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Details Panel */}
        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[32px] border border-white/10"
          >
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-2 break-words leading-tight">{group.name}</h1>
              <p className="text-gray-400 text-base md:text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" /> Dual-Verified • {members.length} Members
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 border-t border-white/10 pt-6">
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-1">Contribution</p>
                <p className="text-xl font-bold truncate">₦{group.contribution_amount}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-1">Frequency</p>
                <p className="text-xl font-bold capitalize truncate">{group.payout_frequency}</p>
              </div>
            </div>

            {/* Core Action: Contribution */}
            {members.some(m => m.user_id === user?.id) && (
              group.status === 'disbanded' ? (
                <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-0 text-red-400">Circle Disbanded</h4>
                      <p className="text-sm text-red-500/70">This circle is no longer active and contributions are disabled.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
                  <div>
                    <h4 className="font-bold text-lg mb-1 flex items-center gap-2 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" /> Secured Transaction
                    </h4>
                    <p className="text-sm text-emerald-500/70">
                      Your contribution of ₦{group.contribution_amount} will be verified automatically.
                    </p>
                  </div>
                  <button 
                    onClick={handleContribution}
                    disabled={contributing}
                    className="w-full sm:w-auto shrink-0 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {contributing ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> : <><Wallet className="w-5 h-5 shrink-0" /> Pay ₦{group.contribution_amount}</>}
                  </button>
                </div>
              )
            )}

            {/* Member Roster */}
            <div>
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Official Roster ({members.length}/{group.max_members || '∞'})
              </h3>
              <div className="space-y-3">
                {members.map((mem) => (
                  <div key={mem.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold shadow-lg">
                        {mem.profiles?.full_name?.charAt(0) || <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold">{mem.profiles?.full_name || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-400 capitalize">{mem.role || 'Member'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Circle Ledger */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Circle Ledger
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {ledger.length === 0 ? (
                  <p className="text-gray-400 text-sm p-4 bg-white/5 rounded-xl border border-white/5 border-dashed text-center">No transactions recorded yet.</p>
                ) : (
                  ledger.map(entry => (
                    <div key={entry.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${entry.entry_type === 'contribution' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {entry.entry_type === 'contribution' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold capitalize">{entry.entry_type}</p>
                          <p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-bold font-display text-lg">₦{parseFloat(entry.amount).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Governance & Proposals */}
            {proposals.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2 text-yellow-500">
                  <AlertTriangle className="w-5 h-5" /> Active Governance Proposals
                </h3>
                <div className="space-y-4">
                  {proposals.map(prop => {
                    const hasVoted = prop.votes?.some(v => v.voter_id === user?.id);
                    const approveCount = prop.votes?.filter(v => v.vote).length || 0;
                    const rejectCount = prop.votes?.filter(v => !v.vote).length || 0;

                    return (
                      <div key={prop.id} className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="font-bold text-lg mb-2">
                          {prop.type === 'delete_group' ? 'Disband Circle Request' : 'Modify Circle Request'}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-sm text-yellow-500/80 font-medium">
                            Status: {approveCount} Approvals | {rejectCount} Rejections
                            <span className="block text-xs mt-1 text-yellow-500/50">Requires 60% relative to total active members</span>
                          </p>
                          {!hasVoted && user ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleVote(prop.id, true)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-bold transition-colors">
                                <ThumbsUp className="w-4 h-4" /> Approve
                              </button>
                              <button onClick={() => handleVote(prop.id, false)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-bold transition-colors">
                                <ThumbsDown className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-500 border border-white/5 py-1.5 px-3 rounded-lg bg-black/20">
                              {hasVoted ? 'Vote Recorded' : 'Login to Vote'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Admin Controls */}
            {isAdmin && proposals.length === 0 && (
              <div className="mt-8 pt-8 border-t border-red-500/20">
                <h3 className="text-lg font-bold font-display mb-4 text-red-400">Admin Danger Zone</h3>
                <button 
                  onClick={handleProposeDelete} 
                  className="flex items-center justify-center sm:justify-start w-full sm:w-auto gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold border border-red-500/20 transition-all active:scale-95"
                >
                  <Trash2 className="w-5 h-5" /> Propose Disbanding Circle
                </button>
              </div>
            )}

          </motion.div>
        </div>

        {/* Sidebar / Invite Panel */}
        <div className="md:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-[32px] border border-white/10 sticky top-12"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <UserPlus className="text-accent w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2">Invite Members</h3>
            <p className="text-gray-400 text-sm mb-6">
              Share this unique circle code with trusted individuals. They can enter it on their Dashboard to join.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-black/50 border border-white/5 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Circle Invite Code</p>
                <p className="text-sm text-primary font-mono select-all">
                  {inviteCode}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied Code' : 'Copy Invite Code'}
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default GroupDetails;
