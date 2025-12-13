import { useState } from 'react';
import axios from 'axios';
import { apiClient } from '../api/client';
import { Play, Plus, Trash2, Copy, Check } from 'lucide-react';

// Organized list based on SoccersAPI documentation
const API_DEFINITIONS = [
    {
        label: "General Resources",
        options: [
            { label: "Countries", value: "countries", params: [{ key: 't', value: 'list' }] },
            { label: "Timezones", value: "timezones", params: [{ key: 't', value: 'list' }] },
        ]
    },
    {
        label: "Leagues",
        options: [
            { label: "All Leagues", value: "leagues", params: [{ key: 't', value: 'list' }] },
            { label: "League by ID", value: "leagues", params: [{ key: 'id', value: '146' }, { key: 't', value: 'info' }] },
            { label: "Leagues by Country", value: "leagues", params: [{ key: 'country_id', value: '108' }, { key: 't', value: 'list' }] },
            { label: "Seasons", value: "leagues/seasons", params: [{ key: 'league_id', value: '146' }, { key: 't', value: 'list' }] },
            { label: "Standings (General)", value: "leagues", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'standings' }] },
            { label: "Live Standings", value: "leagues", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'standings' }] },
            { label: "Home/Away Standings", value: "leagues", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'ha' }] },
            { label: "Cup Draw (Bracket)", value: "leagues", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'cup' }] },
        ]
    },
    {
        label: "Fixtures & Live",
        options: [
            { label: "Fixtures by Date", value: "fixtures", params: [{ key: 'd', value: new Date().toISOString().split('T')[0] }, { key: 't', value: 'date' }] },
            { label: "Fixtures by League", value: "fixtures", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'season' }] },
            { label: "Fixture by ID", value: "fixtures", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Live Scores", value: "livescore", params: [{ key: 'league_id', value: '146' }, { key: 't', value: 'm' }] },
            { label: "Live Score (Now)", value: "livescore/now", params: [{ key: 't', value: 'now' }] },
            { label: "Head to Head", value: "fixtures/h2h", params: [{ key: 'team1_id', value: '' }, { key: 'team2_id', value: '' }, { key: 't', value: 'h2h' }] },
            { label: "Commentary", value: "fixtures/commentary", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Lineups", value: "fixtures/lineups", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Events", value: "fixtures/events", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Stats", value: "fixtures/stats", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'info' }] },
        ]
    },
    {
        label: "Teams & Players",
        options: [
            { label: "Teams (Season)", value: "teams", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'season' }] },
            { label: "Team by ID", value: "teams", params: [{ key: 'id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Top Scorers", value: "leaders", params: [{ key: 'season_id', value: '2309' }, { key: 't', value: 'topscores' }] },
            { label: "Squads", value: "teams", params: [{ key: 'id', value: '' }, { key: 't', value: 'squad' }] },
            { label: "Players", value: "players", params: [{ key: 'id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Coaches", value: "coaches", params: [{ key: 'id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Transfers", value: "transfers", params: [{ key: 'team_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Sidelined/Injuries", value: "sidelined", params: [{ key: 'team_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Trophies", value: "teams/trophies", params: [{ key: 'team_id', value: '' }, { key: 't', value: 'info' }] },
            { label: "Venues", value: "venues", params: [{ key: 't', value: 'list' }] },
        ]
    },
    {
        label: "Odds & Predictions",
        options: [
            { label: "Odds Pre-match", value: "odds", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'list' }] },
            { label: "Odds Live", value: "odds/live", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'list' }] },
            { label: "Predictions", value: "predictions", params: [{ key: 'match_id', value: '' }, { key: 't', value: 'list' }] },
        ]
    }
];

export const DebugPage = () => {
    const [selectedOptIndex, setSelectedOptIndex] = useState('');
    const [endpoint, setEndpoint] = useState('leagues');
    const [params, setParams] = useState<{ key: string; value: string }[]>([
        { key: 't', value: 'list' }
    ]);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Flatten options for easier lookup by index/label combo
    const allOptions = API_DEFINITIONS.flatMap(g => g.options.map(o => ({ ...o, group: g.label })));

    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idx = e.target.value;
        setSelectedOptIndex(idx);

        if (idx === "") return;

        const numIdx = parseInt(idx);
        if (!isNaN(numIdx) && allOptions[numIdx]) {
            const opt = allOptions[numIdx];
            setEndpoint(opt.value);
            setParams(opt.params || [{ key: 't', value: 'list' }]);
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
        // Cancel previous request if exists
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
                if (p.key) queryParams[p.key] = p.value;
            });

            const res = await apiClient.get(endpoint, {
                params: queryParams,
                signal: controller.signal
            });

            setResponse(res.data);
        } catch (err: any) {
            if (axios.isCancel(err)) {
                setError('Request cancelled by user');
            } else {
                console.error(err);
                setError(err.message || 'Error occurred');
                if (err.response) {
                    setResponse(err.response.data);
                }
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

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">API Debugger</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONFIGURATION PANEL */}
                <div className="space-y-6 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Endpoint Selection</label>
                        <select
                            value={selectedOptIndex}
                            onChange={handleEndpointChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="">Select an endpoint...</option>
                            {API_DEFINITIONS.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.options.map((opt) => {
                                        // find global index
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
                        <div className="mt-2 text-xs text-gray-500 font-mono">
                            Target Endpoint: <span className="text-emerald-400">/{endpoint}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-400">Parameters</label>
                            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                User & Token auto-included
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
                                        className="w-1/3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={p.value}
                                        onChange={(e) => updateParam(i, 'value', e.target.value)}
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                    />
                                    <button
                                        onClick={() => removeParam(i)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addParam}
                            className="mt-3 flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Parameter
                        </button>
                    </div>

                    import axios from 'axios'; // Ensure this is at top, but tool replacer might miss it if I don't check.
                    // Actually, I'll just use the button change here.

                    // ... inside render ...
                    <button
                        onClick={loading ? cancelRequest : executeRequest}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
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
                <div className="lg:col-span-2 flex flex-col h-[600px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                        <span className="text-sm font-bold text-gray-300">
                            Response {response?.meta && `(Status: ${response.meta.requests_left} left)`}
                        </span>
                        {response && (
                            <button
                                onClick={copyResponse}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied' : 'Copy JSON'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                        {error && (
                            <div className="text-red-400 mb-4 p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                                {error}
                            </div>
                        )}
                        {response ? (
                            <pre className="text-gray-300">
                                {JSON.stringify(response, null, 2)}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
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
