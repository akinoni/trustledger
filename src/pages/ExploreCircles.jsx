import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, ArrowLeft, Loader2, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAvailableGroups } from '../lib/api';

const ExploreCircles = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExploreData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      
      try {
        const available = await getAvailableGroups(session.user.id);
        setGroups(available);
      } catch (err) {
        console.error("Error fetching available groups:", err);
      }
      setLoading(false);
    };

    fetchExploreData();
  }, [navigate]);

  const filteredGroups = groups.filter(g => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto w-full flex flex-col pt-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 mb-6 self-start">
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight mb-3 flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" /> Explore Circles
          </h1>
          <p className="text-gray-400 text-lg">Discover active Ajo/Esusu groups and request to join.</p>
        </div>

        <div className="relative group w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
            placeholder="Search by name..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-white/5 border-dashed rounded-3xl bg-white/5">
            <p className="text-gray-400 text-lg mb-4">No available circles found.</p>
            <Link to="/create-group" className="inline-flex items-center justify-center px-6 py-3 bg-gradient-premium rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
              Start a New Circle
            </Link>
          </div>
        ) : (
          filteredGroups.map((circle, idx) => {
            const colorClasses = [
              'from-orange-500 to-pink-500',
              'from-blue-500 to-cyan-500',
              'from-green-500 to-emerald-500',
              'from-purple-500 to-indigo-500'
            ];
            const bgGradient = colorClasses[idx % colorClasses.length];

            return (
              <motion.div 
                key={circle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/join/${circle.id}`} className="glass p-6 rounded-[32px] flex flex-col h-full hover:bg-white/5 transition-all border border-white/10 hover:border-primary/30 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${bgGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Users className="text-white w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl truncate group-hover:text-primary transition-colors">{circle.name}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {circle.max_members ? `Capacity: ${circle.max_members}` : 'Open Group'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto border-t border-white/10 pt-4">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Contribution</p>
                      <p className="font-bold">₦{circle.contribution_amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Frequency</p>
                      <p className="font-bold capitalize">{circle.payout_frequency}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <span className="text-sm font-bold text-primary group-hover:underline flex items-center gap-1">
                      View Details & Join &rarr;
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExploreCircles;
