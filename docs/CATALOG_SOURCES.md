# Real catalog sources

The maintainer supplied 23 screenshots on October 10, 2026 and authorized replacing the six demonstration/preview listings with these real shops. Each shop remains independently editable in `shops/<id>.yml`; `shops/index.yml` defines the published catalog. Text is transcribed from the announcements rather than independently verified in Minecraft.

## Source mapping

All screenshot filenames below start with `Screenshot 2026-10-10 ` and end in `.png`. The files themselves remain outside the repository; their Discord interface and unrelated conversations are not published as shop photos. Listings currently use `images: []` and the site's existing illustrations. Add original shop photos through the existing `images` field when available.

| Shop file | Announced shop | Screenshot time |
| --- | --- | --- |
| `ancient-armory.yml` | Ancient Armory | 010026 |
| `bricked-up-pots.yml` | Bricked up Pots | 010021 |
| `there-and-back-again.yml` | THERE AND BACK AGAIN | 010012 |
| `premades-trims.yml` | Premades Trims (Services) | 010001 |
| `gadgets-and-gizmos.yml` | Gadgets & Gizmos by Faevyn | 005949 |
| `things-that-go-boom.yml` | Things That Go BOOM! | 005943 |
| `horse-of-course.yml` | Horse of Course! | 005936 |
| `enchanted-archives.yml` | The Enchanted Archives of Clover Hollow | 005916 |
| `neon-lights-cyberstore.yml` | Neon Lights CyberStore | 005856 |
| `janks-and-pranks.yml` | Janks & Pranks | 005907 |
| `mooshine-literature.yml` | Mooshine Literature | 005842 |
| `sticky-business.yml` | Sticky Business | 005834 |
| `between-rock-and-hard-place.yml` | Between a Rock and a Hard Place | 005818 |
| `totally-stumped.yml` | Totally STUMPED! | 005809 |
| `wooden-emporium.yml` | Wooden Emporium | 005801 |
| `metallo.yml` | Metallo! | 005753 |
| `wolf-wears-wool.yml` | The Wolf Wears Wool | 005744 |
| `jungle-jams.yml` | Jungle Jams | 005733 |
| `calliopes-cat-cafe.yml` | calliope's cat cafe | 005724 |
| `berrylelli-flower-shop.yml` | Flowers N' Thyme | 005710 |
| `riverbend-boutique.yml` | Riverbend Boutique | 005703 |
| `atomicsmb-halloween-shop.yml` | The Deer Skull | 005654 |
| `impact-potion-shop.yml` | Impact's Brewery | 005824 |

## Data interpretation

- **Confirmed titles:** the maintainer supplied the three titles missing from the screenshots on October 10, 2026: AtomicSMB — The Deer Skull; BerryLelli — Flowers N' Thyme; Impact — Impact's Brewery. These replace the initial descriptive names; listing IDs, filenames and links remain stable.
- **Owners:** names come from visible author names or explicit ownership statements. Discord display names are not guaranteed Minecraft usernames. Co-owners remain credited; Totally STUMPED!'s title credits `mojohit (izzayy)` while its post displays `izzler`.
- **Coordinates:** X and Z are transcribed exactly. Y is an integer only when supplied, otherwise `null`. The site shows an unspecified height and copies only the known axes. No ground level or teleport destination is inferred. Ancient Alley uses the existing `district` location ID; screenshot tags, plot numbers and shopping-district context identify the district. Unreported plot numbers are not guessed.
- **Dates and stock:** `updated: '2026-10-10'` records a transcription check. `status: open` reflects the announcements, not a server visit. `stock: in` means an owner explicitly advertised availability; `unknown` preserves uncertainty and rotating stock; announced future products are `out` with a coming-soon label.
- **Prices:** `price` covers the entire listed `quantity`. One stack of stackable advertised goods is 64 items; half a stack is 32. `diamond_block` is retained for offers quoted in DB. No currency conversion is applied. Unknown prices use `null`, and unspecified batches are labelled accordingly. Slot offers and shulker offers preserve those units without assuming container contents.
- **Riverbend Boutique:** the October 9 correction establishes **6 diamond blocks per netherite armor piece**, not per set. The 7-diamond custom sets are also per piece and temporary October stock.
- **The Wolf Wears Wool:** all 16 wool colors cost one diamond per stack. Bulk shulker sales are still being prepared; the announced **around 23 diamonds** is labelled as an estimate for a bulk order, with availability unknown.
- **Sticky Business:** honey blocks are half a stack for two diamonds. Its froglight offer allows two stacks of mixed colors for one diamond.
- **Totally STUMPED!:** one diamond per slot is retained as a slot trade; neither full-stack contents nor exact wood forms are asserted.
- **Unspecified variants:** BerryLelli's `Rose`, `Lily` and `Orchid` names and impact's `Glowstone` are retained without inventing a more precise item type. Potion durations and levels are not guessed. Short rocket-refill notation remains explained in the relevant listing instead of being silently expanded into an assumed container.
- **Seasonal and future offers:** AtomicSMB's shop is advertised for October only. Jungle Jams' posters, buy-back and bulk-disc service, the Archives' Swift Sneak and Soul Speed, future horse orders and Neon Lights' Sea Lanterns retain their announced future status.

## Removed demonstrations

`woolery.yml`, `pale-found.yml`, `moonbound.yml`, `circuit.yml`, `builders-bench.yml` and `preview-test.yml` are removed from `shops/` and the manifest. Generated Minecraft item previews remain intact. `docs/shop-template.yml` remains an inactive template, and `tests/fixtures/example-data.js` remains an isolated engine-test fixture. Neither is an active shop listing or part of the Pages public catalog.
