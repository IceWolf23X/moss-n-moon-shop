'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const context = vm.createContext({URL, Date, Set, Map});
for (const filename of ['js/vendor/js-yaml.js', 'js/core.js', 'js/data.js']) {
  vm.runInContext(fs.readFileSync(path.join(base, filename), 'utf8'), context, {filename});
}

/** Load actual published YAML through the production parser and validator. */
async function catalog() {
  return context.MMDataSource.loadCatalog({
    // Resolve catalog resources from the checkout, matching the public relative paths.
    readText: async filename => fs.readFileSync(path.join(base, filename), 'utf8')
  });
}

// Prevent sample files from remaining publicly accessible after removal from the manifest.
test('real catalog contains all 23 shops and no demonstration or unlisted shop files', async () => {
  const data = await catalog();
  assert.equal(data.shops.length, 23);
  assert.equal(data.config.demoMode, false);
  assert.ok(data.shops.every(shop => shop.demo === false));
  assert.ok(data.shops.every(shop => shop.updated === '2026-10-10'));
  const manifest = context.MMDataSource.parseYaml(fs.readFileSync(path.join(base, 'shops/index.yml'), 'utf8'), 'shops/index.yml');
  assert.deepEqual(Array.from(manifest.shops).sort(), fs.readdirSync(path.join(base, 'shops')).filter(name => name !== 'index.yml').sort());
  for (const old of ['woolery', 'pale-found', 'moonbound', 'circuit', 'builders-bench', 'preview-test']) {
    assert.equal(fs.existsSync(path.join(base, 'shops', old + '.yml')), false, old);
    assert.ok(!data.shops.some(shop => shop.id === old));
  }
});

// Lock the corrected armor price to its currency and per-piece contract.
test('Riverbend netherite costs six diamond blocks per piece', async () => {
  const shop = (await catalog()).shops.find(shop => shop.id === 'riverbend-boutique');
  const armor = shop.items.find(item => item.id === 'enchanted_netherite_piece');
  assert.equal(armor.price, 6);
  assert.equal(armor.currency, 'diamond_block');
  assert.equal(armor.quantity, 1);
  assert.equal(armor.unit, 'piece');
  assert.match(shop.notes, /October 9.*PER PIECE/);
});

// Preserve the distinction between stacked retail wool and an estimated bulk order.
test('all 16 wool colors retain stack prices and bulk orders remain estimates', async () => {
  const shop = (await catalog()).shops.find(shop => shop.id === 'wolf-wears-wool');
  const colors = shop.items.filter(item => item.id.endsWith('_wool'));
  assert.equal(colors.length, 16);
  assert.ok(colors.every(item => item.price === 1 && item.currency === 'diamond' && item.quantity === 64));
  const bulk = shop.items.find(item => item.id === 'bulk_wool_order');
  assert.equal(bulk.price, 23);
  assert.equal(bulk.quantity, 1);
  assert.equal(bulk.stock, 'unknown');
  assert.match(bulk.unit, /estimate/);
  assert.match(shop.notes, /around 23 diamonds/);
});

// Prevent diamond-block services from being confused with the cafe's diamond trades.
test('cat services and cafe consumables retain different currencies and batch sizes', async () => {
  const shop = (await catalog()).shops.find(shop => shop.id === 'calliopes-cat-cafe');
  const items = new Map(shop.items.map(item => [item.id, item]));
  assert.equal(items.get('cat_breeding').price, 2);
  assert.equal(items.get('cat_breeding').currency, 'diamond_block');
  assert.equal(items.get('cat_rescue').price, 1);
  assert.equal(items.get('cat_rescue').currency, 'diamond_block');
  assert.equal(items.get('cookie').quantity, 128);
  assert.equal(items.get('cookie').price, 1);
  assert.equal(items.get('cookie').currency, 'diamond');
  assert.equal(items.get('name_tag').quantity, 16);
  assert.equal(items.get('lead').quantity, 16);
});

// Preserve confirmed shop titles and keep unreported heights and batch sizes explicit.
test('confirmed shop names retain stable IDs and unknown heights and slot sizes stay exact', async () => {
  const data = await catalog();
  for (const [id, name] of Object.entries({
    'berrylelli-flower-shop': "Flowers N' Thyme",
    'impact-potion-shop': "Impact's Brewery",
    'atomicsmb-halloween-shop': 'The Deer Skull'
  })) {
    const shop = data.shops.find(shop => shop.id === id);
    assert.equal(shop.name, name);
    assert.ok(!shop.tags.includes('Provisional name'));
    assert.doesNotMatch(shop.notes, /Provisional descriptive shop name/);
  }
  assert.deepEqual({...data.shops.find(shop => shop.id === 'wolf-wears-wool').coords}, {x: -35, y: 87, z: 385});
  assert.deepEqual({...data.shops.find(shop => shop.id === 'impact-potion-shop').coords}, {x: -75, y: null, z: 332});
  assert.ok(data.shops.find(shop => shop.id === 'totally-stumped').items.every(item => item.quantity === 1 && item.unit === 'slot'));
  const honey = data.shops.find(shop => shop.id === 'sticky-business').items.find(item => item.id === 'honey_block');
  assert.equal(honey.quantity, 32);
  assert.equal(honey.price, 2);
});

// Future stock must never pass an available-inventory filter.
test('announced coming-soon inventory remains unavailable', async () => {
  const data = await catalog();
  const future = data.shops.flatMap(shop => shop.items).filter(item => /coming soon/i.test(item.name));
  assert.ok(future.length >= 6);
  assert.ok(future.every(item => item.stock === 'out' && !context.MMCore.available(item)));
});
