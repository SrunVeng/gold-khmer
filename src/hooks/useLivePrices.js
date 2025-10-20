import { useEffect, useMemo, useRef, useState } from 'react'

const GOLD_URL = '/api/gold'
const NBC_URL  = '/api/nbc'

export default function useLivePrices({
                                          goldPollMs = 10000,      // 10s
                                          nbcPollMs  = 300000      // 5 min
                                      } = {}) {
    const [gold, setGold] = useState(null)
    const [nbc, setNbc]   = useState(null)
    const [nbcError, setNbcError] = useState(null)
    const goldTimer = useRef()
    const nbcTimer  = useRef()

    async function fetchGold() {
        const r = await fetch(GOLD_URL, { cache: 'no-store' })
        const j = await r.json()
        const it = (j.items && j.items[0]) || {}
        setGold({
            ts: j.ts || Date.now(),
            dateNY: j.date || '',
            xau: it.xauPrice,
            chg: it.chgXau,
            pc:  it.pcXau
        })
    }

    async function fetchNBC() {
        try {
            const r = await fetch(NBC_URL, { cache: 'no-store' })
            if (!r.ok) throw new Error(`NBC ${r.status}`)
            const j = await r.json()
            setNbc({ rate: Number(j.usd_khr), asOf: j.as_of || '', ts: j.ts || Date.now() })
            setNbcError(null)
        } catch (e) {
            setNbcError(e.message)
        }
    }

    useEffect(() => {
        fetchGold(); goldTimer.current = setInterval(fetchGold, goldPollMs)
        fetchNBC();  nbcTimer.current  = setInterval(fetchNBC,  nbcPollMs)
        return () => { clearInterval(goldTimer.current); clearInterval(nbcTimer.current) }
    }, [goldPollMs, nbcPollMs])

    const ready = useMemo(() => !!gold, [gold])
    return { gold, nbc, nbcError, ready }
}
