import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess('Password reset link sent! Check your email inbox to proceed.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 sm:p-10 rounded-[32px] shadow-2xl relative z-10 border border-white/10">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 self-start text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display tracking-tight mb-2">Reset Password</h1>
            <p className="text-gray-400 text-sm leading-relaxed">Enter the email address associated with your account and we'll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <Info className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <ShieldCheck className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-4 mt-2 bg-gradient-premium rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
