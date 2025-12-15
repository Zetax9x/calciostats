// API-Football Adapter - Converts API-Football v3 responses to normalized format
// Documentation: https://www.api-football.com/documentation-v3
// To use this adapter, switch the export in adapters/index.ts

import axios from 'axios';
import type {
    NormalizedMatch,
    NormalizedTeam,
    NormalizedStanding,
    NormalizedLeader,
    NormalizedVenue,
    NormalizedLeague,
    NormalizedH2H,
    NormalizedMatchEvent,
    NormalizedMatchStats,
    NormalizedMatchLineups,
    MatchStatus,
    NormalizedTeamBasic,
    NormalizedPlayer
} from '../types/normalized';

// API Configuration - API-Football uses header-based auth
const API_BASE_URL = 'https://v3.football.api-sports.io';
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'x-apisports-key': import.meta.env.VITE_API_FOOTBALL_KEY
    }
});

interface ApiResponse<T> {
    get: string;
    parameters: any;
    errors: any[];
    results: number;
    paging: { current: number; total: number };
    response: T;
}

// ============== HELPER CONVERTERS ==============

function convertStatus(short: string): MatchStatus {
    const s = (short || '').toUpperCase();
    switch (s) {
        case 'TBD':
        case 'NS':
            return 'scheduled';
        case '1H':
        case '2H':
        case 'ET':
        case 'BT':
        case 'P':
        case 'SUSP':
        case 'INT':
        case 'LIVE':
            return 'live';
        case 'HT':
            return 'halftime';
        case 'FT':
        case 'AET':
        case 'PEN':
            return 'finished';
        case 'PST':
            return 'postponed';
        case 'CANC':
        case 'ABD':
        case 'AWD':
        case 'WO':
            return 'cancelled';
        default:
            return 'scheduled';
    }
}

function convertTeamBasic(team: any): NormalizedTeamBasic {
    return {
        id: String(team?.id || ''),
        name: team?.name || 'Unknown',
        logo: team?.logo || ''
    };
}

function convertPlayer(player: any): NormalizedPlayer {
    return {
        id: String(player?.id || ''),
        name: player?.name || 'Unknown',
        firstName: player?.firstname,
        lastName: player?.lastname,
        nationality: player?.nationality,
        position: player?.pos || player?.position,
        number: player?.number,
        age: player?.age,
        height: player?.height,
        weight: player?.weight,
        photo: player?.photo
    };
}

// ============== MAIN CONVERTERS ==============

export function convertMatch(raw: any): NormalizedMatch {
    const fixture = raw.fixture || raw;
    const teams = raw.teams || {};
    const goals = raw.goals || {};
    const score = raw.score || {};
    const league = raw.league || {};

    return {
        id: String(fixture.id),
        status: convertStatus(fixture.status?.short),
        date: fixture.date?.split('T')[0] || '',
        time: fixture.date?.split('T')[1]?.substring(0, 5) || '',
        homeTeam: convertTeamBasic(teams.home),
        awayTeam: convertTeamBasic(teams.away),
        score: {
            home: goals.home ?? null,
            away: goals.away ?? null,
            halftimeHome: score.halftime?.home ?? null,
            halftimeAway: score.halftime?.away ?? null
        },
        league: {
            id: String(league.id || ''),
            name: league.name || '',
            logo: league.logo
        },
        venue: fixture.venue?.id ? {
            id: String(fixture.venue.id),
            name: fixture.venue.name || ''
        } : undefined,
        round: league.round,
        seasonId: league.season ? String(league.season) : undefined
    };
}

export function convertTeam(raw: any): NormalizedTeam {
    const team = raw.team || raw;
    const venue = raw.venue;

    return {
        id: String(team.id),
        name: team.name,
        shortName: team.code,
        logo: team.logo,
        country: team.country,
        founded: team.founded,
        venue: venue ? {
            id: String(venue.id),
            name: venue.name,
            city: venue.city,
            capacity: venue.capacity,
            address: venue.address,
            coordinates: undefined // API-Football doesn't provide coordinates in team endpoint
        } : undefined
    };
}

export function convertStanding(raw: any): NormalizedStanding {
    return {
        position: raw.rank,
        team: convertTeamBasic(raw.team),
        played: raw.all?.played || 0,
        won: raw.all?.win || 0,
        drawn: raw.all?.draw || 0,
        lost: raw.all?.lose || 0,
        goalsFor: raw.all?.goals?.for || 0,
        goalsAgainst: raw.all?.goals?.against || 0,
        goalDifference: raw.goalsDiff || 0,
        points: raw.points || 0,
        form: raw.form,
        description: raw.description
    };
}

export function convertLeader(raw: any): NormalizedLeader {
    const player = raw.player || {};
    const stats = raw.statistics?.[0] || {};

    return {
        position: raw.position || 0,
        player: convertPlayer(player),
        team: convertTeamBasic(stats.team),
        goals: stats.goals?.total || 0,
        assists: stats.goals?.assists,
        matches: stats.games?.appearences
    };
}

export function convertVenue(raw: any): NormalizedVenue {
    return {
        id: String(raw.id),
        name: raw.name,
        city: raw.city,
        country: raw.country,
        capacity: raw.capacity,
        address: raw.address,
        image: raw.image
    };
}

export function convertLeague(raw: any): NormalizedLeague {
    const league = raw.league || raw;
    const seasons = raw.seasons || [];
    const currentSeason = seasons.find((s: any) => s.current === true);

    return {
        id: String(league.id),
        name: league.name,
        country: raw.country?.name || league.country,
        logo: league.logo,
        isCup: league.type === 'Cup',
        currentSeasonId: currentSeason?.year ? String(currentSeason.year) : undefined
    };
}

export function convertH2H(raw: any[], homeTeamId: string, _awayTeamId: string): NormalizedH2H {
    const matches = (raw || []).map(convertMatch);

    let homeWins = 0, awayWins = 0, draws = 0;
    matches.forEach((m: NormalizedMatch) => {
        const isHomeTeamHome = m.homeTeam.id === homeTeamId;
        const homeScore = m.score.home || 0;
        const awayScore = m.score.away || 0;

        if (homeScore > awayScore) {
            if (isHomeTeamHome) homeWins++; else awayWins++;
        } else if (awayScore > homeScore) {
            if (isHomeTeamHome) awayWins++; else homeWins++;
        } else {
            draws++;
        }
    });

    return { matches, homeTeamWins: homeWins, awayTeamWins: awayWins, draws };
}

export function convertMatchEvents(rawEvents: any[]): NormalizedMatchEvent[] {
    return (rawEvents || []).map(e => {
        let type: NormalizedMatchEvent['type'] = 'other';
        const eventType = (e.type || '').toLowerCase();
        const detail = (e.detail || '').toLowerCase();

        if (eventType === 'goal') {
            if (detail.includes('own')) type = 'own_goal';
            else if (detail.includes('penalty')) type = 'penalty';
            else type = 'goal';
        } else if (eventType === 'card') {
            type = detail.includes('red') ? 'red_card' : 'yellow_card';
        } else if (eventType === 'subst') {
            type = 'substitution';
        } else if (eventType === 'var') {
            type = 'var';
        }

        return {
            id: undefined,
            minute: e.time?.elapsed || 0,
            type,
            player: e.player ? convertPlayer(e.player) : undefined,
            assistPlayer: e.assist?.id ? convertPlayer(e.assist) : undefined,
            team: convertTeamBasic(e.team),
            detail: e.detail
        };
    });
}

export function convertMatchStats(rawStats: any[]): NormalizedMatchStats {
    // API-Football returns array with home and away team stats
    const homeStats = rawStats?.[0]?.statistics || [];
    const awayStats = rawStats?.[1]?.statistics || [];

    const getValue = (stats: any[], type: string): number => {
        const stat = stats.find((s: any) => s.type === type);
        const val = stat?.value;
        if (typeof val === 'string' && val.includes('%')) {
            return parseInt(val.replace('%', ''));
        }
        return val || 0;
    };

    return {
        possession: {
            home: getValue(homeStats, 'Ball Possession'),
            away: getValue(awayStats, 'Ball Possession')
        },
        shotsTotal: {
            home: getValue(homeStats, 'Total Shots'),
            away: getValue(awayStats, 'Total Shots')
        },
        shotsOnTarget: {
            home: getValue(homeStats, 'Shots on Goal'),
            away: getValue(awayStats, 'Shots on Goal')
        },
        corners: {
            home: getValue(homeStats, 'Corner Kicks'),
            away: getValue(awayStats, 'Corner Kicks')
        },
        fouls: {
            home: getValue(homeStats, 'Fouls'),
            away: getValue(awayStats, 'Fouls')
        },
        yellowCards: {
            home: getValue(homeStats, 'Yellow Cards'),
            away: getValue(awayStats, 'Yellow Cards')
        },
        redCards: {
            home: getValue(homeStats, 'Red Cards'),
            away: getValue(awayStats, 'Red Cards')
        },
        offsides: {
            home: getValue(homeStats, 'Offsides'),
            away: getValue(awayStats, 'Offsides')
        }
    };
}

export function convertMatchLineups(rawLineups: any[]): NormalizedMatchLineups {
    const convertLineup = (teamData: any) => ({
        formation: teamData?.formation || undefined,
        players: (teamData?.startXI || []).map((p: any) => ({
            player: convertPlayer(p.player),
            position: p.player?.pos || '',
            number: p.player?.number || 0,
            isCaptain: false // API-Football includes this differently
        }))
    });

    return {
        home: convertLineup(rawLineups?.[0]),
        away: convertLineup(rawLineups?.[1])
    };
}

// ============== API FETCH FUNCTIONS ==============

export async function fetchMatch(matchId: string): Promise<NormalizedMatch | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures', {
            params: { id: matchId }
        });
        const match = response.data.response?.[0];
        return match ? convertMatch(match) : null;
    } catch (error) {
        console.error('Error fetching match:', error);
        return null;
    }
}

export async function fetchTeam(teamId: string): Promise<NormalizedTeam | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/teams', {
            params: { id: teamId }
        });
        const team = response.data.response?.[0];
        return team ? convertTeam(team) : null;
    } catch (error) {
        console.error('Error fetching team:', error);
        return null;
    }
}

export async function fetchStandings(seasonId: string, leagueId?: string): Promise<NormalizedStanding[]> {
    try {
        // API-Football uses season year (e.g., "2024") and league_id
        const response = await apiClient.get<ApiResponse<any[]>>('/standings', {
            params: {
                season: seasonId,
                league: leagueId
            }
        });
        const standings = response.data.response?.[0]?.league?.standings?.[0] || [];
        return standings.map(convertStanding);
    } catch (error) {
        console.error('Error fetching standings:', error);
        return [];
    }
}

export async function fetchFixtures(seasonId: string, options?: { teamId?: string; leagueId?: string }): Promise<NormalizedMatch[]> {
    try {
        const params: any = { season: seasonId };
        if (options?.teamId) params.team = options.teamId;
        if (options?.leagueId) params.league = options.leagueId;

        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures', { params });
        return (response.data.response || []).map(convertMatch);
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return [];
    }
}

export async function fetchLeaders(seasonId: string, leagueId: string): Promise<NormalizedLeader[]> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/players/topscorers', {
            params: {
                season: seasonId,
                league: leagueId
            }
        });
        return (response.data.response || []).map((item, index) => ({
            ...convertLeader(item),
            position: index + 1
        }));
    } catch (error) {
        console.error('Error fetching leaders:', error);
        return [];
    }
}

export async function fetchVenue(venueId: string): Promise<NormalizedVenue | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/venues', {
            params: { id: venueId }
        });
        const venue = response.data.response?.[0];
        return venue ? convertVenue(venue) : null;
    } catch (error) {
        console.error('Error fetching venue:', error);
        return null;
    }
}

export async function fetchH2H(team1Id: string, team2Id: string): Promise<NormalizedH2H | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures/headtohead', {
            params: { h2h: `${team1Id}-${team2Id}` }
        });
        return convertH2H(response.data.response || [], team1Id, team2Id);
    } catch (error) {
        console.error('Error fetching H2H:', error);
        return null;
    }
}

export async function fetchMatchEvents(matchId: string): Promise<NormalizedMatchEvent[]> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures/events', {
            params: { fixture: matchId }
        });
        return convertMatchEvents(response.data.response || []);
    } catch (error) {
        console.error('Error fetching match events:', error);
        return [];
    }
}

export async function fetchMatchStats(matchId: string): Promise<NormalizedMatchStats | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures/statistics', {
            params: { fixture: matchId }
        });
        return response.data.response?.length ? convertMatchStats(response.data.response) : null;
    } catch (error) {
        console.error('Error fetching match stats:', error);
        return null;
    }
}

export async function fetchMatchLineups(matchId: string): Promise<NormalizedMatchLineups | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures/lineups', {
            params: { fixture: matchId }
        });
        return response.data.response?.length ? convertMatchLineups(response.data.response) : null;
    } catch (error) {
        console.error('Error fetching match lineups:', error);
        return null;
    }
}

export async function fetchLeagues(countryName: string): Promise<NormalizedLeague[]> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/leagues', {
            params: { country: countryName }
        });
        return (response.data.response || []).map(convertLeague);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        return [];
    }
}

export async function fetchCountryId(countryName: string): Promise<string | null> {
    // API-Football uses country name directly, not ID
    // Return the name as-is for compatibility
    return countryName.toLowerCase() === 'italy' ? 'Italy' : countryName;
}

export async function fetchItalianLeagues(): Promise<NormalizedLeague[]> {
    try {
        return fetchLeagues('Italy');
    } catch (error) {
        console.error('Error fetching Italian leagues:', error);
        return [];
    }
}

export async function fetchLeague(leagueId: string): Promise<NormalizedLeague | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/leagues', {
            params: { id: leagueId }
        });
        const league = response.data.response?.[0];
        return league ? convertLeague(league) : null;
    } catch (error) {
        console.error('Error fetching league:', error);
        return null;
    }
}
