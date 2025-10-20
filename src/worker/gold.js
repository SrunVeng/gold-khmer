module.exports = async (req, res) => {
    try {
        const upstream = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
            headers: { accept: "application/json" }
        });

        const text = await upstream.text();

        if (!upstream.ok) {
            return res.status(upstream.status).send(text);
        }

        const ct = upstream.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
            return res.status(502).json({ error: "Upstream not JSON", sample: text.slice(0, 200) });
        }

        const json = JSON.parse(text);
        res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
        return res.status(200).json(json);
    } catch (e) {
        return res.status(500).json({ error: String(e) });
    }
};
