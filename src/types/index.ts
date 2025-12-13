export interface ApiResponse<T> {
    data: T;
    meta?: {
        requests_left: number;
        user: string;
        plan: string;
        pages: number;
        page: number;
        count: number;
        total: number;
        msg?: string;
    };
}

export interface Country {
    id: string;
    name: string;
    cc: string; // country code
}

export interface League {
    id: string;
    img: string;
    name: string; // name_en usually
    is_cup: boolean; // API returns "0" or "1" strings sometimes
    seasons: Season[]; // Add seasons array to League interface
    id_current_season: string; // API field name might differ
}

export interface Season {
    id: string;
    name: string; // e.g. "25/26"
    start_date: string;
    end_date: string;
    is_current: boolean | string; // "1" or "0"
    year?: number; // Custom field we might want to map, but API gives name
}

export interface Team {
    id: string;
    name: string;
    logo: string;
    img?: string; // API often sends 'img'
    venue_id?: string;
    venue_name?: string;
    venue_city?: string;
    venue_capacity?: number;
}


export interface StandingStats {
    games_played: number;
    won: number;
    draw: number;
    lost: number;
    goals_diff: number;
    goals_scored: number;
    goals_against: number;
    points: number;
    position: number;
}

export interface Standing {
    team_id: string;
    team_name: string;
    round_id: string;
    round_name: string;
    group_id: string;
    group_name: string;

    // Nested Stats (Standard SoccersAPI response)
    overall?: StandingStats;
    home?: StandingStats;
    away?: StandingStats;

    // Direct properties (sometimes API returns flat, or for backward compat)
    position: number | string; // Can be string in some contexts
    status?: string;
    result?: string;
    points?: number; // Sometimes at root too
    recent_form: string;
    team_badge?: string;
    img?: string;

    // Legacy/Flat fields (Optional now, as we prefer overall)
    games_played?: number;
    won?: number;
    draw?: number;
    lost?: number;
    goals_scored?: number;
    goals_against?: number;
    goals_diff?: number;
    gd?: number;
}

export interface Fixture {
    id: string;
    league_id: string;
    season_id: string;
    round_id?: string;
    round_name?: string;
    stage_id?: string;

    // Time
    start_date: string; // "YYYY-MM-DD" often, or "date_match"
    date_match?: string; // Alternative field for start date
    start_time: string; // "HH:MM"
    time?: { time: string; timestamp: number; timezone: string; minute: number; date?: string };
    status?: string; // "NS", "FT"

    // Team Info (handling both flat and nested variations just in case)
    home_team_name?: string;
    away_team_name?: string;
    home_score?: number | string | null;
    away_score?: number | string | null;

    // Nested Structure (Common in SoccersAPI)
    teams?: {
        home: { id: string; name: string; img?: string };
        away: { id: string; name: string; img?: string };
    };
    scores?: {
        home_score: number | string;
        away_score: number | string;
        ht_score?: string;
        ft_score?: string;
    };
}

export interface Leader {
    pos: number;
    player: { id: number; name: string };
    team: { id: number; name: string };
    goals: { overall: number; home: number; away: number };
    penalties: number;
    minutes_played?: number;
    matches_played?: number;
}

export interface SquadPlayer {
    id: string;
    player: {
        id: string;
        name: string;
        common_name: string;
        firstname: string;
        lastname: string;
        weight?: string;
        height?: string;
        img?: string;
        country?: { id: string; name: string; cc: string };
    };
    team_id?: string;
    team_name?: string;
    team_img?: string;
    position?: string | {
        id: string;
        name: string;
    };
    shirt_number?: number;
}

export interface PlayerDetails {
    id: string;
    fullname?: string;
    name: string;
    firstname: string;
    lastname: string;
    common_name: string;
    img: string;
    country: {
        id: string;
        name: string;
        cc: string;
    };
    height: string;
    weight: string;
    age: number;
    birthday: string;
    birth_place: string;
    position: string; // e.g. "Defender"
    foot: string;
    shirt_number: number;
    team_name: string;
    team_img: string;
    current_team_id: string;
    // Add other fields as per API response
    career?: any[]; // Allow for career stats if available
}

export interface Venue {
    id: string;
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surface?: string;
    image?: string;
    img?: string;
    opened?: string;
    coordinates?: { lat: string; long: string };
}

export interface TeamDetails {
    id: string;
    name: string;
    common_name: string;
    logo: string;
    img: string;
    country: {
        id: string;
        name: string;
        cc: string;
    };
    venue_id?: string;
    venue?: Venue;
    venue_name?: string;
    venue_address?: string;
    venue_city?: string;
    venue_capacity?: number;
    venue_surface?: string;
    founded?: string;
    coach_id?: string;
}

export interface Coach {
    id: string;
    name: string;
    common_name?: string;
    firstname?: string;
    lastname?: string;
    birthdate?: string;
    age?: number;
    nationality?: string;
    img?: string;
}
