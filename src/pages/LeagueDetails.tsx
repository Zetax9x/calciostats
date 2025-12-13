import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStandings, getFixtures, getLeague, getTopScorers, getTeams, getSquad } from '../api/football';
import type { Standing, Fixture, League, Leader, Team, SquadPlayer, Venue } from '../types';
import { ChevronLeft, Trophy, MapPin, Loader2 } from 'lucide-react';
import { LeagueSidebar } from '../components/LeagueSidebar';
import { motion } from 'framer-motion';

export const LeagueDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [activeSection, setActiveSection] = useState('classifica');

    // Data State
    const [leagueInfo, setLeagueInfo] = useState<League | null>(null);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [squadPlayers, setSquadPlayers] = useState<SquadPlayer[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [activeRound, setActiveRound] = useState<string>('');

    // UI State
    const [loading, setLoading] = useState(true);
    const [fetchingData, setFetchingData] = useState(false);
    const [loadingSquads, setLoadingSquads] = useState(false); // Local loading for players
    const [fetchStatus, setFetchStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Initial League Load
    useEffect(() => {
        const fetchLeagueInfo = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getLeague(id);
                if (!data) throw new Error('League not found');
                setLeagueInfo(data);
            } catch (err: any) {
                console.error("Error in fetchLeagueInfo:", err);
                setError(err.message || 'Error fetching league');
            } finally {
                setLoading(false);
            }
        };
        fetchLeagueInfo();
    }, [id]);

    // Data Fetching based on Active Section
    const fetchingSquadsRef = useRef(false);

    useEffect(() => {
        if (!leagueInfo) return;
        const currentSeasonId = leagueInfo.id_current_season;
        if (!currentSeasonId) return;

        const fetchData = async () => {
            // For players, we handle loading manually to show progress.
            // For others, use the generic fetchingData overlay.
            if (activeSection !== 'players') {
                setFetchingData(true);
            }

            try {
                // Fetch Standings
                if (activeSection === 'classifica' && standings.length === 0) {
                    const data = await getStandings(currentSeasonId);
                    setStandings(data || []);
                }
                // Fetch Fixtures 
                else if ((activeSection === 'partite' || activeSection === 'risultati') && fixtures.length === 0) {
                    const data = await getFixtures(leagueInfo.id, currentSeasonId);
                    setFixtures(data || []);
                }
                // Fetch Leaders (Top Scorers)
                else if (activeSection === 'leaders' && leaders.length === 0) {
                    console.log("Fetching leaders for:", currentSeasonId);
                    let data = await getTopScorers(currentSeasonId);
                    setLeaders(data || []);
                }
                // Fetch Teams (for Venues)
                else if (activeSection === 'venues' && teams.length === 0) {
                    const data = await getTeams(currentSeasonId);
                    setTeams(data || []);
                }
                // Fetch Players (Squads for all teams)
                else if (activeSection === 'players' && squadPlayers.length === 0) {
                    if (fetchingSquadsRef.current) return;
                    fetchingSquadsRef.current = true;
                    setLoadingSquads(true);
                    setLoadingProgress(0);

                    try {
                        let teamsToFetch: { id: string, name: string, img: string }[] = [];

                        // Always prefer Standings for the source of truth for teams list
                        if (standings.length > 0) {
                            teamsToFetch = standings.map(s => ({
                                id: s.team_id,
                                name: s.team_name,
                                img: s.team_badge || s.img || '',
                            }));
                        } else {
                            // Fetch standings if not available
                            console.log("Fetching standings to get team list...");
                            const stData = await getStandings(currentSeasonId);
                            setStandings(stData || []);
                            teamsToFetch = (stData || []).map(s => ({
                                id: s.team_id,
                                name: s.team_name,
                                img: s.team_badge || s.img || '',
                            }));
                        }

                        console.log("Fetching squads for", teamsToFetch.length, "teams...");

                        // Sequential fetching to avoid rate limits


                        // Batch fetching to improve speed while respecting partial limits
                        const BATCH_SIZE = 5;
                        for (let i = 0; i < teamsToFetch.length; i += BATCH_SIZE) {
                            const batch = teamsToFetch.slice(i, i + BATCH_SIZE);

                            // Update progress message
                            setFetchStatus(`Caricamento giocatori: ${i + 1}-${Math.min(i + BATCH_SIZE, teamsToFetch.length)} di ${teamsToFetch.length}...`);

                            await Promise.all(batch.map(async (team) => {
                                try {
                                    // Don't pass currentSeasonId to get the full current squad
                                    const squad = await getSquad(team.id);

                                    if (squad && squad.length > 0) {
                                        const playersWithTeam = squad.map(p => ({
                                            ...p,
                                            team_id: team.id,
                                            team_name: team.name,
                                            team_img: team.img,
                                        }));

                                        setSquadPlayers(prev => {
                                            const existingKeys = new Set(prev.map(p => `${p.id}-${p.team_id}`));
                                            const uniqueNewPlayers = playersWithTeam.filter(p => {
                                                if (existingKeys.has(`${p.id}-${p.team_id}`)) return false;
                                                const hasName = p.player.common_name || p.player.name || p.player.firstname || p.player.lastname;
                                                return !!hasName;
                                            });
                                            return [...prev, ...uniqueNewPlayers];
                                        });
                                    }
                                } catch (e) {
                                    console.error(`Failed to fetch squad for team ${team.id}`, e);
                                }
                            }));

                            setLoadingProgress(Math.round((Math.min(i + BATCH_SIZE, teamsToFetch.length) / teamsToFetch.length) * 100));
                        }
                    } finally {
                        setLoadingSquads(false);
                        fetchingSquadsRef.current = false;
                        setFetchStatus('Caricamento completato');

                    }
                }

            } catch (err) {
                console.error(`Error fetching ${activeSection}: `, err);
            } finally {
                setFetchingData(false);
            }
        };
        fetchData();
    }, [activeSection, leagueInfo, standings, fixtures, leaders.length, teams.length]);

    // Derived Logic for Fixtures (Group & Sort)
    const { nextFixtures, pastFixtures } = useMemo(() => {
        try {
            const now = new Date();
            const safeDate = (d: string) => new Date(d).getTime();
            const getDate = (f: Fixture) => f.start_date || f.date_match || f.time?.date || '';

            const next = fixtures
                .filter(f => getDate(f) && new Date(getDate(f)) >= now)
                .sort((a, b) => safeDate(getDate(a)) - safeDate(getDate(b)));

            const past = fixtures
                .filter(f => getDate(f) && new Date(getDate(f)) < now)
                .sort((a, b) => safeDate(getDate(b)) - safeDate(getDate(a)));

            return { nextFixtures: next, pastFixtures: past };
        } catch (e) {
            console.error("Error processing fixtures dates:", e);
            return { nextFixtures: [], pastFixtures: [] };
        }
    }, [fixtures]);

    // Helper for Round Selection
    useEffect(() => {
        setActiveRound('');
    }, [activeSection]);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin relative" />
                </div>
                <p className="text-dark-400 text-sm">Caricamento campionato...</p>
            </div>
        );
    }

    if (error || !leagueInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="glass-card p-10 text-center max-w-md">
                    <h2 className="text-xl font-semibold text-white mb-3">{error || 'Campionato non trovato'}</h2>
                    <Link to="/" className="text-primary-400 hover:text-primary-300 font-medium">
                        ← Torna ai Campionati
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Back Link */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Campionati</span>
                </Link>
            </motion.div>

            {/* League Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 relative overflow-hidden"
            >
                {/* Gradient Orb */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 p-3">
                        <img
                            src={leagueInfo.img}
                            alt={leagueInfo.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{leagueInfo.name}</h1>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm">
                            <span className="text-dark-500">Stagione {leagueInfo.id_current_season}</span>
                            {leagueInfo.is_cup === true && (
                                <span className="badge-secondary">COPPA</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Layout: Sidebar + Content */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Sidebar */}
                <LeagueSidebar activeSection={activeSection} onSelect={setActiveSection} />

                <div className="flex-grow w-full min-h-[400px]">
                    {fetchingData && activeSection !== 'players' ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-10 h-10 text-primary-500 animate-spin relative" />
                            </div>
                            <p className="text-dark-400 text-sm">Caricamento dati...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* STANDINGS */}
                            {activeSection === 'classifica' && (
                                standings.length > 0 ? (
                                    <div className="overflow-x-auto glass-card p-0">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-dark-800/50 uppercase text-xs tracking-wider">
                                                <tr className="border-b border-white/10 text-dark-400">
                                                    <th className="py-3.5 pl-4 w-12">#</th>
                                                    <th className="py-3.5 px-2">Squadra</th>
                                                    <th className="py-3.5 text-center w-10 hidden sm:table-cell">PG</th>
                                                    <th className="py-3.5 text-center w-10 hidden sm:table-cell">V</th>
                                                    <th className="py-3.5 text-center w-10 hidden sm:table-cell">N</th>
                                                    <th className="py-3.5 text-center w-10 hidden sm:table-cell">P</th>
                                                    <th className="py-3.5 text-center w-10 hidden sm:table-cell">GF</th>
                                                    <th className="py-3.5 text-center w-10 hidden sm:table-cell">GS</th>
                                                    <th className="py-3.5 text-center w-10">DR</th>
                                                    <th className="py-3.5 text-center w-14 font-bold text-white pr-4">Pt</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {standings.map((team) => {
                                                    const fullStatus = ((team.status || "") + " " + (team.result || "")).toLowerCase();
                                                    let zoneColor = "border-l-4 border-l-transparent hover:bg-white/5";

                                                    if (fullStatus) {
                                                        if (fullStatus.includes("champions") || fullStatus.includes("promotion")) {
                                                            if (fullStatus.includes("playoff") || fullStatus.includes("play-off") || fullStatus.includes("play off") || fullStatus.includes("qualification")) {
                                                                zoneColor = "border-l-4 border-l-blue-400 bg-blue-500/25";
                                                            } else {
                                                                zoneColor = "border-l-4 border-l-primary-500 bg-primary-500/25";
                                                            }
                                                        } else if (fullStatus.includes("europa") || fullStatus.includes("conference")) {
                                                            zoneColor = "border-l-4 border-l-secondary-400 bg-secondary-500/25";
                                                        } else if (fullStatus.includes("relegation")) {
                                                            if (fullStatus.includes("playoff") || fullStatus.includes("play-off") || fullStatus.includes("play off")) {
                                                                zoneColor = "border-l-4 border-l-orange-400 bg-orange-500/25";
                                                            } else {
                                                                zoneColor = "border-l-4 border-l-red-400 bg-red-500/25";
                                                            }
                                                        }
                                                    }

                                                    return (
                                                        <tr key={team.team_id} className={`transition-colors ${zoneColor}`}>
                                                            <td className="py-3 pl-4 font-medium text-dark-500">{team.overall?.position}</td>
                                                            <td className="py-3 px-2 font-semibold text-white flex items-center gap-3">
                                                                <img
                                                                    src={team.team_badge || team.img || `https://cdn.soccersapi.com/images/soccer/teams/100/${team.team_id}.png`}
                                                                    alt={team.team_name}
                                                                    className="w-7 h-7 object-contain bg-dark-700 rounded-lg p-0.5"
                                                                    onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                                                                />
                                                                <Link to={`/team/${team.team_id}`} className="hover:text-primary-400 transition-colors">
                                                                    {team.team_name}
                                                                </Link>
                                                            </td>
                                                            <td className="py-3 text-center text-dark-400 hidden sm:table-cell">{team.overall?.games_played}</td>
                                                            <td className="py-3 text-center text-dark-400 hidden sm:table-cell">{team.overall?.won}</td>
                                                            <td className="py-3 text-center text-dark-400 hidden sm:table-cell">{team.overall?.draw}</td>
                                                            <td className="py-3 text-center text-dark-400 hidden sm:table-cell">{team.overall?.lost}</td>
                                                            <td className="py-3 text-center text-dark-400 hidden sm:table-cell">{team.overall?.goals_scored}</td>
                                                            <td className="py-3 text-center text-dark-400 hidden sm:table-cell">{team.overall?.goals_against}</td>
                                                            <td className="py-3 text-center text-dark-400">{team.overall?.goals_diff}</td>
                                                            <td className="py-3 text-center font-bold text-gradient pr-4">{team.overall?.points}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-dark-500">Nessuna classifica disponibile.</div>
                                )
                            )}

                            {/* FIXTURES & RESULTS */}
                            {
                                (activeSection === 'partite' || activeSection === 'risultati') && (
                                    (() => {
                                        const list = activeSection === 'partite' ? nextFixtures : pastFixtures;
                                        if (!list || list.length === 0) {
                                            return (
                                                <div className="text-center py-16 card-soft border-dashed">
                                                    <p className="text-surface-500">Nessuna partita disponibile per {activeSection}.</p>
                                                </div>
                                            );
                                        }

                                        const grouped = list.reduce((acc, fixture) => {
                                            const roundLabel = fixture.round_name || (fixture.round_id ? `Giornata ${fixture.round_id}` : "Altre Partite");
                                            if (!acc[roundLabel]) acc[roundLabel] = [];
                                            acc[roundLabel].push(fixture);
                                            return acc;
                                        }, {} as Record<string, Fixture[]>);

                                        const rounds = Object.keys(grouped).sort((a, b) => {
                                            const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                            const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                            return numA - numB;
                                        });

                                        const currentRound = activeRound || (activeSection === 'risultati' ? rounds[rounds.length - 1] : rounds[0]);

                                        if (!currentRound || !grouped[currentRound]) return null;

                                        return (
                                            <div className="space-y-6">
                                                {/* Round Selector */}
                                                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                                    {rounds.map(round => (
                                                        <button
                                                            key={round}
                                                            onClick={() => setActiveRound(round)}
                                                            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${currentRound === round
                                                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-sm'
                                                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white border border-white/10'
                                                                }`}
                                                        >
                                                            {round}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Matches */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                    {grouped[currentRound].map((fixture) => {
                                                        const homeName = fixture.teams?.home?.name || fixture.home_team_name || "Squadra Casa";
                                                        const awayName = fixture.teams?.away?.name || fixture.away_team_name || "Squadra Ospite";
                                                        const homeScore = fixture.scores?.home_score ?? fixture.home_score;
                                                        const awayScore = fixture.scores?.away_score ?? fixture.away_score;

                                                        let timeDisplay = fixture.time?.time || fixture.start_time || "";
                                                        if (timeDisplay && timeDisplay.split(':').length === 3) timeDisplay = timeDisplay.split(':').slice(0, 2).join(':');

                                                        const dateRaw = fixture.start_date || fixture.date_match || fixture.time?.date || '';
                                                        let dateDisplay = "";
                                                        if (dateRaw) {
                                                            try {
                                                                const d = new Date(dateRaw);
                                                                dateDisplay = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(d);
                                                            } catch (e) { }
                                                        }

                                                        return (
                                                            <div key={fixture.id} className="glass-card p-4 flex items-center justify-between group relative overflow-hidden">
                                                                <div className="absolute top-0 left-0 bg-dark-700 px-2 py-0.5 rounded-br-lg text-[10px] text-dark-400 font-mono">
                                                                    {dateDisplay}
                                                                </div>
                                                                <div className="flex-1 text-right flex items-center justify-end gap-3 mt-2 sm:mt-0">
                                                                    <span className="font-medium text-dark-300 group-hover:text-white transition-colors line-clamp-1 text-sm">{homeName}</span>
                                                                    {fixture.teams?.home?.img && (
                                                                        <img src={fixture.teams.home.img} alt={homeName} className="w-7 h-7 object-contain" />
                                                                    )}
                                                                </div>
                                                                <div className="mx-3 flex flex-col items-center justify-center min-w-[65px] bg-dark-800 rounded-xl py-2 px-2 mt-2 sm:mt-0">
                                                                    {activeSection === 'risultati' ? (
                                                                        <span className="text-lg font-bold text-white tracking-wider whitespace-nowrap">
                                                                            {homeScore} - {awayScore}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-lg font-bold text-primary-400 whitespace-nowrap">
                                                                            {timeDisplay}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 text-left flex items-center justify-start gap-3 mt-2 sm:mt-0">
                                                                    {fixture.teams?.away?.img && (
                                                                        <img src={fixture.teams.away.img} alt={awayName} className="w-7 h-7 object-contain" />
                                                                    )}
                                                                    <span className="font-medium text-dark-300 group-hover:text-white transition-colors line-clamp-1 text-sm">{awayName}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()
                                )
                            }

                            {/* LEADERS (Top Scorers) */}
                            {
                                activeSection === 'leaders' && (
                                    leaders.length > 0 ? (
                                        <div className="overflow-x-auto glass-card p-0">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-dark-800/50 uppercase text-xs tracking-wider">
                                                    <tr className="border-b border-white/10 text-dark-400">
                                                        <th className="py-3.5 pl-4 w-12">#</th>
                                                        <th className="py-3.5 px-2">Giocatore</th>
                                                        <th className="py-3.5 px-2 hidden sm:table-cell">Squadra</th>
                                                        <th className="py-3.5 pr-4 text-right">Gol</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {leaders.slice(0, 10).map((player, idx) => (
                                                        <tr key={player.player.id || idx} className="hover:bg-white/5 transition-colors">
                                                            <td className="py-3 pl-4 font-medium text-dark-500">{player.pos || idx + 1}</td>
                                                            <td className="py-3 px-2 font-semibold text-white">{player.player.name}</td>
                                                            <td className="py-3 px-2 text-dark-400 hidden sm:table-cell">
                                                                <div className="flex items-center gap-2">
                                                                    <img
                                                                        src={`https://cdn.soccersapi.com/images/soccer/teams/100/${player.team.id}.png`}
                                                                        alt={player.team.name}
                                                                        className="w-6 h-6 object-contain bg-dark-700 rounded-lg p-0.5"
                                                                    />
                                                                    {player.team.name}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 pr-4 text-right font-bold text-gradient">
                                                                {player.goals.overall}
                                                                {player.penalties > 0 && <span className="text-dark-500 text-sm font-normal ml-1">({player.penalties})</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 glass-card border-dashed">
                                            <Trophy className="w-12 h-12 text-dark-600 mb-2" />
                                            <p className="text-dark-400">Dati marcatori non disponibili.</p>
                                        </div>
                                    )
                                )
                            }

                            {/* VENUES */}
                            {activeSection === 'venues' && (
                                <VenueGrid standings={standings} />
                            )}


                            {/* PLAYERS (Squads) - Tabbed & List View */}
                            {
                                activeSection === 'players' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                                                    <Trophy className="w-6 h-6" />
                                                </div>
                                                <h2 className="text-xl font-bold text-white">Giocatori & Rose</h2>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-400">{squadPlayers.length} giocatori mostrati</div>

                                                <div className="text-xs text-gray-600 font-mono">
                                                    Teams: {standings.length}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {loadingSquads && (
                                            <div className="space-y-2 mb-6">
                                                <div className="flex justify-between text-sm text-gray-400">
                                                    <span>{fetchStatus || 'Caricamento rose in corso...'}</span>
                                                    <span>{Math.min(loadingProgress, 100)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                                        style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Role Filter Tabs */}
                                        <div className="flex gap-2 p-1 bg-gray-900 rounded-lg overflow-x-auto">
                                            {[
                                                { id: 'all', label: 'Tutti' },
                                                { id: 'Goalkeeper', label: 'Portieri' },
                                                { id: 'Defender', label: 'Difensori' },
                                                { id: 'Midfielder', label: 'Centrocampisti' },
                                                { id: 'Attacker', label: 'Attaccanti' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setSelectedRole(tab.id)}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${selectedRole === tab.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Players List */}
                                        <div className="space-y-2">
                                            {squadPlayers.length > 0 ? (
                                                squadPlayers
                                                    .filter(p => {
                                                        // 1. Role Filtering
                                                        if (selectedRole === 'all') return true;

                                                        // If role is specific, exclude players with NO position
                                                        if (!p.position) return false;

                                                        let posName = "";
                                                        if (typeof p.position === 'string') {
                                                            const map: Record<string, string> = {
                                                                'G': 'Goalkeeper',
                                                                'D': 'Defender',
                                                                'M': 'Midfielder',
                                                                'F': 'Attacker',
                                                                'A': 'Attacker'
                                                            };
                                                            posName = map[p.position] || p.position;
                                                        } else {
                                                            posName = p.position?.name || "";
                                                        }

                                                        return posName.includes(selectedRole) ||
                                                            (selectedRole === 'Attacker' && (posName.includes('Forward') || posName.includes('Striker')));
                                                    })
                                                    .sort((a, b) => {
                                                        // 2. Sorting Logic
                                                        const hasLastNameA = !!a.player.lastname;
                                                        const hasLastNameB = !!b.player.lastname;

                                                        // If one has lastname and other doesn't, prioritize lastname
                                                        if (hasLastNameA && !hasLastNameB) return -1;
                                                        if (!hasLastNameA && hasLastNameB) return 1;

                                                        // If both have lastname, sort by lastname
                                                        if (hasLastNameA && hasLastNameB) {
                                                            return (a.player.lastname || "").localeCompare(b.player.lastname || "");
                                                        }

                                                        // If neither has lastname, sort by common_name (which is effectively the "name" display fallback)
                                                        const nameA = a.player.common_name || a.player.name || "";
                                                        const nameB = b.player.common_name || b.player.name || "";
                                                        return nameA.localeCompare(nameB);
                                                    })
                                                    .map((player, idx) => {
                                                        // 3. Name Display Logic
                                                        let displayName = "";
                                                        if (player.player.firstname && player.player.lastname) {
                                                            displayName = `${player.player.lastname || ""} ${player.player.firstname || ""}`.trim();
                                                        } else {
                                                            displayName = player.player.common_name;
                                                        }

                                                        return (
                                                            <Link
                                                                key={`${player.id}-${idx}`}
                                                                to={`/player/${player.player.id}`}
                                                                className="group bg-gray-900/40 border border-gray-800 p-3 rounded-lg flex items-center gap-4 hover:bg-gray-800/80 transition-colors"
                                                            >
                                                                {/* Avatar */}
                                                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-700">
                                                                    {player.player.img ? (
                                                                        <img src={player.player.img} alt={displayName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-sm font-bold text-gray-500">{player.shirt_number || '-'}</span>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                    <div className="overflow-hidden">
                                                                        <p className="font-bold text-white truncate">{displayName}</p>
                                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                            {player.position && (
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(typeof player.position === 'string' && player.position === 'G') || (typeof player.position !== 'string' && player.position?.name?.includes('Goalkeeper')) ? 'bg-yellow-500/20 text-yellow-500' :
                                                                                    (typeof player.position === 'string' && player.position === 'D') || (typeof player.position !== 'string' && player.position?.name?.includes('Defender')) ? 'bg-blue-500/20 text-blue-500' :
                                                                                        (typeof player.position === 'string' && player.position === 'M') || (typeof player.position !== 'string' && player.position?.name?.includes('Midfielder')) ? 'bg-green-500/20 text-green-500' :
                                                                                            'bg-red-500/20 text-red-500' // Attacker
                                                                                    }`}>
                                                                                    {(() => {
                                                                                        const pos = typeof player.position === 'string' ? player.position : player.position?.name;
                                                                                        if (pos === 'G' || pos?.includes('Goalkeeper')) return 'Portiere';
                                                                                        if (pos === 'D' || pos?.includes('Defender')) return 'Difensore';
                                                                                        if (pos === 'M' || pos?.includes('Midfielder')) return 'Centrocampista';
                                                                                        if (pos === 'F' || pos === 'A' || pos?.includes('Forward') || pos?.includes('Attacker')) return 'Attaccante';
                                                                                        return pos;
                                                                                    })()}
                                                                                </span>
                                                                            )}
                                                                            {player.shirt_number && <span>#{player.shirt_number}</span>}
                                                                        </div>
                                                                    </div>

                                                                    {/* Team */}
                                                                    <Link to={`/team/${player.team_id}`} className="flex items-center gap-2 shrink-0 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 hover:bg-black/40 transition-colors">
                                                                        {player.team_img && <img src={player.team_img} className="w-5 h-5 object-contain" />}
                                                                        <span className="text-xs text-gray-300 font-medium truncate max-w-[150px]">{player.team_name}</span>
                                                                    </Link>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })
                                            ) : (
                                                !loadingSquads && (
                                                    <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed text-gray-500">
                                                        <p>Nessun giocatore trovato.</p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            }

                            {/* PLACEHOLDERS FOR NEW SECTIONS */}
                            {
                                ['stats', 'tv', 'media'].includes(activeSection) && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed text-gray-500">
                                        <div className="p-4 bg-gray-800 rounded-full mb-4">
                                            <div className="w-8 h-8 animate-pulse bg-gray-700 rounded-full"></div>
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-1">Coming Soon</h3>
                                        <p>La sezione {activeSection} è in fase di sviluppo.</p>
                                    </div>
                                )
                            }

                        </div >
                    )}
                </div >
            </div >
        </div >
    );
}

// Component to display Venue Grid based on Standings
function VenueGrid({ standings }: { standings: Standing[] }) {
    if (standings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                <MapPin className="w-12 h-12 text-gray-600 mb-2" />
                <p className="text-gray-400">Classifica non disponibile, impossibile mostrare gli stadi.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                    <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Squadre & Stadi ({standings.length})</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {standings.map((standing) => (
                    <VenueCard
                        key={standing.team_id}
                        teamId={standing.team_id}
                        teamName={standing.team_name}
                        teamImg={standing.team_badge || standing.img || `https://cdn.soccersapi.com/images/soccer/teams/100/${standing.team_id}.png`}
                    />
                ))}
            </div>
        </div>
    );
}

// Individual Card that handles its own fetching chain
function VenueCard({ teamId, teamName, teamImg }: { teamId: string, teamName: string, teamImg: string }) {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        let mounted = true;

        // Avoid re-fetching if already fetched
        if (fetched) return;

        const fetchData = async () => {
            try {
                // 1. Fetch Team Details specifically to get venue_id
                const teamData = await import('../api/football').then(m => m.getTeam(teamId));

                if (mounted && teamData && teamData.venue_id) {
                    // 2. Fetch Venue Details
                    const venueData = await import('../api/football').then(m => m.getVenue(teamData.venue_id!));
                    if (mounted && venueData) {
                        setVenue(venueData);
                    }
                }
            } catch (e) {
                console.error(`Error fetching venue for team ${teamId}`, e);
                if (mounted) setError(true);
            } finally {
                if (mounted) {
                    setLoading(false);
                    setFetched(true);
                }
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [teamId, fetched]);

    return (
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl hover:border-gray-600 transition-all flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                <img
                    src={teamImg}
                    alt={teamName}
                    className="w-10 h-10 object-contain bg-white/5 rounded-full p-1"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="font-bold text-white">{teamName}</span>
            </div>
            <div>
                {loading ? (
                    <p className="text-gray-500 italic text-sm animate-pulse">Caricamento stadio...</p>
                ) : error ? (
                    <p className="text-red-500 text-sm">Errore nel caricamento dello stadio.</p>
                ) : venue ? (
                    <>
                        {venue.coordinates ? (
                            <a
                                href={`https://www.google.com/maps?q=${venue.coordinates}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 font-medium hover:text-emerald-300 hover:underline flex items-center gap-1 group/link"
                                title="Apri su Google Maps"
                            >
                                <span className="truncate">{venue.name}</span>
                                <MapPin className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                            </a>
                        ) : (
                            <p className="text-emerald-400 font-medium truncate">{venue.name}</p>
                        )}
                        <p className="text-gray-500 text-sm truncate">{venue.city}</p>
                        {venue.capacity && <p className="text-gray-600 text-xs mt-1">Cap: {venue.capacity.toLocaleString()}</p>}
                    </>
                ) : (
                    <p className="text-gray-500 italic text-sm">Nessuno stadio assegnato o dettagli non disponibili.</p>
                )}
            </div>
        </div>
    );
}
