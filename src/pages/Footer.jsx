import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()
    const year = new Date().getFullYear()
    const appName = 'Khmer Gold' // change if you prefer a different display name

    return (
        <footer className="border-t bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div>
                    {t('footer_line', '© {{year}} {{app}} • For informational purposes only', {
                        year,
                        app: appName,
                    })}
                </div>
                <div className="text-gray-400">
                    {t('footer_disclaimer', 'Prices shown are computed estimates; verify before trading.')}
                </div>
            </div>
        </footer>
    )
}
