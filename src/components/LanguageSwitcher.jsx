import React from 'react'
import { useTranslation } from 'react-i18next'
import ReactCountryFlag from 'react-country-flag'

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation()
    const active = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]

    // Map language -> ISO country code for the flag
    const langs = [
        { code: 'km', label: 'ខ្មែរ', country: 'KH' }, // Cambodia
        { code: 'en', label: 'English', country: 'US' }, // or 'GB'
        { code: 'zh', label: '中文', country: 'CN' },
    ]

    const handleChange = (code) => {
        // Instant language swap
        i18n.changeLanguage(code)
        // optional: persist preference
        try { localStorage.setItem('lang', code) } catch {}
    }

    const Button = ({ code, label, country }) => {
        const isActive = active === code
        return (
            <button
                type="button"
                onClick={() => handleChange(code)}
                aria-label={label}
                aria-pressed={isActive}
                title={label}
                className={[
                    'group relative inline-flex size-9 items-center justify-center rounded-full border',
                    'motion-safe:transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70',
                    isActive
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm ring-1 ring-amber-400/60'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200',
                    'dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800',
                    isActive ? 'dark:bg-white dark:text-zinc-900' : '',
                    'active:scale-95',
                ].join(' ')}
            >
                <ReactCountryFlag
                    countryCode={country}
                    svg
                    aria-hidden="true"
                    style={{
                        width: '1.125rem',
                        height: '1.125rem',
                        borderRadius: '9999px',
                    }}
                />
                {/* glow ring on hover */}
                <span
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                        boxShadow: '0 0 0 6px rgba(251, 191, 36, 0.10)', // amber-400/10
                    }}
                    aria-hidden="true"
                />
                {/* Tooltip */}
                <span
                    className="pointer-events-none absolute -bottom-9 scale-95 opacity-0 rounded-full bg-gray-900 px-2 py-1 text-[10px] font-medium text-white shadow-md transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 dark:bg-zinc-800"
                    role="presentation"
                >
          {label}
        </span>
            </button>
        )
    }

    return (
        <div className="flex items-center gap-2" role="group" aria-label={t('language', { defaultValue: 'Language' })}>
      <span className="text-xs text-gray-500 hidden sm:inline dark:text-zinc-400">
        {t('language', { defaultValue: 'Language' })}:
      </span>
            <div
                className={[
                    'flex items-center gap-2 rounded-full border p-1',
                    'bg-white/70 backdrop-blur supports-backdrop-blur:border-gray-200',
                    'border-gray-200',
                    'dark:bg-zinc-900/60 dark:border-zinc-800',
                ].join(' ')}
            >
                {langs.map((lng) => (
                    <Button key={lng.code} {...lng} />
                ))}
            </div>
        </div>
    )
}
