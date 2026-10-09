# YAML version verification

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

`CHROMIUM_EXECUTABLE` can point to an existing Chromium executable. The browser suite captures the five examples and requires names/counts to be adjusted if you change the catalog. Engine tests use an independent fixture; the validator always reads the actual catalog.

## Before a real deployment

Check approved data and image files, run the validator, and verify that `config.yml`, `shops/` and `js/vendor/` are published and Pages is configured. On the hosted site, test opening, search, shop links, reload, coordinate copying, YAML downloads, favorites and themes. Confirm Discord/store links with the maintainers.

No independent security audit, screen reader verification or Minecraft synchronization tests were performed. Automatic synchronization is not provided.
