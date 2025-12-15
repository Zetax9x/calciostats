import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { fetchTeam, fetchFixtures, type NormalizedTeam, type NormalizedMatch } from '../api';
import { ChevronLeft, Users, Building2, Loader2, Calendar, Globe, MapPin, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export const TeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { currentSeasonId } = useAppContext();
    // Use context first, fallback to URL param for direct links
    const seasonId = currentSeasonId || searchParams.get('season_id');
    const navigate = useNavigate();
    const [team, setTeam] = useState<NormalizedTeam | null>(null);
    const [recentMatches, setRecentMatches] = useState<NormalizedMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch team using normalized API
                const teamData = await fetchTeam(id);
                if (teamData) {
                    setTeam(teamData);
                }

                // Fetch team's recent fixtures using normalized API
                if (seasonId) {
                    const fixturesData = await fetchFixtures(seasonId, { teamId: id });
                    console.log('Fixtures data for team', id, 'season', seasonId, ':', fixturesData);
                    // Filter completed matches and sort by date descending
                    const completedMatches = fixturesData
                        .filter(f => f.status === 'finished')
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10);
                    console.log('Completed matches:', completedMatches);
                    setRecentMatches(completedMatches);
                }
            } catch (error) {
                console.error("Error fetching team data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, seasonId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin relative" />
                </div>
                <p className="text-dark-400 text-sm">Caricamento squadra...</p>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="glass-card p-10 text-center max-w-md">
                    <h2 className="text-xl font-semibold text-white mb-3">Squadra non trovata</h2>
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

    return (
        <div className="space-y-8 overflow-x-hidden">
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
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Team Logo */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-3xl p-5 flex items-center justify-center shrink-0">
                        <img
                            src={team.logo}
                            alt={team.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                        />
                    </div>

                    {/* Team Info */}
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
                            {team.name}
                        </h1>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {team.country && (
                                <span className="badge-primary">
                                    <Globe className="w-3 h-3" />
                                    {team.country === 'Italy' ? 'Italia' : team.country}
                                </span>
                            )}
                            {team.founded && (
                                <span className="badge-secondary">
                                    <Calendar className="w-3 h-3" />
                                    Fondata nel {team.founded}
                                </span>
                            )}
                        </div>

                        {/* Stadium & Coach Info */}
                        <div className="flex flex-col gap-2 mt-4 text-sm">
                            {team.venue && (
                                <div className="flex flex-wrap items-center gap-2 text-gray-500">
                                    <Building2 className="w-4 h-4 text-primary-500" />
                                    <span className="text-gray-800 font-medium">{team.venue.name}</span>
                                    {team.venue.city && (
                                        <span className="text-gray-500">• Città: {team.venue.city}</span>
                                    )}
                                    {team.venue.capacity && (
                                        <span className="text-gray-500">• {team.venue.capacity.toLocaleString()} posti</span>
                                    )}
                                    {team.venue.coordinates && (
                                        <a
                                            href={`https://www.google.com/maps?q=${team.venue.coordinates.lat},${team.venue.coordinates.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Mappa
                                        </a>
                                    )}
                                </div>
                            )}
                            {team.coach && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Users className="w-4 h-4 text-secondary-500" />
                                    <span className="text-gray-800 font-medium">{team.coach.name}</span>
                                    {team.coach.nationality && (
                                        <span className="text-gray-500">• {team.coach.nationality}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Recent Matches Section */}
            {recentMatches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-500/20 rounded-xl">
                            <History className="w-5 h-5 text-primary-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Ultime Partite</h2>
                    </div>

                    <div className="space-y-3">
                        {recentMatches.map((match) => {
                            const isHome = match.homeTeam.id === id;
                            const opponent = isHome ? match.awayTeam : match.homeTeam;

                            // Compute form from scores
                            const homeScore = match.score.home ?? 0;
                            const awayScore = match.score.away ?? 0;
                            let form: 'W' | 'D' | 'L';
                            if (isHome) {
                                form = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
                            } else {
                                form = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
                            }

                            const formColor = form === 'W' ? 'bg-green-500' : form === 'D' ? 'bg-yellow-500' : 'bg-red-500';
                            const formText = form === 'W' ? 'V' : form === 'D' ? 'P' : 'S';

                            return (
                                <Link
                                    key={match.id}
                                    to={`/match/${match.id}`}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    {/* Form Badge */}
                                    <div className={`w-10 h-10 ${formColor} rounded-xl flex items-center justify-center shrink-0`}>
                                        <span className="text-white font-bold text-sm">{formText}</span>
                                    </div>

                                    {/* Opponent */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <img
                                            src={opponent.logo}
                                            alt={opponent.name}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                                        />
                                        <div className="min-w-0">
                                            <span className="text-gray-800 font-medium truncate block">{opponent.name}</span>
                                            <p className="text-gray-500 text-xs">{isHome ? 'Casa' : 'Trasferta'}</p>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right shrink-0">
                                        <p className="text-gray-800 font-bold text-lg">
                                            {match.score.home ?? '-'} - {match.score.away ?? '-'}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {match.date ? new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : ''}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
