# Calcio AI 1.0 — Cloudflare Pages

Versione convertita da Netlify a Cloudflare Pages.

## Struttura
- `index.html` — interfaccia
- `functions/api/analyze.js` — analisi pre-match
- `functions/api/details.js` — quote, assenti e formazioni
- `_routes.json` — esegue Functions solo su `/api/*`; la pagina statica non consuma richieste Worker
- `tools/backtest_model.py` — utility locale, non viene eseguita sul sito

## Pubblicazione con Cloudflare Pages
1. Crea un progetto Pages e carica/deploya questa cartella.
2. In Settings > Variables and Secrets aggiungi il secret `API_FOOTBALL_KEY`.
3. Non inserire la chiave API nei file del progetto.
4. La pagina usa `/api/analyze` e `/api/details`.

## Cache
- Analisi base: browser 30 min, cache Cloudflare 6 ore.
- Dettagli: browser 5 min, cache Cloudflare 30 min.
- `_routes.json` limita le invocazioni alle sole API.
