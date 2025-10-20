export function formatNumber(value, { locale = "en", digits = 2 } = {}) {
    if (value == null || Number.isNaN(value)) return "-";
    try {
        return new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    } catch {
        return String(value);
    }
}

export function formatCurrency(value, { locale = "en", currency = "USD" } = {}) {
    if (value == null || Number.isNaN(value)) return "-";
    try {
        return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    } catch {
        // Fallback if currency code not available in env
        return `${currency} ${formatNumber(value, { locale, digits: 2 })}`;
    }
}

export function formatTime(ts, timeZone = "UTC") {
    const d = typeof ts === "number" ? new Date(ts) : new Date(ts || Date.now());
    try {
        return new Intl.DateTimeFormat("en-GB", {
            timeZone,
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }).format(d);
    } catch {
        return d.toISOString();
    }
}
