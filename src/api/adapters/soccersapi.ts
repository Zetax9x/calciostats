// SoccersAPI Adapter - Converts SoccersAPI responses to normalized format
// CHANGE THIS FILE when switching to a different API provider

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

// API Configuration
const API_BASE_URL = '/api';
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    params: {
        user: import.meta.env.VITE_SOCCERSAPI_USER,
        token: import.meta.env.VITE_SOCCERSAPI_TOKEN
    }
});

interface ApiResponse<T> {
    data: T;
    meta?: any;
}

// ============== HELPER CONVERTERS ==============

function convertStatus(status: number): MatchStatus {
    switch (status) {
        case 0: return 'scheduled';
        case 1: return 'live';
        case 2: return 'halftime';
        case 3: return 'finished';
        case 4: return 'postponed';
        case 5: return 'cancelled';
        default: return 'scheduled';
    }
}

function convertTeamBasic(team: any): NormalizedTeamBasic {
    return {
        id: String(team?.id || ''),
        name: team?.name || 'Unknown',
        logo: team?.img || `https://cdn.soccersapi.com/images/soccer/teams/100/${team?.id}.png`
    };
}

function convertPlayer(player: any): NormalizedPlayer {
    return {
        id: String(player?.id || ''),
        name: player?.name || player?.common_name || 'Unknown',
        firstName: player?.firstname,
        lastName: player?.lastname,
        nationality: player?.country?.name,
        position: player?.position,
        photo: player?.img
    };
}

// ============== MAIN CONVERTERS ==============

export function convertMatch(raw: any): NormalizedMatch {
    return {
        id: String(raw.id),
        status: convertStatus(raw.status),
        date: raw.time?.date || raw.startdate?.split(' ')[0] || '',
        time: raw.time?.time || raw.startdate?.split(' ')[1]?.substring(0, 5) || '',
        homeTeam: convertTeamBasic(raw.teams?.home || { id: raw.home_team_id, name: raw.home_team_name }),
        awayTeam: convertTeamBasic(raw.teams?.away || { id: raw.away_team_id, name: raw.away_team_name }),
        score: {
            home: raw.scores?.home_score ?? raw.home_score ?? null,
            away: raw.scores?.away_score ?? raw.away_score ?? null,
            halftimeHome: raw.scores?.ht_score ? parseInt(raw.scores.ht_score.split('-')[0]) : null,
            halftimeAway: raw.scores?.ht_score ? parseInt(raw.scores.ht_score.split('-')[1]) : null
        },
        league: {
            id: String(raw.league?.id || raw.league_id || ''),
            name: raw.league?.name || raw.league_name || '',
            logo: raw.league?.img
        },
        venue: raw.venue_id ? { id: String(raw.venue_id), name: raw.venue_name || '' } : undefined,
        round: raw.round_name || raw.round?.name,
        seasonId: raw.season_id ? String(raw.season_id) : undefined
    };
}

export function convertTeam(raw: any): NormalizedTeam {
    return {
        id: String(raw.id),
        name: raw.name,
        shortName: raw.short_name,
        logo: raw.img || `https://cdn.soccersapi.com/images/soccer/teams/100/${raw.id}.png`,
        country: raw.country?.name,
        founded: raw.founded ? parseInt(raw.founded) : undefined,
        venue: raw.venue ? {
            id: String(raw.venue.id),
            name: raw.venue.name,
            city: raw.venue.city,
            capacity: raw.venue.capacity ? parseInt(raw.venue.capacity) : undefined,
            address: raw.venue.address,
            coordinates: raw.venue.coordinates ? {
                lat: raw.venue.coordinates.lat,
                lng: raw.venue.coordinates.long || raw.venue.coordinates.lng
            } : undefined
        } : undefined,
        coach: raw.coach ? {
            id: String(raw.coach.id),
            name: raw.coach.name,
            nationality: raw.coach.country?.name
        } : undefined
    };
}

export function convertStanding(raw: any): NormalizedStanding {
    return {
        position: raw.position || raw.rank,
        team: convertTeamBasic(raw.team || { id: raw.team_id, name: raw.team_name }),
        played: raw.played || raw.overall?.games_played || 0,
        won: raw.won || raw.overall?.won || 0,
        drawn: raw.draw || raw.overall?.draw || 0,
        lost: raw.lost || raw.overall?.lost || 0,
        goalsFor: raw.goals_for || raw.overall?.goals_for || 0,
        goalsAgainst: raw.goals_against || raw.overall?.goals_against || 0,
        goalDifference: raw.goal_diff || (raw.goals_for - raw.goals_against) || 0,
        points: raw.points || raw.overall?.points || 0,
        form: raw.recent_form,
        description: raw.description
    };
}

export function convertLeader(raw: any): NormalizedLeader {
    return {
        position: raw.position || raw.rank || 0,
        player: convertPlayer(raw.player || raw),
        team: convertTeamBasic(raw.team || { id: raw.team_id, name: raw.team_name }),
        goals: raw.goals?.overall || raw.goals || 0,
        assists: raw.assists,
        matches: raw.matches || raw.games_played
    };
}

export function convertVenue(raw: any): NormalizedVenue {
    return {
        id: String(raw.id),
        name: raw.name,
        city: raw.city,
        country: raw.country?.name,
        capacity: raw.capacity ? parseInt(raw.capacity) : undefined,
        address: raw.address,
        coordinates: raw.coordinates ? {
            lat: raw.coordinates.lat,
            lng: raw.coordinates.long || raw.coordinates.lng
        } : undefined,
        image: raw.img
    };
}

export function convertLeague(raw: any): NormalizedLeague {
    return {
        id: String(raw.id),
        name: raw.name,
        country: raw.country?.name,
        logo: raw.img,
        isCup: raw.is_cup === true || raw.is_cup === 1,
        currentSeasonId: raw.current_season_id ? String(raw.current_season_id) : undefined
    };
}

export function convertH2H(raw: any, homeTeamId: string, _awayTeamId: string): NormalizedH2H {
    const matches = (raw.h2h || []).map(convertMatch);

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
    return rawEvents.map(e => {
        let type: NormalizedMatchEvent['type'] = 'other';
        const eventType = (e.type || e.event_type || '').toLowerCase();

        if (eventType.includes('goal') && eventType.includes('own')) type = 'own_goal';
        else if (eventType.includes('penalty') || eventType.includes('pen')) type = 'penalty';
        else if (eventType.includes('goal')) type = 'goal';
        else if (eventType.includes('yellow')) type = 'yellow_card';
        else if (eventType.includes('red')) type = 'red_card';
        else if (eventType.includes('sub')) type = 'substitution';
        else if (eventType.includes('var')) type = 'var';

        return {
            id: e.id ? String(e.id) : undefined,
            minute: e.minute || 0,
            type,
            player: e.player ? convertPlayer(e.player) : undefined,
            team: convertTeamBasic(e.team || { id: e.team_id, name: e.team_name }),
            detail: e.detail || e.comment
        };
    });
}

export function convertMatchStats(raw: any): NormalizedMatchStats {
    return {
        possession: { home: raw.possession?.home || 50, away: raw.possession?.away || 50 },
        shotsTotal: raw.shots_total ? { home: raw.shots_total.home, away: raw.shots_total.away } : undefined,
        shotsOnTarget: raw.shots_on_target ? { home: raw.shots_on_target.home, away: raw.shots_on_target.away } : undefined,
        corners: raw.corners ? { home: raw.corners.home, away: raw.corners.away } : undefined,
        fouls: raw.fouls ? { home: raw.fouls.home, away: raw.fouls.away } : undefined,
        yellowCards: raw.yellow_cards ? { home: raw.yellow_cards.home, away: raw.yellow_cards.away } : undefined,
        redCards: raw.red_cards ? { home: raw.red_cards.home, away: raw.red_cards.away } : undefined,
        offsides: raw.offsides ? { home: raw.offsides.home, away: raw.offsides.away } : undefined
    };
}

export function convertMatchLineups(raw: any): NormalizedMatchLineups {
    const convertLineup = (teamData: any) => ({
        formation: teamData?.formation || undefined,
        players: (teamData?.squad || []).map((p: any, idx: number) => ({
            player: convertPlayer(p.player || p),
            position: p.position || '',
            number: parseInt(p.number) || idx + 1,
            isCaptain: p.captain === true || p.captain === '1'
        }))
    });

    return {
        home: convertLineup(raw.home),
        away: convertLineup(raw.away)
    };
}

// ============== API FETCH FUNCTIONS ==============

export async function fetchMatch(matchId: string): Promise<NormalizedMatch | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/fixtures', {
            params: { id: matchId, t: 'info' }
        });
        return response.data.data ? convertMatch(response.data.data) : null;
    } catch (error) {
        console.error('Error fetching match:', error);
        return null;
    }
}

export async function fetchTeam(teamId: string): Promise<NormalizedTeam | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/teams', {
            params: { id: teamId, t: 'info' }
        });
        return response.data.data ? convertTeam(response.data.data) : null;
    } catch (error) {
        console.error('Error fetching team:', error);
        return null;
    }
}

export async function fetchStandings(seasonId: string): Promise<NormalizedStanding[]> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/standings', {
            params: { season_id: seasonId, t: 'total' }
        });
        const data = response.data.data;
        if (Array.isArray(data)) {
            return data.map(convertStanding);
        }
        return [];
    } catch (error) {
        console.error('Error fetching standings:', error);
        return [];
    }
}

export async function fetchFixtures(seasonId: string, options?: { teamId?: string }): Promise<NormalizedMatch[]> {
    try {
        const params: any = { season_id: seasonId, t: 'season' };
        if (options?.teamId) params.team_id = options.teamId;

        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures', { params });
        return (response.data.data || []).map(convertMatch);
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return [];
    }
}

export async function fetchLeaders(seasonId: string): Promise<NormalizedLeader[]> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/leaders', {
            params: { season_id: seasonId, t: 'topscorers' }
        });
        return (response.data.data || []).map(convertLeader);
    } catch (error) {
        console.error('Error fetching leaders:', error);
        return [];
    }
}

export async function fetchVenue(venueId: string): Promise<NormalizedVenue | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/venues', {
            params: { id: venueId, t: 'info' }
        });
        return response.data.data ? convertVenue(response.data.data) : null;
    } catch (error) {
        console.error('Error fetching venue:', error);
        return null;
    }
}

export async function fetchH2H(team1Id: string, team2Id: string): Promise<NormalizedH2H | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/h2h', {
            params: { team1: team1Id, team2: team2Id, t: 'teams' }
        });
        return response.data.data ? convertH2H(response.data.data, team1Id, team2Id) : null;
    } catch (error) {
        console.error('Error fetching H2H:', error);
        return null;
    }
}

export async function fetchMatchEvents(matchId: string): Promise<NormalizedMatchEvent[]> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/fixtures/events', {
            params: { match_id: matchId, t: 'info' }
        });
        return convertMatchEvents(response.data.data || []);
    } catch (error) {
        console.error('Error fetching match events:', error);
        return [];
    }
}

export async function fetchMatchStats(matchId: string): Promise<NormalizedMatchStats | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/stats', {
            params: { match_id: matchId, t: 'info' }
        });
        return response.data.data ? convertMatchStats(response.data.data) : null;
    } catch (error) {
        console.error('Error fetching match stats:', error);
        return null;
    }
}

export async function fetchMatchLineups(matchId: string): Promise<NormalizedMatchLineups | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/fixtures/lineups', {
            params: { match_id: matchId, t: 'info' }
        });
        return response.data.data ? convertMatchLineups(response.data.data) : null;
    } catch (error) {
        console.error('Error fetching match lineups:', error);
        return null;
    }
}

export async function fetchLeagues(countryId: string): Promise<NormalizedLeague[]> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/leagues', {
            params: { country_id: countryId, t: 'info' }
        });
        return (response.data.data || []).map(convertLeague);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        return [];
    }
}

export async function fetchCountryId(countryName: string): Promise<string | null> {
    try {
        const response = await apiClient.get<ApiResponse<any[]>>('/countries', { params: { t: 'list' } });
        const country = (response.data.data || []).find(
            (c: any) => c.name?.toLowerCase() === countryName.toLowerCase()
        );
        return country ? String(country.id) : null;
    } catch (error) {
        console.error('Error fetching country:', error);
        return null;
    }
}

export async function fetchItalianLeagues(): Promise<NormalizedLeague[]> {
    try {
        const countryId = await fetchCountryId('italy');
        if (!countryId) return [];
        return fetchLeagues(countryId);
    } catch (error) {
        console.error('Error fetching Italian leagues:', error);
        return [];
    }
}

export async function fetchLeague(leagueId: string): Promise<NormalizedLeague | null> {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/leagues', {
            params: { id: leagueId, t: 'info' }
        });
        return response.data.data ? convertLeague(response.data.data) : null;
    } catch (error) {
        console.error('Error fetching league:', error);
        return null;
    }
}
