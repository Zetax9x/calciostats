export default async function handler(request, response) {
    const { url } = request;

    // Extract the path after /apifootball/
    const apiPath = url.replace('/apifootball/', '').split('?')[0];
    const queryString = url.includes('?') ? url.split('?')[1] : '';

    // Build the target URL for API-Football v3
    const targetUrl = `https://v3.football.api-sports.io/${apiPath}?${queryString}`;

    try {
        const res = await fetch(targetUrl, {
            headers: {
                'x-apisports-key': process.env.VITE_API_FOOTBALL_KEY
            }
        });
        const data = await res.json();

        // Set CORS headers
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.setHeader('Content-Type', 'application/json');

        // Determine cache duration based on endpoint type and data
        let cacheDuration = 3600; // Default: 1 hour

        if (apiPath.includes('fixtures/live') || apiPath.includes('fixtures') && queryString.includes('live=all')) {
            // LIVE matches endpoint - update every minute
            cacheDuration = 60;
        } else if (apiPath.includes('fixtures') && queryString.includes('id=')) {
            // Single match details - check status in response
            const fixture = data?.response?.[0];
            const status = fixture?.fixture?.status?.short;

            if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(status)) {
                // Match is LIVE
                cacheDuration = 60; // 1 minute
            } else if (['FT', 'AET', 'PEN'].includes(status)) {
                // Match is FINISHED
                cacheDuration = 86400; // 24 hours
            } else {
                // Match not started yet (TBD, NS, etc)
                cacheDuration = 3600; // 1 hour
            }
        } else if (apiPath.includes('fixtures/lineups') || apiPath.includes('fixtures/events') || apiPath.includes('fixtures/statistics')) {
            // Match-specific data
            cacheDuration = 300; // 5 minutes
        } else if (apiPath.includes('standings') || apiPath.includes('players/topscorers')) {
            // Standings and top scorers change rarely
            cacheDuration = 86400; // 24 hours
        } else if (apiPath.includes('fixtures')) {
            // Fixtures list
            cacheDuration = 21600; // 6 hours
        } else if (apiPath.includes('teams') || apiPath.includes('venues') || apiPath.includes('coachs')) {
            // Team/venue/coach info rarely changes
            cacheDuration = 604800; // 7 days
        } else if (apiPath.includes('fixtures/headtohead')) {
            // H2H changes only when new matches are played
            cacheDuration = 86400; // 24 hours
        } else if (apiPath.includes('leagues')) {
            // Leagues info rarely changes
            cacheDuration = 604800; // 7 days
        }

        // Set Vercel Edge Cache headers (shared cache for all users)
        // s-maxage = shared cache (CDN), stale-while-revalidate = serve stale while fetching fresh
        response.setHeader('Cache-Control', `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`);

        return response.status(200).json(data);
    } catch (error) {
        console.error('API-Football Proxy error:', error);
        return response.status(500).json({ error: 'Failed to fetch from API-Football' });
    }
}
