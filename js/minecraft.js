/* Local resource-pack previews. No network lookup or guessed remote URLs. */
(function(root){
  'use strict';
  const aliases=Object.freeze({black_wool_bulk:'black_wool',mending_book:'enchanted_book',unbreaking_iii_book:'enchanted_book',efficiency_v_book:'enchanted_book',fortune_iii_book:'enchanted_book',silk_touch_book:'enchanted_book'});
  function resolve(item){
    let id=item.minecraftId===undefined?item.id:item.minecraftId;
    if(typeof id!=='string'||!/^(?:minecraft:)?[a-z0-9_]+$/.test(id))return '';
    id=id.replace(/^minecraft:/,'');
    id=aliases[id]||id;
    const rendered=root.MMMinecraftRendered?.[id];
    if(typeof rendered==='string'&&/^assets\/minecraft\/rendered\/[a-z0-9_]+\.png$/.test(rendered))return rendered;
    const assets=root.MMMinecraftAssets||{};
    for(const name of ['item/'+id,'block/'+id,'block/'+id+'_front','block/'+id+'_side','block/'+id+'_top']){
      const src=assets[name];
      if(typeof src==='string'&&/^assets\/minecraft\/previews\/(?:item|block)\/[a-z0-9_/-]+\.png$/.test(src))return src;
    }
    return '';
  }
  root.MMMinecraft=Object.freeze({resolve});
})(globalThis);
