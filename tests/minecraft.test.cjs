'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'..');
function runtime(withAssets=true){
  const ctx=vm.createContext({});
  for(const f of [...(withAssets?['js/minecraft-assets.js']:[]),'js/minecraft.js','js/art.js'])
    if(fs.existsSync(path.join(base,f)))vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),ctx);
  return ctx;
}
test('Minecraft IDs resolve to local Bare Bones item and block previews',()=>{
  const c=runtime();assert.ok(c.MMMinecraft,'Minecraft asset resolver must exist');
  for(const [id,texture] of [['minecraft:white_wool','block/white_wool'],['diamond','item/diamond'],['observer','block/observer_front'],['pale_oak_log','block/pale_oak_log']]){
    const src=c.MMMinecraft.resolve({id});assert.match(src,/^assets\/minecraft\/previews\//);assert.ok(fs.existsSync(path.join(base,src)));
    assert.equal(src,c.MMMinecraftAssets[texture]);
  }
});
test('catalog aliases and explicit Minecraft IDs select the corresponding assets',()=>{
  const c=runtime();assert.ok(c.MMMinecraft);
  assert.equal(c.MMMinecraft.resolve({id:'black_wool_bulk'}),c.MMMinecraft.resolve({id:'black_wool'}));
  assert.equal(c.MMMinecraft.resolve({id:'mending_book'}),c.MMMinecraft.resolve({id:'enchanted_book'}));
  assert.equal(c.MMMinecraft.resolve({id:'custom_batch',minecraftId:'minecraft:diamond'}),c.MMMinecraft.resolve({id:'diamond'}));
});
test('unknown IDs, unsupported namespaces and traversal never create asset URLs',()=>{
  const c=runtime();assert.ok(c.MMMinecraft);
  for(const id of ['building_service','nonexistent_item','../diamond','mod:diamond','"><script>'])assert.equal(c.MMMinecraft.resolve({id}),'');
  assert.equal(c.MMMinecraft.resolve({id:'diamond',minecraftId:'../../diamond'}),'');
});
test('item rendering includes an original illustration fallback and safe local image',()=>{
  const c=runtime();assert.match(c.MMArt.itemIcon({id:'white_wool',icon:'wool'}),/class="minecraft-item"/);
  assert.match(c.MMArt.itemIcon({id:'white_wool',icon:'wool'}),/item-fallback/);
  assert.doesNotMatch(c.MMArt.itemIcon({id:'building_service',icon:'tools'}),/<img/);
  assert.doesNotMatch(runtime(false).MMArt.itemIcon({id:'white_wool',icon:'wool'}),/<img/);
});
test('every registry preview and provenance texture exists',()=>{
  const c=runtime();assert.ok(c.MMMinecraftAssets);
  for(const src of Object.values(c.MMMinecraftAssets))assert.ok(fs.existsSync(path.join(base,src)),src);
  const manifest=JSON.parse(fs.readFileSync(path.join(base,'assets/minecraft/manifest.json')));
  assert.deepEqual(manifest.packs.map(p=>p.role),['base','updated','extra']);
  for(const entry of Object.values(manifest.files)){
    const file=path.join(base,'assets/minecraft',entry.path);assert.ok(fs.existsSync(file));
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),entry.sha256,file);
  }
});
test('YAML validation accepts explicit Minecraft IDs and rejects invalid values',()=>{
  const c=vm.createContext({URL,Date,Set,Map});
  for(const f of ['tests/fixtures/example-data.js','js/core.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),c);
  for(const id of ['minecraft:white_wool','diamond']){
    const data=JSON.parse(JSON.stringify(c.MMData));data.shops[0].items[0].minecraftId=id;
    assert.equal(c.MMCore.validateData(data).length,0);
  }
  for(const id of [123,'../../diamond','mod:diamond','']){
    const data=JSON.parse(JSON.stringify(c.MMData));data.shops[0].items[0].minecraftId=id;
    assert.ok(c.MMCore.validateData(data).some(e=>e.includes('.minecraftId:')));
  }
});
