'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console, URL, Date, Set, Map });
for (const file of ['tests/fixtures/example-data.js', 'js/core.js']) {
  if (fs.existsSync(path.join(base, file))) vm.runInContext(fs.readFileSync(path.join(base, file), 'utf8'), ctx);
}
const core = () => { assert.ok(ctx.MMCore, 'MMCore must exist'); return ctx.MMCore; };
const data = () => { assert.ok(ctx.MMData, 'MMData must exist'); return ctx.MMData; };
test('dataset is valid with five unique demonstration shops', () => {
  assert.equal(data().shops.length, 5);
  assert.equal(core().validateData(data()).length, 0);
  assert.equal(new Set(data().shops.map(s => s.id)).size, 5);
  assert.ok(data().shops.every(s => s.demo === true));
});
test('normalizes namespaced item IDs, accents and punctuation', () => {
  assert.equal(core().normalize('  minecraft:BLACK_WOOL  '), 'black wool');
  assert.equal(core().normalize('Café & Crystals'), 'cafe crystals');
});
test('search matches item IDs and multi-word product names', () => {
  assert.equal(core().searchShops(data().shops, {query:'minecraft:black_wool'})[0].id, 'woolery');
  assert.equal(core().searchShops(data().shops, {query:'pale oak'})[0].id, 'pale-found');
  assert.equal(core().searchShops(data().shops, {query:'a-product-nobody-sells'}).length, 0);
});
test('search matches enchanted book aliases and services', () => {
  assert.ok(core().searchShops(data().shops, {query:'mending'}).some(s => s.id === 'moonbound'));
  assert.ok(core().searchShops(data().shops, {query:'terraforming'}).some(s => s.kind === 'service'));
});
test('all filters compose, including local favorites and in-stock listings', () => {
  assert.equal(core().searchShops(data().shops, {query:'wool', category:'redstone'}).length, 0);
  assert.equal(core().searchShops(data().shops, {savedOnly:true, saved:[]}).length, 0);
  assert.equal(core().searchShops(data().shops, {savedOnly:true, saved:['woolery']})[0].id, 'woolery');
  assert.ok(core().searchShops(data().shops, {kind:'stall'}).every(s => s.kind === 'stall'));
  assert.ok(core().searchShops(data().shops, {location:'spawn'}).every(s => s.location === 'spawn'));
  const fixture = [{id:'a',name:'A',owner:'B',description:'',items:[{id:'elytra',name:'Elytra',stock:'out'}],categories:[]}];
  assert.equal(core().searchShops(fixture,{query:'elytra',inStock:true}).length,0);
});
test('sort is stable and does not mutate source', () => {
  const before = data().shops.map(s => s.id).join();
  const sorted = core().searchShops(data().shops,{sort:'az'});
  assert.equal(sorted[0].name, 'Circuit & Co.');
  assert.equal(data().shops.map(s => s.id).join(), before);
});
test('suggestions are useful and bounded', () => {
  const suggestions = core().suggest(data().shops,'wool',6);
  assert.ok(suggestions.length > 0 && suggestions.length <= 6);
  assert.ok(suggestions.every(s => typeof s.label === 'string' && typeof s.value === 'string'));
  assert.equal(core().suggest(data().shops,'',6).length,0);
});
test('escapes all HTML metacharacters and rejects unsafe URLs', () => {
  assert.equal(core().escapeHTML('<script>"&\'</script>'), '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
  assert.equal(core().safeUrl('javascript:alert(1)'), '');
  assert.equal(core().safeUrl('data:text/html,hello'), '');
  assert.equal(core().safeUrl('https://discord.gg/example'), 'https://discord.gg/example');
});
test('matches only the requested inventory rows', () => {
  const shop = data().shops.find(s => s.id === 'woolery');
  assert.equal(core().matchedItems(shop,'white wool').length,1);
  assert.ok(core().matchedItems(shop,'wool').length >= 16);
});
test('submission validates coordinates and makes a publishable draft, never a live listing', () => {
  const input = { name:'A New Shop',owner:'Player_1',kind:'shop',category:'building',location:'district',x:'-120',y:'64',z:'44',description:'Our new shop.',items:'Stone, Oak logs' };
  const result = core().makeSubmission(input,data());
  assert.equal(result.errors.length,0);
  assert.equal(result.shop.coords.x,-120);
  assert.equal(result.shop.items.length,2);
  assert.equal(result.shop.status,'unverified');
  assert.equal(result.shop.demo,false);
  assert.ok(core().makeSubmission({...input,x:'nope'},data()).errors.length);
  assert.ok(core().makeSubmission({...input,name:'  '},data()).errors.length);
});
test('submission preserves a blank optional Y coordinate as null', () => {
  // Catches blank form values being coerced to a fabricated height of zero.
  const input = { name:'A New Shop',owner:'Player_1',kind:'shop',category:'building',location:'district',x:'-114',y:'',z:'400',description:'Our new shop.',items:'Stone' };
  const result = core().makeSubmission(input,data());
  assert.equal(result.errors.length,0);
  assert.equal(JSON.stringify(result.shop.coords),'{"x":-114,"y":null,"z":400}');
  assert.ok(core().makeSubmission({...input,y:'64'},data()).errors.length === 0);
  assert.ok(core().makeSubmission({...input,y:'1.5'},data()).errors.length);
  assert.ok(core().makeSubmission({...input,x:''},data()).errors.length);
  assert.ok(core().makeSubmission({...input,z:''},data()).errors.length);
});
test('coordinate formatting omits an unknown height without changing complete coordinates', () => {
  // Catches null heights leaking as null, zero, or undefined into visible/copyable text.
  assert.equal(core().coordinateValue({x:-114,y:null,z:400},'y'),'Not specified');
  assert.equal(core().coordinateCopyText({x:-114,y:null,z:400}),'X: -114, Z: 400');
  assert.equal(core().coordinateCopyText({x:128,y:64,z:-240}),'128 64 -240');
});
test('unknown references and invalid coordinates are caught by data validation', () => {
  const broken = JSON.parse(JSON.stringify(data()));
  broken.shops[0].location='missing';
  broken.shops[0].coords.x='not-a-number';
  assert.ok(core().validateData(broken).length >= 2);
});
test('data validation accepts only an explicit null for unknown Y', () => {
  // Catches nullable X/Z or noninteger coordinate values weakening the catalog contract.
  const unknownHeight = JSON.parse(JSON.stringify(data()));
  unknownHeight.shops[0].coords.y=null;
  assert.equal(core().validateData(unknownHeight).length,0);
  for (const [axis,value] of [['x',null],['z',null],['y','64'],['y',undefined],['y',1.5]]) {
    const broken = JSON.parse(JSON.stringify(data()));
    if (value === undefined) delete broken.shops[0].coords[axis];
    else broken.shops[0].coords[axis]=value;
    assert.ok(core().validateData(broken).some(error=>error.includes('coordinates')),`${axis}=${String(value)} must be rejected`);
  }
});
test('validation reports malformed top-level arrays instead of throwing', () => {
  assert.ok(core().validateData({shops:[],categories:null,locations:[]}).length);
  assert.ok(core().validateData({shops:[null],categories:[],locations:[]}).length);
});
test('validation rejects calendar dates that only look valid', () => {
  const broken=JSON.parse(JSON.stringify(data()));broken.shops[0].updated='2026-02-31';
  assert.ok(core().validateData(broken).length);
});
test('submission IDs stay unique after multiple similarly named drafts', () => {
  const d=JSON.parse(JSON.stringify(data()));d.shops.push({id:'new-shop'},{id:'new-shop-new'});
  const input={name:'New Shop',owner:'Player_1',kind:'shop',category:'building',location:'district',x:'0',y:'64',z:'0',description:'A new test shop.',items:'stone'};
  const result=core().makeSubmission(input,d);
  assert.equal(result.errors.length,0);assert.ok(!d.shops.some(s=>s.id===result.shop.id));
});
