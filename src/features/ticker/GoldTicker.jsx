import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useLivePrices from '../../hooks/useLivePrices'
import GoldPriceCard from '../../components/GoldPriceCard'
import { DEFAULT_DOMLENG_GRAMS } from '../../utils/units'
import { formatTime } from '../../utils/format'

const TZ_PP = 'Asia/Phnom_Penh'
const TZ_NY = 'America/New_York'

export default function GoldTicker() {
    const { t, i18n } = useTranslation()
    const { gold, nbc, nbcError, ready } = useLivePrices()

    const [domlengG, setDomlengG] = useState(DEFAULT_DOMLENG_GRAMS)
    const [currency] = useState('USD')
    const [rateMode, setRateMode] = useState('auto')
    const [manualRate, setManualRate] = useState(4020)

    const usdKhr = rateMode === 'auto' && nbc?.rate ? nbc.rate : manualRate
    const locale = i18n.resolvedLanguage || i18n.language || 'en'

    const computed = useMemo(() => {
        if (!gold) return null
        const priceOzUSD     = gold.xau
        const perDomlengUSD  = priceOzUSD * (domlengG / 31.1034768)
        const perChiUSD      = perDomlengUSD / 10
        const toDisplay      = (vUSD) => currency === 'USD' ? vUSD : vUSD * (usdKhr || 0)
        return {
            perDomleng:   toDisplay(perDomlengUSD),
            perChi:       toDisplay(perChiUSD),
            perDomlengUSD,
            perChiUSD
        }
    }, [gold, domlengG, currency, usdKhr])

    if (!ready || !computed) {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <div className="animate-pulse h-24 rounded-2xl bg-gray-100" />
            </div>
        )
    }

    const currencyLabel = currency === 'USD' ? 'USD' : 'KHR'

    return (
        <div className="w-full max-w-3xl mx-auto">
            <GoldPriceCard
                computed={computed}
                currencyLabel={currencyLabel}
                gold={{
                    ...gold,
                    tsPP: formatTime(gold.ts, TZ_PP),
                    dateNY: gold.dateNY || formatTime(gold.ts, TZ_NY)
                }}
                locale={locale}
                domlengG={domlengG}
                setDomlengG={setDomlengG}
                rateMode={rateMode}
                setRateMode={setRateMode}
                manualRate={manualRate}
                setManualRate={setManualRate}
                nbc={nbc}
                nbcError={nbcError}
                usdKhr={usdKhr}
            />

            <div className="mt-2 text-xs text-gray-500 text-right">
                {t('last_updated_pp')}: <span className="font-medium">{formatTime(gold.ts, TZ_PP)}</span>
                <span className="mx-2">•</span>
                {t('ny_time')}: <span className="font-medium">{gold.dateNY}</span>
            </div>
        </div>
    )
}
