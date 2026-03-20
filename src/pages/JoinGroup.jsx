import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const JoinGroup = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch group info so the user knows what they're joining
    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setGroup(data);
      if (error) setError('This invite link appears to be invalid or expired.');
      setLoading(false);
    };

    fetchGroup();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    setError('');

    try {
      // Get current logged in user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not logged in, they must log in first to join.
        // Usually you'd save the intended redirect URL in session storage here.
        navigate('/login');
        return;
      }

      // Check if they are already a member
      const { data: existing } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('group_id', id)
        .single();

      if (existing) {
        setAlreadyMember(true);
        setTimeout(() => navigate(`/group/${id}`), 2000);
        return;
      }

      // Insert new membership logic
      const { error: insertError } = await supabase
        .from('memberships')
        .insert([{
          user_id: session.user.id,
          group_id: id,
          role: 'member',
          payout_position: Math.floor(Math.random() * 10) + 2 // Temporary dummy logic for MVP payout positioning
        }]);

      if (insertError) throw insertError;
      
      setSuccess(true);
      setTimeout(() => navigate(`/group/${id}`), 2000);

    } catch (err) {
      setError(err.message || "Failed to join circle. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || "Circle not found"}</h2>
        <Link to="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-10 rounded-[32px] text-center shadow-2xl border border-white/10">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-primary/20 mb-8 border border-white/10">
            <Users className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold font-display tracking-tight mb-2">Join Circle</h2>
          <p className="text-gray-400 mb-8">You've been invited to join an exclusive Ajo/Esusu savings group.</p>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-6 mb-8 text-left">
            <p className="text-sm text-primary font-bold uppercase tracking-widest mb-1">Circle Name</p>
            <p className="text-xl font-bold mb-4">{group.name}</p>
            
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase">Contribution</p>
                <p className="font-bold">₦{group.contribution_amount}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs font-bold uppercase">Frequency</p>
                <p className="font-bold capitalize">{group.payout_frequency}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Secured by TrustLedger Dual-Verification
          </div>

          {alreadyMember ? (
            <div className="py-4 bg-purple-500/20 text-purple-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" /> You are already a member! Re-routing...
            </div>
          ) : success ? (
            <div className="py-4 bg-green-500/20 text-green-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-500/30">
              <CheckCircle className="w-6 h-6" /> Seamlessly Joined! Re-routing...
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-4 bg-gradient-premium rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 group text-lg"
            >
              {joining ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Accept Invitation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          )}

          <div className="mt-6">
            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">Decline and go to Dashboard</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinGroup;
