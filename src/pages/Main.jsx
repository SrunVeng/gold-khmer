import React from 'react'
import Footer from "./Footer.jsx";
import GoldTicker from "../features/ticker/GoldTicker.jsx";

export default function Main() {
    return (
        <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                {/* Ticker Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GoldTicker />
                </div>
            </div>
        </main>
    )
}
