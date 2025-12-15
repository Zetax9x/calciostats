export default async function handler(request, response) {
    const { url } = request;

    // Extract the path after /api/
    const apiPath = url.replace('/api/', '').split('?')[0];
    const queryString = url.includes('?') ? url.split('?')[1] : '';

    // Build the target URL
    const targetUrl = `https://api.soccersapi.com/v2.2/${apiPath}?user=${process.env.VITE_SOCCERSAPI_USER}&token=${process.env.VITE_SOCCERSAPI_TOKEN}&${queryString}`;

    try {
        const res = await fetch(targetUrl);
        const data = await res.json();

        // Set CORS headers
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.setHeader('Content-Type', 'application/json');

        // Determine cache duration based on endpoint type and data
        let cacheDuration = 3600; // Default: 1 hour

        if (apiPath.includes('livescores')) {
            // LIVE matches endpoint - update every minute
            cacheDuration = 60;
        } else if (apiPath.includes('fixtures') && queryString.includes('match_id')) {
            // Single match details - check status in response
            const matchData = data?.data;
            const status = matchData?.status;

            if (status === 1 || status === 2) {
                // Match is LIVE (1=in progress, 2=halftime, etc)
                cacheDuration = 60; // 1 minute
            } else if (status === 3) {
                // Match is FINISHED
                cacheDuration = 86400; // 24 hours
            } else {
                // Match not started yet
                cacheDuration = 3600; // 1 hour
            }
        } else if (apiPath.includes('lineups') || apiPath.includes('events') || apiPath.includes('stats')) {
            // Match-specific data - check if it's for a live match would need match lookup
            // For now, use moderate cache
            cacheDuration = 300; // 5 minutes
        } else if (apiPath.includes('standings') || apiPath.includes('leaders')) {
            // Standings and top scorers change rarely
            cacheDuration = 86400; // 24 hours
        } else if (apiPath.includes('fixtures')) {
            // Fixtures list
            cacheDuration = 21600; // 6 hours
        } else if (apiPath.includes('teams') || apiPath.includes('venues') || apiPath.includes('coaches')) {
            // Team/venue info rarely changes
            cacheDuration = 604800; // 7 days
        } else if (apiPath.includes('h2h')) {
            // H2H changes only when new matches are played
            cacheDuration = 86400; // 24 hours
        }

        // Set Vercel Edge Cache headers (shared cache for all users)
        // s-maxage = shared cache (CDN), stale-while-revalidate = serve stale while fetching fresh
        response.setHeader('Cache-Control', `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`);

        return response.status(200).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return response.status(500).json({ error: 'Failed to fetch from API' });
    }
}
