'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'..');
function imageDimensions(src){
  const data=fs.readFileSync(path.join(base,src));
  if(src.endsWith('.png'))return [data.readUInt32BE(16),data.readUInt32BE(20)];
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');
  assert.equal(data.toString('ascii',12,16),'VP8L','Previews must use lossless WebP');
  assert.equal(data[20],0x2f);
  const bits=data.readUInt32LE(21);return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];
}
function runtime(withAssets=true){
  const ctx=vm.createContext({});
  for(const f of [...(withAssets?['js/minecraft-assets.js','js/minecraft-rendered.js']:[]),'js/minecraft.js','js/art.js'])
    if(fs.existsSync(path.join(base,f)))vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),ctx);
  return ctx;
}
test('Minecraft IDs resolve to local native item and CoreChatX block previews',()=>{
  const c=runtime();assert.ok(c.MMMinecraft,'Minecraft asset resolver must exist');
  for(const [id,texture] of [['minecraft:white_wool','block/white_wool'],['diamond','item/diamond'],['observer','block/observer_front'],['pale_oak_log','block/pale_oak_log']]){
    const src=c.MMMinecraft.resolve({id});assert.match(src,/^assets\/minecraft\/(?:rendered|textures|direct|previews)\//);assert.ok(fs.existsSync(path.join(base,src)));
    assert.equal(src,c.MMMinecraftRendered[id.replace(/^minecraft:/,'')]);
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
test('every flat/rendered preview and provenance texture exists',()=>{
  const c=runtime();assert.ok(c.MMMinecraftAssets);
  for(const src of Object.values(c.MMMinecraftAssets))assert.ok(fs.existsSync(path.join(base,src)),src);
  for(const src of Object.values(c.MMMinecraftRendered))assert.ok(fs.existsSync(path.join(base,src)),src);
  const rendered=JSON.parse(fs.readFileSync(path.join(base,'assets/minecraft/rendered/manifest.json')));
  for(const entry of Object.values(rendered.items)){
    const png=fs.readFileSync(path.join(base,entry.path));
    assert.equal(crypto.createHash('sha256').update(png).digest('hex'),entry.sha256,entry.path);
    assert.deepEqual(imageDimensions(entry.path),[entry.pixel_size,entry.pixel_size]);
    assert.equal(entry.used_fallback,false);
  }
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
test('CoreChatX rendered previews take priority over flat textures at scale 16',()=>{
  const c=runtime();
  if(fs.existsSync(path.join(base,'js/minecraft-rendered.js')))vm.runInContext(fs.readFileSync(path.join(base,'js/minecraft-rendered.js'),'utf8'),c);
  assert.ok(c.MMMinecraftRendered,'CoreChatX rendered registry must exist');
  for(const id of ['white_wool','pale_oak_log','observer','enchanted_book']){
    const src=c.MMMinecraft.resolve({id});assert.equal(src,c.MMMinecraftRendered[id]);assert.match(src,/^assets\/minecraft\/rendered\//);
    assert.deepEqual(imageDimensions(src),[256,256]);
  }
});

test('plain 2D items use original native-size images while enchanted books retain glint',()=>{
  const c=runtime();
  for(const id of ['diamond','apple','iron_ingot']){
    const src=c.MMMinecraft.resolve({id});
    assert.match(src,/^assets\/minecraft\/(?:textures|direct|previews)\//);
    assert.deepEqual(imageDimensions(src),[16,16]);
    assert.ok(!fs.existsSync(path.join(base,'assets/minecraft/rendered/'+id+'.png')),'Redundant upscale must be removed');
  }
  assert.match(c.MMMinecraft.resolve({id:'enchanted_book'}),/\/rendered\/enchanted_book\.(?:png|webp)$/);
});
