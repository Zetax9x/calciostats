import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchItalianLeagues, type NormalizedLeague } from '../api';
import { Trophy, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
    const [leagues, setLeagues] = useState<NormalizedLeague[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchItalianLeagues();
            setLeagues(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin relative" />
                </div>
                <p className="text-gray-500 text-sm">Caricamento campionati...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8 relative"
            >
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-6"
                >
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-400 text-sm font-medium">Tutti i campionati italiani</span>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4 relative">
                    <span className="text-white">Calcio</span>
                    <span className="text-gradient">Stats</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                    Segui tutti i campionati italiani dalla Serie A alla Serie C
                </p>
            </motion.div>

            {/* Leagues Grid */}
            {leagues.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-12 text-center"
                >
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Nessun campionato disponibile</h3>
                    <p className="text-gray-400">Riprova più tardi</p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                    {leagues.map((league, index) => (
                        <motion.div
                            key={league.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.03 }}
                        >
                            <Link
                                to={`/league/${league.id}`}
                                className="glass-card-hover p-5 flex items-center gap-4 group h-full"
                            >
                                {/* League Logo */}
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform p-2.5">
                                    {league.logo ? (
                                        <img
                                            src={league.logo}
                                            alt={league.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.opacity = '0.3';
                                            }}
                                        />
                                    ) : (
                                        <Trophy className="w-7 h-7 text-primary-400" />
                                    )}
                                </div>

                                {/* League Info */}
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-500 transition-colors truncate">
                                        {league.name}
                                    </h3>
                                    {league.isCup && (
                                        <span className="badge-secondary text-[10px] mt-1.5">COPPA</span>
                                    )}
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};
