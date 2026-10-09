'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console, URL, Date, Set, Map, AbortController, setTimeout, clearTimeout });
for (const name of ['js/vendor/js-yaml.js', 'js/core.js', 'js/data.js']) {
  const file = path.join(base, name);
  if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, {filename:name});
}
const src = () => { assert.ok(ctx.MMDataSource, 'The YAML data source must exist'); return ctx.MMDataSource; };
const fixture = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(base, 'tests/fixtures/example-data.js'), 'utf8'), fixture);
const config = JSON.parse(JSON.stringify(fixture.MMData));
delete config.shops;
config.config.currency = 'diamond';
const shopYaml = `# A demonstration shop that can be filled in manually.
id: sample-shop
name: "Sample: Shop #1"
owner: Player_1
description: >-
  Blocks for a new home.
  This second line joins the first.
categories: [building]
location: district
coords: {x: -12, y: 64, z: 40}
updated: 2026-10-09
currency: diamond
items:
  - id: stone
    name: Stone
    price: 1
    quantity: 64
  - id: wool_bulk
    name: "Wool: bulk #1"
    price: 3
    currency: diamond_block
    quantity: 1728
    stock: in
  - id: custom
    name: Custom project
    price: null
    quantity: 1
    unit: project
`;
const files = () => ({'config.yml': JSON.stringify(config), 'shops/index.yml':'shops:\n  - sample-shop.yml\n', 'shops/sample-shop.yml':shopYaml});
const readFrom = map => async filename => { if (!(filename in map)) throw new Error('Missing file'); return map[filename]; };
const clone = data => JSON.parse(JSON.stringify(data));

test('YAML reads comments, quoted punctuation, folded text, arrays, null and numeric types', () => {
  const data = src().parseYaml(shopYaml, 'shops/sample-shop.yml');
  assert.equal(data.name, 'Sample: Shop #1');
  assert.equal(data.description, 'Blocks for a new home. This second line joins the first.');
  assert.equal(data.updated, '2026-10-09');
  assert.equal(data.coords.x, -12);
  assert.equal(data.items[2].price, null);
});
test('YAML preserves literal multiline descriptions and UTF-8', () => {
  const data = src().parseYaml('notes: |\n  Caffè e resina.\n  Seconda riga.\n', 'notes.yml');
  assert.equal(data.notes, 'Caffè e resina.\nSeconda riga.\n');
});
test('syntax errors include filename and line/column, and duplicate keys are rejected', () => {
  assert.throws(() => src().parseYaml('name: First\nname: Second', 'shops/broken.yml'), /shops\/broken\.yml.*\(2:1\)/s);
  assert.throws(() => src().parseYaml('items:\n\t- bad', 'shops/tabs.yml'), /shops\/tabs\.yml/);
});
test('YAML rejects empty documents, unsafe keys, cycles, and executable custom tags', () => {
  for (const text of ['', '__proto__: {polluted: true}', 'constructor: value', 'a: &loop\n  child: *loop', 'a: !!js/function "function(){}"']) {
    assert.throws(() => src().parseYaml(text, 'bad.yml'));
  }
  assert.equal(({}).polluted, undefined);
});
test('vendor merge handling cannot change the result prototype', () => {
  assert.ok(ctx.jsyaml, 'A local YAML parser must exist');
  const result = ctx.jsyaml.load('source: &s\n  __proto__:\n    polluted: true\ntarget:\n  <<: *s\n');
  assert.equal(result.target.polluted, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(result.target, '__proto__'), true);
});
test('manifest accepts filenames and an empty catalog, but blocks paths, URLs and duplicates', () => {
  assert.equal(src().validateManifest({shops:['one.yml','two.yaml']}).length, 2);
  assert.equal(src().validateManifest({shops:[]}).length, 0);
  for (const name of ['../secret.yml', '/other.yml', 'https://example.com/x.yml', 'index.yml', 'folder/x.yml', 'bad.YML', 'x.yml?query=1']) {
    assert.throws(() => src().validateManifest({shops:[name]}), /shops\/index\.yml/);
  }
  assert.throws(() => src().validateManifest({shops:['one.yml','one.yml']}), /duplicate/i);
  assert.throws(() => src().validateManifest({shops:null}));
});
test('loader reads config, manifest and individual files without embedded catalog data', async () => {
  const calls=[]; const map=files();
  const data=await src().loadCatalog({readText:async file=>{calls.push(file);return readFrom(map)(file);}});
  assert.deepEqual(calls.sort(),['config.yml','shops/index.yml','shops/sample-shop.yml']);
  assert.equal(data.shops.length,1);
  assert.equal(data.shops[0].items[0].currency,'diamond');
  assert.equal(data.shops[0].items[1].currency,'diamond_block');
  assert.equal(data.shops[0].items[0].stock,'unknown');
  assert.equal(ctx.MMCore.validateData(data).length,0);
});
test('currency inheritance is item > shop > site, without converting the amount', async () => {
  const map=files();
  map['shops/sample-shop.yml']=shopYaml.replace('currency: diamond\n','currency: diamond_block\n');
  let data=await src().loadCatalog({readText:readFrom(map)});
  assert.equal(data.shops[0].items[0].currency,'diamond_block');
  assert.equal(data.shops[0].items[0].price,1);
  map['shops/sample-shop.yml']=shopYaml.replace('currency: diamond\n','');
  data=await src().loadCatalog({readText:readFrom(map)});
  assert.equal(data.shops[0].items[0].currency,'diamond');
});
test('loader preserves manifest order even when requests finish out of order', async () => {
  const map=files();map['shops/index.yml']='shops: [second.yml, sample-shop.yml]';
  map['shops/second.yml']=shopYaml.replace('id: sample-shop','id: second-shop');
  const data=await src().loadCatalog({readText:async file=>{if(file==='shops/second.yml')await new Promise(r=>setTimeout(r,15));return readFrom(map)(file);}});
  assert.equal(data.shops[0].id,'second-shop');
});
test('an empty manifest is a valid empty directory, not a loading failure', async () => {
  const map=files();map['shops/index.yml']='shops: []';
  assert.equal((await src().loadCatalog({readText:readFrom(map)})).shops.length,0);
});
test('missing files are reported by name rather than silently losing a shop', async () => {
  const map=files();delete map['shops/sample-shop.yml'];
  await assert.rejects(src().loadCatalog({readText:readFrom(map)}), /shops\/sample-shop\.yml/);
});
test('unknown currencies, price strings and invalid item structures give named errors', async () => {
  for (const [from,to,pattern] of [
    ['currency: diamond\n','currency: emerald\n',/currency/],
    ['price: 1','price: "1"',/price/],
    ['price: 1','price: -1',/price/],
    ['price: 1','price: .nan',/price/],
    ['quantity: 64','quantity: 0',/quantity/],
    ['categories: [building]','categories: [unknown]',/categories/],
    ['items:\n','items:\n  - null\n',/items/]
  ]) {
    const map=files();map['shops/sample-shop.yml']=shopYaml.replace(from,to);
    await assert.rejects(src().loadCatalog({readText:readFrom(map)}), error=>/shops\/sample-shop\.yml/.test(error.message)&&pattern.test(error.message));
  }
});
test('typos and invalid optional fields cannot crash the renderer silently', async () => {
  for (const addition of ['\nfeatured: "false"\n','\ntags: wool\n','\nimages: wrong\n','\ncurreny: diamond\n']) {
    const map=files();map['shops/sample-shop.yml']=shopYaml+addition;
    await assert.rejects(src().loadCatalog({readText:readFrom(map)}), /shops\/sample-shop\.yml/);
  }
});
test('duplicate shop identifiers are detected across files', async () => {
  const map=files();map['shops/index.yml']='shops: [sample-shop.yml, duplicate.yml]';map['shops/duplicate.yml']=shopYaml;
  await assert.rejects(src().loadCatalog({readText:readFrom(map)}), /duplicate/i);
});
test('labels explicitly distinguish diamonds and blocks, including zero and null', () => {
  assert.equal(ctx.MMCore.priceLabel({price:1,currency:'diamond'}),'1 diamond');
  assert.equal(ctx.MMCore.priceLabel({price:2,currency:'diamond'}),'2 diamonds');
  assert.equal(ctx.MMCore.priceLabel({price:1,currency:'diamond_block'}),'1 diamond block');
  assert.equal(ctx.MMCore.priceLabel({price:3,currency:'diamond_block'}),'3 diamond blocks');
  assert.equal(ctx.MMCore.priceLabel({price:0,currency:'diamond'}),'0 diamonds');
  assert.equal(ctx.MMCore.priceLabel({price:null,currency:'diamond_block'}),'Ask owner');
});
test('YAML proposal export round trips safely and includes editing comments', async () => {
  const data=await src().loadCatalog({readText:readFrom(files())});
  const text=src().serializeShop(data.shops[0]);
  assert.ok(text.startsWith('#'));
  const result=src().parseYaml(text,'export.yml');
  assert.deepEqual(clone(result),clone(data.shops[0]));
});
test('submission carries the selected currency and rejects arbitrary currencies', () => {
  const data={...config,shops:[]};
  const input={name:'A New Shop',owner:'Player_1',kind:'shop',category:'building',location:'district',x:'0',y:'64',z:'0',description:'A useful little shop.',items:'Stone',currency:'diamond_block'};
  const draft=ctx.MMCore.makeSubmission(input,data);
  assert.equal(draft.errors.length,0);
  assert.equal(draft.shop.currency,'diamond_block');
  assert.equal(draft.shop.items[0].currency,'diamond_block');
  assert.ok(ctx.MMCore.makeSubmission({...input,currency:'emerald'},data).errors.length);
});

test('reference IDs in configuration must be strings, even when a shop repeats a numeric ID', async () => {
  const map = files();
  const bad = clone(config);
  bad.locations[0].id = 12;
  map['config.yml'] = JSON.stringify(bad);
  map['shops/sample-shop.yml'] = shopYaml.replace('location: district', 'location: 12');
  await assert.rejects(src().loadCatalog({readText:readFrom(map)}), /config\.yml: locations\[0\].*invalid or duplicate id/);
});
