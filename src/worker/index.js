export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url)

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders()
            })
        }

        if (url.pathname === '/gold') {
            const r = await fetch('https://data-asg.goldprice.org/dbXRates/USD', { cf: { cacheTtl: 0 }, headers: { 'accept': 'application/json' }})
            const j = await r.json()
            return json(j)
        }

        if (url.pathname === '/nbc') {
            const res = await fetch('https://www.nbc.gov.kh/english/economic_research/exchange_rate.php', { cf: { cacheTtl: 60 }})
            const html = await res.text()

            // Try to capture "Official Exchange Rate : 4023 KHR / USD"
            let m = html.match(/Official\s+Exchange\s+Rate\s*:\s*([\d,]+)\s*KHR\s*\/\s*USD/i)
            let rate = m ? Number(m[1].replace(/,/g,'')) : null

            // Fallback: try to parse USD row average like "...USD/KHR...Average...</td><td>4023.00"
            if (!rate) {
                const row = html.match(/US\s*Dollar.*?USD\/KHR.*?(\d{3,5}(?:\.\d+)?)/is)
                if (row) rate = Number(row[1])
            }

            if (!rate || !isFinite(rate)) {
                return json({ error: 'NBC rate not found' }, 502)
            }

            const out = {
                source: 'nbc.gov.kh',
                usd_khr: rate,
                as_of: new Date().toISOString(),
                ts: Date.now()
            }
            return json(out, 200, 30) // cache 30s at edge (optional)
        }

        // 404
        return new Response('Not found', { status: 404, headers: corsHeaders() })
    }
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Cache-Control': 'no-store'
    }
}

function json(obj, status = 200, edgeTtl = 0) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
            ...(edgeTtl ? { 'CDN-Cache-Control': `max-age=${edgeTtl}` } : {})
        }
    })
}
