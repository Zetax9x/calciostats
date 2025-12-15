import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { League, Standing, Fixture, Team, Leader } from '../types';

// Define the shape of our app state
interface AppState {
    // Current navigation context
    currentLeagueId: string | null;
    currentSeasonId: string | null;
    currentLeague: League | null;

    // Cached data (keyed by seasonId for efficient lookup)
    standingsCache: Record<string, Standing[]>;
    fixturesCache: Record<string, Fixture[]>;
    teamsCache: Record<string, Team[]>;
    leadersCache: Record<string, Leader[]>;
}

// Define actions to update the state
interface AppActions {
    setCurrentLeague: (league: League) => void;
    setCurrentSeasonId: (seasonId: string) => void;
    clearContext: () => void;

    // Cache setters
    cacheStandings: (seasonId: string, standings: Standing[]) => void;
    cacheFixtures: (seasonId: string, fixtures: Fixture[]) => void;
    cacheTeams: (seasonId: string, teams: Team[]) => void;
    cacheLeaders: (seasonId: string, leaders: Leader[]) => void;

    // Cache getters
    getCachedStandings: (seasonId: string) => Standing[] | null;
    getCachedFixtures: (seasonId: string) => Fixture[] | null;
    getCachedTeams: (seasonId: string) => Team[] | null;
    getCachedLeaders: (seasonId: string) => Leader[] | null;
}

type AppContextType = AppState & AppActions;

const initialState: AppState = {
    currentLeagueId: null,
    currentSeasonId: null,
    currentLeague: null,
    standingsCache: {},
    fixturesCache: {},
    teamsCache: {},
    leadersCache: {},
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AppState>(initialState);

    const setCurrentLeague = useCallback((league: League) => {
        setState(prev => ({
            ...prev,
            currentLeague: league,
            currentLeagueId: league.id,
            currentSeasonId: league.id_current_season || null,
        }));
    }, []);

    const setCurrentSeasonId = useCallback((seasonId: string) => {
        setState(prev => ({
            ...prev,
            currentSeasonId: seasonId,
        }));
    }, []);

    const clearContext = useCallback(() => {
        setState(initialState);
    }, []);

    // Cache setters
    const cacheStandings = useCallback((seasonId: string, standings: Standing[]) => {
        setState(prev => ({
            ...prev,
            standingsCache: { ...prev.standingsCache, [seasonId]: standings },
        }));
    }, []);

    const cacheFixtures = useCallback((seasonId: string, fixtures: Fixture[]) => {
        setState(prev => ({
            ...prev,
            fixturesCache: { ...prev.fixturesCache, [seasonId]: fixtures },
        }));
    }, []);

    const cacheTeams = useCallback((seasonId: string, teams: Team[]) => {
        setState(prev => ({
            ...prev,
            teamsCache: { ...prev.teamsCache, [seasonId]: teams },
        }));
    }, []);

    const cacheLeaders = useCallback((seasonId: string, leaders: Leader[]) => {
        setState(prev => ({
            ...prev,
            leadersCache: { ...prev.leadersCache, [seasonId]: leaders },
        }));
    }, []);

    // Cache getters
    const getCachedStandings = useCallback((seasonId: string) => {
        return state.standingsCache[seasonId] || null;
    }, [state.standingsCache]);

    const getCachedFixtures = useCallback((seasonId: string) => {
        return state.fixturesCache[seasonId] || null;
    }, [state.fixturesCache]);

    const getCachedTeams = useCallback((seasonId: string) => {
        return state.teamsCache[seasonId] || null;
    }, [state.teamsCache]);

    const getCachedLeaders = useCallback((seasonId: string) => {
        return state.leadersCache[seasonId] || null;
    }, [state.leadersCache]);

    const value: AppContextType = {
        ...state,
        setCurrentLeague,
        setCurrentSeasonId,
        clearContext,
        cacheStandings,
        cacheFixtures,
        cacheTeams,
        cacheLeaders,
        getCachedStandings,
        getCachedFixtures,
        getCachedTeams,
        getCachedLeaders,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// Optional: hook to get just the current season id
export const useCurrentSeasonId = () => {
    const { currentSeasonId } = useAppContext();
    return currentSeasonId;
};
