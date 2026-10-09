/* Local resource-pack previews. No network lookup or guessed remote URLs. */
(function(root){
  'use strict';
  const aliases=Object.freeze({black_wool_bulk:'black_wool',mending_book:'enchanted_book',unbreaking_iii_book:'enchanted_book',efficiency_v_book:'enchanted_book',fortune_iii_book:'enchanted_book',silk_touch_book:'enchanted_book'});
  function resolve(item){
    let id=item.minecraftId===undefined?item.id:item.minecraftId;
    if(typeof id!=='string'||!/^(?:minecraft:)?[a-z0-9_]+$/.test(id))return '';
    id=id.replace(/^minecraft:/,'');
    id=aliases[id]||id;
    const preview=root.MMMinecraftRendered?.[id];
    if(typeof preview==='string'&&/^assets\/minecraft\/(?:rendered|textures|direct|previews)\/[a-z0-9_/-]+\.png$/.test(preview))return preview;
    const assets=root.MMMinecraftAssets||{};
    for(const name of ['item/'+id,'block/'+id,'block/'+id+'_front','block/'+id+'_side','block/'+id+'_top']){
      const src=assets[name];
      if(typeof src==='string'&&/^assets\/minecraft\/previews\/(?:item|block)\/[a-z0-9_/-]+\.png$/.test(src))return src;
    }
    return '';
  }
  root.MMMinecraft=Object.freeze({resolve});
})(globalThis);
