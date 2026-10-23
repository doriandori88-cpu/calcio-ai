# Calcio AI 1.7

Worker Cloudflare su branch `calcio-ai-1.2`. `worker.js` contiene API e HTML incorporato;
`index.html` ne è la copia leggibile. Il nome del branch e del Worker resta invariato.

## Campionati disponibili

Serie A (135), Premier League (39), Bundesliga (78), La Liga (140), Ligue 1 (61) e Champions League (2). I campionati nazionali usano lo stesso modello domestico con dati della propria competizione e stagione corrente. Snapshot e lavori di recupero sono separati per campionato; archivio delle statistiche e limite API restano condivisi. Il recupero parte quando si apre la competizione e può richiedere più passaggi. Dati non disponibili restano mancanti, senza inventare xG.

## Confronto Champions

Il modello precedente confrontava direttamente indici relativi a campionati diversi.
La versione 1.7 attenua il dominio domestico (esponente 0,35 per forza e fattori
attacco/difesa) e applica un riferimento storico fra federazioni a entrambe le
componenti, risultati e xG. Nessuna eccezione basata sul nome di un club.

Il riferimento è la classifica **finale 2025**, relativa al quinquennio
2020/21–2024/25, non la classifica live e non un rating dei singoli club.
Dati: https://kassiesa.net/uefa/data/method5/crank2025.html
Metodo UEFA: https://www.uefa.com/nationalassociations/uefarankings/country/

Moltiplicatore gol casa: `exp(0.025 * (rankAway - rankHome))`, limitato a
`[1/2.2, 2.2]`; per l'ospite si usa il reciproco. Si applica dopo il blend xG.
I parametri sono **euristici, non stimati con un backtest**. La qualità dati
Champions resta bassa. Il coefficiente nazionale è solo una correzione iniziale:
non dimostra che una squadra specifica sia più forte di un'altra.

Il riferimento è utilizzabile per gare dal 1 luglio 2025 al 30 giugno 2027;
fuori dall'intervallo, o con paese non riconosciuto, il confronto fra campionati
si astiene invece di equiparare implicitamente le leghe. La mappatura usa il paese
nei metadati API-Football della lega già identificata. Stesso campionato: fattore 1.
Prima della stagione 2027/28 occorre aggiornare e verificare il riferimento.

## Verifica e pubblicazione

Richiede Node 22+ per i test locali:

```sh
node --check worker.js
node --test test-worker.cjs
```

Il confronto numerico Serie A con la versione precedente può essere abilitato con:

```sh
git show de797193fb74cdc441ddc0a64271c4b06ba5f897:worker.js > original-worker.js
node --test test-worker.cjs
```

Senza quel file il solo confronto con la versione precedente viene saltato.
I test usano una data fissa e dati sintetici: non costituiscono validazione predittiva
su partite reali e non riproducono i dati originali Sabah–Dortmund.

Le versioni nuove sono `1.7.0-af` e `1.7.0-af-ucl`: storico distinto dalle versioni
precedenti, importazione 1.5/1.6 conservata e snapshot previsionali precedenti
invalidati. L'archivio dei dati API-Football rimane riutilizzabile.
`wrangler.jsonc` e secret `API_FOOTBALL_KEY` restano quelli esistenti.

## Limiti API e diagnostica

Il client legge separatamente le quote giornaliere e al minuto, rispetta Retry-After (secondi o data HTTP) e condivide la pausa tra le richieste di analisi e il recupero in background. In assenza di un tempo dichiarato, i rifiuti consecutivi causano pause progressive da 65 secondi fino a 15 minuti. Un successo azzera il conteggio dei rifiuti. La UI usa il tempo comunicato dal server .

`/api/coverage?league=135` espone `rateDiagnostics`: solo gli ultimi 10 campioni con orario, endpoint senza parametri, stato HTTP e contatori numerici. Nessuna chiave, IP o intestazione completa. Intestazioni mancanti restano null, non diventano zero. I campioni permettono di distinguere un limite dichiarato da un rifiuto privo di contatori; non provano da soli la causa del blocco. Fonte: https://www.api-football.com/news/post/how-ratelimit-works

Test: `node --test test-worker.cjs test-rate.cjs`. Non costituiscono validazione delle previsioni.

Il primo recupero di un campionato nazionale usa al massimo due chiamate upstream: metadati e calendario. Le statistiche aggiuntive sono recuperate nei passaggi successivi. Nella coda hanno precedenza i campionati senza snapshot; a parità di priorità ruotano in base all’ultimo tentativo, anche quando la pausa API impedisce nuove chiamate.
