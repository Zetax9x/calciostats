import { useState } from 'react';
import { Play, Plus, Trash2, Copy, Check, Info } from 'lucide-react';

// API-Football v3 Endpoints - Complete List
// Documentation: https://www.api-football.com/documentation-v3
const API_FOOTBALL_ENDPOINTS = [
    {
        label: "🌍 Countries & Timezone",
        options: [
            { label: "All Countries", value: "countries", params: [] },
            { label: "Country by Name", value: "countries", params: [{ key: 'name', value: 'Italy' }] },
            { label: "Country by Code", value: "countries", params: [{ key: 'code', value: 'IT' }] },
            { label: "Timezones", value: "timezone", params: [] },
        ]
    },
    {
        label: "🏆 Leagues & Seasons",
        options: [
            { label: "All Leagues", value: "leagues", params: [] },
            { label: "League by ID", value: "leagues", params: [{ key: 'id', value: '135' }] },
            { label: "Leagues by Country", value: "leagues", params: [{ key: 'country', value: 'Italy' }] },
            { label: "Leagues by Season", value: "leagues", params: [{ key: 'season', value: '2024' }] },
            { label: "Current Leagues", value: "leagues", params: [{ key: 'current', value: 'true' }] },
            { label: "League Seasons", value: "leagues/seasons", params: [] },
        ]
    },
    {
        label: "⚽ Teams",
        options: [
            { label: "Team by ID", value: "teams", params: [{ key: 'id', value: '489' }] },
            { label: "Teams by League/Season", value: "teams", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Teams by Country", value: "teams", params: [{ key: 'country', value: 'Italy' }] },
            { label: "Team Statistics", value: "teams/statistics", params: [{ key: 'team', value: '489' }, { key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Team Seasons", value: "teams/seasons", params: [{ key: 'team', value: '489' }] },
            { label: "Team Countries", value: "teams/countries", params: [] },
        ]
    },
    {
        label: "📊 Standings",
        options: [
            { label: "Standings by League/Season", value: "standings", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Standings by Team", value: "standings", params: [{ key: 'team', value: '489' }, { key: 'season', value: '2024' }] },
        ]
    },
    {
        label: "⚽ Fixtures",
        options: [
            { label: "Fixture by ID", value: "fixtures", params: [{ key: 'id', value: '' }] },
            { label: "Fixtures by Date", value: "fixtures", params: [{ key: 'date', value: new Date().toISOString().split('T')[0] }] },
            { label: "Fixtures by League/Season", value: "fixtures", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Fixtures by Team/Season", value: "fixtures", params: [{ key: 'team', value: '489' }, { key: 'season', value: '2024' }] },
            { label: "Live Fixtures", value: "fixtures", params: [{ key: 'live', value: 'all' }] },
            { label: "Live by League", value: "fixtures", params: [{ key: 'live', value: 'all' }, { key: 'league', value: '135' }] },
            { label: "Next N Fixtures", value: "fixtures", params: [{ key: 'next', value: '10' }] },
            { label: "Last N Fixtures", value: "fixtures", params: [{ key: 'last', value: '10' }] },
            { label: "Fixture Rounds", value: "fixtures/rounds", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
        ]
    },
    {
        label: "📅 Fixture Details",
        options: [
            { label: "Head to Head", value: "fixtures/headtohead", params: [{ key: 'h2h', value: '489-505' }] },
            { label: "Match Statistics", value: "fixtures/statistics", params: [{ key: 'fixture', value: '' }] },
            { label: "Match Events", value: "fixtures/events", params: [{ key: 'fixture', value: '' }] },
            { label: "Match Lineups", value: "fixtures/lineups", params: [{ key: 'fixture', value: '' }] },
            { label: "Match Player Stats", value: "fixtures/players", params: [{ key: 'fixture', value: '' }] },
        ]
    },
    {
        label: "👥 Players",
        options: [
            { label: "Player by ID", value: "players", params: [{ key: 'id', value: '' }, { key: 'season', value: '2024' }] },
            { label: "Players by Team/Season", value: "players", params: [{ key: 'team', value: '489' }, { key: 'season', value: '2024' }] },
            { label: "Players by League/Season", value: "players", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Top Scorers", value: "players/topscorers", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Top Assists", value: "players/topassists", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Top Yellow Cards", value: "players/topyellowcards", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Top Red Cards", value: "players/topredcards", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Player Squads", value: "players/squads", params: [{ key: 'team', value: '489' }] },
            { label: "Player Seasons", value: "players/seasons", params: [{ key: 'player', value: '' }] },
        ]
    },
    {
        label: "👔 Coaches & Transfers",
        options: [
            { label: "Coach by ID", value: "coachs", params: [{ key: 'id', value: '' }] },
            { label: "Coaches by Team", value: "coachs", params: [{ key: 'team', value: '489' }] },
            { label: "Transfers by Team", value: "transfers", params: [{ key: 'team', value: '489' }] },
            { label: "Transfers by Player", value: "transfers", params: [{ key: 'player', value: '' }] },
            { label: "Sidelined by Player", value: "sidelined", params: [{ key: 'player', value: '' }] },
            { label: "Sidelined by Coach", value: "sidelined", params: [{ key: 'coach', value: '' }] },
            { label: "Trophies by Player", value: "trophies", params: [{ key: 'player', value: '' }] },
            { label: "Trophies by Coach", value: "trophies", params: [{ key: 'coach', value: '' }] },
        ]
    },
    {
        label: "🏟️ Venues",
        options: [
            { label: "Venue by ID", value: "venues", params: [{ key: 'id', value: '' }] },
            { label: "Venues by Country", value: "venues", params: [{ key: 'country', value: 'Italy' }] },
            { label: "Venues by City", value: "venues", params: [{ key: 'city', value: 'Milan' }] },
        ]
    },
    {
        label: "💰 Odds & Predictions",
        options: [
            { label: "Predictions by Fixture", value: "predictions", params: [{ key: 'fixture', value: '' }] },
            { label: "Odds by Fixture", value: "odds", params: [{ key: 'fixture', value: '' }] },
            { label: "Odds by League/Season", value: "odds", params: [{ key: 'league', value: '135' }, { key: 'season', value: '2024' }] },
            { label: "Live Odds", value: "odds/live", params: [] },
            { label: "Bookmakers", value: "odds/bookmakers", params: [] },
            { label: "Bet Mapping", value: "odds/mapping", params: [] },
            { label: "Bets Types", value: "odds/bets", params: [] },
        ]
    },
];

// API-Football base URL and client
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

export const DebugPage = () => {
    const [selectedOptIndex, setSelectedOptIndex] = useState('');
    const [endpoint, setEndpoint] = useState('leagues');
    const [params, setParams] = useState<{ key: string; value: string }[]>([]);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Flatten options for easier lookup
    const allOptions = API_FOOTBALL_ENDPOINTS.flatMap(g => g.options.map(o => ({ ...o, group: g.label })));

    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idx = e.target.value;
        setSelectedOptIndex(idx);

        if (idx === "") return;

        const numIdx = parseInt(idx);
        if (!isNaN(numIdx) && allOptions[numIdx]) {
            const opt = allOptions[numIdx];
            setEndpoint(opt.value);
            setParams(opt.params || []);
        }
    };

    const addParam = () => {
        setParams([...params, { key: '', value: '' }]);
    };

    const removeParam = (index: number) => {
        setParams(params.filter((_, i) => i !== index));
    };

    const updateParam = (index: number, field: 'key' | 'value', text: string) => {
        const newParams = [...params];
        newParams[index][field] = text;
        setParams(newParams);
    };

    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const executeRequest = async () => {
        if (abortController) {
            abortController.abort();
        }

        const controller = new AbortController();
        setAbortController(controller);
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const queryParams: Record<string, string> = {};
            params.forEach(p => {
                if (p.key && p.value) queryParams[p.key] = p.value;
            });

            // Get API key from environment
            const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY;
            if (!apiKey || apiKey === 'YOUR_API_FOOTBALL_KEY_HERE') {
                throw new Error('API-Football key not configured. Add VITE_API_FOOTBALL_KEY to your .env file');
            }

            // Build URL with query params
            const url = new URL(`${API_FOOTBALL_BASE}/${endpoint}`);
            Object.entries(queryParams).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const res = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'x-apisports-key': apiKey
                },
                signal: controller.signal
            });

            const data = await res.json();
            setResponse(data);

            if (data.errors && Object.keys(data.errors).length > 0) {
                setError(JSON.stringify(data.errors));
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('Request cancelled by user');
            } else {
                console.error(err);
                setError(err.message || 'Error occurred');
            }
        } finally {
            setLoading(false);
            setAbortController(null);
        }
    };

    const cancelRequest = () => {
        if (abortController) {
            abortController.abort();
        }
    };

    const copyResponse = () => {
        if (!response) return;
        navigator.clipboard.writeText(JSON.stringify(response, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Build full URL for display
    const getFullUrl = () => {
        const url = new URL(`${API_FOOTBALL_BASE}/${endpoint}`);
        params.forEach(p => {
            if (p.key && p.value) url.searchParams.append(p.key, p.value);
        });
        return url.toString();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-3xl font-bold text-gray-800">API-Football Debugger</h1>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">v3</span>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-700">
                    <strong>API-Football v3</strong> - Richiede chiave API in <code className="bg-blue-100 px-1 rounded">VITE_API_FOOTBALL_KEY</code>
                    <br />
                    <a href="https://www.api-football.com/documentation-v3" target="_blank" rel="noopener" className="underline hover:no-underline">
                        📖 Documentazione completa
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONFIGURATION PANEL */}
                <div className="space-y-6 glass-card p-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Endpoint Selection</label>
                        <select
                            value={selectedOptIndex}
                            onChange={handleEndpointChange}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        >
                            <option value="">Select an endpoint...</option>
                            {API_FOOTBALL_ENDPOINTS.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.options.map((opt) => {
                                        const globalIdx = allOptions.findIndex(o => o.label === opt.label && o.value === opt.value);
                                        return (
                                            <option key={`${globalIdx}-${opt.label}`} value={globalIdx}>
                                                {opt.label}
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            ))}
                        </select>
                        <div className="mt-2 text-xs text-gray-500 font-mono break-all">
                            <span className="text-primary-600">{getFullUrl()}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-600">Parameters</label>
                            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                Auth Header auto-included
                            </span>
                        </div>

                        <div className="space-y-2">
                            {params.map((p, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={p.key}
                                        onChange={(e) => updateParam(i, 'key', e.target.value)}
                                        className="w-1/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={p.value}
                                        onChange={(e) => updateParam(i, 'value', e.target.value)}
                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                    <button
                                        onClick={() => removeParam(i)}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addParam}
                            className="mt-3 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Parameter
                        </button>
                    </div>

                    <button
                        onClick={loading ? cancelRequest : executeRequest}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Cancel Request</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" /> Execute Request
                            </>
                        )}
                    </button>
                </div>

                {/* RESPONSE PANEL */}
                <div className="lg:col-span-2 flex flex-col h-[600px] glass-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <span className="text-sm font-bold text-gray-700">
                            Response {response?.results !== undefined && `(${response.results} results)`}
                        </span>
                        {response && (
                            <button
                                onClick={copyResponse}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors bg-white hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-primary-500" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied' : 'Copy JSON'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-50">
                        {error && (
                            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}
                        {response ? (
                            <pre className="text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(response, null, 2)}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="mb-2">No response yet</span>
                                <span className="text-xs">Execute a request to see data here</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
