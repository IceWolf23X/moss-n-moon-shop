# YAML version verification

## Hidden editor notes and unannounced book prices — October 10, 2026

The maintainer clarified that Swift Sneak/Soul Speed still have no announced prices and requested removal of every shop's visible Notes panel. Those two book prices are now `null`; the other 41 books retain 2-diamond unit prices and confirmed levels. The shared shop renderer no longer renders editor notes, and its unused CSS was removed without affecting description/directions whitespace. Editor provenance remains in YAML; essential sponge-rental and remote-horse terms are visible in their item names.

The new price regression failed before correction and passed afterwards; the browser assertion for note hiding likewise failed before removal. The catalog validator and **7 catalog regressions** passed. Real local HTTP/Chromium checks covered **all 23 dialogs without Notes**, retained editor metadata, both future prices displayed as Ask owner, 41 two-diamond book prices, visible rental/Nether-location terms, mobile overflow and no JavaScript page errors. Desktop future-book and mobile rental captures were opened and inspected. Application JS syntax, Python smoke syntax and `git diff --check` passed; the Python Playwright suite itself remains unexecuted because its optional module is not installed.

## Neon Lights CyberStore visit — October 10, 2026

The maintainer confirmed **45, 100, 327**, supplied the original facade, and confirmed **1 diamond per 128 froglights** for all three types plus **1 diamond per 64 End Rods**. Existing price fields already matched and were retained. The original future Sea Lanterns entry remains unpriced/unconfirmed; all stock stays unknown. The photo copy matches the source SHA-256.

The catalog validator and **6 catalog regressions** passed. Production-loader checks verified all three equal froglight trades, End Rods, coordinates and retained future entry. **17 real local HTTP/Chromium checks** passed, including facade in card/details, Y 100, exact coordinate-copy format, four 1-diamond prices, three 128-item batches and one 64-item batch, confirmation notes, owner-verification stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. Affected index paths and `git diff --check` passed.

## Enchanted Archives book prices/levels — October 10, 2026

The maintainer stated **all books cost 2 diamonds per book**, supplied five shelf-label screenshots matching 33 existing labels, and confirmed all other enchantments are maximum level except the separately displayed **Knockback I/II**. All 43 book entries now use `price: 2`, `quantity: 1`, `unit: book`; the free cookie, stable IDs and unknown availability are preserved. Original Swift Sneak/Soul Speed coming-soon labels remain separate from the pricing/maximum-level rule and do not assert arrival.

Numerical maxima were extracted from the installed vanilla **1.21.11 and 26.3 client JARs** at `data/minecraft/enchantment/*.json`. The complete maxima maps agree; the 1.21.11 client SHA-1 matches the repository's pinned renderer provenance. All 43 name labels were checked against those maxima, with explicit Knockback I/II preserved and all non-name inventory fields unchanged during level enrichment.

The catalog validator and **6 catalog regressions** passed. Production-loader checks covered 43 prices/units, representative verified levels, the two Knockback variants and the unchanged free cookie. **17 real local HTTP/Chromium checks** passed, including 43 displayed 2-diamond prices, 43 one-book units, both Knockback variants, visible uniform-price/maximum-level notes, retained facade/coordinates, mobile overflow and no JavaScript page errors. `git diff --check` and the affected index entry passed review.

## Enchanted Archives coordinates/facade — October 10, 2026

The maintainer confirmed **-145, 80, 365** and supplied the original facade photo. Its unchanged copy matches the source SHA-256. This update confirms location/photo only: all 44 announcement-based inventory entries remain, including 43 entries without an announced price; no book prices, unreported batch details or numeric levels were fabricated, and availability stays unknown.

The catalog validator and **6 catalog regressions** passed. **14 real local HTTP/Chromium checks** passed for the photo in card/details, Y 80, exact coordinate-copy format, all 44 existing rows, visible pending-price/level notes, owner-verification stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. The coordinate triplet, inventory count, missing-price count and affected index paths were checked; `git diff --check` passed.

## Horse of Course visit and emergency-refill clarification — October 10, 2026

The maintainer supplied Horse of Course's original facade and confirmed **-114, 80, 400**, the equipment prices/batches and a book advertising horses at **20 diamonds each** on the **Nether roof, X 777, Z -257**. The equipment shop retains its Overworld location; the remote horse sale is disclosed separately without guessing Nether Y or numerical stats. The facade copy matches the source SHA-256. Future custom orders retain their announcement-based label.

The maintainer also clarified Things That Go BOOM!'s emergency refill as **1 diamond block for 32 gunpowder + 32 paper**. The item now explicitly overrides currency to `diamond_block` and uses one refill kit with named components, without depicting finished rockets or assuming a container. Its former ambiguous unit is removed.

The catalog validator and **6 catalog regressions** passed. The six horse trade pairs, location separation, exact refill composition/currency/unit and unknown availability were checked through the production loader. **21 real local HTTP/Chromium checks** passed for facade loading in card/details, Y 80 and coordinate-copy format, 7 horse shop rows, the 20-diamond Nether horse offer, separate Nether coordinates, the Overworld equipment location, displayed diamond-block refill price and contents, stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. Affected index paths and `git diff --check` passed.

## Things That Go BOOM! visit — October 10, 2026

The maintainer confirmed **89, 121, 401**, supplied two price-sign screenshots and the original facade photo, and confirmed the emergency refill still exists. Tier 1 rocket shulkers changed from the old 15-diamond announcement to **19 diamonds**; Tier 3 shulkers were added at **50 diamonds**. Seven signed trades are verified, plus the existing emergency-refill entry whose `1b` unit remains explicitly unresolved. Container trades keep one shulker box as their quantity/unit. The photo copy matches the source SHA-256. The complete catalog contains **23 shops and 294 listings**, with unknown stock throughout.

The catalog validator and **6 catalog regressions** passed. All seven price/quantity pairs, currency, container units, local previews, coordinates and retained emergency-refill uncertainty were checked through the production loader. **17 real local HTTP/Chromium checks** passed for the facade in card/details, Y 121, exact coordinate-copy format, 8 rows, visible 19/50-diamond prices, unresolved-unit disclosure, stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. Affected index paths and `git diff --check` passed.

## Gadgets & Gizmos visit — October 10, 2026

The maintainer confirmed coordinates **-73, 78, 369**, supplied 12 price-sign screenshots and the original facade photo. All 22 prices/batches were filled: coral plants 1 diamond/8, coral blocks/fans 1/16; prismarine, bricks and lanterns 1/192; dark prismarine 1/128; two tridents 20 each; sponge rental 1 diamond/32 sponges/day, with a separately disclosed 1-diamond extra fee if returned wet. No trident levels or unshown rental rules were inferred. All availability remains unknown. The facade copy matches the source SHA-256.

The catalog validator and **6 catalog regressions** passed. All exact price/quantity pairs, currency, unknown stock, local previews, daily unit and coordinates were checked through the production loader. **16 real local HTTP/Chromium checks** passed for facade loading in card/details, Y 78, exact coordinate-copy format, 22 inventory rows, visible daily rental unit and conditional fee, manual confirmation notes, owner-verification stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. Affected index paths and `git diff --check` passed.

## Premades Trims visit — October 10, 2026

The maintainer confirmed all 18 named trim patterns at **8 diamonds each**, supplied **Y 80** and an original facade screenshot. Coordinates are **-160, 80, 390**. The photo copy matches the source SHA-256. The original announcement's free banner/application extras remain explicitly distinguished from this visit's confirmed trim prices.

The catalog validator and **6 catalog regressions** passed. The exact 18-pattern set, 8-diamond unit prices, quantities, unknown availability and local previews were checked through the production loader. **14 real local HTTP/Chromium checks** passed for the facade in card/details, visible Y 80, exact coordinate-copy format, 20 total inventory/service rows, manual confirmation notes, unknown-stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. Affected index paths and `git diff --check` passed.

## THERE AND BACK AGAIN visit — October 10, 2026

The maintainer supplied corrected coordinates **-60, 80, 300**, seven exact 1-diamond batch trades and an original facade photo. The generic Nether Supplies entry was replaced by seven item entries; the complete catalog now has **23 shops and 293 listings**, all with unknown availability. The photo was copied unchanged with matching source/destination SHA-256.

`node tests/validate-data.cjs` and all **6 catalog regressions** passed. The seven price/quantity pairs, diamond currency, unknown stock, corrected coordinate triplet and local item previews were checked through the production loader. **15 real local HTTP/Chromium checks** passed, including facade loading in card/details, visible Y 80, exact coordinate-copy format, 7 inventory rows, netherrack displayed as 192 items per diamond, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected. Affected index paths and `git diff --check` passed.

## Bricked up Pots sherd inventory — October 10, 2026

The seven supplied sign screenshots identify 23 variants priced at **1 diamond per 4 sherds**. The generic inventory entry was replaced by 23 individually searchable entries, all with `stock: unknown`. Bricked up Pots has 27 listings; the complete catalog contained **23 shops and 287 listings** at that stage.

The maintainer subsequently confirmed the four remaining trades: 1 diamond per 64 brick blocks, 64 brick items, 24 Flower Pots or 16 Decorated Pots. The catalog validator and six catalog regressions passed after this update; the four exact price/quantity pairs, diamond currency and unknown availability were checked through the production loader.

Height Y 80 and the original facade photo were then supplied. The PNG copy's SHA-256 matches the source. The catalog validator and six catalog regressions passed again; **14 real local HTTP/Chromium checks** passed for the photo in card/details, complete coordinate triplet `-145 80 400`, all 27 listings with owner-verification stock labels, mobile layout and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected.

`node tests/validate-data.cjs` passed, and `node --test tests/catalog.test.cjs tests/core.test.cjs tests/yaml.test.cjs tests/http.test.cjs` passed **46/46**. All 23 sherd IDs match existing local preview registry entries, and their price/batch fields and the four remaining pot/brick entries were checked during the update.

## Ancient Armory visit and stock policy — October 10, 2026

Ancient Armory's prices and advertised assortment were confirmed by the maintainer. Its original facade PNG was copied unchanged, with matching source/destination SHA-256, and connected to card/detail images. The maintainer requested unverified availability throughout the directory: all **265 listings** now use `stock: unknown`, including products whose names still disclose coming-soon status.

Observed checks:

- The stock-policy regression failed before the data update and passed afterwards.
- `node --test tests/catalog.test.cjs tests/core.test.cjs tests/yaml.test.cjs tests/http.test.cjs`: **46/46 passed**.
- `node tests/validate-data.cjs`: **23 shops, 265 listings valid**, including the new local photo.
- Real local HTTP/Chromium: **12 checks passed**, with all stocks unknown, facade loading in card/details, 18 Ancient Armory listings, visible confirmation notes and owner-verification stock labels, mobile overflow checks and no JavaScript page errors. Desktop card and mobile facade captures were opened and inspected.
- `git diff --check` and the affected concrete index paths passed verification.

These results concern the local changes. The existing Windows resource-checksum limitation documented below remains; asset generation and hosted deployment were not part of this update.

## Real catalog import — October 10, 2026

At the initial import, the catalog contained **23 real shops and 265 inventory listings**. Source mapping and interpretation limits are in `CATALOG_SOURCES.md`; later shop updates are recorded above. The historical demonstration-package results below are retained as historical evidence.

Observed checks for this import:

- `node tests/validate-data.cjs`: passed against the actual checkout; all shop data, local assets and HTML dependencies exist.
- `node --test tests/catalog.test.cjs tests/core.test.cjs tests/yaml.test.cjs tests/http.test.cjs`: **46/46 passed**. This covers source-specific currencies, per-piece/batch offers, removed demo files, unavailable future stock, explicit unknown Y, safe form export and real Node HTTP loading.
- `node --test tests/*.test.cjs`: **53/54 passed in the Windows checkout**. The existing original-resource checksum test fails because `core.autocrlf=true` changed 81 manifest-tracked text assets from LF to CRLF during checkout. All 4,000 other original resources match directly; those 81 match their recorded SHA-256 after reversing only CRLF to LF, with zero other mismatches. No resource files were modified for this import.
- The **unchanged complete Node suite passed 54/54** in a disposable copy with those 81 original asset line endings restored. This distinguishes a checkout-format issue from catalog/renderer regression; it does not claim the current checkout's checksum test passes.
- Real local HTTP navigation in the installed headless Chromium: **19 checks passed**, no JavaScript page errors. Observed 23 cards/265 listings, Mending search, wool and cafe inventories, diamond/diamond-block prices, estimated bulk text, exact triplet clipboard copying, labelled X/Z copying for unknown Y, blank-Y proposal export, actual YAML download initiation and 390px mobile layout/dialog behavior. Desktop/mobile captures were opened and inspected.
- `tests/browser_smoke.py` was adapted to the real catalog and parsed with Python's `ast.parse`. Its full Python Playwright suite was **not run** because that module is not installed; the separate 19-check Node Chromium run used an already-installed bundled Playwright runtime. No test dependencies were installed.
- `git diff --check`: passed after final whitespace cleanup. The initial `CODE_INDEX.md` covers maintained files, including all 23 manifest paths; indexed concrete paths were checked against disk.

The task-local Node browser harness and disposable-copy verification helper were outside the published repository. Browser captures are ignored under `test-previews/real-catalog/`. The checked-in `tests/browser_smoke.py` remains the reusable browser suite, with its optional tooling requirements documented below.

Confidence: **PARTIALLY VERIFIED** for the current Windows checkout because the existing asset checksum check remains sensitive to its checkout line endings. Catalog/coordinate regressions, real local browser behavior and the full suite with original resource bytes passed. Hosted Pages deployment and a current in-game stock/price check were not performed.

## Historical demonstration package — October 9, 2026

Checks performed on October 9, 2026. Included data: **5 shops and 36 inventory listings**. These numbers describe the demonstration package, not a catalog verified on the server.

## Node tests: 36 tests passed

14 engine tests, 18 YAML/currency tests and 4 HTTP tests. They cover search, aliases and services, combined filters, favorites, sorting, escaping, coordinates, dates, IDs, data types, YAML comments, multiline strings, currencies and defaults, proposal export and reimport.

Negative cases include invalid syntax and duplicate keys, TAB characters, missing files, disallowed manifest paths/URLs, duplicate IDs across shops, string prices, negative or NaN prices, invalid quantities, unknown categories, quoted booleans, typos, invalid image/tag types, JavaScript tags, reserved keys and cyclic aliases. A regression test covers the `__proto__` key in the modified library's merge maps.

**Real HTTP, executed in Node:** the production loader loads YAML files from the filesystem through a local HTTP server under a `/directory-repo/` prefix. It checks relative paths, manifest order, request counts, 404 responses, timeouts and rejection of the `file:` protocol. This tests the fetch/read/parse/validation path in Node; it does not prove GitHub Pages deployment or every browser's network policies.

## Chromium browser: 73 checks passed

Rendering with five cards, two catalog files plus five shops, search and keyboard suggestions, filters, empty states, grid/list views, favorites, sorting, dialogs, inventory, labels and icons for both currencies, per-item overrides, prepared clipboard copies, links, Esc and focus, themes, the YAML form with currency and comments, download filenames, reopening the form and unconfigured links.

Error paths with file/line/column details and an empty catalog were checked. The suite reported no JavaScript runtime errors. No horizontal overflow was found at 320, 390, 540, 768, 1024, 1440, 1920 or 3440 pixels. Desktop, mobile and detail images with prices in both currencies were inspected. This does not claim accessibility certification or verification in all browsers.

## Important limitation of browser checks

Chromium navigation to a local server was attempted and returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The suite was therefore run with **`--inline-fixture`**: it embeds the same production scripts and YAML files, but explicitly substitutes fetch responses with file text, along with storage, clipboard and download initiation.

The real loader and parser still read YAML text in the fixture. A pre-transformed JSON catalog is not substituted for YAML loading. The logo is adapted to a data URI only in the fixture, after validation.

This mode **does not demonstrate** end-to-end HTTP(S) browser navigation, hosted-site CORS behavior, real persistence after a restart, system clipboard access or actual download saving. The Node HTTP check above is separate and does not remove these limitations. No deployment or tests on the user's repository were performed.

## Rerunning the tests

```sh
node --test tests/*.test.cjs
node tests/validate-data.cjs
```

Optional browser checks, with development-only dependencies:

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

For an environment that blocks navigation:

```sh
python tests/browser_smoke.py --inline-fixture --screenshots ./test-previews
```

`CHROMIUM_EXECUTABLE` can point to an existing Chromium executable. The browser suite now reads the actual manifest and catalog, using real wool, cafe and enchanted-book listings for the relevant interactions. Engine tests retain an independent fictional fixture; the validator always reads the actual catalog.

## Before a real deployment

Check approved data and image files, run the validator, and verify that `config.yml`, `shops/` and `js/vendor/` are published and Pages is configured. On the hosted site, test opening, search, shop links, reload, coordinate copying, YAML downloads, favorites and themes. Confirm Discord/store links with the maintainers.

No independent security audit, screen reader verification or Minecraft synchronization tests were performed. Automatic synchronization is not provided.

## Local Bare Bones integration

The resource-pack integration adds seven Node tests, bringing the suite to 43 tests. They verify local item/block lookup, catalog aliases, explicit `minecraftId` values, invalid IDs, illustration fallback, generated file existence and original asset checksums. Four Python importer tests verify base-first precedence, compatible overlays, preview frame cropping, repeatability and unsafe-path rejection.

```sh
node --test tests/*.test.cjs
python -m pip install -r tools/requirements-assets.txt
python tests/import_minecraft_test.py
CHROMIUM_EXECUTABLE=/usr/bin/chromium python tests/minecraft_browser.py
```

The dedicated browser test uses real HTTP under a `/directory/` repository subpath. It loads all 33 item/block previews in the sample catalog, checks service illustrations, and deliberately blocks a texture request to verify the visible fallback. This checks actual PNG loading locally; it does not establish a successful public GitHub Pages deployment. The primary previews are CoreChatX model renders at scale ×16 (256×256). The browser checks that size for every catalog preview; flat textures are retained only as a secondary lookup option.


## CoreChatX render verification

```sh
python tests/render_minecraft_test.py
```

The four render tests include three input-isolation regressions: removed assets are excluded after a manifest refresh, modified originals fail checksum validation, and vanilla extraction refuses contaminated output directories. The render-output test checks nonempty 256×256 PNGs and excludes generated placeholders for representative blocks, sprites, special bed geometry, clocks and compasses. It also verifies that the bed contains its pillow/head section and that a wool block has a transparent canvas around its rendered model. The Node suite checks the existence, dimensions and SHA-256 of all 1,503 generated PNGs. Three unsupported/nonvisible candidates are listed separately in the render manifest, not counted as successful previews.
