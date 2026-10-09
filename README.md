# Moss & Moon — directory con catalogo YAML

Versione aggiornata: **5 negozi dimostrativi, 36 voci di inventario, un file `.yml` per negozio**. Commenti e istruzioni per la compilazione sono in italiano; l’interfaccia resta in inglese. Il design originale, la ricerca, i filtri, i preferiti, i temi e le schede sono mantenuti.

**Sostituisci l’intero pacchetto precedente**, non soltanto `js/data.js`: sono cambiati il caricamento iniziale, la validazione, la visualizzazione dei prezzi, il modulo proposte e il workflow. L’unico HTML resta `index.html` e tutti i contenuti dell’interfaccia vengono creati da JavaScript.

## Dove modificare i dati

```text
index.html                         Unica pagina, struttura minimale
config.yml                         Testi, link, categorie, zone e valuta generale
shops/
  index.yml                        Elenco dei file da caricare
  woolery.yml                      The Woolery
  pale-found.yml                   Pale & Found
  moonbound.yml                    Moonbound Books
  circuit.yml                      Circuit & Co.
  builders-bench.yml                The Builder’s Bench
docs/
  shop-template.yml                Modello commentato da duplicare; NON attivo
  TESTING.md                       Verifiche effettuate e limiti
js/
  data.js                          Lettura e validazione dei YAML, non dati da editare
  core.js                          Ricerca, filtri, valute e validazione
  app.js                           Rendering e interazioni
  art.js                           Icone e illustrazioni
  theme.js                         Ripristino del tema
  vendor/                          Parser YAML locale e licenza
assets/logo.png                    Logo fornito
css/style.css                      Stile e responsive
.github/workflows/pages.yml        Validazione e pubblicazione facoltativa
tests/                             Test; non necessari per visitare il sito
```

Non devi modificare JavaScript per aggiungere, rimuovere o aggiornare negozi. `js/data.js` non contiene più il catalogo. Non esiste una copia JSON del catalogo da mantenere sincronizzata.

## Aggiungere un negozio

Copia `docs/shop-template.yml` in `shops/nome-negozio.yml`. Compila nome, proprietario, descrizione, categorie, posizione, coordinate, immagini facoltative e inventario. **Cambia anche `id`**, che deve essere univoco nell’intera directory. I commenti del modello spiegano ogni campo e i valori disponibili.

Aggiungi il nome del file a `shops/index.yml`:

```yaml
shops:
  - woolery.yml
  - pale-found.yml
  - moonbound.yml
  - circuit.yml
  - builders-bench.yml
  - nome-negozio.yml  # Il nuovo file è relativo alla cartella shops/
```

Pubblica entrambi i file. Il sito legge il manifest e quindi i singoli negozi. Non cerca file attraverso l’API di GitHub e non prova a enumerare la directory del server.

Per **aggiornare** uno shop, modifica soltanto il suo YAML e pubblicalo. Per **rimuoverlo** dal catalogo, togli la riga dal manifest. Elimina anche il file dal sito pubblicato se non deve più essere accessibile direttamente.

I cinque negozi sono solo la quantità di esempi inclusi, **non un limite del software**. L’ordine del manifest è mantenuto come ordine base; l’ordinamento “Featured first” porta in cima quelli con `featured: true`. Puoi creare una directory vuota con `shops: []`.

## Prezzi: diamanti oppure blocchi di diamante

Le due valute accettate sono:

| Valore YAML | Visualizzazione |
|---|---|
| `diamond` | diamond / diamonds, con icona del diamante |
| `diamond_block` | diamond block / diamond blocks, con icona del blocco |

La valuta si può impostare a tre livelli: **prodotto → negozio → `config.currency` in `config.yml`**. Vince sempre l’impostazione più specifica. Se il prodotto non ha `currency`, usa quella del negozio; se manca anche quella, usa il valore generale, predefinito `diamond`.

Esempio di parte di un file negozio:

```yaml
# Valuta predefinita del negozio
currency: diamond

items:
  - id: stone
    name: Stone
    price: 1             # 1 diamante per l’intero lotto di 64 oggetti
    quantity: 64
    stock: in
    icon: cube

  - id: black_wool_bulk
    name: Black Wool — bulk
    price: 3             # 3 blocchi di diamante per l’intero lotto
    currency: diamond_block
    quantity: 1728
    unit: items
    stock: in
    icon: wool
    color: "#303437"

  - id: custom_order
    name: Custom order
    price: null          # Mostra “Ask owner”, non un prezzo pari a zero
    quantity: 1
    unit: project
    stock: unknown
    icon: tools
```

**Il prezzo non viene convertito automaticamente.** `price: 3` con `currency: diamond_block` viene mostrato come **3 diamond blocks**, non come 3 diamanti. Cambiando solo la valuta cambi il significato della cifra. Non è presente un selettore visitatore per convertire tutti i prezzi: ogni voce espone la valuta scelta dal proprietario.

`price` è il costo dell’intera quantità `quantity`, non il prezzo per singolo oggetto. Usa un numero senza virgolette: `1`, `2`, `1.5`; usa il punto per i decimali. `0` indica un prezzo gratuito; `null` indica un prezzo da concordare. Non scrivere `"1 diamond"`, `"1"` o `1,5`.

`quantity` è un intero positivo. Il testo `unit` è facoltativo: se omesso viene usato `item` per quantità 1 oppure `items`. Per servizi puoi scrivere `unit: project`. Non esiste un calcolo automatico del contenuto di stack, shulker o contenitori: scrivi la quantità effettivamente venduta e specifica nelle note se il contenitore è incluso.

## Regole YAML e campi

Usa **2 spazi per ogni livello**, mai TAB. Il trattino `-` introduce una nuova voce di un elenco. `true`, `false`, numeri e `null` non vanno tra virgolette. I commenti iniziano con `#`: non sono mostrati nell’interfaccia ma restano nel file pubblico.

Per testi con due punti, cancelletto o caratteri particolari usa virgolette:

```yaml
name: "Pale & Found: shop #1"
notes: "Ask the owner before taking an empty shulker."
color: "#e7e5df"  # Senza virgolette, # inizierebbe un commento
```

Puoi scrivere descrizioni lunghe su più righe:

```yaml
description: >-
  These two source lines become
  one paragraph on the website.

notes: |
  First line.
  Second line, with its line break preserved.
```

Per gli elenchi vuoti usa `images: []`, `tags: []` o `aliases: []`. Una chiave lasciata senza valore diventa `null`, non una lista vuota, e viene segnalata se il campo richiede una lista.

**Campi essenziali di uno shop:** `id`, `name`, `owner`, `description`, `categories`, `location`, `coords`, `updated`, `items`. `categories` è una lista di ID presenti in `config.yml`; `location` è un ID di zona presente nello stesso file. Ogni coordinata deve essere un intero. `updated` deve essere una vera data `YYYY-MM-DD`.

**Valori predefiniti per i campi facoltativi:** `kind: shop`, `status: unverified`, `demo: false`, `featured: false`, `theme: welcome`, `tags: []`, `images: []`, testi aggiuntivi vuoti e valuta ereditata dalla configurazione.

**Campi essenziali di un prodotto:** `id`, `name`, `price`, `quantity`. Gli ID dei prodotti devono essere univoci all’interno dello stesso inventario. Gli altri campi hanno predefiniti: valuta ereditata dal negozio, `stock: unknown`, `icon: cube`, `aliases: []` e unità in base alla quantità.

**Tipo:** `shop`, `stall` o `service`. **Stato:** `open`, `paused` o `unverified`. Tutti questi stati restano pubblici se il file è nel manifest; il filtro “Listed as in stock” considera solo i negozi `open` con prodotti `in` o `low`.

Per le immagini inserisci i file sotto `assets/shops/` e usa percorsi **relativi a `index.html`**, non al YAML:

```yaml
images:
  - src: assets/shops/my-shop/front.webp
    alt: Front of the shop
  - src: assets/shops/my-shop/inside.webp
    alt: Inside the shop
```

La prima immagine è la copertina. Senza foto viene usata l’illustrazione di `theme`. Le immagini mancanti hanno un ripiego visivo; il validatore della pubblicazione segnala risorse locali mancanti. Sono accettati anche URL HTTP(S), che introducono però richieste a siti esterni.

Il parser usa YAML con schema Core: date mantenute come testo, niente tag JavaScript o chiavi di merge. Non usare `<<`, `__proto__`, `constructor`, `prototype` o riferimenti ciclici. Un file troppo grande o annidato viene rifiutato. Chiavi sconosciute negli shop e nei prodotti vengono segnalate per intercettare refusi.

## Cosa succede in caso di errore

Il sito mostra un messaggio con **nome del file** e problema rilevato. Per errori di sintassi YAML sono incluse anche riga e colonna. File mancanti indicano l’errore HTTP. Le richieste scadono dopo 15 secondi.

La directory non presenta in silenzio un catalogo parziale: se un file richiesto è errato, mostra la schermata di errore e consente di riprovare. Correggi il file, ripubblica e ricarica. L’uso del workflow incluso blocca il nuovo deploy quando validazione o test falliscono.

## Proposte dal sito

“List your shop” esporta ora **un file `.yml` commentato**, non JSON. Il modulo permette di scegliere la valuta predefinita. Prezzi e stock vengono completati durante la revisione (`price: null`, `stock: unknown`). Il file esportato può essere letto dallo stesso loader dopo la verifica e l’aggiunta al manifest.

Il modulo non invia, salva nel repository, approva o pubblica nulla. I gestori devono verificare manualmente la proposta prima di metterla nel catalogo. `status: unverified` è un’etichetta, non una coda di moderazione privata.

## Anteprima locale

Questa versione legge file separati tramite `fetch()`: **il doppio clic su `index.html` non è il metodo di avvio previsto**. Utilizza GitHub Pages oppure un server locale. Per esempio, con Python installato, dal terminale nella cartella del progetto:

```sh
python -m http.server 8080
```

Su Windows puoi usare anche `py -m http.server 8080` se Python è configurato con il launcher. Apri `http://localhost:8080`. Il parser è incluso nel pacchetto: il sito non scarica librerie o font da CDN. Non servono Node.js, npm o una compilazione per visualizzare il sito; Node.js serve soltanto per i test facoltativi.

## Pubblicazione su GitHub Pages

Il sito non è stato pubblicato sul tuo account. Il pacchetto include un workflow facoltativo per il branch `main`.

1. Carica **il contenuto** della cartella `moss-moon-directory` alla radice del repository. Includi `config.yml`, `shops/`, `js/vendor/`, `tests/`, `.github/` e `.nojekyll`, oltre agli altri file. Non creare una cartella radice aggiuntiva per errore.
2. In **Settings → Pages → Source** seleziona **GitHub Actions**.
3. Pubblica su `main` oppure avvia il workflow **Validate and deploy directory**. Con un altro branch, aggiorna `branches: [main]` nel workflow.

Il workflow esegue test e validazione e copia `index.html`, `config.yml`, `assets/`, `css/`, `js/` e **l’intera cartella `shops/`** nella pubblicazione. Non genera HTML e non trasforma gli YAML in JS. I YAML vengono serviti e letti come file statici. I percorsi relativi funzionano anche sotto il percorso del repository, senza modificare il codice.

In alternativa puoi pubblicare i file statici con una configurazione Pages già esistente: assicurati che `.nojekyll` sia nella radice pubblicata e che i file `.yml` non siano esclusi dalla pipeline. Il workflow incluso è la configurazione di riferimento del pacchetto.

Le istruzioni di configurazione si basano sulla documentazione ufficiale GitHub Pages e sul template Static HTML; l’esecuzione reale dipende dai permessi del repository e non è stata provata sul tuo account.

Fonti tecniche:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://github.com/actions/starter-workflows/blob/main/pages/static.yml

## Test

Dalla cartella principale, con Node.js 22:

```sh
node --test tests/*.test.cjs
node tests/validate-data.cjs
```

Le fixture dei test di ricerca sono separate dai dati pubblicati. Il validatore e il test HTTP leggono invece il catalogo corrente. Per le prove browser e i limiti dell’ambiente usato vedi `docs/TESTING.md`.

## Dati di esempio e informazioni pubbliche

I cinque negozi, i proprietari, le 36 voci, i prezzi, le coordinate, le date e le disponibilità sono **dimostrativi**. Prima di una directory ufficiale sostituiscili con informazioni approvate; imposta `demo: false` su ciascuna scheda reale e `config.demoMode: false` quando l’intero catalogo è pronto. Aggiorna anche i testi che parlano della demo.

Stock e prezzi non sono sincronizzati con Minecraft. Il logo è quello fornito; le vignette sono illustrazioni, non screenshot di negozi reali. Indirizzo e link non implicano una verifica dello stato del server.

**Ogni file pubblicato, anche non elencato nel manifest, e tutti i commenti sono leggibili pubblicamente.** Non inserire password, token, bozze riservate o dati privati negli YAML o nel codice. Un file non elencato non appare nella ricerca, ma non è protetto da accessi diretti.

Tema e preferiti sono locali al browser; nessun account, checkout, analytics o collegamento automatico a Discord è incluso. Le informazioni sulla libreria YAML locale, la modifica applicata e la licenza sono in `js/vendor/README.md` e `js/vendor/js-yaml.LICENSE.txt`.
