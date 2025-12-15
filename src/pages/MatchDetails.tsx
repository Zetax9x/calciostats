import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    fetchMatch, fetchH2H, fetchMatchStats, fetchMatchEvents, fetchMatchLineups, fetchFixtures,
    type NormalizedMatch, type NormalizedH2H, type NormalizedMatchStats, type NormalizedMatchEvent, type NormalizedMatchLineups
} from '../api';
import { ChevronLeft, Calendar, MapPin, Clock, Trophy, Loader2, Swords, BarChart3, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const MatchDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<NormalizedMatch | null>(null);
    const [h2h, setH2H] = useState<NormalizedH2H | null>(null);
    const [stats, setStats] = useState<NormalizedMatchStats | null>(null);
    const [events, setEvents] = useState<NormalizedMatchEvent[]>([]);
    const [lineups, setLineups] = useState<NormalizedMatchLineups | null>(null);
    const [homeForm, setHomeForm] = useState<NormalizedMatch[]>([]);
    const [awayForm, setAwayForm] = useState<NormalizedMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await fetchMatch(id);
                console.log('Match details:', data);
                if (!data) return;
                setMatch(data);

                // Fetch H2H if team IDs exist
                const homeTeamId = data.homeTeam.id;
                const awayTeamId = data.awayTeam.id;
                const seasonId = data.seasonId;

                if (homeTeamId && awayTeamId) {
                    const h2hData = await fetchH2H(homeTeamId, awayTeamId);
                    setH2H(h2hData);
                }

                // Fetch match stats, events, lineups
                const [statsData, eventsData, lineupsData] = await Promise.all([
                    fetchMatchStats(id),
                    fetchMatchEvents(id),
                    fetchMatchLineups(id)
                ]);
                setStats(statsData);
                setEvents(eventsData);
                setLineups(lineupsData);

                // Fetch recent form for both teams (last 5 matches)
                if (homeTeamId && seasonId) {
                    const homeFixtures = await fetchFixtures(seasonId, { teamId: homeTeamId });
                    const finished = homeFixtures.filter(f => f.status === 'finished').slice(0, 5);
                    setHomeForm(finished);
                }
                if (awayTeamId && seasonId) {
                    const awayFixtures = await fetchFixtures(seasonId, { teamId: awayTeamId });
                    const finished = awayFixtures.filter(f => f.status === 'finished').slice(0, 5);
                    setAwayForm(finished);
                }
            } catch (error) {
                console.error("Error fetching match:", error);
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
                <p className="text-gray-500 text-sm">Caricamento partita...</p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="glass-card p-10 text-center max-w-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Partita non trovata</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                        ← Torna indietro
                    </button>
                </div>
            </div>
        );
    }

    // Extract match data using normalized types
    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;
    const homeScore = match.score.home ?? '-';
    const awayScore = match.score.away ?? '-';
    const htScore = match.score.halftimeHome !== undefined && match.score.halftimeAway !== undefined
        ? `${match.score.halftimeHome} - ${match.score.halftimeAway}`
        : null;
    const isFinished = match.status === 'finished';

    const matchDate = match.date;
    const displayTime = match.time || '';

    const leagueName = match.league.name || '';
    const venueName = match.venue?.name || '';
    const roundName = match.round || '';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Indietro</span>
            </motion.button>

            {/* Match Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 md:p-8 relative overflow-hidden"
            >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />

                {/* League & Round Info */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    {leagueName && (
                        <span className="badge-primary">
                            <Trophy className="w-3 h-3" />
                            {leagueName}
                        </span>
                    )}
                    {roundName && (
                        <span className="text-gray-500 text-sm">Giornata {roundName}</span>
                    )}
                </div>

                {/* Teams & Score */}
                <div className="flex items-center justify-center gap-6 md:gap-12 relative z-10">
                    {/* Home Team */}
                    <Link to={`/team/${homeTeam.id}`} className="flex flex-col items-center gap-3 flex-1 group">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-2xl p-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            <img
                                src={homeTeam.logo}
                                alt={homeTeam.name}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                            />
                        </div>
                        <span className="text-gray-800 font-semibold text-center text-sm md:text-base group-hover:text-primary-500 transition-colors">
                            {homeTeam.name}
                        </span>
                    </Link>

                    {/* Score */}
                    <div className="flex flex-col items-center gap-2">
                        {isFinished ? (
                            <>
                                <div className="flex items-center gap-3 md:gap-4 bg-gray-100 rounded-2xl px-6 py-4">
                                    <span className="text-3xl md:text-5xl font-bold text-gray-800">{homeScore}</span>
                                    <span className="text-2xl md:text-4xl text-gray-400">-</span>
                                    <span className="text-3xl md:text-5xl font-bold text-gray-800">{awayScore}</span>
                                </div>
                                {htScore && (
                                    <span className="text-gray-400 text-xs">PT: {htScore}</span>
                                )}
                                <span className="text-green-400 text-xs font-medium uppercase">Finita</span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-6 py-4">
                                    <span className="text-2xl md:text-4xl font-bold text-primary-400">{displayTime}</span>
                                </div>
                                <span className="text-gray-500 text-xs font-medium uppercase">Da giocare</span>
                            </>
                        )}
                    </div>

                    {/* Away Team */}
                    <Link to={`/team/${awayTeam.id}`} className="flex flex-col items-center gap-3 flex-1 group">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-2xl p-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            <img
                                src={awayTeam.logo}
                                alt={awayTeam.name}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                            />
                        </div>
                        <span className="text-gray-800 font-semibold text-center text-sm md:text-base group-hover:text-primary-500 transition-colors">
                            {awayTeam.name}
                        </span>
                    </Link>
                </div>

                {/* Match Info */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                    {matchDate && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(matchDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    )}
                    {displayTime && !isFinished && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{displayTime}</span>
                        </div>
                    )}
                    {venueName && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{venueName}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Additional Info - can be expanded later with events, lineups, stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informazioni Partita</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <InfoRow label="Competizione" value={leagueName} />
                    <InfoRow label="Giornata" value={roundName ? `Giornata ${roundName}` : null} />
                    <InfoRow label="Data" value={matchDate ? new Date(matchDate).toLocaleDateString('it-IT') : null} />
                    <InfoRow label="Orario" value={displayTime || null} />
                    <InfoRow label="Stadio" value={venueName || null} />
                    <InfoRow label="Stato" value={isFinished ? 'Terminata' : 'Da giocare'} highlight />
                </div>
            </motion.div>

            {/* H2H Section */}
            {h2h && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
                            <Swords className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Scontri Diretti</h3>
                    </div>

                    {/* H2H Stats Summary - calculated from finished matches only */}
                    {h2h.matches && (() => {
                        const finishedMatches = h2h.matches.filter(m => m.status === 'finished');
                        if (finishedMatches.length === 0) return null;

                        // Recalculate stats from finished matches
                        let homeWins = 0, awayWins = 0, draws = 0;
                        finishedMatches.forEach(m => {
                            const homeScore = m.score.home ?? 0;
                            const awayScore = m.score.away ?? 0;
                            const isHomeTeamHome = m.homeTeam.id === homeTeam.id;

                            if (homeScore > awayScore) {
                                isHomeTeamHome ? homeWins++ : awayWins++;
                            } else if (awayScore > homeScore) {
                                isHomeTeamHome ? awayWins++ : homeWins++;
                            } else {
                                draws++;
                            }
                        });

                        return (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-100/50 rounded-xl">
                                    <p className="text-2xl font-bold text-green-500">{homeWins}</p>
                                    <p className="text-xs text-gray-500 mt-1">Vittorie {homeTeam.name}</p>
                                </div>
                                <div className="text-center p-4 bg-gray-100/50 rounded-xl">
                                    <p className="text-2xl font-bold text-yellow-500">{draws}</p>
                                    <p className="text-xs text-gray-500 mt-1">Pareggi</p>
                                </div>
                                <div className="text-center p-4 bg-gray-100/50 rounded-xl">
                                    <p className="text-2xl font-bold text-red-500">{awayWins}</p>
                                    <p className="text-xs text-gray-500 mt-1">Vittorie {awayTeam.name}</p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Recent H2H Matches - only finished */}
                    {h2h.matches && h2h.matches.filter(m => m.status === 'finished').length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-3">Ultime partite</p>
                            {h2h.matches.filter(m => m.status === 'finished').slice(0, 5).map((m, index) => (
                                <div key={m.id || index} className="flex items-center justify-between p-3 bg-gray-100/50 rounded-xl text-sm">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-gray-800 font-medium truncate">{m.homeTeam.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 bg-gray-200 rounded-lg py-1">
                                        <span className="text-gray-800 font-bold">{m.score.home ?? '-'}</span>
                                        <span className="text-gray-400">-</span>
                                        <span className="text-gray-800 font-bold">{m.score.away ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 justify-end">
                                        <span className="text-gray-800 font-medium truncate">{m.awayTeam.name}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs ml-3 hidden sm:block">
                                        {m.date ? new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' }) : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">Nessun precedente disponibile</p>
                    )}
                </motion.div>
            )}



            {/* Match Events */}
            {events && events.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                            <Activity className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Eventi Partita</h3>
                    </div>

                    {/* Team Headers */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain" />
                            <span className="font-medium text-gray-700 text-sm">{homeTeam.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 text-sm">{awayTeam.name}</span>
                            <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {events.map((event: any, idx: number) => {
                            const isHomeEvent = event.team?.id === homeTeam.id || String(event.team?.id) === homeTeam.id;
                            const playerName = event.player?.name || event.player_name || 'Evento';
                            // In normalized: assistPlayer contains who enters (for substitutions)
                            const assistName = event.assistPlayer?.name || event.assist?.name || null;
                            const eventType = event.type || event.event_type;
                            const eventIcon = getEventIcon(eventType);
                            const isSubstitution = eventType === 'subst' || eventType === 'substitution';

                            // For substitutions: player = OUT, assistPlayer = IN
                            const displayText = isSubstitution && assistName
                                ? <><span className="text-red-500">↓ {playerName}</span> <span className="text-green-500">↑ {assistName}</span></>
                                : playerName;

                            return (
                                <div key={idx} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                                    {/* Home team side */}
                                    <div className="flex-1 flex items-center justify-end gap-2">
                                        {isHomeEvent && (
                                            <>
                                                <span className="text-gray-800 text-sm font-medium">{displayText}</span>
                                                <span className="text-lg">{eventIcon}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Minute in center */}
                                    <div className="w-12 text-center">
                                        <span className="text-primary-500 font-mono text-sm font-bold">{event.time?.elapsed || event.minute}'</span>
                                    </div>

                                    {/* Away team side */}
                                    <div className="flex-1 flex items-center gap-2">
                                        {!isHomeEvent && (
                                            <>
                                                <span className="text-lg">{eventIcon}</span>
                                                <span className="text-gray-800 text-sm font-medium">{displayText}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}


            {/* Recent Form */}
            {
                (homeForm.length > 0 || awayForm.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                                <Activity className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Forma Recente</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Home Team Form */}
                            <div>
                                <h4 className="text-white font-medium mb-3">{homeTeam.name}</h4>
                                <div className="flex gap-2">
                                    {homeForm.map((f: any, idx: number) => {
                                        const hScore = f.scores?.home_score ?? 0;
                                        const aScore = f.scores?.away_score ?? 0;
                                        const isHome = String(f.teams?.home?.id) === String(homeTeam.id);
                                        let result = 'D';
                                        if (isHome) {
                                            result = hScore > aScore ? 'W' : hScore < aScore ? 'L' : 'D';
                                        } else {
                                            result = aScore > hScore ? 'W' : aScore < hScore ? 'L' : 'D';
                                        }
                                        const bgColor = result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500';
                                        return (
                                            <div key={idx} className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                                                {result === 'W' ? 'V' : result === 'L' ? 'S' : 'P'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Away Team Form */}
                            <div>
                                <h4 className="text-white font-medium mb-3">{awayTeam.name}</h4>
                                <div className="flex gap-2">
                                    {awayForm.map((f: any, idx: number) => {
                                        const hScore = f.scores?.home_score ?? 0;
                                        const aScore = f.scores?.away_score ?? 0;
                                        const isHome = String(f.teams?.home?.id) === String(awayTeam.id);
                                        let result = 'D';
                                        if (isHome) {
                                            result = hScore > aScore ? 'W' : hScore < aScore ? 'L' : 'D';
                                        } else {
                                            result = aScore > hScore ? 'W' : aScore < hScore ? 'L' : 'D';
                                        }
                                        const bgColor = result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500';
                                        return (
                                            <div key={idx} className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                                                {result === 'W' ? 'V' : result === 'L' ? 'S' : 'P'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }
        </div >
    );
};

function InfoRow({ label, value, highlight = false }: { label: string; value?: string | null; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className={`text-sm font-medium ${highlight ? 'text-primary-500' : 'text-gray-800'}`}>
                {value || 'N/D'}
            </span>
        </div>
    );
}

function StatBar({ label, homeValue, awayValue, suffix = '' }: {
    label: string;
    homeValue: number | string;
    awayValue: number | string;
    suffix?: string
}) {
    const home = Number(homeValue) || 0;
    const away = Number(awayValue) || 0;
    const total = home + away || 1;
    const homePercent = (home / total) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-white font-medium">{home}{suffix}</span>
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium">{away}{suffix}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                <div
                    className="bg-primary-500 transition-all duration-500"
                    style={{ width: `${homePercent}%` }}
                />
                <div
                    className="bg-secondary-500 transition-all duration-500"
                    style={{ width: `${100 - homePercent}%` }}
                />
            </div>
        </div>
    );
}

function getEventIcon(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('goal') || t.includes('gol')) return '⚽';
    if (t.includes('yellow') || t.includes('giall')) return '🟨';
    if (t.includes('red') || t.includes('ross')) return '🟥';
    if (t.includes('sub') || t.includes('sost')) return '🔄';
    if (t.includes('pen') || t.includes('rigor')) return '⚡';
    if (t.includes('own') || t.includes('auto')) return '🥅';
    if (t.includes('var')) return '📺';
    return '📌';
}
