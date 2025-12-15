// Normalized API types - API-agnostic interfaces
// These types are STABLE and should not change when switching API providers

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled';

export interface NormalizedTeamBasic {
    id: string;
    name: string;
    logo: string;
}

export interface NormalizedMatch {
    id: string;
    status: MatchStatus;
    date: string;      // YYYY-MM-DD
    time: string;      // HH:mm
    homeTeam: NormalizedTeamBasic;
    awayTeam: NormalizedTeamBasic;
    score: {
        home: number | null;
        away: number | null;
        halftimeHome?: number | null;
        halftimeAway?: number | null;
    };
    league: {
        id: string;
        name: string;
        logo?: string;
    };
    venue?: {
        id: string;
        name: string;
    };
    round?: string;
    seasonId?: string;
}

export interface NormalizedTeam {
    id: string;
    name: string;
    shortName?: string;
    logo: string;
    country?: string;
    founded?: number;
    venue?: {
        id: string;
        name: string;
        city?: string;
        capacity?: number;
        address?: string;
        coordinates?: { lat: string; lng: string };
    };
    coach?: {
        id: string;
        name: string;
        nationality?: string;
    };
}

export interface NormalizedStanding {
    position: number;
    team: NormalizedTeamBasic;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form?: string;  // e.g., "WWDLW"
    description?: string;  // e.g., "Promotion", "Relegation"
}

export interface NormalizedPlayer {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    nationality?: string;
    position?: string;
    number?: number;
    age?: number;
    height?: string;
    weight?: string;
    photo?: string;
}

export interface NormalizedLeader {
    position: number;
    player: NormalizedPlayer;
    team: NormalizedTeamBasic;
    goals: number;
    assists?: number;
    matches?: number;
}

export interface NormalizedVenue {
    id: string;
    name: string;
    city?: string;
    country?: string;
    capacity?: number;
    address?: string;
    coordinates?: {
        lat: string;
        lng: string;
    };
    image?: string;
}

export interface NormalizedLeague {
    id: string;
    name: string;
    country?: string;
    logo?: string;
    isCup?: boolean;
    currentSeasonId?: string;
}

export interface NormalizedH2H {
    matches: NormalizedMatch[];
    homeTeamWins: number;
    awayTeamWins: number;
    draws: number;
}

export interface NormalizedMatchEvent {
    id?: string;
    minute: number;
    type: 'goal' | 'own_goal' | 'penalty' | 'yellow_card' | 'red_card' | 'substitution' | 'var' | 'other';
    player?: NormalizedPlayer;
    assistPlayer?: NormalizedPlayer;
    team: NormalizedTeamBasic;
    detail?: string;
}

export interface NormalizedMatchStats {
    possession: { home: number; away: number };
    shotsTotal?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    corners?: { home: number; away: number };
    fouls?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
    offsides?: { home: number; away: number };
}

export interface NormalizedLineup {
    formation?: string;
    players: Array<{
        player: NormalizedPlayer;
        position: string;
        number: number;
        isCaptain?: boolean;
    }>;
}

export interface NormalizedMatchLineups {
    home: NormalizedLineup;
    away: NormalizedLineup;
}
