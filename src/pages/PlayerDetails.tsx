import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlayer } from '../api/football';
import type { PlayerDetails as PlayerType } from '../types';
import { User, ChevronLeft, Calendar, Ruler, Weight, Flag, Shield, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function PlayerDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [player, setPlayer] = useState<PlayerType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchPlayer = async () => {
            setLoading(true);
            try {
                const data = await getPlayer(id);
                setPlayer(data);
            } catch (error) {
                console.error("Failed to fetch player details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayer();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin relative" />
                </div>
                <p className="text-dark-400 text-sm">Caricamento giocatore...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="glass-card p-10 text-center max-w-md">
                    <h2 className="text-xl font-semibold text-white mb-3">Giocatore non trovato</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary-400 hover:text-primary-300 font-medium"
                    >
                        ← Torna indietro
                    </button>
                </div>
            </div>
        );
    }

    const getRoleName = (pos: string) => {
        if (pos === 'G' || pos?.includes('Goalkeeper')) return 'Portiere';
        if (pos === 'D' || pos?.includes('Defender')) return 'Difensore';
        if (pos === 'M' || pos?.includes('Midfielder')) return 'Centrocampista';
        if (pos === 'F' || pos === 'A' || pos?.includes('Forward') || pos?.includes('Attacker')) return 'Attaccante';
        return pos || 'N/D';
    };

    const roleName = getRoleName(player.position);
    const displayName = player.common_name || `${player.firstname} ${player.lastname}`.trim() || player.name;

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Indietro</span>
            </motion.button>

            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 relative overflow-hidden"
            >
                {/* Gradient Orb */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    {/* Player Avatar */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-dark-800 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                        {player.img ? (
                            <img src={player.img} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-14 h-14 text-dark-600" />
                        )}
                    </div>

                    {/* Player Info */}
                    <div className="text-center sm:text-left space-y-3">
                        {/* Role Badge */}
                        <div className="badge-primary">
                            <Shield className="w-3 h-3" />
                            {roleName}
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">
                            {displayName}
                        </h1>

                        {/* Team Link */}
                        {player.current_team_id && (
                            <Link
                                to={`/team/${player.current_team_id}`}
                                className="inline-flex items-center gap-3 px-4 py-2 bg-dark-800/80 rounded-2xl hover:bg-dark-700 transition-colors group"
                            >
                                {player.team_img && <img src={player.team_img} alt="Team" className="w-6 h-6 object-contain" />}
                                <span className="text-dark-300 group-hover:text-white transition-colors">{player.team_name}</span>
                                {player.shirt_number && (
                                    <span className="bg-primary-500/20 text-primary-400 px-2.5 py-1 rounded-lg text-sm font-bold">
                                        #{player.shirt_number}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Flag className="w-5 h-5" />}
                    label="Nazionalità"
                    value={player.country?.name}
                    delay={0.15}
                    color="primary"
                />
                <StatCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="Età"
                    value={player.age ? `${player.age} anni` : undefined}
                    delay={0.2}
                    color="secondary"
                />
                <StatCard
                    icon={<Ruler className="w-5 h-5" />}
                    label="Altezza"
                    value={player.height ? `${player.height} cm` : undefined}
                    delay={0.25}
                    color="primary"
                />
                <StatCard
                    icon={<Weight className="w-5 h-5" />}
                    label="Peso"
                    value={player.weight ? `${player.weight} kg` : undefined}
                    delay={0.3}
                    color="secondary"
                />
            </div>

            {/* Additional Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card"
            >
                <div className="flex items-center gap-3 p-5 border-b border-white/10">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl">
                        <Sparkles className="w-5 h-5 text-primary-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Dettagli</h2>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <InfoRow label="Nome Completo" value={player.fullname || `${player.firstname} ${player.lastname}`} />
                    <InfoRow label="Data di Nascita" value={player.birthday} />
                    <InfoRow label="Luogo di Nascita" value={player.birth_place} />
                    <InfoRow label="Piede Preferito" value={player.foot} highlight />
                </div>
            </motion.div>
        </div>
    );
}

function StatCard({ icon, label, value, delay = 0, color = 'primary' }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    delay?: number;
    color?: 'primary' | 'secondary';
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card p-5 flex flex-col items-center justify-center gap-3 text-center"
        >
            <div className={`${color === 'primary' ? 'text-primary-400' : 'text-secondary-400'}`}>
                {icon}
            </div>
            <span className="text-xs text-dark-500 uppercase tracking-wider">{label}</span>
            <span className={`font-bold text-lg ${color === 'primary' ? 'text-gradient' : 'text-gradient-cyan'}`}>
                {value || 'N/D'}
            </span>
        </motion.div>
    );
}

function InfoRow({ label, value, highlight = false }: { label: string; value?: string | null; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
            <span className="text-dark-400 text-sm">{label}</span>
            <span className={`text-sm font-medium ${highlight ? 'text-gradient capitalize' : 'text-white'}`}>
                {value || 'N/D'}
            </span>
        </div>
    );
}
