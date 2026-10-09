# Moss & Moon — directory with a YAML catalog

Updated version: **5 demonstration shops, 36 inventory listings, one `.yml` file per shop**. Comments and editing instructions are in English, as is the interface. Search, filters, favorites and themes remain; the interface now uses compact directory entries.

**Replace the entire previous package**, not just `js/data.js`: initial loading, validation, price display, the proposal form and the workflow have changed. `index.html` remains the only HTML file, and all interface content is created with JavaScript.

The interface is a compact shop directory: search, category and location filters, shop listings, saved shops, and inventory/coordinate details. Promotional hero, banners, onboarding guide and FAQ are omitted. Shop preview images and illustrations remain visible in listing cards and shop details.

## Where to edit data

```text
index.html                         Single page, minimal structure
config.yml                         Text, links, categories, locations and global currency
shops/
  index.yml                        List of files to load
  woolery.yml                      The Woolery
  pale-found.yml                   Pale & Found
  moonbound.yml                    Moonbound Books
  circuit.yml                      Circuit & Co.
  builders-bench.yml                The Builder’s Bench
docs/
  shop-template.yml                Commented template to copy; NOT active
  TESTING.md                       Checks performed and limitations
js/
  data.js                          YAML loading and validation, not editable catalog data
  core.js                          Search, filters, currencies and validation
  app.js                           Rendering and interactions
  art.js                           Icons and illustrations
  theme.js                         Theme restoration
  vendor/                          Local YAML parser and license
assets/logo.png                    Supplied logo
css/style.css                      Styles and responsive layout
.github/workflows/pages.yml        Optional validation and deployment
tests/                             Tests; not required to visit the site
```

You do not need to edit JavaScript to add, remove or update shops. `js/data.js` no longer contains the catalog. There is no JSON copy of the catalog to keep synchronized.

## Adding a shop

Copy `docs/shop-template.yml` to `shops/shop-name.yml`. Fill in the name, owner, description, categories, location, coordinates, optional images and inventory. **Also change `id`**, which must be unique throughout the directory. The template comments explain every field and its available values.

Add the filename to `shops/index.yml`:

```yaml
shops:
  - woolery.yml
  - pale-found.yml
  - moonbound.yml
  - circuit.yml
  - builders-bench.yml
  - shop-name.yml  # The new file is relative to the shops/ directory
```

Publish both files. The site reads the manifest and then the individual shops. It does not look for files through the GitHub API or try to enumerate the server directory.

To **update** a shop, edit only its YAML file and publish it. To **remove** it from the catalog, remove its line from the manifest. Also delete the file from the published site if it should no longer be directly accessible.

The catalog includes five example shops and a Minecraft preview test shop; this is **not a software limit**. Manifest order is preserved as the base order; “Featured first” sorting moves shops with `featured: true` to the top. You can create an empty directory with `shops: []`.

## Minecraft item and block previews

The site serves local Bare Bones textures from `assets/minecraft/`. No resource-pack downloads or third-party requests happen in the visitor's browser. Simple 2D items use their original native-size texture pixels (normally 16×16), without upscaling. The importer’s lossless PNGs avoid unused editor metadata. Items requiring 2D layer composition or tinting use compact 16×16 PNGs; 3D models and inherently enchanted items with glint use transparent 256×256 PNGs generated offline by CoreChatX at scale ×16. Blocks with 3D inventory models use their actual geometry, textures and GUI transforms; items with flat inventory models keep that appearance. Each preview is encoded as WebP lossless only when it is smaller than its PNG, with exact decoded RGBA verification; otherwise PNG is retained. The browser loads finished images, not Java or a live renderer. Flat texture previews remain a fallback for objects without a supported rendered model. Services and unknown objects retain the original illustrations; failed image requests also fall back to those illustrations.

The supplied packs are merged by **missing path**, in this order:

1. Bare Bones 1.21.11, including its compatible overlays (pack format 75).
2. Bare Bones X Updated v1.0, only for paths absent from the base.
3. Bare Bones Extra, only for paths still absent.

This is intentionally different from installing add-on packs as overriding layers in Minecraft. Extra does not replace textures already supplied by the first two packs. `assets/minecraft/manifest.json` records the source archive, source member and SHA-256 for each imported file, plus archive checksums and original pack metadata. The originals are retained in `textures/`; `previews/` contains cropped PNGs for display. Block/item models, block states and item definitions supplied by the packs are also retained. All supplied PNG texture categories are retained, including entity textures needed for beds, heads and other special item models.

An item's `id` is used to find its texture automatically. Use an optional `minecraftId` when the listing ID differs from the Minecraft ID:

```yaml
items:
  - id: wool_delivery
    minecraftId: minecraft:white_wool
    name: White Wool — delivery
    price: 1
    quantity: 64
```

This excerpt shows the essential fields; existing optional item defaults still apply. `minecraftId` supports the `minecraft:` namespace or an unprefixed lowercase ID, not paths or URLs. The supplied bulk wool and enchanted-book listings already have aliases, so their catalog IDs remain unchanged.

To refresh the generated assets, keep the original ZIPs outside the checkout and run from the repository root:

```sh
python -m pip install -r tools/requirements-assets.txt
python tools/import_minecraft_assets.py \
  --base "/path/to/Bare Bones 1.21.11.zip" \
  --updated "/path/to/Bare Bones X Updated v1.0.zip" \
  --extra "/path/to/Bare Bones Extra.zip"
node --test tests/*.test.cjs
python tests/import_minecraft_test.py
node tests/validate-data.cjs
```

The importer rewrites its generated files and registry. It does not delete unrelated files; assets removed from newer packs may remain on disk but are no longer referenced by the generated registry. Commit `assets/minecraft/`, `js/minecraft-assets.js` and `js/minecraft-rendered.js` together after regenerating both texture and rendered registries. The Pages workflow already publishes the entire `assets/` directory, so it does not need the ZIPs, Python or Java at deployment time.

### Regenerate CoreChatX previews

After importing or changing resource packs, regenerate the previews (including selective WebP optimization):

```sh
python tools/render_minecraft_previews.py --scale 16
node --test tests/*.test.cjs
python tests/render_minecraft_test.py
```

Generation requires the Pillow version in `tools/requirements-assets.txt`, Java 21 or newer and network access to GitHub, Maven Central and Mojang. It compiles the renderer from CoreChatX-plugin at pinned commit `9d1ef37bd266f18e7451d61db7e8ebaf91a055c2`, using a checksum-verified Eclipse compiler and Gson. It does not copy or modify CoreChatX source in this repository and does not require Bukkit, Discord or a running Minecraft server. Source, dependencies and the verified vanilla client archive are cached outside the checkout. Each run stages only checksum-validated entries from the current pack manifest and extracts vanilla assets into a fresh temporary directory, so removed or stale files cannot influence the new renders. Use `--cache /path/to/cache` to choose the cache location.

The default vanilla model base is Java 1.21.11, matching the base pack. Vanilla models and textures only fill missing paths; the merged Bare Bones assets always take priority. Vanilla downloads and version metadata are checked against Mojang's published checksums. `--minecraft-version` can select a different official version when deliberately updating the catalog's model base.

The offline adapter supplies fixed Overworld, clock and compass state and translates legacy single-part bed definitions into head/foot composites supported by the renderer. It leaves the original renderer unchanged. Amounts, tooltips and durability bars are not baked into the icon; catalog prices and quantities remain HTML.

To optimize existing previews offline without Java or downloads, run `python tools/render_minecraft_previews.py --optimize-only`. Source pack PNGs and the PNG fallback registry remain available; converted PNGs in the generated render directory are removed.

The current output contains **1,503 successful previews: 615 native textures, 39 compact 2D images, and 849 rendered images**. The render manifest lists three excluded candidates: `air` (no useful icon), `snow_golem_spawn_egg` and the legacy ID `zombie_pigman_spawn_egg`. Generated placeholder/text fallbacks are not published as successful renders. All 33 item/block listings in the five example shops resolve to local native or rendered images; services use illustrations. Enchanted books and enchanted golden apples include the static glint produced by CoreChatX’s complete item renderer. The `Minecraft Preview Test` shop (`#shop=preview-test`) lists all 1,503 available previews with searchable names and Minecraft IDs, unspecified prices and unknown stock. It is a visual test gallery, not a real trading shop; remove `preview-test.yml` from `shops/index.yml` to hide it.

`assets/minecraft/rendered/manifest.json` records the renderer revision, scale, vanilla version/checksums, source-pack manifest checksum, image checksums and formats, per-item dimensions, preview kind, original texture checksums, render source and unsuccessful candidates. `js/minecraft-rendered.js` is the generated runtime registry. The lookup order is the generated native/compact/3D preview registry → flat pack texture → original illustration; a failed image request also displays the original illustration. Redundant enlarged PNGs are deleted when an item switches to its native texture. Other files removed from a subsequent render may remain on disk, but are not included in its new registry. The `--only` option is for diagnostics and replaces the registry with that subset; do not use it for publication.

## Prices: diamonds or diamond blocks

The two accepted currencies are:

| YAML value | Display |
|---|---|
| `diamond` | diamond / diamonds, with a diamond icon |
| `diamond_block` | diamond block / diamond blocks, with a block icon |

Currency can be set at three levels: **item → shop → `config.currency` in `config.yml`**. The most specific setting wins. If an item has no `currency`, it uses the shop's currency; if that is also missing, it uses the global setting, which defaults to `diamond`.

Example excerpt from a shop file:

```yaml
# Default currency for the shop
currency: diamond

items:
  - id: stone
    name: Stone
    price: 1             # 1 diamond for the entire batch of 64 items
    quantity: 64
    stock: in
    icon: cube

  - id: black_wool_bulk
    name: Black Wool — bulk
    price: 3             # 3 diamond blocks for the entire batch
    currency: diamond_block
    quantity: 1728
    unit: items
    stock: in
    icon: wool
    color: "#303437"

  - id: custom_order
    name: Custom order
    price: null          # Displays “Ask owner”, not a zero price
    quantity: 1
    unit: project
    stock: unknown
    icon: tools
```

**Prices are not automatically converted.** `price: 3` with `currency: diamond_block` is displayed as **3 diamond blocks**, not 3 diamonds. Changing only the currency changes the meaning of the number. There is no visitor control to convert all prices: each listing shows the currency chosen by its owner.

`price` is the cost of the entire `quantity`, not the price of a single item. Use an unquoted number: `1`, `2`, `1.5`; use a decimal point. `0` means free; `null` means the price must be agreed with the owner. Do not write `"1 diamond"`, `"1"` or `1,5`.

`quantity` is a positive integer. The `unit` text is optional: if omitted, `item` is used for quantity 1, otherwise `items`. For services, you can write `unit: project`. Stack, shulker or container contents are not calculated automatically: enter the actual amount sold and specify in the notes whether the container is included.

## YAML rules and fields

Use **2 spaces per level**, never TAB. A hyphen `-` introduces a new list entry. Do not quote `true`, `false`, numbers or `null`. Comments start with `#`: they are not shown in the interface but remain in the public file.

Quote text containing colons, hash signs or special characters:

```yaml
name: "Pale & Found: shop #1"
notes: "Ask the owner before taking an empty shulker."
color: "#e7e5df"  # Without quotes, # would start a comment
```

You can write long descriptions across multiple lines:

```yaml
description: >-
  These two source lines become
  one paragraph on the website.

notes: |
  First line.
  Second line, with its line break preserved.
```

For empty lists, use `images: []`, `tags: []` or `aliases: []`. A key left without a value becomes `null`, not an empty list, and is flagged if the field requires a list.

**Required shop fields:** `id`, `name`, `owner`, `description`, `categories`, `location`, `coords`, `updated`, `items`. `categories` is a list of IDs defined in `config.yml`; `location` is a location ID defined in the same file. Each coordinate must be an integer. `updated` must be a real `YYYY-MM-DD` date.

**Defaults for optional fields:** `kind: shop`, `status: unverified`, `demo: false`, `featured: false`, `theme: welcome`, `tags: []`, `images: []`, empty additional text and currency inherited from the configuration.

**Required item fields:** `id`, `name`, `price`, `quantity`. Item IDs must be unique within the same inventory. Other fields have defaults: currency inherited from the shop, `stock: unknown`, `icon: cube`, `aliases: []` and a unit based on quantity.

**Type:** `shop`, `stall` or `service`. **Status:** `open`, `paused` or `unverified`. All these statuses remain public if the file is in the manifest; the “Listed as in stock” filter considers only `open` shops with items marked `in` or `low`.

For images, place files under `assets/shops/` and use paths **relative to `index.html`**, not to the YAML file:

```yaml
images:
  - src: assets/shops/my-shop/front.webp
    alt: Front of the shop
  - src: assets/shops/my-shop/inside.webp
    alt: Inside the shop
```

The first image is the cover. Without photos, the `theme` illustration is used. Missing images have a visual fallback; the deployment validator flags missing local assets. HTTP(S) URLs are also accepted, but introduce requests to external sites.

The parser uses YAML with the Core schema: dates remain text, and JavaScript tags and merge keys are not supported. Do not use `<<`, `__proto__`, `constructor`, `prototype` or cyclic references. Files that are too large or deeply nested are rejected. Unknown shop and item keys are flagged to catch typos.

## What happens when an error occurs

The site displays a message with the **filename** and detected problem. YAML syntax errors also include the line and column. Missing files show the HTTP error. Requests time out after 15 seconds.

The directory does not silently display a partial catalog: if a required file is invalid, it shows the error screen and allows retrying. Correct the file, publish it again and reload. The included workflow blocks a new deployment when validation or tests fail.

## Proposals from the site

“List your shop” now exports **a commented `.yml` file**, not JSON. The form lets you choose the default currency. Prices and stock are completed during review (`price: null`, `stock: unknown`). The exported file can be read by the same loader after review and addition to the manifest.

The form does not submit, save to the repository, approve or publish anything. Maintainers must manually review the proposal before adding it to the catalog. `status: unverified` is a label, not a private moderation queue.

## Local preview

This version reads separate files through `fetch()`: **double-clicking `index.html` is not the intended startup method**. Use GitHub Pages or a local server. For example, with Python installed, run this from a terminal in the project directory:

```sh
python -m http.server 8080
```

On Windows, you can also use `py -m http.server 8080` if Python is configured with the launcher. Open `http://localhost:8080`. The parser is included in the package: the site does not download libraries or fonts from CDNs. Node.js, npm and a build are not required to view the site; Node.js is only needed for optional tests.

## Publishing on GitHub Pages

The site has not been published to your account. The package includes an optional workflow for the `main` branch.

1. Upload **the contents** of the `moss-moon-directory` folder to the repository root. Include `config.yml`, `shops/`, `js/vendor/`, `tests/`, `.github/` and `.nojekyll`, as well as the other files. Do not accidentally add an extra root folder.
2. In **Settings → Pages → Source**, select **GitHub Actions**.
3. Publish to `main` or run the **Validate and deploy directory** workflow. For another branch, update `branches: [main]` in the workflow.

The workflow runs tests and validation and copies `index.html`, `config.yml`, `assets/`, `css/`, `js/` and **the entire `shops/` directory** into the deployment. It does not generate HTML or transform YAML into JS. YAML files are served and read as static files. Relative paths also work under the repository path without code changes.

Alternatively, you can publish the static files with an existing Pages configuration: make sure `.nojekyll` is at the published root and `.yml` files are not excluded by the pipeline. The included workflow is the package's reference configuration.

The setup instructions are based on the official GitHub Pages documentation and Static HTML template; actual execution depends on repository permissions and has not been tested on your account.

Technical sources:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://github.com/actions/starter-workflows/blob/main/pages/static.yml

## Tests

From the root directory, with Node.js 22:

```sh
node --test tests/*.test.cjs
node tests/validate-data.cjs
```

Search test fixtures are separate from the published data. The validator and HTTP test read the current catalog. For browser checks and limitations of the environment used, see `docs/TESTING.md`.

## Sample data and public information

The five example shops with 36 listings, their owners, prices, coordinates, dates and availability are **demonstration data**. The additional Minecraft preview test shop is also sample content. Before launching an official directory, replace them with approved information; set `demo: false` on each real listing and `config.demoMode: false` when the entire catalog is ready. Also update text referring to the demo.

Stock and prices are not synchronized with Minecraft. The logo is the supplied one; thumbnails are illustrations, not screenshots of real shops. The address and links do not imply that server status has been verified.

**Every published file, even if not listed in the manifest, and all comments can be read publicly.** Do not put passwords, tokens, confidential drafts or private data in YAML or code. An unlisted file does not appear in search, but is not protected from direct access.

Themes and favorites are local to the browser; no accounts, checkout, analytics or automatic Discord integration are included. Information about the local YAML library, the applied modification and the license is in `js/vendor/README.md` and `js/vendor/js-yaml.LICENSE.txt`.
