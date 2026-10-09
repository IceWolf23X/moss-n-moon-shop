# Verifiche della versione YAML

Verifiche effettuate il 9 ottobre 2026. Dati inclusi: **5 shop e 36 voci di inventario**. Questi numeri descrivono il pacchetto dimostrativo, non un catalogo verificato sul server.

## Test Node: 36 test superati

14 test del motore, 18 test YAML/valute e 4 test HTTP. Coprono ricerca, alias e servizi, filtri combinati, preferiti, ordinamento, escaping, coordinate, date, ID, tipi di dato, commenti YAML, stringhe multilinea, valute e predefiniti, export e reimportazione di una proposta.

I casi negativi includono sintassi errata e chiavi duplicate, TAB, file assenti, path/URL non ammessi nel manifest, ID duplicati tra shop, prezzi come stringhe, prezzi negativi o NaN, quantità errate, categorie sconosciute, valori booleani tra virgolette, refusi, immagini/tag di tipo errato, tag JavaScript, chiavi riservate e alias ciclici. È incluso un test di regressione per la chiave `__proto__` nelle mappe di merge della libreria modificata.

**HTTP reale, eseguito in Node:** il loader di produzione carica i file YAML dal filesystem tramite un server HTTP locale, sotto un prefisso `/directory-repo/`. Verifica percorsi relativi, ordine del manifest, numero delle richieste, 404, timeout e rifiuto del protocollo `file:`. Questo prova il percorso fetch/lettura/parse/validazione in Node; non è una prova di deploy GitHub Pages né una prova delle politiche di rete di tutti i browser.

## Browser Chromium: 73 controlli superati

Rendering con cinque schede, due file di catalogo più cinque shop, ricerca e suggerimenti da tastiera, filtri, vuoti, griglia/elenco, preferiti, ordinamento, finestre, inventario, etichette e icone per entrambe le valute, override sul prodotto, copia preparata, link, Esc e focus, tema, modulo YAML con valuta e commenti, nome del download, riapertura del modulo e link non configurati.

Verificati percorsi di errore con file/riga/colonna e catalogo vuoto. Nessun errore JavaScript runtime nella suite. Controllata assenza di overflow orizzontale a 320, 390, 540, 768, 1024, 1440, 1920 e 3440 pixel. Ispezionate immagini desktop, mobile e dettaglio con prezzi in entrambe le valute. Non viene dichiarata una certificazione di accessibilità o una verifica con tutti i browser.

## Limite importante delle prove browser

La navigazione Chromium verso un server locale è stata tentata e ha restituito `net::ERR_BLOCKED_BY_ADMINISTRATOR`. La suite è stata quindi eseguita con **`--inline-fixture`**: incorpora gli stessi script e gli stessi YAML del prodotto, ma sostituisce esplicitamente le risposte fetch con i testi dei file, insieme a storage, clipboard e avvio download.

Il loader e il parser reali continuano a leggere il testo YAML nella fixture. Non viene fornito un catalogo JSON già trasformato al posto della lettura YAML. Il logo è adattato solo nella fixture a un data URI dopo la validazione.

Questa modalità **non dimostra** navigazione browser HTTP(S) end-to-end, comportamento CORS del sito ospitato, persistenza reale dopo riavvio, accesso agli appunti del sistema o salvataggio reale del download. La prova HTTP Node sopra descritta è separata e non rimuove questi limiti. Nessun deploy o test sul repository dell’utente è stato eseguito.

## Ripetere i test

```sh
node --test tests/*.test.cjs
node tests/validate-data.cjs
```

Prove browser facoltative, con dipendenze solo di sviluppo:

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

Per un ambiente che blocca la navigazione:

```sh
python tests/browser_smoke.py --inline-fixture --screenshots ./test-previews
```

`CHROMIUM_EXECUTABLE` può indicare un eseguibile Chromium esistente. La suite browser fotografa i cinque esempi e richiede l’adeguamento dei nomi/conteggi se cambi il catalogo. I test del motore usano una fixture indipendente; il validatore legge sempre il catalogo reale.

## Prima del deploy reale

Controlla i dati approvati e i file immagine, esegui il validatore, verifica che `config.yml`, `shops/` e `js/vendor/` siano pubblicati e che Pages sia configurato. Sul sito ospitato prova apertura, ricerca, link a un negozio, reload, copia delle coordinate, download YAML, preferiti e tema. Conferma i link Discord/store con i gestori.

Non sono stati eseguiti un audit di sicurezza indipendente, una verifica con screen reader o test di sincronizzazione Minecraft. Non è prevista alcuna sincronizzazione automatica.
