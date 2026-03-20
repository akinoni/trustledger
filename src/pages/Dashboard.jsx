import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Users, PlusCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, LogOut, Loader2, Compass, Link2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserGroups, getRecentActivity, getWalletBalance, getUserTrustScore } from '../lib/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [trustScore, setTrustScore] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();

  const handleCopyInvite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(id); // Only copy the code
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      
      try {
        const [userGroups, userActivities, balance, score] = await Promise.all([
          getUserGroups(session.user.id),
          getRecentActivity(session.user.id),
          getWalletBalance(session.user.id),
          getUserTrustScore(session.user.id)
        ]);
        setGroups(userGroups);
        setActivities(userActivities);
        setWalletBalance(balance);
        setTrustScore(score);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">TrustLedger 3MTT</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold">{user?.user_metadata?.full_name || user?.email}</p>
            <p className="text-xs text-gray-400">Verified Member</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Balance & Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[32px] relative overflow-hidden"
          >
            {/* Glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
            
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2 relative z-10">Wallet Balance</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
              <div>
                <h2 className="text-5xl font-bold font-display tracking-tight">₦{walletBalance.toLocaleString()}</h2>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Trust Score</p>
                  <p className="text-xl font-bold text-primary">{trustScore}/100</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center p-1">
                   <div className="w-full h-full rounded-full bg-primary" style={{ opacity: trustScore / 100 }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <Link to="/create-group" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-premium rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 group w-full sm:w-auto">
                <PlusCircle className="w-5 h-5 shrink-0" /> Start Circle
              </Link>
              <Link to="/fund-wallet" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all active:scale-95 text-gray-300 w-full sm:w-auto">
                <Wallet className="w-5 h-5 text-gray-400 shrink-0" /> Fund
              </Link>
              <button 
                onClick={() => alert("Wallet-to-Wallet Transfer UI coming soon! The API is already active.")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all active:scale-95 text-gray-300 w-full sm:w-auto"
              >
                <ArrowUpRight className="w-5 h-5 text-gray-400 shrink-0" /> Transfer
              </button>
            </div>
          </motion.div>

          {/* Join by Code Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 p-6 bg-white/5 border border-white/10 shadow-xl shadow-black/20 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h4 className="font-bold mb-1 flex items-center gap-2 text-lg"><Link2 className="w-5 h-5 text-primary" /> Have a Circle Code?</h4>
              <p className="text-sm text-gray-400">Enter a private circle code to join instantly.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <input 
                type="text" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. 123e4567..." 
                className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-full md:w-64 font-mono text-sm"
              />
              <button 
                onClick={() => inviteCode && navigate(`/join/${inviteCode}`)}
                className="px-6 py-3 bg-gradient-premium rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 shrink-0"
              >
                Join
              </button>
            </div>
          </motion.div>

          {/* Active Circles List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-display">Active Circles</h3>
              <Link to="/explore" className="text-sm font-bold text-primary hover:text-white transition-colors flex items-center gap-1">
                <Compass className="w-4 h-4" /> Explore Public Circles
              </Link>
            </div>

            <div className="space-y-4">
              {groups.length === 0 ? (
                <div className="glass p-8 rounded-2xl text-center border border-white/5 border-dashed">
                  <p className="text-gray-400 mb-4">You haven't joined any circles yet.</p>
                  <Link to="/create-group" className="text-primary font-bold hover:underline">Start a new Circle</Link>
                </div>
              ) : (
                groups.map((membership, idx) => {
                  const circle = membership.groups;
                  if (!circle) return null;
                  
                  // Pick colors based on index for a dynamic feel
                  const colorClasses = [
                    'from-orange-500 to-pink-500',
                    'from-blue-500 to-cyan-500',
                    'from-green-500 to-emerald-500',
                    'from-purple-500 to-indigo-500'
                  ];
                  const bgGradient = colorClasses[idx % colorClasses.length];

                  return (
                    <Link to={`/group/${circle.id}`} key={circle.id} className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-tr ${bgGradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                          <Users className="text-white w-6 h-6 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">{circle.name}</h4>
                          <p className="text-sm text-gray-400 truncate">
                            {circle.max_members ? `${circle.max_members} Members • ` : ''}
                            ₦{circle.contribution_amount}/{circle.payout_frequency}
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 sm:border-0 pt-3 sm:pt-0 shrink-0">
                        <button 
                          onClick={(e) => handleCopyInvite(e, circle.id)}
                          className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5 hover:border-white/10 shrink-0"
                          title="Copy Invite Code"
                        >
                          {copiedId === circle.id ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
                        </button>
                        <div className="text-right">
                          <p className="font-bold uppercase text-[10px] tracking-widest text-gray-500 mb-0.5">Role</p>
                          <p className={`text-sm font-bold ${membership.role === 'admin' ? 'text-primary' : 'text-gray-300'} capitalize`}>
                            {membership.role || 'Member'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-[32px] h-full"
          >
            <h3 className="text-xl font-bold font-display mb-6">Recent Activity</h3>
            
            <div className="space-y-6">
              {activities.length === 0 ? (
                <div className="text-center p-6 border border-white/5 border-dashed rounded-2xl">
                  <p className="text-gray-400 text-sm">No recent activity found.</p>
                </div>
              ) : (
                activities.map((act) => {
                  // Determine color based on entry type
                  let colorClass = 'bg-primary';
                  let actionText = 'Activity';
                  
                  if (act.entry_type === 'welcome') {
                    colorClass = 'bg-blue-500';
                    actionText = 'Account Created';
                  } else if (act.entry_type === 'joined_circle') {
                    colorClass = 'bg-purple-500';
                    actionText = 'New Circle Joined';
                  } else if (act.entry_type === 'created_circle') {
                    colorClass = 'bg-orange-500';
                    actionText = 'Circle Created';
                  } else if (act.entry_type === 'contribution') {
                    colorClass = 'bg-green-500';
                    actionText = 'Contribution Made';
                  } else if (act.entry_type === 'payout') {
                    colorClass = 'bg-yellow-500';
                    actionText = 'Payout Received';
                  }

                  const dateStr = new Date(act.created_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <div key={act.id} className="relative pl-6 border-l-2 border-white/10 pb-6 last:border-l-transparent last:pb-0">
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${colorClass} border-4 border-[#16161d]`} />
                      <p className="font-bold mb-1">{actionText}</p>
                      <p className="text-sm text-gray-400 mb-2">{act.description}</p>
                      {act.entry_type === 'contribution' && (
                        <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded border border-green-500/20 mr-2">
                          Dual Verified
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{dateStr}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
