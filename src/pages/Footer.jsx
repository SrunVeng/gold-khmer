import React from 'react'

export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="border-t bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div>© {year} Gold Ticker • For informational purposes only</div>
                <div className="text-gray-400">
                    Prices shown are computed estimates; verify before trading.
                </div>
            </div>
        </footer>
    )
}
