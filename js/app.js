/* All document content is rendered from JavaScript after YAML loading. index.html remains a shell. */
(async function () {
  'use strict';
  const C=globalThis.MMCore, A=globalThis.MMArt, Source=globalThis.MMDataSource;
  const root=document.getElementById('app');
  if(!C||!A||!Source){root.textContent='The directory could not load. Keep the js, css, assets, and shops folders beside index.html.';return;}
  const e=C.escapeHTML, icon=A.icon;
  root.innerHTML='<main class="load-error loading-state" role="status"><span class="loading-dot" aria-hidden="true"></span><h1>Loading directory…</h1><p>Loading the shop directory.</p></main>';
  let D;
  try {
    D=await Source.loadCatalog();
  } catch(error) {
    const local=location.protocol==='file:';
    root.innerHTML=`<main class="load-error" role="alert"><p class="eyebrow">DIRECTORY DATA</p><h1>${local?'Open this preview through a web server.':'The directory could not load its data.'}</h1><p>${local?'This version reads separate YAML files. Open it on GitHub Pages or use a local HTTP server instead of double-clicking index.html.':'Check the YAML file named below, correct the problem, and publish the updated files. No shops have been silently omitted.'}</p><pre>${e(error.message)}</pre>${local?'<p>Local preview command, from the project folder:</p><pre>python -m http.server 8080</pre><p>Then open http://localhost:8080 in your browser.</p>':''}<button class="button button-primary" id="retry-data">Try again</button></main>`;
    document.getElementById('retry-data').addEventListener('click',()=>location.reload(),{once:true});
    return;
  }
  globalThis.MMData=D; // Read-only by convention; useful when inspecting the loaded catalog.
  const config=D.config;
  document.documentElement.lang=config.language;
  document.title=`${config.name} · ${config.demoMode?'Directory preview':'Community directory'}`;
  const $=(selector,scope=document)=>scope.querySelector(selector);
  const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
  let storageWritable=true, storageWarned=false, toastTimer, lastFocus=null, activeModal='', galleryIndex=0, listingDraft=null;
  const validIds=new Set(D.shops.map(s=>s.id));
  let saved=[];
  try{const stored=JSON.parse(localStorage.getItem(config.storageKey+'-saved')||'[]'); if(Array.isArray(stored))saved=[...new Set(stored.filter(id=>validIds.has(id)))];}catch{storageWritable=false;}
  const defaults={query:'',category:'all',kind:'all',location:'all',inStock:false,savedOnly:false,sort:'featured',view:'grid',shopId:''};
  let state={...defaults,saved};
  let suggestions=[], suggestionIndex=-1;
  const getShop=id=>D.shops.find(s=>s.id===id);
  const getLocation=id=>D.locations.find(l=>l.id===id);
  const getCategory=id=>D.categories.find(c=>c.id===id);
  const kindName=kind=>({shop:'Shop',stall:'Stall',service:'Service'}[kind]||'Shop');
  const dateLabel=value=>new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));
  const locationOptions=(includeAll=true)=>`${includeAll?'<option value="all">All locations</option>':''}${D.locations.map(l=>`<option value="${e(l.id)}">${e(l.name)}</option>`).join('')}`;
  const totalListings=()=>new Set(D.shops.flatMap(s=>s.items.map(i=>i.id))).size;
  function readRoute(){
    const params=new URLSearchParams(location.hash.slice(1));
    state={...state,...defaults,
      query:(params.get('q')||'').slice(0,160),
      category:D.categories.some(c=>c.id===params.get('category'))?params.get('category'):'all',
      location:D.locations.some(l=>l.id===params.get('location'))?params.get('location'):'all',
      kind:['shop','stall','service'].includes(params.get('type'))?params.get('type'):'all',
      sort:['az','updated'].includes(params.get('sort'))?params.get('sort'):'featured',
      view:params.get('view')==='list'?'list':'grid',inStock:params.get('stock')==='1',savedOnly:params.get('saved')==='1',
      shopId:validIds.has(params.get('shop'))?params.get('shop'):''
    };
  }
  function routeHash(shopId=state.shopId){
    const p=new URLSearchParams();
    if(state.query)p.set('q',state.query);
    if(state.category!=='all')p.set('category',state.category);
    if(state.location!=='all')p.set('location',state.location);
    if(state.kind!=='all')p.set('type',state.kind);
    if(state.inStock)p.set('stock','1');
    if(state.savedOnly)p.set('saved','1');
    if(state.sort!=='featured')p.set('sort',state.sort);
    if(state.view!=='grid')p.set('view',state.view);
    if(shopId)p.set('shop',shopId);
    return p.toString();
  }
  function syncRoute(){try{history.replaceState(null,'',location.pathname+location.search+(routeHash()?'#'+routeHash():''));}catch{/* file:// and restricted browsers can still use the directory without history. */}}
  function renderShell(){
    root.innerHTML=`
      <a class="skip-link" href="#directory-heading">Skip to the directory</a>
      <header class="site-header"><div class="header-inner wrap">
        <a class="brand" href="#" data-action="home" aria-label="${e(config.name)} home"><img src="${e(config.logo)}" width="46" height="46" alt=""><span><strong>${e(config.name)}</strong><small>THE COMMUNITY DIRECTORY</small></span></a>
        <nav class="desktop-nav" aria-label="Main navigation"><button class="nav-link active" data-action="directory">Directory</button><button class="nav-link" data-action="saved">Saved shops <span class="nav-count" data-saved-count>0</span></button></nav>
        <div class="header-actions"><button class="icon-button theme-toggle" data-action="theme" aria-label="Switch to dark theme"></button><button class="button button-primary header-list" data-action="listing">${icon('plus')}<span>List your shop</span></button><button class="icon-button mobile-menu-button" data-action="menu" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav">${icon('menu')}</button></div>
      </div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><button data-action="directory">Directory</button><button data-action="saved">Saved shops <span data-saved-count>0</span></button><button data-action="community">Community</button><button data-action="listing">List your shop</button></nav></header>
      <main id="main-content">
        <div class="wrap">
          <div class="directory-intro"><h1 id="directory-title">Shop directory</h1></div>
          <section class="search-section" aria-label="Search the directory">
            <form id="search-form" class="search-box" role="search"><div class="search-input-wrap">${icon('search')}<label for="query" class="sr-only">Search items, shops, or services</label><input id="query" name="q" type="search" maxlength="160" placeholder="Search items, shops or services" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="suggestions" aria-expanded="false"><button type="button" class="icon-button clear-query" data-action="clear-query" aria-label="Clear search" hidden>${icon('close')}</button><kbd class="search-shortcut" aria-hidden="true">/</kbd></div><div class="search-location">${icon('pin')}<label for="location" class="sr-only">Location</label><select id="location">${locationOptions()}</select>${icon('down','select-chevron')}</div><button class="button button-primary search-submit" type="submit">Search ${icon('arrow')}</button></form>
            <div id="suggestion-panel" class="suggestion-panel" hidden><p>IN THIS DIRECTORY</p><ul id="suggestions" role="listbox" aria-label="Search suggestions"></ul><div class="suggestion-hint"><span>↑ ↓ to explore · Enter to select</span><span>Esc to close</span></div></div>

          </section>
          ${config.demoMode?`<aside class="demo-notice">${icon('info')}<p><strong>Sample data.</strong> Shops, stock, prices, and coordinates shown here are sample data.</p><button data-action="about">About this preview ${icon('arrow')}</button></aside>`:''}
          <section id="directory" class="directory" aria-labelledby="directory-heading"><div class="section-heading"><div><h2 id="directory-heading" tabindex="-1">Shops</h2></div><span class="directory-total">${D.shops.length} listings</span></div>
            <div class="directory-layout"><aside id="filters" class="filters" aria-label="Directory filters"><div class="filter-heading"><h3>Categories</h3><button data-action="reset" class="text-button">Reset</button><button class="icon-button mobile-filter-close" data-action="filters" aria-label="Close filters">${icon('close')}</button></div><div id="category-list" class="category-list"></div><div class="stock-filter"><label class="switch-label" for="in-stock"><span>Listed as in stock</span><span class="switch"><input id="in-stock" type="checkbox"><span class="switch-track"></span></span></label><p>Owner-updated, not live inventory.</p></div></aside>
              <div class="results-area"><div class="results-toolbar"><div class="kind-tabs" role="group" aria-label="Listing type">${[['all','All types'],['shop','Shops'],['stall','Stalls'],['service','Services']].map(([id,name])=>`<button data-action="kind" data-value="${id}" aria-pressed="${id==='all'}">${name}</button>`).join('')}</div><div class="display-controls"><label for="sort" class="sr-only">Sort shops</label><select id="sort"><option value="featured">Featured first</option><option value="az">Name: A to Z</option><option value="updated">Recently updated</option></select><div class="view-controls" role="group" aria-label="Display format"><button class="icon-button" data-action="view" data-value="grid" aria-label="Grid view" aria-pressed="true">${icon('grid')}</button><button class="icon-button" data-action="view" data-value="list" aria-label="List view" aria-pressed="false">${icon('list')}</button></div></div></div>
                <div class="results-meta"><p id="result-summary" role="status" aria-live="polite" aria-atomic="true"></p><button class="mobile-filter-button" data-action="filters" aria-expanded="false" aria-controls="filters">${icon('filter')} Filters</button></div><div id="active-filters" class="active-filters"></div><div id="shop-grid" class="shop-grid"></div>
              </div>
            </div>
          </section>

        </div>
      </main>
      <footer class="site-footer"><div class="wrap footer-top"><a class="brand footer-brand" href="#" data-action="home"><img src="${e(config.logo)}" width="40" height="40" alt=""><span><strong>${e(config.name)}</strong><small>SHOP DIRECTORY</small></span></a><div class="footer-links"><button data-action="directory">Directory</button><button data-action="community">Community ${icon('external')}</button></div><button class="server-address" data-action="server" aria-label="Copy Minecraft server address">${icon('copy')} ${e(config.serverAddress)}</button></div><div class="wrap footer-bottom"><p>© ${new Date().getFullYear()} ${e(config.name)} · Community directory${config.demoMode?' preview':''}</p><p>Not an official Minecraft product.</p></div></footer>
      <dialog id="modal" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog><div id="toast" class="toast" role="status" aria-live="polite" hidden></div>`;
  }
  function picture(shop,detail=false){
    const images=(shop.images||[]).map(image=>typeof image==='string'?{src:C.safeAsset(image),alt:''}:{src:C.safeAsset(image.src),alt:image.alt||''}).filter(image=>image.src);
    if(images.length){const image=images[(detail?galleryIndex:0)%images.length];return `<img class="shop-photo" src="${e(image.src)}" alt="${e(image.alt||`${shop.name} — ${shop.demo?'example':'shop'} image`)}" ${detail?'':'loading="lazy"'} data-fallback-theme="${e(shop.theme)}">`;}
    return A.scene(shop.theme);
  }
  function card(shop){
    const isSaved=state.saved.includes(shop.id),location=getLocation(shop.location),matched=C.matchedItems(shop,state.query);
    const matchText=state.query&&matched.length?matched.slice(0,2).map(i=>i.name).join(' · ')+(matched.length>2?` +${matched.length-2}`:''):'';
    return `<article class="shop-card" data-shop="${e(shop.id)}"><div class="shop-visual"><button class="art-link" data-action="open" data-id="${e(shop.id)}" aria-label="View ${e(shop.name)}">${picture(shop)}</button></div><div class="card-content"><p class="card-location">${icon('pin')}${e(location.short)} · ${kindName(shop.kind)}</p><div class="shop-title"><h3><button data-action="open" data-id="${e(shop.id)}">${e(shop.name)}</button></h3><button class="save-button ${isSaved?'is-saved':''}" data-action="save" data-id="${e(shop.id)}" aria-pressed="${isSaved}" aria-label="${isSaved?'Unsave':'Save'} ${e(shop.name)}">${icon('heart')}</button></div><p class="card-tagline ${matchText?'has-match':''}">${matchText?icon('search'):''}${e(matchText||shop.categories.map(id=>getCategory(id).name).join(' · '))}</p><div class="card-tags"><span class="listing-count">${shop.items.length} ${shop.kind==='service'?'services':'items'}</span></div><div class="card-footer"><span class="shop-owner">${e(shop.owner)}</span><button class="visit-link" data-action="open" data-id="${e(shop.id)}" aria-label="View ${e(shop.name)}">Details ${icon('arrow')}</button></div></div></article>`;
  }
  function refresh({sync=true}={}){
    const matches=C.searchShops(D.shops,state);
    $('#query').value=state.query;
    $('#location').value=state.location;
    $('#sort').value=state.sort;
    $('#in-stock').checked=state.inStock;
    $('.clear-query').hidden=!state.query;
    $('.search-shortcut').hidden=Boolean(state.query);
    $('#shop-grid').classList.toggle('list-view',state.view==='list');
    $('#shop-grid').innerHTML=matches.length?matches.map(card).join(''):emptyState();
    const title=state.savedOnly?'Saved shops':'Shops';
    $('#directory-heading').textContent=title;
    $('#result-summary').innerHTML=`<strong>${matches.length}</strong> ${matches.length===1?'listing':'listings'}${state.query?` for <strong>“${e(state.query)}”</strong>`:state.savedOnly?' saved on this device':''}`;
    $$('.kind-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===state.kind)));
    $$('.view-controls button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===state.view)));
    $$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.action===(state.savedOnly?'saved':'directory')));
    const categories=[{id:'all',name:'All categories',icon:'grid'},...D.categories];
    $('#category-list').innerHTML=categories.map(c=>`<button class="category-button ${state.category===c.id?'selected':''}" data-action="category" data-value="${e(c.id)}" aria-pressed="${state.category===c.id}">${icon(c.icon)}<span>${e(c.name)}</span><small>${C.searchShops(D.shops,{...state,category:c.id}).length}</small></button>`).join('');
    const chips=[];
    if(state.query)chips.push(['query',state.query]);
    if(state.category!=='all')chips.push(['category',getCategory(state.category).name]);
    if(state.location!=='all')chips.push(['location',getLocation(state.location).name]);
    if(state.inStock)chips.push(['inStock','Listed in stock']);
    if(state.savedOnly)chips.push(['savedOnly','Saved shops']);
    $('#active-filters').innerHTML=chips.map(([key,label])=>`<button data-action="remove-filter" data-value="${key}" aria-label="Remove ${e(label)} filter">${e(label)}${icon('close')}</button>`).join('');
    $('#active-filters').hidden=!chips.length;
    updateSavedUI();
    if(sync)syncRoute();
  }
  function emptyState(){
    const savedEmpty=state.savedOnly&&state.saved.length===0;
    return `<div class="empty-state"><div class="empty-icon">${icon(savedEmpty?'heart':'search')}</div><h3>${savedEmpty?'No saved shops.':'No shops found.'}</h3><p>${savedEmpty?'Save a shop using its heart button. Saved shops are stored in this browser.':'Try a broader search or clear a filter. This directory only searches the items and services that owners have listed.'}</p><button class="button button-primary" data-action="${savedEmpty?'directory':'reset'}">${savedEmpty?'View directory':'Clear the filters'} ${icon('arrow')}</button></div>`;
  }
  function updateSavedUI(){
    $$('[data-saved-count]').forEach(el=>el.textContent=String(state.saved.length));
    $$('[data-action="save"]').forEach(b=>{const s=getShop(b.dataset.id),on=state.saved.includes(b.dataset.id);b.classList.toggle('is-saved',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',`${on?'Unsave':'Save'} ${s?.name||'shop'}`);const text=b.querySelector('[data-save-label]');if(text)text.textContent=on?'Saved':'Save shop';});
  }
  function persistSaved(){
    try{localStorage.setItem(config.storageKey+'-saved',JSON.stringify(state.saved));storageWritable=true;}catch{storageWritable=false;}
    if(!storageWritable&&!storageWarned){toast('Browser storage is blocked. Your saved shops will last only for this session.');storageWarned=true;}
  }
  function updateThemeUI(){
    const dark=document.documentElement.dataset.theme==='dark',button=$('.theme-toggle');
    button.innerHTML=icon(dark?'sun':'moon');button.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`);button.title=`Switch to ${dark?'light':'dark'} theme`;
    $('meta[name="theme-color"]').content=dark?'#142920':'#07584c';
  }
  function toast(message){
    clearTimeout(toastTimer);const el=$('#toast');($('#modal').open?$('#modal'):document.body).append(el);el.replaceChildren();const span=document.createElement('span');span.textContent=message;el.append(span);el.hidden=false;toastTimer=setTimeout(()=>el.hidden=true,4500);
  }
  async function copyText(text,message='Copied to clipboard.'){
    let copied=false;
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);copied=true;}}catch{/* Fall through to the offline-compatible path. */}
    if(!copied){
      const focus=document.activeElement,area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','Text to copy');area.style.cssText='position:fixed;top:0;left:0;width:2px;height:2px;opacity:0';
      ($('#modal').open?$('#dialog-content'):document.body).append(area);area.focus();area.select();
      try{copied=document.execCommand('copy');}catch{}
      area.remove();focus?.focus({preventScroll:true});
    }
    toast(copied?message:'Copy is unavailable here. Select and copy the displayed text manually.');return copied;
  }
  function closeSuggestions(){
    $('#suggestion-panel').hidden=true;$('#query').setAttribute('aria-expanded','false');$('#query').removeAttribute('aria-activedescendant');suggestions=[];suggestionIndex=-1;
  }
  function showSuggestions(){
    suggestions=C.suggest(D.shops,state.query,6);suggestionIndex=-1;
    if(!suggestions.length){closeSuggestions();return;}
    $('#suggestions').innerHTML=suggestions.map((s,i)=>`<li id="suggestion-${i}" role="option" aria-selected="false" data-suggestion="${i}"><span class="suggestion-icon">${icon(s.type==='Shop'?'store':s.type==='Service'?'tools':'cube')}</span><span><strong>${e(s.label)}</strong><small>${e(s.type)}${s.type==='Item'?` · ${s.count} ${s.count===1?'shop':'shops'}`:''}</small></span>${icon('arrow')}</li>`).join('');
    $('#suggestion-panel').hidden=false;$('#query').setAttribute('aria-expanded','true');
  }
  function chooseSuggestion(index){const suggestion=suggestions[index];if(!suggestion)return;state.query=suggestion.value;closeSuggestions();refresh();$('#query').focus();}
  function scrollDirectory(){closeMobileMenu();$('#directory').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  function closeMobileMenu(){$('#mobile-nav').hidden=true;$('.mobile-menu-button').setAttribute('aria-expanded','false');}
  function closeFilters(){$('#filters').classList.remove('mobile-open');$('.mobile-filter-button').setAttribute('aria-expanded','false');}
  function showModal(content,type){
    const modal=$('#modal');if(!modal.open)lastFocus=document.activeElement;
    activeModal=type;$('#dialog-content').innerHTML=content;
    modal.className=type==='shop'?'shop-dialog':type==='listing'?'listing-dialog':'simple-dialog';
    if(!modal.open)modal.showModal();modal.scrollTop=0;document.body.classList.add('modal-open');closeSuggestions();closeMobileMenu();
  }
  const closeButton=()=>`<button class="icon-button dialog-close" data-action="close" aria-label="Close dialog">${icon('close')}</button>`;
  // Renders all coordinate axes while giving an unknown Y an explicit readable value.
  function coordinateMarkup(shop){
    return `<div><span>X</span><code>${e(C.coordinateValue(shop.coords,'x'))}</code></div><div><span>Y</span><code>${e(C.coordinateValue(shop.coords,'y'))}</code></div><div><span>Z</span><code>${e(C.coordinateValue(shop.coords,'z'))}</code></div>`;
  }
  // Opens shop inventory, coordinates and trading terms without exposing editor notes.
  function openShop(id){
    const shop=getShop(id);if(!shop)return;
    state.shopId=id;galleryIndex=0;
    const location=getLocation(shop.location),images=(shop.images||[]).filter(img=>C.safeAsset(typeof img==='string'?img:img.src));
    showModal(`<div class="detail-hero"><div id="detail-picture">${picture(shop,true)}</div>${closeButton()}<span class="detail-type">${icon(shop.kind==='service'?'tools':'store')}${kindName(shop.kind)}${shop.demo?' · Sample listing':''}</span>${images.length>1?`<div class="gallery-controls"><button class="icon-button" data-action="gallery" data-value="-1" aria-label="Previous photo">${icon('chevron','flip')}</button><span id="gallery-count">1 / ${images.length}</span><button class="icon-button" data-action="gallery" data-value="1" aria-label="Next photo">${icon('chevron')}</button></div>`:''}</div><div class="dialog-main"><div class="detail-title-row"><div><p class="eyebrow">${shop.categories.map(id=>e(getCategory(id).name)).join(' · ')}</p><h2 id="dialog-title">${e(shop.name)}</h2><p class="detail-owner">By <strong>${e(shop.owner)}</strong><span>·</span>Updated ${e(dateLabel(shop.updated))}</p></div><div class="detail-actions"><button class="button button-secondary" data-action="save" data-id="${e(shop.id)}">${icon('heart')}<span data-save-label>Save shop</span></button><button class="icon-button" data-action="share" data-id="${e(shop.id)}" aria-label="Copy link to ${e(shop.name)}">${icon('share')}</button></div></div><p class="detail-description">${e(shop.description)}</p>${shop.demo?`<div class="detail-demo">${icon('info')} Example listing. Prices, stock, owner, and coordinates are not verified server data.</div>`:''}<div class="detail-columns"><section class="inventory-section" aria-labelledby="inventory-heading"><div class="inventory-heading"><h3 id="inventory-heading">${shop.kind==='service'?'Services':'Inventory'}</h3><span>${shop.items.length} ${shop.kind==='service'?'services':'listings'}</span></div><div class="inventory-search">${icon('search')}<label for="inventory-query" class="sr-only">Search this inventory</label><input id="inventory-query" type="search" placeholder="Search ${shop.kind==='service'?'services':'this shop’s items'}…" maxlength="100" autocomplete="off"></div><div class="inventory-table-wrap"><table class="inventory-table"><caption class="sr-only">${e(shop.name)} ${shop.demo?'example ':''}inventory</caption><thead><tr><th scope="col">${shop.kind==='service'?'Service':'Item'}</th><th scope="col">Price</th><th scope="col">Listing</th></tr></thead><tbody id="inventory-rows"></tbody></table></div><p class="inventory-footnote">${icon('clock')} Availability is not tracked. Check with the owner in-game.</p></section><aside class="visit-panel"><p class="eyebrow">LOCATION</p><h3>${icon('pin')}${e(location.name)}</h3><span class="dimension-chip">${e(location.dimension)}</span><div class="coordinates">${coordinateMarkup(shop)}</div><button class="button button-primary full-width" data-action="coords" data-id="${e(shop.id)}">${icon('copy')}Copy coordinates</button><p class="directions">${e(shop.directions||'Ask the owner in-game for directions.')}</p><div class="visit-owner">${icon('user')}<span>Owner<strong>${e(shop.owner)}</strong></span></div><p class="visit-reminder">${icon('shield')}Trades happen in Minecraft. This website has no checkout.</p></aside></div></div>`, 'shop');
    renderInventory(shop,'');updateSavedUI();syncRoute();
  }
  function priceMarkup(item){
    if(item.price===null)return '<span class="price-quote">Ask owner</span>';
    const currency=C.currencies[item.currency],label=C.priceLabel(item);
    const amount=new Intl.NumberFormat('en',{maximumSignificantDigits:21}).format(item.price);
    return `<span class="price" data-currency="${e(item.currency)}" title="${e(label)}" aria-label="${e(label)}">${icon(currency.icon)}<span class="price-text"><strong>${e(amount)}</strong><span class="currency-name">${e(item.price===1?currency.singular:currency.plural)}</span></span></span><small>per ${item.quantity} ${e(item.unit||'items')}</small>`;
  }
  function renderInventory(shop,query){
    const items=C.matchedItems(shop,query),stock={in:['in','In stock'],low:['low','Low stock'],out:['out','Sold out'],unknown:['unknown','Ask owner']};
    $('#inventory-rows').innerHTML=items.length?items.map(item=>`<tr><td><div class="inventory-item">${A.itemIcon(item)}<span>${e(item.name)}</span></div></td><td>${priceMarkup(item)}</td><td><span class="stock-badge stock-${stock[item.stock][0]}"><i></i>${stock[item.stock][1]}</span></td></tr>`).join(''):'<tr><td colspan="3" class="inventory-empty">No matching listings in this shop. Clear the search to see everything.</td></tr>';
  }
  function openCommunity(){
    const discord=C.safeUrl(config.links.discord),store=C.safeUrl(config.links.store);
    showModal(`${closeButton()}<div class="simple-content"><img class="community-logo" src="${e(config.logo)}" width="100" height="100" alt="${e(config.name)}"><p class="eyebrow">THE PEOPLE BEHIND THE PLACES</p><h2 id="dialog-title">Better together.</h2><p>Meet your neighbours, ask about a listing, or share a shop with the Moss & Moon community.</p>${discord?`<a class="button button-primary" href="${e(discord)}" target="_blank" rel="noopener noreferrer">Join our Discord ${icon('external')}</a>`:'<div class="configuration-note">The Discord invite isn’t configured in this preview. The site owner can add the real link to <code>config.links.discord</code> in <code>config.yml</code>.</div>'}<div class="server-copy-box"><span>Minecraft server</span><code>${e(config.serverAddress)}</code><button class="button button-secondary" data-action="server">${icon('copy')} Copy address</button></div>${store?`<a class="text-button" href="${e(store)}" target="_blank" rel="noopener noreferrer">Visit the official store ${icon('external')}</a>`:''}</div>`,'community');
  }
  // Explains either fixture/demo status or the limits of the manually maintained real directory.
  function openAbout(){
    const intro=config.demoMode?'This directory lists Minecraft shops and services. The current listings are examples. Names, owners, inventory, prices, stock, dates, and coordinates are sample content—not verified information about the server.':'This directory lists Minecraft shops and services from owner announcements maintained manually by the directory team. Listings are not live or automatically verified against the server or in-game signs.';
    const listingStatus=config.demoMode?'Replace the examples with approved community listings before publishing as a real directory.':'Check current details with the owner in-game before travelling or trading.';
    showModal(`${closeButton()}<div class="simple-content"><div class="simple-icon">${icon('sprout')}</div><p class="eyebrow">DIRECTORY</p><h2 id="dialog-title">About this directory</h2><p>${e(intro)}</p><div class="about-points"><p>${icon('cube')}Each shop comes from its own <code>shops/&lt;shop&gt;.yml</code> file.</p><p>${icon('heart')}Saved shops stay in this browser.</p><p>${icon('shield')}No accounts, analytics, payments, or automatic submissions.</p><p>${icon('store')}${e(listingStatus)}</p></div><button class="button button-primary" data-action="close">Back to exploring ${icon('arrow')}</button></div>`,'about');
  }
  // Opens the local proposal form, allowing Y to remain unknown while requiring X and Z.
  function openListing(){
    listingDraft=null;
    showModal(`${closeButton()}<div class="listing-content"><p class="eyebrow">NEW LISTING</p><h2 id="dialog-title">Add a shop</h2><p class="listing-intro">Enter the shop details. This creates a YAML (.yml) listing file for the directory maintainers to review.</p><div class="listing-disclaimer">${icon('info')}This form works locally. It does not send, upload, or publish anything.</div><form id="listing-form"><div class="form-grid"><label>Shop name <span>*</span><input name="name" required minlength="2" maxlength="60" placeholder="Shop name"></label><label>In-game owner <span>*</span><input name="owner" required minlength="2" maxlength="32" placeholder="Your Minecraft username"></label><label>Listing type <span>*</span><select name="kind"><option value="shop">Shop</option><option value="stall">Stall</option><option value="service">Player service</option></select></label><label>Main category <span>*</span><select name="category">${D.categories.map(c=>`<option value="${e(c.id)}">${e(c.name)}</option>`).join('')}</select></label><label>Default price currency <span>*</span><select name="currency"><option value="diamond">Diamonds</option><option value="diamond_block">Diamond blocks</option></select></label><label>Location <span>*</span><select name="location">${locationOptions(false)}</select></label><div class="form-coordinates full-span"><label>X coordinate <span>*</span><input name="x" type="number" step="1" required min="-30000000" max="30000000" placeholder="0"></label><label>Y coordinate <small>(optional)</small><input name="y" type="number" step="1" min="-30000000" max="30000000" placeholder="Unknown"></label><label>Z coordinate <span>*</span><input name="z" type="number" step="1" required min="-30000000" max="30000000" placeholder="0"></label></div><label class="full-span">Description <span>*</span><textarea name="description" rows="3" required minlength="10" maxlength="600" placeholder="Items or services offered and other useful information"></textarea></label><label class="full-span">Items or services <span>*</span><textarea name="items" rows="3" required maxlength="5000" placeholder="White wool, Pale oak logs, Building services…"></textarea><small>Separate names with commas or new lines. Prices and stock are added during review.</small></label></div><div id="form-errors" class="form-errors" role="alert" hidden></div><div class="form-footer"><p>Prepare a file, then share it with the maintainers through your community’s usual channel.</p><button type="submit" class="button button-primary">Prepare listing ${icon('arrow')}</button></div></form><div id="listing-output" hidden><div class="prepared-notice">${icon('check')}<div><h3>Ready to share. Not published.</h3><p>Download this file and send it to the directory maintainers for review.</p></div></div><label class="output-label" for="listing-yaml">Your listing file</label><textarea id="listing-yaml" rows="12" readonly spellcheck="false"></textarea><div class="output-buttons"><button class="button button-primary" data-action="download-listing">${icon('download')}Download YAML</button><button class="button button-secondary" data-action="copy-listing">${icon('copy')}Copy YAML</button><button class="text-button" data-action="edit-listing">Keep editing</button></div></div></div>`,'listing');
  }
  function downloadListing(){
    if(!listingDraft)return;
    const blob=new Blob([Source.serializeShop(listingDraft)],{type:'text/yaml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=listingDraft.id+'.yml';a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast('Listing file prepared for download. Nothing has been published.');
  }
  function resetDirectory(preserveSaved=false){state={...defaults,saved:state.saved,savedOnly:preserveSaved?state.savedOnly:false};closeSuggestions();refresh();closeFilters();}
  readRoute();renderShell();refresh({sync:false});updateThemeUI();
  const initialShop=state.shopId;if(initialShop)openShop(initialShop);

  // Routes delegated controls, including coordinate copies that omit unknown height values.
  document.addEventListener('click',event=>{
    const suggestion=event.target.closest('[data-suggestion]');if(suggestion){chooseSuggestion(Number(suggestion.dataset.suggestion));return;}
    const button=event.target.closest('[data-action]');
    if(!button){if(!event.target.closest('.search-section'))closeSuggestions();return;}
    const {action,id,value}=button.dataset;
    if(button.tagName==='A')event.preventDefault();
    switch(action){
      case 'home':resetDirectory();closeMobileMenu();window.scrollTo({top:0,behavior:'smooth'});break;
      case 'directory':resetDirectory();scrollDirectory();break;
      case 'saved':resetDirectory();state.savedOnly=true;refresh();scrollDirectory();break;
      case 'listing':openListing();break;
      case 'community':openCommunity();break;
      case 'about':openAbout();break;
      case 'theme':{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('moss-moon-theme',theme);}catch{}updateThemeUI();break;}
      case 'menu':{const menu=$('#mobile-nav');menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));break;}
      case 'filters':{const open=$('#filters').classList.toggle('mobile-open');$('.mobile-filter-button').setAttribute('aria-expanded',String(open));if(open)$('#filters').scrollIntoView({behavior:'smooth',block:'start'});break;}
      case 'category':state.category=value;refresh();closeFilters();break;
      case 'kind':state.kind=value;refresh();break;
      case 'view':state.view=value;refresh();break;
      case 'query':state.query=value;closeSuggestions();refresh();$('#query').focus({preventScroll:true});break;
      case 'clear-query':state.query='';closeSuggestions();refresh();$('#query').focus();break;
      case 'reset':resetDirectory(true);break;
      case 'remove-filter':state[value]=defaults[value];closeSuggestions();refresh();break;
      case 'open':openShop(id);break;
      case 'save':{const on=state.saved.includes(id);state.saved=on?state.saved.filter(s=>s!==id):[...state.saved,id];persistSaved();if(state.savedOnly)refresh();else updateSavedUI();if(storageWritable)toast(on?'Removed from your saved shops.':'Shop saved on this device.');break;}
      case 'close':$('#modal').close();break;
      case 'coords':{const shop=getShop(id);if(shop)copyText(C.coordinateCopyText(shop.coords),shop.coords.y===null?'Coordinates copied: X and Z.':'Coordinates copied: X Y Z.');break;}
      case 'share':{const url=new URL(location.href);url.hash=routeHash(id);copyText(url.href,location.protocol==='file:'?'Local preview link copied. It only works where these files exist.':'Shop link copied.');break;}
      case 'server':copyText(config.serverAddress,'Minecraft server address copied.');break;
      case 'gallery':{const shop=getShop(state.shopId),images=(shop?.images||[]).filter(img=>C.safeAsset(typeof img==='string'?img:img.src));if(images.length){galleryIndex=(galleryIndex+Number(value)+images.length)%images.length;$('#detail-picture').innerHTML=picture(shop,true);$('#gallery-count').textContent=`${galleryIndex+1} / ${images.length}`;}break;}
      case 'download-listing':downloadListing();break;
      case 'copy-listing':if(listingDraft)copyText(Source.serializeShop(listingDraft),'Listing YAML copied. Nothing has been published.');break;
      case 'edit-listing':$('#listing-form').hidden=false;$('#listing-output').hidden=true;$('#listing-form input').focus();break;
    }
  });
  $('#query').addEventListener('input',()=>{state.query=$('#query').value;refresh();showSuggestions();});
  $('#query').addEventListener('focus',()=>{if(state.query)showSuggestions();});
  $('#query').addEventListener('blur',()=>{setTimeout(()=>{if(document.activeElement!==$('#query'))closeSuggestions();},100);});
  $('#query').addEventListener('keydown',event=>{
    if(event.key==='Escape'){closeSuggestions();event.preventDefault();return;}
    if(!suggestions.length)return;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();const delta=event.key==='ArrowDown'?1:-1;suggestionIndex=(suggestionIndex+delta+suggestions.length)%suggestions.length;
      $$('#suggestions [role="option"]').forEach((el,i)=>el.setAttribute('aria-selected',String(i===suggestionIndex)));
      $('#query').setAttribute('aria-activedescendant',`suggestion-${suggestionIndex}`);$(`#suggestion-${suggestionIndex}`).scrollIntoView({block:'nearest'});
    }else if(event.key==='Enter'&&suggestionIndex>=0){event.preventDefault();chooseSuggestion(suggestionIndex);}
  });
  $('#search-form').addEventListener('submit',event=>{event.preventDefault();state.query=$('#query').value.trim();closeSuggestions();refresh();scrollDirectory();});
  $('#location').addEventListener('change',()=>{state.location=$('#location').value;closeSuggestions();refresh();});
  $('#sort').addEventListener('change',()=>{state.sort=$('#sort').value;refresh();});
  $('#in-stock').addEventListener('change',()=>{state.inStock=$('#in-stock').checked;refresh();});
  document.addEventListener('keydown',event=>{
    if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!$('#modal').open&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)&&!event.target.isContentEditable){event.preventDefault();$('#query').focus();$('#query').select();}
    if(event.key==='Escape'){closeMobileMenu();closeFilters();}
  });
  $('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const box=$('#modal').getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)$('#modal').close();}});
  $('#modal').addEventListener('close',()=>{
    if(activeModal==='shop'){state.shopId='';syncRoute();}
    activeModal='';document.body.classList.remove('modal-open');document.body.append($('#toast'));
    if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});else $('#directory-heading').focus({preventScroll:true});
  });
  $('#dialog-content').addEventListener('input',event=>{if(event.target.id==='inventory-query'){const shop=getShop(state.shopId);if(shop)renderInventory(shop,event.target.value);}});
  $('#dialog-content').addEventListener('submit',event=>{
    if(event.target.id!=='listing-form')return;event.preventDefault();
    const form=event.target;if(!form.reportValidity())return;
    const result=C.makeSubmission(Object.fromEntries(new FormData(form)),D);
    const errorBox=$('#form-errors');errorBox.hidden=!result.errors.length;
    if(result.errors.length){errorBox.innerHTML=result.errors.map(error=>`<p>${e(error)}</p>`).join('');return;}
    listingDraft=result.shop;$('#listing-yaml').value=Source.serializeShop(listingDraft);form.hidden=true;$('#listing-output').hidden=false;$('#modal').scrollTop=0;$('#listing-yaml').focus();
  });
  document.addEventListener('error',event=>{const img=event.target;if(img instanceof HTMLImageElement&&img.dataset.fallbackTheme){const holder=document.createElement('div');holder.innerHTML=A.scene(img.dataset.fallbackTheme);img.replaceWith(holder.firstElementChild);}},true);
  window.addEventListener('hashchange',()=>{
    readRoute();refresh({sync:false});
    if(state.shopId)openShop(state.shopId);
    else if($('#modal').open&&activeModal==='shop')$('#modal').close();
  });
  window.addEventListener('storage',event=>{
    if(event.key===config.storageKey+'-saved'){
      try{const incoming=JSON.parse(event.newValue||'[]');if(Array.isArray(incoming))state.saved=[...new Set(incoming.filter(id=>validIds.has(id)))];}catch{}
      if(state.savedOnly)refresh();else updateSavedUI();
    }else if(event.key==='moss-moon-theme'&&['dark','light'].includes(event.newValue)){document.documentElement.dataset.theme=event.newValue;updateThemeUI();}
  });
}());
