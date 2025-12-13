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

        return response.status(200).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return response.status(500).json({ error: 'Failed to fetch from API' });
    }
}
