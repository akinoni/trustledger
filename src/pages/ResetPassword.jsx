import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Make sure the user is on this page due to an active recovery session.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      // Typically, Supabase triggers a PASSWORD_RECOVERY event with a session
      if (event === 'PASSWORD_RECOVERY') {
        // user is ready to reset
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Successfully updated!
      alert("Password updated successfully!");
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 sm:p-10 rounded-[32px] shadow-2xl relative z-10 border border-white/10">
          
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-premium shadow-lg shadow-primary/20 mb-6">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight mb-2">Create New Password</h1>
            <p className="text-gray-400 text-sm">Enter your new secure password below.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <Info className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                  placeholder="Must be at least 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-premium rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Update Password <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
