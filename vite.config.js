import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev proxy:
// - /api/gold → GoldPrice.org (Vite handles CORS in dev)
// - /api/nbc  → your local Cloudflare Worker at http://127.0.0.1:8787/nbc (run `wrangler dev`)
//   If you’re not running the worker, the app will fall back to manual rate input.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/api/gold': {
                target: 'https://data-asg.goldprice.org',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/gold$/, '/dbXRates/USD'),
            },
            '/api/nbc': {
                target: 'https://www.nbc.gov.kh/english/economic_research/exchange_rate.php',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api\/nbc/, '/nbc'),
            }
        }
    }
})
