# Calcio AI 1.2

Versione separata dalla 1.1.1 stabile.

## Novità principali
- Tre livelli leggibili: Dati reali → Analisi del modello → Previsioni AI.
- Elo dinamico mostrato come rating numerico, separato dalla forza strutturale.
- Forza strutturale calcolata dal rendimento e normalizzata rispetto al campionato (1.00 = media).
- Forma recente pesata per recenza e forza degli avversari.
- Casa/trasferta mostrata con dati osservati.
- H2H fino a 5 precedenti, con peso massimo molto basso (±3%) nel motore.
- xG modello esplicitamente etichettato come stima del modello, non xG ufficiale.
- Affidabilità e campione mantenuti visibili.
- Rate-limit protection e cache upstream della 1.1.1 mantenuti.

## Nota su tiri, corner e cartellini
Non vengono inventati. L'attuale flusso API non fornisce nel dataset già caricato una base storica sufficiente per stimarli seriamente senza moltiplicare le chiamate /fixtures/statistics e rischiare nuovamente il limite per minuto. La 1.2 mostra quindi solo metriche che il motore può motivare con i dati effettivamente disponibili. La fase successiva dovrà aggiungere uno storico statistico persistente/cache dedicata prima di esporre queste previsioni.

## Installazione
Caricare i file sul branch dedicato `calcio-ai-1.2`. Il Worker usa `worker.js`; `index.html` è incluso anche separatamente per leggibilità, ma è già incorporato in Base64 dentro `worker.js`.
