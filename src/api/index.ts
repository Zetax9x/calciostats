// Public API - Normalized interface for the application
// Components should import from this file, not directly from adapters

// Re-export all types
export type {
    NormalizedMatch,
    NormalizedTeam,
    NormalizedTeamBasic,
    NormalizedStanding,
    NormalizedLeader,
    NormalizedVenue,
    NormalizedLeague,
    NormalizedH2H,
    NormalizedMatchEvent,
    NormalizedMatchStats,
    NormalizedMatchLineups,
    NormalizedPlayer,
    MatchStatus
} from './types/normalized';

// Re-export all API functions from the active adapter
export {
    fetchMatch,
    fetchTeam,
    fetchStandings,
    fetchFixtures,
    fetchLeaders,
    fetchVenue,
    fetchH2H,
    fetchMatchEvents,
    fetchMatchStats,
    fetchMatchLineups,
    fetchLeagues,
    fetchCountryId,
    fetchItalianLeagues,
    fetchLeague
} from './adapters';

// Legacy exports for backward compatibility with existing code
// These can be removed once all components are migrated to use normalized types
export * from './football';
