import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeam, getVenue, getCoach } from '../api/football';
import type { TeamDetails as TeamDetailsType, Venue, Coach } from '../types';
import { ChevronLeft, Users, Building2, Loader2, Calendar, Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [team, setTeam] = useState<TeamDetailsType | null>(null);
    const [venue, setVenue] = useState<Venue | null>(null);
    const [coach, setCoach] = useState<Coach | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const teamData = await getTeam(id);
                if (teamData) {
                    setTeam(teamData);
                    const venueId = teamData.venue_id;
                    if (venueId) {
                        const venueData = await getVenue(String(venueId));
                        setVenue(venueData);
                    }
                    const coachId = teamData.coach_id;
                    if (coachId) {
                        const coachData = await getCoach(coachId);
                        setCoach(coachData);
                    }
                }
            } catch (error) {
                console.error("Error fetching team data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-3xl p-5 flex items-center justify-center shrink-0">
                        <img
                            src={team.img || `https://cdn.soccersapi.com/images/soccer/teams/150/${team.id}.png`}
                            alt={team.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                        />
                    </div>

                    {/* Team Info */}
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            {team.name}
                        </h1>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {team.country?.name && (
                                <span className="badge-primary">
                                    <Globe className="w-3 h-3" />
                                    {team.country.name === 'Italy' ? 'Italia' : team.country.name}
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
                            {(venue || team.venue) && (
                                <div className="flex flex-wrap items-center gap-2 text-dark-300">
                                    <Building2 className="w-4 h-4 text-primary-400" />
                                    <span className="text-white font-medium">{venue?.name || team.venue?.name}</span>
                                    {(venue?.city || team.venue?.city) && (
                                        <span className="text-dark-400">• Città: {venue?.city || team.venue?.city}</span>
                                    )}
                                    {(venue?.capacity || team.venue?.capacity) && (
                                        <span className="text-dark-400">• {venue?.capacity || team.venue?.capacity} posti</span>
                                    )}
                                    {venue?.coordinates && (
                                        <a
                                            href={`https://www.google.com/maps?q=${venue.coordinates.lat},${venue.coordinates.long}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Mappa
                                        </a>
                                    )}
                                </div>
                            )}
                            {coach && (
                                <div className="flex items-center gap-2 text-dark-300">
                                    <Users className="w-4 h-4 text-secondary-400" />
                                    <span className="text-white font-medium">{coach.name}</span>
                                    {coach.nationality && (
                                        <span className="text-dark-400">• {coach.nationality}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
