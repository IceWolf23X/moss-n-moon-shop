/* Pure functions. No DOM, network, or storage access. Tested with node --test. */
(function (root) {
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/minecraft:/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const tokens = query => normalize(query).split(' ').filter(Boolean);
  const has = (value, query) => tokens(query).every(token => normalize(value).includes(token));
  const itemText = item => [item.id,item.name,...(item.aliases || [])].join(' ');
  const shopText = shop => [shop.name,shop.owner,shop.description,shop.tagline,...(shop.tags||[]),...shop.items.map(itemText)].join(' ');
  const available = item => item.stock === 'in' || item.stock === 'low';
  const matchedItems = (shop, query) => shop.items.filter(item => has(itemText(item),query));
  function searchShops(shops, filters = {}) {
    const {query='',category='all',kind='all',location='all',inStock=false,savedOnly=false,saved=[],sort='featured'}=filters;
    const results = shops.filter(shop => {
      if (category !== 'all' && !shop.categories.includes(category)) return false;
      if (kind !== 'all' && shop.kind !== kind) return false;
      if (location !== 'all' && shop.location !== location) return false;
      if (savedOnly && !saved.includes(shop.id)) return false;
      if (!has(shopText(shop),query)) return false;
      if (inStock) {
        if (shop.status !== 'open') return false;
        const matches=matchedItems(shop,query);
        if (!(matches.length ? matches : shop.items).some(available)) return false;
      }
      return true;
    });
    const nameOrder=(a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'});
    if (sort==='az') results.sort(nameOrder);
    else if (sort==='updated') results.sort((a,b)=>String(b.updated).localeCompare(String(a.updated))||nameOrder(a,b));
    else results.sort((a,b)=>Number(b.featured)-Number(a.featured));
    return results;
  }
  function suggest(shops,query,limit=6) {
    if (normalize(query).length < 2) return [];
    const map=new Map();
    shops.forEach(shop=>{
      if (has(shop.name,query)) map.set('shop:'+shop.id,{label:shop.name,value:shop.name,type:shop.kind==='service'?'Service':'Shop',shopId:shop.id,count:1});
      shop.items.forEach(item=>{
        if (!has(itemText(item),query)) return;
        const key=normalize(item.name);
        if (!map.has(key)) map.set(key,{label:item.name,value:item.name,type:shop.kind==='service'?'Service':'Item',count:0,_shops:new Set()});
        const entry=map.get(key); entry._shops.add(shop.id); entry.count=entry._shops.size;
      });
    });
    return [...map.values()].sort((a,b)=>Number(normalize(b.label).startsWith(normalize(query)))-Number(normalize(a.label).startsWith(normalize(query)))||a.label.localeCompare(b.label)).slice(0,limit).map(({_shops,...entry})=>entry);
  }
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  function safeUrl(value) {
    try { const url=new URL(String(value)); return ['https:','http:'].includes(url.protocol)?url.href:''; }
    catch { return ''; }
  }
  function safeAsset(value) {
    const input=String(value||'');
    if (/^(?:assets\/)[a-z0-9_./ -]+\.(?:png|jpg|jpeg|webp|svg)$/i.test(input) && !input.includes('..')) return input;
    return safeUrl(input);
  }
  // Canonical currency IDs. These are display units, not an automatic exchange system.
  const currencies = Object.freeze({
    diamond: Object.freeze({singular:'diamond', plural:'diamonds', icon:'diamond'}),
    diamond_block: Object.freeze({singular:'diamond block', plural:'diamond blocks', icon:'diamond-block'})
  });
  const isCurrency = value => Object.prototype.hasOwnProperty.call(currencies, value);
  function priceLabel(item) {
    if (item.price === null) return 'Ask owner';
    const currency = currencies[item.currency];
    if (!isCurrency(item.currency)) throw new Error('Unknown price currency.');
    const amount = new Intl.NumberFormat('en', {maximumSignificantDigits:21}).format(item.price);
    return `${amount} ${item.price === 1 ? currency.singular : currency.plural}`;
  }
  function validateData(data) {
    const errors = [];
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const text = value => typeof value === 'string' && value.trim().length > 0;
    const strings = value => Array.isArray(value) && value.every(text);
    const allowed = (value, keys, prefix) => {
      if (object(value)) Object.keys(value).forEach(key => {
        if (!keys.includes(key)) errors.push(`${prefix}.${key}: unknown field; check the spelling.`);
      });
    };
    if (!object(data) || !Array.isArray(data.shops)) return ['shops must be an array.'];
    if (!Array.isArray(data.categories) || !Array.isArray(data.locations)) return ['categories and locations must be arrays.'];
    const config = data.config;
    if (!object(config)) errors.push('config: a configuration object is required.');
    else {
      allowed(config, ['name','title','language','serverAddress','logo','demoMode','currency','storageKey','links','hero','popular','guide','faq'], 'config');
      for (const key of ['name','title','language','serverAddress','logo','storageKey']) {
        if (!text(config[key])) errors.push(`config.${key}: a nonempty string is required.`);
      }
      if (!isCurrency(config.currency)) errors.push('config.currency: use diamond or diamond_block.');
      if (typeof config.demoMode !== 'boolean') errors.push('config.demoMode: use true or false, without quotes.');
      if (!safeAsset(config.logo)) errors.push('config.logo: unsupported or unsafe asset path.');
      if (!object(config.links)) errors.push('config.links: an object is required.');
      else {
        allowed(config.links, ['discord','store','repository'], 'config.links');
        for (const [key, value] of Object.entries(config.links)) {
          if (typeof value !== 'string' || (value && !safeUrl(value))) errors.push(`config.links.${key}: use an HTTP(S) URL or an empty string.`);
        }
      }
      if (!object(config.hero)) errors.push('config.hero: an object is required.');
      else for (const key of ['eyebrow','title','accent','description']) {
        if (!text(config.hero[key])) errors.push(`config.hero.${key}: a nonempty string is required.`);
      }
      if (!strings(config.popular)) errors.push('config.popular: a list of strings is required.');
      for (const [key, fields] of [['guide',['icon','title','text']],['faq',['question','answer']]]) {
        if (!Array.isArray(config[key]) || config[key].some(entry => !object(entry) || fields.some(field => !text(entry[field])))) {
          errors.push(`config.${key}: each entry needs ${fields.join(', ')}.`);
        }
      }
    }
    const validateReferenceList = (list, type, keys) => {
      const ids = new Set();
      list.forEach((entry, index) => {
        const prefix = `${type}[${index}]`;
        if (!object(entry)) { errors.push(`${prefix}: an object is required.`); return; }
        allowed(entry, keys, prefix);
        if (typeof entry.id !== 'string' || !/^[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id)) errors.push(`${prefix}: invalid or duplicate id.`);
        ids.add(entry.id);
        for (const key of keys.filter(key => key !== 'id')) if (!text(entry[key])) errors.push(`${prefix}.${key}: a nonempty string is required.`);
      });
      return ids;
    };
    const categories = validateReferenceList(data.categories, 'categories', ['id','name','icon','description']);
    const locations = validateReferenceList(data.locations, 'locations', ['id','name','short','dimension','icon']);
    const ids = new Set();
    data.shops.forEach((shop, index) => {
      const prefix = `shops[${index}] (${shop?.id || 'no id'})`;
      if (!object(shop)) { errors.push(`${prefix}: must be a shop object.`); return; }
      allowed(shop, ['id','name','owner','categories','location','coords','theme','description','items','kind','status','demo','featured','updated','images','directions','tagline','tags','notes','currency'], prefix);
      if (typeof shop.id !== 'string' || !/^[a-z0-9-]+$/.test(shop.id) || ids.has(shop.id)) errors.push(`${prefix}: invalid or duplicate id.`);
      ids.add(shop.id);
      for (const key of ['name','owner','description']) if (!text(shop[key])) errors.push(`${prefix}.${key}: a nonempty string is required.`);
      for (const key of ['tagline','directions','notes','theme']) if (shop[key] !== undefined && typeof shop[key] !== 'string') errors.push(`${prefix}.${key}: a string is required.`);
      for (const key of ['demo','featured']) if (typeof shop[key] !== 'boolean') errors.push(`${prefix}.${key}: use true or false, without quotes.`);
      if (!['shop','stall','service'].includes(shop.kind)) errors.push(`${prefix}: invalid kind.`);
      if (!['open','paused','unverified'].includes(shop.status)) errors.push(`${prefix}: invalid status.`);
      if (!isCurrency(shop.currency)) errors.push(`${prefix}.currency: use diamond or diamond_block.`);
      if (!locations.has(shop.location)) errors.push(`${prefix}: unknown location.`);
      if (!strings(shop.categories) || !shop.categories.length || shop.categories.some(id => !categories.has(id))) errors.push(`${prefix}: unknown or empty categories.`);
      if (!strings(shop.tags)) errors.push(`${prefix}.tags: a list of strings is required; use [] for none.`);
      if (!object(shop.coords) || !['x','y','z'].every(key => Number.isSafeInteger(shop.coords[key]))) errors.push(`${prefix}: coordinates must be integers.`);
      else allowed(shop.coords, ['x','y','z'], `${prefix}.coords`);
      if (typeof shop.updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(shop.updated) || Number.isNaN(Date.parse(shop.updated)) || new Date(shop.updated).toISOString().slice(0,10) !== shop.updated) errors.push(`${prefix}: invalid updated date; use YYYY-MM-DD.`);
      if (!Array.isArray(shop.images)) errors.push(`${prefix}.images: a list is required; use [] for no images.`);
      else shop.images.forEach((image,n) => {
        const src = typeof image === 'string' ? image : object(image) ? image.src : '';
        if (!text(src) || !safeAsset(src)) errors.push(`${prefix}.images[${n}]: unsupported or unsafe image path.`);
        if (object(image)) {
          allowed(image, ['src','alt'], `${prefix}.images[${n}]`);
          if (image.alt !== undefined && typeof image.alt !== 'string') errors.push(`${prefix}.images[${n}].alt: a string is required.`);
        }
      });
      if (!Array.isArray(shop.items) || !shop.items.length) errors.push(`${prefix}: at least one listing is required.`);
      else {
        const itemIds = new Set();
        shop.items.forEach((item,n) => {
          const at = `${prefix}.items[${n}]`;
          if (!object(item)) { errors.push(`${at}: an item object is required.`); return; }
          allowed(item, ['id','name','price','quantity','unit','stock','icon','aliases','color','currency','minecraftId'], at);
          if (!text(item.id) || itemIds.has(item.id) || !text(item.name)) errors.push(`${at}: missing name/id or duplicate id.`);
          itemIds.add(item.id);
          if (item.price !== null && (!Number.isFinite(item.price) || item.price < 0)) errors.push(`${at}.price: use a nonnegative number or null, not a quoted string.`);
          if (!isCurrency(item.currency)) errors.push(`${at}.currency: use diamond or diamond_block.`);
          if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) errors.push(`${at}: invalid quantity.`);
          if (!text(item.unit)) errors.push(`${at}.unit: a nonempty string is required.`);
          if (item.minecraftId !== undefined && (typeof item.minecraftId !== 'string' || !/^(?:minecraft:)?[a-z0-9_]+$/.test(item.minecraftId))) errors.push(`${at}.minecraftId: use a Minecraft ID such as minecraft:white_wool.`);
          if (!text(item.icon)) errors.push(`${at}.icon: a nonempty string is required.`);
          if (!strings(item.aliases)) errors.push(`${at}.aliases: a list of strings is required.`);
          if (!['in','low','out','unknown'].includes(item.stock)) errors.push(`${at}: invalid stock.`);
          if (item.color !== undefined && !/^#[0-9a-f]{6}$/i.test(item.color)) errors.push(`${at}.color: use a quoted six-digit hex colour, e.g. "#e7e5df".`);
        });
      }
    });
    return errors;
  }
  function makeSubmission(input,data) {
    const errors=[];
    const currency=input.currency === undefined ? (data.config?.currency || 'diamond') : input.currency;
    if (!isCurrency(currency)) errors.push('Choose diamonds or diamond blocks.');
    const name=String(input.name||'').trim(),owner=String(input.owner||'').trim(),description=String(input.description||'').trim();
    if (name.length<2||name.length>60) errors.push('Use a shop name between 2 and 60 characters.');
    if (owner.length<2||owner.length>32) errors.push('Enter an in-game owner name (2–32 characters).');
    if (description.length<10||description.length>600) errors.push('Write a description between 10 and 600 characters.');
    if (!['shop','stall','service'].includes(input.kind)) errors.push('Choose a valid listing type.');
    if (!data.categories.some(c=>c.id===input.category)) errors.push('Choose a category.');
    if (!data.locations.some(l=>l.id===input.location)) errors.push('Choose a location.');
    const coords={};
    for (const axis of ['x','y','z']) {
      const raw=String(input[axis]??'').trim(); coords[axis]=Number(raw);
      if (!/^-?\d+$/.test(raw)||!Number.isSafeInteger(coords[axis])||Math.abs(coords[axis])>30000000) errors.push(`Enter a valid integer for coordinate ${axis.toUpperCase()}.`);
    }
    const itemNames=[...new Map(String(input.items||'').split(/[,\n]+/).map(s=>s.trim()).filter(Boolean).map(s=>[normalize(s),s])).values()];
    if (!itemNames.length||itemNames.length>50||itemNames.some(s=>s.length>100)) errors.push('List 1–50 item or service names, no more than 100 characters each.');
    if (errors.length) return {errors,shop:null};
    let id=normalize(name).replace(/ /g,'-'); if(!id)id='new-shop';
    const baseId=id;let suffix=1;while(data.shops.some(s=>s.id===id)){id=baseId+'-new'+(suffix>1?'-'+suffix:'');suffix++;}
    return {errors,shop:{id,name,owner,description,currency,kind:input.kind,categories:[input.category],location:input.location,coords,
      status:'unverified',demo:false,featured:false,theme:'welcome',updated:new Date().toISOString().slice(0,10),images:[],
      directions:'Add precise directions after staff review.',tags:[],
      items:itemNames.map((name,index)=>({id:normalize(name).replace(/ /g,'_')||`item_${index+1}`,name,price:null,currency,quantity:1,unit:input.kind==='service'?'project':'item',stock:'unknown',icon:'cube',aliases:[]}))}};
  }
  root.MMCore = Object.freeze({normalize,has,itemText,searchShops,matchedItems,suggest,escapeHTML,safeUrl,safeAsset,validateData,makeSubmission,available,currencies,isCurrency,priceLabel});
}(globalThis));
