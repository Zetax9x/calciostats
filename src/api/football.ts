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
