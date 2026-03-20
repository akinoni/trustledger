import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowLeft, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fundWallet } from '../lib/api';

const FundWallet = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
      else navigate('/login');
    });
  }, [navigate]);

  const handleFund = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // Simulate payment gateway, then update database
      await fundWallet(user.id, parseFloat(amount));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to fund wallet. Did you run the SQL script?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto w-full flex flex-col pt-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 mb-6 self-start z-10">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 sm:p-10 rounded-[32px] border border-white/10 z-10 text-center shadow-2xl"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-green-500/20 flex items-center justify-center mb-8 border border-green-500/30">
          <Wallet className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold font-display tracking-tight mb-2">Fund Your Wallet</h1>
        <p className="text-gray-400 text-sm mb-8">Add funds securely to participate in your Ajo/Esusu savings circles.</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start text-left gap-3">
            <Info className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-8 bg-green-500/10 text-green-400 rounded-2xl font-bold flex flex-col items-center justify-center gap-4 border border-green-500/20">
            <CheckCircle className="w-12 h-12" /> 
            <div>
               <p className="text-xl">Successfully Funded ₦{amount}!</p>
               <p className="text-sm font-normal text-green-400/70 mt-1">Redirecting to Dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFund} className="space-y-6 text-left">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Amount to Add (₦)</label>
              <div className="relative group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-bold text-2xl text-center"
                  placeholder="50000"
                  required
                  min={100}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4 text-left invisible sm:visible h-0 sm:h-auto overflow-hidden">
              <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 text-sm">Secure Bank Transfer via Paystack</p>
                <p className="text-xs text-gray-400">
                  (Simulated for MVP: Instantly updates your TrustLedger 3MTT wallet balance).
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-green-500 hover:bg-green-400 text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                `Add ₦${amount || '0'}`
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default FundWallet;
