# Code index

This project is a static Minecraft shop directory. `index.html` loads local scripts; `MMDataSource.loadCatalog` reads `config.yml`, `shops/index.yml` and each manifest entry, validates the complete catalog, then `js/app.js` renders it. There is no backend, checkout, automatic submission or live server inventory.

## Entry points and catalog contracts

| Path | Role and relationships |
| --- | --- |
| `index.html` | Public HTML entry point; loads theme, CSS, local YAML parser, core/data modules, generated preview registries, artwork and application. |
| `config.yml` | Public configuration: labels, currencies, categories (including `collectibles` for music discs/map art), locations, optional links and `demoMode`. Ancient Alley retains the stable `district` ID. |
| `shops/index.yml` | Explicit public catalog manifest, currently 23 real files; ordering is retained by the loader. Unlisted files are still publicly accessible if deployed. |
| `shops/<id>.yml` | Independently editable real shop data; unique identity, owner, classification, position, source notes and inventory. X/Z are integers; Y is an integer or explicit `null`. `price: null` means ask the owner. All current entries use `stock: unknown`; stock is not tracked. |
| `shops/bricked-up-pots.yml` | Pottery shop with 23 sherd variants (1 diamond per 4), Decorated Pots (1 per 16), Flower Pots (1 per 24) and brick items/blocks (1 per 64); local previews, facade photo and coordinates (-145, 80, 400); availability unknown. |
| `shops/there-and-back-again.yml` | Nether shop with seven confirmed 1-diamond batches (32/64/192 blocks), local item previews, original facade and corrected coordinates (-60, 80, 300); availability unknown. |
| `shops/premades-trims.yml` | 18 confirmed trim patterns at 8 diamonds each, original facade and corrected Y 80 at (-160, 80, 390); announcement-based banner/application extras retained separately, availability unknown. |
| `shops/gadgets-and-gizmos.yml` | 22 confirmed ocean trades: coral batches of 8/16, prismarine/lantern batches of 128/192, 20-diamond tridents and 32-sponges/day rental with conditional wet-return fee in notes; original facade, confirmed (-73, 78, 369), availability unknown. |
| `shops/things-that-go-boom.yml` | Rocket/explosive shop with confirmed stack/container trades and 1-diamond-block refill kit containing 32 gunpowder + 32 paper; original facade and confirmed (89, 121, 401), availability unknown. |
| `shops/horse-of-course.yml` | Horse equipment prices/batches and facade at (-114, 80, 400); 20-diamond horses sold at Thistle Town on the Nether roof (X 777, Z -257) disclosed in name/notes, future custom orders retained, availability unknown. |
| `shops/enchanted-archives.yml` | 43 enchanted-book entries at 2 diamonds per book; explicit Knockback I/II and all other maximum levels checked against vanilla 1.21.11/26.3 data, stable IDs; free cookie/future labels retained, confirmed (-145, 80, 365), facade, availability unknown. |
| `shops/neon-lights-cyberstore.yml` | Confirmed 1-diamond trades for all three froglights (128 each) and End Rods (64), original facade and (45, 100, 327); announced future Sea Lanterns remain unpriced, availability unknown. |
| `docs/shop-template.yml` | Inactive commented authoring template, including nullable Y, price inheritance, units, stock and optional photos. Not listed by the manifest. |

Active shop IDs, in manifest order:

`ancient-armory`, `bricked-up-pots`, `there-and-back-again`, `premades-trims`, `gadgets-and-gizmos`, `things-that-go-boom`, `horse-of-course`, `enchanted-archives`, `neon-lights-cyberstore`, `janks-and-pranks`, `mooshine-literature`, `sticky-business`, `between-rock-and-hard-place`, `totally-stumped`, `wooden-emporium`, `metallo`, `wolf-wears-wool`, `jungle-jams`, `calliopes-cat-cafe`, `berrylelli-flower-shop`, `riverbend-boutique`, `atomicsmb-halloween-shop`, `impact-potion-shop`.

All corresponding paths are `shops/<id>.yml`. Source-to-shop mapping and material interpretation notes are in `docs/CATALOG_SOURCES.md`. Former demo/preview files have been removed.

## Application modules

| Path | Main responsibilities and symbols |
| --- | --- |
| `js/core.js` | Pure `MMCore` engine: search/filter/sort, suggestions, escaping, URL/asset validation, catalog validation, currencies/price labels and `makeSubmission`. `coordinateValue` renders unknown Y explicitly; `coordinateCopyText` preserves known triplets and labels X/Z when Y is unknown. |
| `js/data.js` | `MMDataSource`: strict YAML parsing, manifest validation, optional defaults, same-site HTTP fetching with timeout, complete catalog loading and proposal serialization. Depends on vendored YAML and `MMCore`. |
| `js/app.js` | DOM entry point: directory cards, filters, inventory dialogs, saved shops, route/hash state, themes, coordinate copying, local proposal form and YAML downloads. Uses `MMCore`, `MMDataSource` and `MMArt`; localStorage stores browser preferences only. Blank form Y remains `null`. |
| `js/theme.js` | Early browser theme restoration before application rendering. |
| `js/art.js` | `MMArt.icon`, `scene` and `itemIcon`; original SVG artwork and preview fallback, not photographs of real shops. |
| `js/minecraft.js` | `MMMinecraft.resolve`: validate Minecraft IDs, apply aliases, choose generated/native previews and fall back safely for unsupported items. |
| `js/minecraft-assets.js` | Generated imported texture registry consumed by the Minecraft resolver. |
| `js/minecraft-rendered.js` | Generated registry of native, compact and CoreChatX-rendered preview paths. |
| `css/style.css` | Responsive directory, listing cards, dialogs, inventory, price icons, themes and form styling. |
| `js/vendor/` | Bundled modified js-yaml parser, upstream/patch provenance and MIT license. Third-party implementation is summarized rather than indexed by symbol. |

## Assets and generation

| Path | Role |
| --- | --- |
| `assets/logo.png` | Public site logo. |
| `assets/shops/ancient-armory/front.png` | Original facade screenshot supplied during the shop visit; unchanged source pixels, referenced by `shops/ancient-armory.yml` for card and detail photos. |
| `assets/shops/bricked-up-pots/front.png` | Original facade screenshot supplied during the pottery shop visit; unchanged source pixels, referenced by `shops/bricked-up-pots.yml` for card and detail photos. |
| `assets/shops/there-and-back-again/front.png` | Original facade screenshot supplied during the Nether shop visit; unchanged source pixels, referenced by `shops/there-and-back-again.yml` for card and detail photos. |
| `assets/shops/premades-trims/front.png` | Original facade screenshot supplied during the trim shop visit; unchanged source pixels, referenced by `shops/premades-trims.yml` for card and detail photos. |
| `assets/shops/gadgets-and-gizmos/front.png` | Original facade screenshot supplied during the ocean shop visit; unchanged source pixels, referenced by `shops/gadgets-and-gizmos.yml` for card and detail photos. |
| `assets/shops/things-that-go-boom/front.png` | Original facade screenshot supplied during the rocket/explosive shop visit; unchanged source pixels, referenced by `shops/things-that-go-boom.yml` for card and detail photos. |
| `assets/shops/horse-of-course/front.png` | Original facade screenshot supplied during the horse-equipment shop visit; unchanged source pixels, referenced by `shops/horse-of-course.yml` for card and detail photos. |
| `assets/shops/enchanted-archives/front.png` | Original facade screenshot supplied during the bookshop visit; unchanged source pixels, referenced by `shops/enchanted-archives.yml` for card and detail photos. |
| `assets/shops/neon-lights-cyberstore/front.png` | Original facade screenshot supplied during the lighting shop visit; unchanged source pixels, referenced by `shops/neon-lights-cyberstore.yml` for card and detail photos. |
| `assets/minecraft/README.md` | Resource-pack ownership, priority and preview integration guidance. |
| `assets/minecraft/manifest.json` | Imported resource provenance, archive metadata, original member paths and SHA-256 checksums. |
| `assets/minecraft/rendered/manifest.json` | Generated preview metadata, paths/checksums, dimensions, renderer revision, context and unsupported candidates. |
| `assets/minecraft/` | Thousands of imported textures, models, blockstates/item definitions and generated previews. Individual repetitive/generated/binary files are intentionally summarized; manifests are the detailed maps. |
| `tools/import_minecraft_assets.py` | Offline `import_packs` CLI: base-first merge, overlays, texture preview processing, provenance and generated asset registry. |
| `tools/render_minecraft_previews.py` | Offline `render`/optimization CLI: prepare pinned renderer/vanilla inputs, render/compact/encode previews, write manifests and runtime registry. Requires its documented optional tooling; does not edit shop listings. |
| `tools/CoreChatXPreviewBatch.java` | Offline Java adapter invoked by the preview-generation script. |
| `tools/requirements-assets.txt` | Optional Python asset-tool dependency declarations; not website runtime dependencies. |

## Verification and deployment

| Path | Role |
| --- | --- |
| `tests/validate-data.cjs` | CLI checks current production YAML, local asset paths, JS syntax and HTML dependencies using the same runtime loader. |
| `tests/catalog.test.cjs` | Real-catalog regressions: 23 real shops, no residual demo files, corrected armor currency/per-piece pricing, wool estimates, cafe currencies, missing data and unknown stock for all listings, including coming-soon goods. |
| `tests/core.test.cjs` | Pure-engine behavior against an isolated sample fixture, including validation/submission/copying with unknown Y. |
| `tests/yaml.test.cjs` | YAML safety, bad fields/types, loader order/failures, defaults, currencies, nullable Y and round-trip proposals. |
| `tests/http.test.cjs` | Real local Node HTTP loading under a repository subpath, request/manifest counts, 404s, timeouts and rejection of `file:` startup. |
| `tests/minecraft.test.cjs` | Preview lookup/fallback/aliases, IDs, registry integration, image dimensions and original/generated checksums. |
| `tests/fixtures/example-data.js` | Fictional isolated engine-test input; never loaded by `index.html` or copied to the Pages artifact. |
| `tests/fixtures/enchanted_book_base.png` | Preview-test image fixture. |
| `tests/browser_smoke.py` | Optional Chromium browser suite using actual YAML and the new catalog; real HTTP mode or clearly labelled inline test doubles. |
| `tests/minecraft_browser.py` | Optional browser verification of Minecraft image previews. |
| `tests/import_minecraft_test.py` | Importer precedence, overlays, safe paths and repeatability tests. |
| `tests/render_minecraft_test.py` | Renderer input isolation, checksums and output/model regressions. |
| `.github/workflows/pages.yml` | Node validation/tests followed by an explicitly staged public website artifact and GitHub Pages deployment on main pushes/manual runs. |
| `.gitignore` | Excludes generated site output, Python caches and test captures. |
| `.nojekyll` | Static Pages marker. |
| `README.md` | Operation, catalog editing, pricing contracts, local HTTP startup and optional asset regeneration. |
| `docs/CATALOG_SOURCES.md` | Source mapping, maintainer-confirmed shop titles, shop-visit confirmations/photos, unavailable heights/prices, currency/unit interpretation and evidence limits. |
| `docs/TESTING.md` | Current checks and historical verification, with local/fixture/production limits distinguished. |

## Guidance and exclusions

There is no project-local `AGENTS.md` in this checkout. Parent `Y:/Documenti/Projects/AGENTS.md` governs local development-document placement; the maintainer's engineering instructions govern scope, function comments, checks and index updates.

`.git/`, temporary helpers outside the checkout, Python caches, optional `_site/`, dependency caches and browser captures are excluded. Generated registries and resource manifests are included as contracts, while their repetitive entries and third-party code are summarized. This initial map covers maintained paths; it does not claim a symbol-by-symbol audit of imported/generated resources.
