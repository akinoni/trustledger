import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Users, LineChart, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">TrustLedger 3MTT</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 rounded-full font-medium hover:bg-white/5 transition-all">Login</Link>
          <Link to="/signup" className="px-6 py-2 bg-gradient-premium rounded-full font-medium shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Join Early</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-20 pb-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              The Digital <span className="text-gradient-premium">Trust Layer</span> for Community Savings.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-sans">
              Bring transparency and safety to your Ajo, Esusu, and Adashe groups. 
              Dual-verification, transparent ledgers, and a secure path to financial identity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/signup" className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-premium rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all group">
                Start a New Circle <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 px-8 py-4 glass border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/5 transition-all"
              >
                Learn How it Works
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Card Mock */}
        <div className="flex-1 relative w-full max-w-md h-[500px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-0 right-0 w-full h-full glass rounded-[40px] p-8 overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-1">Group Balance</p>
                    <h2 className="text-4xl font-bold font-display">₦2,450,000</h2>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Wallet className="text-primary w-6 h-6" />
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500" />
                        <div>
                            <p className="font-bold text-sm">Chidi K.</p>
                            <p className="text-xs text-gray-400">Paid ₦50,000</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                        Verified
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500" />
                        <div>
                            <p className="font-bold text-sm">Fatima A.</p>
                            <p className="text-xs text-gray-400">Paid ₦50,000</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20">
                        Pending Admin
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-3 tracking-widest">Next Recipient</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5">
                             <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500" />
                        </div>
                        <div>
                            <p className="font-bold">Olawale J.</p>
                            <p className="text-sm text-gray-400">Due in 2 days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop Glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </main>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto w-full px-6 py-32 border-t border-white/5">
        <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">How TrustLedger 3MTT Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                A simple, three-step process to secure your community savings and build your financial future.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div 
                whileHover={{ y: -10 }}
                className="glass p-8 rounded-[32px] border border-white/10 relative overflow-hidden group"
            >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-6">1</div>
                <h4 className="text-2xl font-bold mb-4">Join or Create</h4>
                <p className="text-gray-400">
                    Choose a savings circle that fits your goals (amount, frequency, and duration) or start a new one with your trusted peers.
                </p>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
            </motion.div>

            {/* Step 2 */}
            <motion.div 
                whileHover={{ y: -10 }}
                transition={{ delay: 0.1 }}
                className="glass p-8 rounded-[32px] border border-white/10 relative overflow-hidden group"
            >
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary font-bold text-xl mb-6">2</div>
                <h4 className="text-2xl font-bold mb-4">Secure Contribution</h4>
                <p className="text-gray-400">
                    Make your scheduled contributions directly from your digital wallet. Each payment is dual-verified by the system and the admin.
                </p>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/10 blur-3xl group-hover:bg-secondary/20 transition-all" />
            </motion.div>

            {/* Step 3 */}
            <motion.div 
                whileHover={{ y: -10 }}
                transition={{ delay: 0.2 }}
                className="glass p-8 rounded-[32px] border border-white/10 relative overflow-hidden group"
            >
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent font-bold text-xl mb-6">3</div>
                <h4 className="text-2xl font-bold mb-4">Automated Payout</h4>
                <p className="text-gray-400">
                    When it's your turn, the full group pot is automatically transferred to your wallet. No delays, no disputes, just pure trust.
                </p>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/10 blur-3xl group-hover:bg-accent/20 transition-all" />
            </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white/2 max-w-7xl mx-auto w-full px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                    <ShieldCheck className="text-accent w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-display">Dual Verification</h3>
                <p className="text-gray-400 leading-relaxed">
                    Zero disputes. Payments are confirmed by both the payer and the group administrator.
                </p>
            </div>
            <div className="space-y-4">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                    <LineChart className="text-secondary w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-display">Financial Identity</h3>
                <p className="text-gray-400 leading-relaxed">
                    Build a permanent record of your savings behavior, paving the way for future credit access.
                </p>
            </div>
            <div className="space-y-4">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                    <Users className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-display">Community Driven</h3>
                <p className="text-gray-400 leading-relaxed">
                    Designed for Ajo, Esusu, and Adashe groups of all sizes. Easy to join, impossible to manipulate.
                </p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
