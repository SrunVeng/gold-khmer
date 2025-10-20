import { useEffect, useMemo, useRef, useState } from "react";

const GOLD_URL = "/api/gold";

async function getJson(url, opts) {
    const res = await fetch(url, opts);
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 160)}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
        throw new Error(`Expected JSON, got ${ct}: ${text.slice(0, 160)}`);
    }
    return JSON.parse(text);
}

export default function useLivePrices({ goldPollMs = 10000 } = {}) {
    const [gold, setGold] = useState(null);
    const goldTimer = useRef(null);

    async function fetchGold() {
        try {
            const j = await getJson(GOLD_URL, { cache: "no-store" });
            const it = (j.items && j.items[0]) || {};
            setGold({
                ts: j.ts || Date.now(),
                dateNY: j.date || "",
                xau: it.xauPrice,
                chg: it.chgXau,
                pc:  it.pcXau,
            });
        } catch (e) {
            // Optional: log so failures don't crash UI; skeleton will show until next poll succeeds.
            console.error("fetchGold error:", e);
        }
    }

    useEffect(() => {
        fetchGold();
        goldTimer.current = setInterval(fetchGold, goldPollMs);
        return () => {
            if (goldTimer.current) clearInterval(goldTimer.current);
        };
    }, [goldPollMs]);

    const ready = useMemo(() => !!gold, [gold]);
    return { gold, ready };
}
