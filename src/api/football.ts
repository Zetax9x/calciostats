import { apiClient } from './client';
import type { ApiResponse, League, Standing, Fixture, Country, Leader, Team, SquadPlayer, PlayerDetails, TeamDetails, Venue, Coach } from '../types';

export const getCountries = async () => {
    const response = await apiClient.get<ApiResponse<Country[]>>('countries', {
        params: { t: 'list' }
    });
    return response.data.data;
}

export const getItalianLeagues = async () => {
    try {
        // 1. Fetch all countries to find Italy's ID dynamically
        const countries = await getCountries();
        const italy = countries.find(c => c.name === 'Italy' || c.name === 'Italia');

        if (!italy) {
            console.error("Italy not found in countries list");
            throw new Error("Could not find country 'Italy' in API");
        }

        // 2. Fetch leagues for Italy
        const response = await apiClient.get<ApiResponse<League[]>>('leagues', {
            params: {
                country_id: italy.id,
                t: 'list'
            }
        });

        return response.data.data;
    } catch (error) {
        console.error("Error fetching Italian leagues:", error);
        throw error;
    }
};

export const getLeague = async (id: string) => {
    // SoccersAPI League by ID uses /leagues/ endpoint with t=info&id=X
    const response = await apiClient.get<ApiResponse<League>>('leagues', {
        params: {
            t: 'info',
            id: id
        }
    });
    return response.data.data;
};

export const getStandings = async (seasonId: string) => {
    // Docs show: /leagues/?t=standings&season_id=X
    const response = await apiClient.get<ApiResponse<{ standings: Standing[] }>>('leagues', {
        params: {
            season_id: seasonId,
            t: 'standings'
        }
    });
    return response.data.data.standings;
};

export const getFixtures = async (_leagueId: string, seasonId: string) => {
    // SoccersAPI fixtures often by date or round.
    // by season: fixtures/?season_id=X
    const response = await apiClient.get<ApiResponse<Fixture[]>>('fixtures', {
        params: {
            season_id: seasonId,
            // page: 1 // pagination might be needed
            t: 'season',
            page: 1
        }
    });
    return response.data.data;
};

export const getTopScorers = async (seasonId: string) => {
    // SoccersAPI "Leaders" endpoint for top scorers
    // docs: /leaders/?t=topscores&season_id=X
    const response = await apiClient.get<ApiResponse<Leader[]>>('leaders', {
        params: {
            season_id: seasonId,
            t: 'topscorers'
        }
    });
    return response.data.data;
};

export const getTeams = async (seasonId: string) => {
    // Get all teams in a season (useful to extract Venues)
    const response = await apiClient.get<ApiResponse<Team[]>>('teams', {
        params: {
            season_id: seasonId,
            t: 'season'
        }
    });
    return response.data.data;
};

export const getSquad = async (teamId: string, seasonId?: string): Promise<SquadPlayer[]> => {
    // Fetch squad for a specific team
    // endpoint: teams/?t=squad&id=TEAM_ID&season_id=SEASON_ID
    const params: any = {
        id: teamId,
        t: 'squad'
    };
    if (seasonId) {
        params.season_id = seasonId;
    }

    const response = await apiClient.get<ApiResponse<{ squad: SquadPlayer[] }>>('/teams', { params });
    return response.data.data?.squad || [];
};

export const getTeam = async (teamId: string): Promise<TeamDetails | null> => {
    // endpoint: teams/?t=info&id=TEAM_ID
    const response = await apiClient.get<ApiResponse<TeamDetails>>('/teams', {
        params: {
            id: teamId,
            t: 'info'
        }
    });
    return response.data.data;
};

export const getVenue = async (venueId: string): Promise<Venue | null> => {
    // endpoint: venues/?t=info&id=VENUE_ID
    const response = await apiClient.get<ApiResponse<Venue>>('/venues', {
        params: {
            id: venueId,
            t: 'info'
        }
    });
    return response.data.data;
};

export const getPlayer = async (playerId: string): Promise<PlayerDetails | null> => {
    // endpoint: players/?t=info&id=PLAYER_ID
    const response = await apiClient.get<ApiResponse<PlayerDetails>>('/players', {
        params: {
            id: playerId,
            t: 'info'
        }
    });
    return response.data.data;
};

export const getCoach = async (coachId: string): Promise<Coach | null> => {
    // endpoint: coaches/?t=info&id=COACH_ID
    const response = await apiClient.get<ApiResponse<Coach>>('/coaches', {
        params: {
            id: coachId,
            t: 'info'
        }
    });
    return response.data.data;
};

export const getTeamFixtures = async (teamId: string, seasonId?: string): Promise<Fixture[]> => {
    // If we have season_id, use fixtures/season endpoint with team filter
    // Otherwise fall back to fixtures/team endpoint (which may return empty)
    try {
        if (seasonId) {
            // Use season endpoint with team_id filter - this works!
            const response = await apiClient.get<ApiResponse<Fixture[]>>('/fixtures', {
                params: {
                    season_id: seasonId,
                    team_id: teamId,
                    t: 'season'
                }
            });
            return response.data.data || [];
        } else {
            // Fallback to team endpoint (may return empty for some leagues)
            const response = await apiClient.get<ApiResponse<Fixture[]>>('/fixtures', {
                params: {
                    team_id: teamId,
                    t: 'team'
                }
            });
            return response.data.data || [];
        }
    } catch (error) {
        console.error("Error fetching team fixtures:", error);
        return [];
    }
};

export const getMatchDetails = async (matchId: string): Promise<Fixture | null> => {
    // endpoint: fixtures/?match_id=X&t=info for match details
    try {
        const response = await apiClient.get<ApiResponse<Fixture>>('/fixtures', {
            params: {
                id: matchId,
                t: 'info'
            }
        });
        return response.data.data || null;
    } catch (error) {
        console.error("Error fetching match details:", error);
        return null;
    }
};

export interface H2HData {
    h2h: any[];  // The array of previous matches
    home?: any;  // Home team info with events
    away?: any;  // Away team info with events
}

export const getH2H = async (team1Id: string, team2Id: string): Promise<H2HData | null> => {
    // endpoint: h2h/?t=teams&team1=X&team2=Y (per documentation)
    try {
        const response = await apiClient.get<ApiResponse<any>>('/h2h', {
            params: {
                team1: team1Id,
                team2: team2Id,
                t: 'teams'
            }
        });
        console.log('H2H response:', response.data);
        return response.data.data || null;
    } catch (error) {
        console.error("Error fetching H2H:", error);
        return null;
    }
};

// Match Statistics
export const getMatchStats = async (matchId: string): Promise<any> => {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/stats', {
            params: {
                id: matchId,
                t: 'match'
            }
        });
        console.log('Match stats response:', response.data);
        return response.data.data || null;
    } catch (error) {
        console.error("Error fetching match stats:", error);
        return null;
    }
};

// Match Events (goals, cards, substitutions)
export const getMatchEvents = async (matchId: string): Promise<any[]> => {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/fixtures', {
            params: {
                id: matchId,
                t: 'match_events'
            }
        });
        console.log('Match events response:', response.data);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching match events:", error);
        return [];
    }
};

// Match Lineups
export const getMatchLineups = async (matchId: string): Promise<any> => {
    try {
        const response = await apiClient.get<ApiResponse<any>>('/fixtures', {
            params: {
                id: matchId,
                t: 'match_lineups'
            }
        });
        console.log('Match lineups response:', response.data);
        return response.data.data || null;
    } catch (error) {
        console.error("Error fetching match lineups:", error);
        return null;
    }
};
