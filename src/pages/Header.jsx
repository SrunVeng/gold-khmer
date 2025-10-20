import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'

export default function Header() {
    const { t } = useTranslation()
    const [mounted, setMounted] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        setMounted(true)
        const calc = () => {
            const y = window.scrollY || 0
            const h = document.documentElement.scrollHeight - window.innerHeight
            setScrolled(y > 6)
            setProgress(h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0)
        }
        calc()
        window.addEventListener('scroll', calc, { passive: true })
        window.addEventListener('resize', calc)
        return () => {
            window.removeEventListener('scroll', calc)
            window.removeEventListener('resize', calc)
        }
    }, [])

    const appName = t('app_name', 'Khmer Gold')

    return (
        <header
            className={[
                'sticky top-0 z-20 backdrop-blur-xl transition-[box-shadow,background-color] duration-300',
                scrolled
                    ? 'bg-white/85 shadow-sm border-b border-gray-200 dark:bg-zinc-950/80 dark:border-zinc-800'
                    : 'bg-white/60 dark:bg-zinc-950/50',
            ].join(' ')}
        >
            {/* Skip link */}
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 rounded-md bg-amber-500 px-3 py-2 text-white"
            >
                {t('skip_to_content', 'Skip to content')}
            </a>

            {/* Scroll progress bar */}
            <div
                className="absolute left-0 top-0 h-[2px] origin-left bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 transition-transform duration-200"
                style={{ transform: `scaleX(${progress / 100})`, width: '100%' }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                aria-label={t('scroll_progress', 'Scroll progress')}
            />

            <div
                className={[
                    'mx-auto max-w-7xl px-4 sm:px-6',
                    'transition-all duration-500',
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
                ].join(' ')}
            >
                <div className="flex h-16 items-center justify-between">
                    {/* Brand */}
                    <a href="/" className="flex items-center gap-3" aria-label={appName}>
                        <div className="relative">
                            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white text-sm font-semibold shadow-sm">
                                KG
                            </div>
                            {/* subtle glow */}
                            <span
                                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
                                style={{ boxShadow: '0 0 24px 6px rgba(251, 191, 36, 0.15)' }}
                                aria-hidden="true"
                            />
                        </div>
                        <div className="leading-tight">
                            <div className="flex items-center gap-2">
                                <h1 className="text-[15px] sm:text-base font-semibold tracking-tight dark:text-zinc-100">
                                    {appName}
                                </h1>
                            </div>

                        </div>
                    </a>

                    {/* Right tools */}
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    )
}
