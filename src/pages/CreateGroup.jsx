import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Users, Calendar, HelpCircle, AlertCircle, Globe, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createGroup } from '../lib/api';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [memberCount, setMemberCount] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
      else navigate('/login');
    });
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      await createGroup(user.id, {
        name: groupName,
        amount: parseFloat(amount),
        frequency: frequency,
        maxMembers: parseInt(memberCount, 10),
        isPublic: isPublic
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create group. Database setup might be missing or ENUMs mismatched.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto w-full flex flex-col pt-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 mb-6 self-start">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-bold font-display tracking-tight mb-3">Start a New Circle</h1>
        <p className="text-gray-400 text-lg">Set up a transparent & secure Ajo/Esusu group in minutes.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[32px] border border-white/10"
      >
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-white/10 pb-2">Circle Details</h3>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Circle Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                placeholder="e.g., Market Women Ajo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1">
                  Contribution Amount <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₦</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Turn Frequency</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                  >
                    <option value="weekly" className="bg-[#1a1a24]">Weekly</option>
                    <option value="biweekly" className="bg-[#1a1a24]">Bi-weekly</option>
                    <option value="monthly" className="bg-[#1a1a24]">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Number of Members</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="number"
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                  placeholder="Total participants"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2 pt-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Circle Privacy</label>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsPublic(true)} 
                  className={`flex-1 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${isPublic ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Globe className={`w-5 h-5 ${isPublic ? 'text-primary' : 'text-gray-400'}`} /> 
                  <span className="font-bold text-sm">Public (Discoverable)</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsPublic(false)} 
                  className={`flex-1 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${!isPublic ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Lock className={`w-5 h-5 ${!isPublic ? 'text-primary' : 'text-gray-400'}`} /> 
                  <span className="font-bold text-sm">Private (Invite Only)</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 px-1">
                {isPublic ? "Anyone can find and request to join this circle via the Explore page." : "Only users with the direct invite link can join this circle."}
              </p>
            </div>
            
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Dual Verification Enforced</p>
              <p className="text-sm text-gray-400">
                All contributions and payouts in this circle will require confirmation from both the sender and the group administrator to ensure complete transparency.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-premium rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed group text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Launch Circle'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroup;
