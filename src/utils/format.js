export function formatCurrency(value, { currency = 'USD', locale = 'en', maxFrac } = {}) {
    const opts = {
        style: 'currency',
        currency,
        maximumFractionDigits: typeof maxFrac === 'number' ? maxFrac : (currency === 'KHR' ? 0 : 2),
        minimumFractionDigits: typeof maxFrac === 'number' ? maxFrac : (currency === 'KHR' ? 0 : 2)
    }
    const map = { km: 'km-KH', en: 'en-US', zh: 'zh-CN' }
    return new Intl.NumberFormat(map[locale] || 'en-US', opts).format(value)
}

export function formatNumber(value, { locale = 'en', digits = 0 } = {}) {
    const map = { km: 'km-KH', en: 'en-US', zh: 'zh-CN' }
    return new Intl.NumberFormat(map[locale] || 'en-US', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits
    }).format(value)
}

export function formatTime(tsMs, tz) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: 'short', year: 'numeric',
            timeZone: tz
        }).format(new Date(tsMs))
    } catch { return '' }
}
