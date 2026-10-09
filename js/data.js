/* Moss & Moon — YAML data loader, not a catalog to edit.
 * Edit config.yml and shops/<shop>.yml. List active filenames in shops/index.yml.
 * All paths are relative to index.html: compatible with a GitHub Pages subfolder.
 * No build, GitHub API, CDN, database, or Minecraft connection is used at runtime.
 */
(function (root) {
  'use strict';

  const MAX_SOURCE_LENGTH = 1000000;
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

  /** Read one YAML mapping. CORE_SCHEMA keeps dates as strings, not Date objects. */
  function parseYaml(text, filename) {
    if (!root.jsyaml) throw new Error('The local YAML parser is missing: js/vendor/js-yaml.js');
    if (typeof text !== 'string' || text.length > MAX_SOURCE_LENGTH) {
      throw new Error(`${filename}: expected a YAML text file smaller than 1,000,000 characters.`);
    }
    let data;
    try {
      let depth = 0;
      data = root.jsyaml.load(text, {
        filename,
        schema: root.jsyaml.CORE_SCHEMA,
        // Stop pathological nesting while parsing, before application validation.
        listener: event => {
          if (event === 'open' && ++depth > 50) throw new Error('Too much YAML nesting (maximum 50 levels).');
          if (event === 'close') depth--;
        }
      });
    } catch (error) {
      throw new Error(`${filename}: ${error.message}`);
    }
    if (!isObject(data)) throw new Error(`${filename}: expected one YAML object, not an empty file, scalar, or list.`);
    const active = new WeakSet();
    let nodes = 0;
    function inspect(value) {
      if (++nodes > 100000) throw new Error(`${filename}: the YAML document is too complex.`);
      if (value === null || typeof value !== 'object') return;
      if (active.has(value)) throw new Error(`${filename}: cyclic YAML aliases are not supported.`);
      active.add(value);
      for (const [key, child] of Object.entries(value)) {
        if (['__proto__','constructor','prototype','<<'].includes(key)) throw new Error(`${filename}: reserved YAML key "${key}" is not supported.`);
        inspect(child);
      }
      active.delete(value);
    }
    inspect(data);
    return data;
  }

  /** The manifest is explicit because a static website cannot list server folders. */
  function validateManifest(manifest) {
    const prefix = 'shops/index.yml';
    if (!isObject(manifest) || !Array.isArray(manifest.shops)) throw new Error(`${prefix}: use shops: followed by a list of filenames, or shops: [].`);
    if (Object.keys(manifest).some(key => key !== 'shops')) throw new Error(`${prefix}: the only supported field is shops.`);
    const seen = new Set();
    return manifest.shops.map(filename => {
      if (typeof filename !== 'string' || !/^[a-z0-9][a-z0-9_-]*\.ya?ml$/.test(filename) || /^index\.ya?ml$/.test(filename)) {
        throw new Error(`${prefix}: invalid shop filename "${String(filename)}". Use a lowercase name such as my-shop.yml, without a folder or URL.`);
      }
      if (seen.has(filename)) throw new Error(`${prefix}: duplicate filename "${filename}".`);
      seen.add(filename);
      return filename;
    });
  }

  /** Apply optional defaults without coercing or hiding incorrectly typed values. */
  function normalizeShop(raw, config) {
    if (!isObject(raw)) return raw;
    const shop = {
      kind: 'shop', status: 'unverified', demo: false, featured: false,
      theme: 'welcome', tagline: '', directions: '', notes: '', tags: [], images: [],
      currency: config.currency,
      ...raw
    };
    if (Array.isArray(shop.items)) shop.items = shop.items.map(item => {
      if (!isObject(item)) return item;
      return {
        unit: item.quantity === 1 ? 'item' : 'items', stock: 'unknown', icon: 'cube', aliases: [],
        currency: shop.currency,
        ...item
      };
    });
    return shop;
  }

  /** Production reader: GET from the same site, revalidate cache, stop after 15s. */
  async function fetchText(relativePath, {baseUrl = root.document?.baseURI, timeout = 15000} = {}) {
    const url = new URL(relativePath, baseUrl);
    if (!['http:','https:'].includes(url.protocol)) {
      throw new Error('Open this directory through HTTP(S), not by double-clicking index.html. Use GitHub Pages or a local web server.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await root.fetch(url.href, {cache: 'no-cache', signal: controller.signal});
      if (!response.ok) throw new Error(`HTTP ${response.status}. Check the filename and make sure the YAML file was published.`);
      return await response.text();
    } catch (error) {
      if (controller.signal.aborted) throw new Error(`${relativePath}: request timed out. Check the connection and try again.`);
      throw new Error(`${relativePath}: ${error.message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  /** Read the real files. readText injection allows the SAME loader to run in tests. */
  async function loadCatalog({readText = fetchText} = {}) {
    const readYaml = async filename => {
      try { return parseYaml(await readText(filename), filename); }
      catch (error) {
        if (error.message.includes(filename)) throw error;
        throw new Error(`${filename}: ${error.message}`);
      }
    };
    const [site, manifest] = await Promise.all([readYaml('config.yml'), readYaml('shops/index.yml')]);
    if (Object.keys(site).some(key => !['config','categories','locations'].includes(key))) {
      throw new Error('config.yml: supported top-level fields are config, categories and locations. Put shops in shops/<name>.yml.');
    }
    const config = {currency: 'diamond', ...(isObject(site.config) ? site.config : {})};
    const names = validateManifest(manifest);
    // Promise.all preserves the manifest order, regardless of response completion order.
    const shops = await Promise.all(names.map(async name => normalizeShop(await readYaml(`shops/${name}`), config)));
    const data = {...site, config, shops};
    if (!root.MMCore) throw new Error('The validation engine is missing: js/core.js');
    const errors = root.MMCore.validateData(data).map(message => {
      const match = message.match(/^shops\[(\d+)\]/);
      return match ? message.replace(/^shops\[\d+\]/, `shops/${names[Number(match[1])]}`) : `config.yml: ${message}`;
    });
    if (errors.length) throw new Error(errors.join('\n'));
    return data;
  }

  /** A reviewable .yml file, never an automatic upload or publication. */
  function serializeShop(shop) {
    const header = [
      '# Moss & Moon — scheda negozio / shop listing',
      '# Verifica tutti i dati prima di pubblicare; i commenti non vengono mostrati sul sito.',
      '# Salva in shops/<id>.yml e aggiungi il nome del file a shops/index.yml.',
      '# Usa spazi, non TAB. Mantieni id univoco e stabile.',
      '# currency: diamond = diamanti; diamond_block = blocchi di diamante.',
      '# Ogni prodotto puo sovrascrivere currency. Il prezzo NON viene convertito.',
      '# price: null = chiedere al proprietario; quantity = quantita venduta a quel prezzo.',
      '# stock: in | low | out | unknown. status: open | paused | unverified.',
      '# Non aggiungere bozze private al catalogo pubblicato: i file sono pubblici.',
      ''
    ].join('\n');
    return header + root.jsyaml.dump(shop, {schema: root.jsyaml.CORE_SCHEMA, indent: 2, lineWidth: 100, noRefs: true, sortKeys: false});
  }

  root.MMDataSource = Object.freeze({parseYaml, validateManifest, normalizeShop, fetchText, loadCatalog, serializeShop});
})(globalThis);
