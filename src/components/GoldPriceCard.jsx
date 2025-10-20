import { useTranslation } from 'react-i18next'
import { formatCurrency, formatNumber } from '../utils/format'

export default function GoldPriceCard({
                                          computed, currencyLabel, gold, locale,
                                      }) {
    const { t } = useTranslation()
    const goldDelta = gold?.chg ?? 0
    const goldPc    = gold?.pc  ?? 0
    const up        = goldDelta >= 0

    return (
        <div className="rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{t('gold')}</div>
                    <div className="flex items-baseline gap-3">
                        <div className="text-3xl sm:text-4xl font-semibold">
                            {formatCurrency(computed.perDomleng, { currency: currencyLabel, locale })}
                        </div>
                        <div className={`text-sm ${up?'text-emerald-600':'text-rose-600'}`}>
                            {up ? '▲' : '▼'} {formatNumber(Math.abs(goldPc), { locale, digits: 2 })}% <span className="text-gray-400">({t('gold_change')})</span>
                        </div>
                    </div>
                    <div className="text-gray-500 mt-1 text-sm">{t('per_domleng')}</div>
                </div>
            </div>

            <div className="mt-3 text-gray-700">
                <div className="text-sm">
                    <span className="text-gray-500">{t('per_chi')}:</span>{' '}
                    <span className="font-medium">
            {formatCurrency(computed.perChi, { currency: currencyLabel, locale })}
          </span>
                </div>
            </div>
        </div>
    )
}
