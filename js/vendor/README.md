# Local YAML parser

`js-yaml.js` is a standalone rebundle of the MIT-licensed js-yaml 4.1.0 code
available in the local JupyterLab distribution. Only the js-yaml module was
extracted; JupyterLab, Mermaid, and unrelated modules are not included.
Its bundler-only function-name helper is replaced with an identity helper.
The original parser and dumper implementations are retained.

The upstream 4.1.1 merge-mapping prototype-pollution fix is applied: a source
`__proto__` key is stored with `Object.defineProperty` instead of invoking the
legacy prototype setter. Direct mapping entries already use this protection.
This is a **modified build**, not a claim to be the exact upstream 4.1.1 file,
and not a claim that it is the latest upstream release.

Application parsing additionally uses CORE_SCHEMA (no implicit date conversion,
no merge tags or JavaScript object/function tags), rejects reserved keys and
cyclic structures, limits size and nesting, and validates the catalog fields.
The tests include a regression test for the upstream merge issue.

Sources:
- https://github.com/nodeca/js-yaml
- https://github.com/nodeca/js-yaml/security/advisories/GHSA-mh29-5h37-fv8m
- https://github.com/nodeca/js-yaml/blob/4.1.1/lib/loader.js

No CDN is contacted at runtime. The MIT license is included in full.
To replace the library, use a reviewed browser distribution exposing
`globalThis.jsyaml` with `load`, `dump`, and `CORE_SCHEMA`, preserve its license,
and re-run the entire test suite. Do not blindly replace it with an incompatible
major version.
