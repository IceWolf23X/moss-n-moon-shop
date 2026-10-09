'use strict';
// Real HTTP tests run in Node. This does NOT stand in for a browser deployment test.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const base = path.resolve(__dirname,'..');
const ctx = vm.createContext({URL,Date,Set,Map,fetch,AbortController,setTimeout,clearTimeout});
for (const name of ['js/vendor/js-yaml.js','js/core.js','js/data.js']) vm.runInContext(fs.readFileSync(path.join(base,name),'utf8'),ctx);
async function withServer(handler,run) {
  const server=http.createServer(handler);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try { await run(`http://127.0.0.1:${server.address().port}/directory-repo/`); }
  finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
}
test('production fetch loads actual YAML files under a repository subpath over HTTP',async()=>{
  const requests=[];
  await withServer((req,res)=>{
    requests.push(req.url);
    assert.equal(req.method,'GET');
    assert.ok(req.url.startsWith('/directory-repo/'));
    const relative=req.url.slice('/directory-repo/'.length);
    const file=path.resolve(base,relative);
    if (!file.startsWith(base+path.sep)||!fs.existsSync(file)) {res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':'text/yaml; charset=utf-8'});res.end(fs.readFileSync(file));
  },async baseUrl=>{
    const data=await ctx.MMDataSource.loadCatalog({readText:name=>ctx.MMDataSource.fetchText(name,{baseUrl})});
    const manifest=ctx.MMDataSource.parseYaml(fs.readFileSync(path.join(base,'shops/index.yml'),'utf8'),'shops/index.yml');
    assert.equal(data.shops.length,manifest.shops.length);
    assert.equal(requests.length,2+manifest.shops.length);
    assert.ok(requests.includes('/directory-repo/config.yml'));
    assert.ok(requests.includes('/directory-repo/shops/index.yml'));
  });
});
test('fetch reports HTTP failures with a useful filename',async()=>{
  await withServer((_req,res)=>{res.writeHead(404);res.end('missing');},async baseUrl=>{
    await assert.rejects(ctx.MMDataSource.fetchText('shops/missing.yml',{baseUrl}), /shops\/missing\.yml: HTTP 404/);
  });
});
test('fetch timeouts have an actionable message instead of waiting forever',async()=>{
  await withServer(()=>{},async baseUrl=>{
    await assert.rejects(ctx.MMDataSource.fetchText('shops/slow.yml',{baseUrl,timeout:30}), /shops\/slow\.yml: request timed out/);
  });
});
test('file protocol fails with local-server instructions, without trying to fetch',async()=>{
  await assert.rejects(ctx.MMDataSource.fetchText('config.yml',{baseUrl:'file:///example/index.html'}), /HTTP\(S\).*double-clicking/);
});

test('preview test shop lists every rendered Minecraft item and block exactly once',async()=>{
  const catalog=await ctx.MMDataSource.loadCatalog({readText:name=>fs.readFileSync(path.join(base,name),'utf8')});
  const shop=catalog.shops.find(shop=>shop.id==='preview-test');
  assert.ok(shop,'The preview test shop must be listed');
  const rendered=JSON.parse(fs.readFileSync(path.join(base,'assets/minecraft/rendered/manifest.json')));
  assert.deepEqual(Array.from(shop.items,item=>item.id).sort(),Object.keys(rendered.items).sort());
  assert.equal(shop.demo,true);
  assert.ok(shop.items.every(item=>item.price===null&&item.stock==='unknown'));
});
