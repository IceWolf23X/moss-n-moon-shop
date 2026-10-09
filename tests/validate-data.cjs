'use strict';
// Validates the CURRENT YAML catalog with the same parser and loader as the browser.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(base, name), 'utf8');
const ctx = vm.createContext({ URL, Date, Set, Map });
function scriptsIn(folder) {
  return fs.readdirSync(path.join(base,folder), {withFileTypes:true}).flatMap(entry => {
    const name=folder+'/'+entry.name;
    return entry.isDirectory() ? scriptsIn(name) : name.endsWith('.js') ? [name] : [];
  });
}
async function main() {
  for (const file of scriptsIn('js')) new vm.Script(read(file), {filename:file});
  for (const file of ['js/vendor/js-yaml.js','js/core.js','js/data.js']) vm.runInContext(read(file), ctx, {filename:file,timeout:5000});
  const data = await ctx.MMDataSource.loadCatalog({readText:async filename=>read(filename)});
  const localAsset = value => {
    assert.ok(ctx.MMCore.safeAsset(value), `Unsafe or unsupported asset: ${value}`);
    if (value.startsWith('assets/')) assert.ok(fs.existsSync(path.join(base,value)), `Missing asset: ${value}`);
  };
  localAsset(data.config.logo);
  for (const shop of data.shops) for (const image of shop.images) localAsset(typeof image==='string'?image:image.src);
  const html = read('index.html');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (!/^(?:https?:|#|data:)/i.test(match[1])) assert.ok(fs.existsSync(path.join(base,match[1])), `Missing HTML dependency: ${match[1]}`);
  }
  assert.ok(!html.includes('https://cdn.') && !html.includes('https://unpkg.'), 'Runtime scripts must be local.');
  console.log(`YAML catalog valid: ${data.shops.length} shops, ${data.shops.reduce((n,s)=>n+s.items.length,0)} inventory listings. All local assets and HTML dependencies exist.`);
}
main().catch(error=>{console.error('Catalog validation failed:\n'+error.message);process.exitCode=1;});
