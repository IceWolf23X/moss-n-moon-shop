"""Optional Chromium UI smoke tests. Runtime website has no Python dependency.

Install test dependencies: pip install playwright && playwright install chromium
Run: python tests/browser_smoke.py
In a browser environment that prohibits navigation, use --inline-fixture.
That mode embeds the SAME source files and actual YAML text. HTTP responses, storage,
clipboard and download initiation are explicit test doubles, not a real deployment.
"""
from __future__ import annotations
import argparse
import base64
import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def inline_load(page, route='', stored=None, blocked_storage=False, overrides=None):
    logo = 'data:image/png;base64,' + base64.b64encode((ROOT / 'assets/logo.png').read_bytes()).decode()
    storage = json.dumps(stored or {})
    init = '''window.__storage = STORE;
    Object.defineProperty(window, 'localStorage', {configurable:true, value:{
      getItem(k){ BLOCK return window.__storage[k]??null; },
      setItem(k,v){ BLOCK window.__storage[k]=String(v); },
      removeItem(k){ BLOCK delete window.__storage[k]; }
    }});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{async writeText(t){window.__copied=t;}}});
    const originalClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
      if(this.download && this.href.startsWith('blob:')){window.__download={name:this.download,href:this.href};return;}
      return originalClick.call(this);
    };
    '''.replace('STORE', storage).replace('BLOCK', "throw new Error('Test: storage unavailable');" if blocked_storage else '')
    init += 'window.location.hash=' + json.dumps(route) + ';'
    sources = {str(path.relative_to(ROOT)): path.read_text() for path in [ROOT/'config.yml', *sorted((ROOT/'shops').glob('*.yml'))]}
    sources.update(overrides or {})
    init += "window.__yamlSources=" + json.dumps(sources).replace('</', '<\\/') + ";"
    init += """window.__yamlRequests=[];
    window.fetch=async function(url,options){
      const path=new URL(url,document.baseURI).pathname.replace('/repository/','');
      window.__yamlRequests.push(path);
      const found=Object.prototype.hasOwnProperty.call(window.__yamlSources,path);
      return new Response(found?window.__yamlSources[path]:'Not found',{status:found?200:404,headers:{'Content-Type':'text/yaml'}});
    };"""
    scripts = [init, (ROOT/'js/theme.js').read_text()]
    scripts += [(ROOT/path).read_text() for path in ['js/vendor/js-yaml.js','js/core.js','js/data.js','js/minecraft-assets.js','js/minecraft-rendered.js','js/minecraft.js','js/art.js']]
    # Logo-only fixture adaptation happens AFTER production YAML validation.
    scripts.append("const productionLoader=MMDataSource.loadCatalog; MMDataSource={...MMDataSource,async loadCatalog(options){const data=await productionLoader(options);data.config.logo="+json.dumps(logo)+";return data;}};")
    scripts.append((ROOT/'js/app.js').read_text())
    page.set_content('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#07584c"><base href="https://directory.test/repository/"><style>'+(ROOT/'css/style.css').read_text()+'</style></head><body><div id="app"></div>'+''.join('<script>'+code.replace('</script','<\\/script')+'</script>' for code in scripts)+'</body></html>',wait_until='load')



def main():
    """Exercise the locally loaded production catalog and core directory interactions."""
    parser=argparse.ArgumentParser()
    parser.add_argument('--inline-fixture',action='store_true')
    parser.add_argument('--screenshots',type=Path)
    args=parser.parse_args()
    server=None
    if not args.inline_fixture:
        server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
        Thread(target=server.serve_forever,daemon=True).start()
    checks=[]
    all_errors=[]
    def check(condition,label):
        """Record one successful smoke assertion or fail with its user-facing label."""
        assert condition,label
        checks.append(label)
    with sync_playwright() as p:
        executable=os.getenv('CHROMIUM_EXECUTABLE')
        launch={'headless':True}
        if executable: launch['executable_path']=executable
        browser=p.chromium.launch(**launch)
        context=browser.new_context(viewport={'width':1440,'height':1080},reduced_motion='reduce')
        def new_page(width=1440,height=1080,route='',stored=None,blocked=False,overrides=None):
            """Open one isolated page against HTTP or the embedded-source fixture."""
            page=context.new_page();page.set_viewport_size({'width':width,'height':height});page.set_default_timeout(4000)
            page.on('pageerror',lambda error:all_errors.append(str(error)))
            if args.inline_fixture:inline_load(page,route,stored,blocked,overrides)
            else:page.goto(f'http://127.0.0.1:{server.server_port}/index.html'+('#'+route if route else ''),wait_until='networkidle')
            page.wait_for_function("!!window.MMData || !!document.querySelector('#retry-data')")
            return page
        page=new_page()
        catalog_count=page.evaluate('MMData.shops.length')
        check(catalog_count>0 and page.locator('.shop-card').count()==catalog_count,'Production catalog loads every manifest shop from YAML')
        if args.inline_fixture:check(len(page.evaluate('window.__yamlRequests'))==catalog_count+2,'Loader requests config, manifest, and every listed shop')
        check(page.locator('.shop-visual').count()==catalog_count and page.locator('.shop-visual').first.is_visible(),'Shop preview images remain visible in the directory')
        check(page.locator('.hero,.join-banner,.how-section,.faq-section,.sidebar-note,.sidebar-community').count()==0,'Directory has no promotional sections')
        check(page.locator('#directory-heading').inner_text()=='Shops','Directory uses a plain functional heading')
        check(page.locator('h1').count()==1,'Exactly one primary heading')
        demo_mode=page.evaluate('MMData.config.demoMode')
        check(page.locator('.demo-notice').count()==(1 if demo_mode else 0),'Preview disclosure follows config.demoMode')
        check(page.evaluate('new Set([...document.querySelectorAll("[id]")].map(e=>e.id)).size===document.querySelectorAll("[id]").length'),'No duplicate DOM IDs')
        expected_wool=page.evaluate("MMData.shops.filter(shop=>shop.items.some(item=>([item.id,item.name,...item.aliases].join(' ').toLowerCase().includes('wool')))).length")
        check(expected_wool>0,'Production catalog contains searchable wool inventory')
        page.locator('#query').fill('wool')
        check(page.locator('.shop-card').count()==expected_wool,'Wool search matches the actual loaded catalog')
        check('Wool' in page.locator('.card-tagline').first.inner_text(),'Card shows matching wool inventory')
        page.locator('#query').fill('mending')
        check(page.locator('#query').get_attribute('aria-expanded')=='true','Search exposes keyboard suggestions')
        page.locator('#query').press('ArrowDown');page.locator('#query').press('Enter')
        check(page.locator('#query').input_value()=='Mending','Arrow keys and Enter select a suggestion')
        page.locator('#query').fill('something no one sells')
        check(page.locator('.empty-state').is_visible(),'Empty search has recovery state')
        page.locator('.filter-heading [data-action="reset"]').click()
        check(page.locator('.shop-card').count()==catalog_count,'Clear filters recovers all shops')
        expected_in_stock=page.evaluate("MMCore.searchShops(MMData.shops,{inStock:true}).length")
        page.locator('#in-stock').check()
        check(page.locator('.shop-card').count()==expected_in_stock,'In-stock filter matches owner-maintained catalog status')
        page.locator('#in-stock').uncheck()
        check(page.locator('.shop-card').count()==catalog_count,'Removing stock filter restores the catalog')
        page.locator('.filter-heading [data-action="reset"]').click()
        location_id=page.evaluate('MMData.shops[0].location')
        location_count=page.evaluate("id=>MMData.shops.filter(shop=>shop.location===id).length",location_id)
        page.locator('#location').select_option(location_id)
        check(page.locator('.shop-card').count()==location_count,'Location filter is applied')
        first_kind=page.evaluate('MMData.shops[0].kind')
        composed_count=page.evaluate("([location,kind])=>MMData.shops.filter(shop=>shop.location===location&&shop.kind===kind).length",[location_id,first_kind])
        page.locator(f'[data-action="kind"][data-value="{first_kind}"]').click()
        check(page.locator('.shop-card').count()==composed_count,'Location and type filters compose')
        page.locator('.filter-heading [data-action="reset"]').click()
        page.locator('[data-action="category"][data-value="nature"]').click()
        nature_count=page.evaluate("MMData.shops.filter(shop=>shop.categories.includes('nature')).length")
        check(nature_count>0 and page.locator('.shop-card').count()==nature_count,'Nature category filters the actual catalog')
        page.locator('.filter-heading [data-action="reset"]').click()
        page.locator('[data-action="view"][data-value="list"]').click()
        check('list-view' in page.locator('#shop-grid').get_attribute('class'),'List view works')
        page.locator('[data-action="view"][data-value="grid"]').click()
        page.locator('.save-button[data-id="wolf-wears-wool"]').click()
        page.locator('.desktop-nav [data-action="saved"]').click()
        check(page.locator('.shop-card').count()==1,'Saved-only view uses local favorites')
        page.locator('.save-button[data-id="wolf-wears-wool"]').click()
        check('No saved shops' in page.locator('.empty-state').inner_text(),'Unsave last shop gives useful empty state')
        page.locator('.empty-state [data-action="directory"]').click()
        page.locator('#sort').select_option('az')
        expected_first=page.evaluate("[...MMData.shops].sort((a,b)=>a.name.localeCompare(b.name,'en',{sensitivity:'base'}))[0].id")
        check(page.locator('.shop-card').first.get_attribute('data-shop')==expected_first,'Alphabetical sorting follows the loaded shop names')
        page.locator('[data-action="open"][data-id="wolf-wears-wool"]').first.click()
        check(page.locator('#modal').evaluate('d=>d.open'),'Shop details open in a native dialog')
        check(page.locator('#detail-picture').is_visible(),'Shop details retain their preview image')
        # Provenance remains in the catalog without being exposed as a Notes panel.
        check(page.evaluate("Boolean(MMData.shops.find(shop=>shop.id==='wolf-wears-wool').notes)") and page.locator('#modal .shop-note').count()==0,'Shop details hide editor notes while retaining catalog metadata')
        check(page.locator('#inventory-rows tr').count()==17,'Full inventory is rendered')
        check(page.locator('[data-currency="diamond"]').count()==17,'All wool prices use diamonds')
        bulk_price=page.locator('[data-currency="diamond"][aria-label="23 diamonds"]')
        check(bulk_price.count()==1 and 'per 1 shulker box' in bulk_price.locator('xpath=ancestor::td').inner_text(),'Bulk wool price is 23 diamonds per shulker box')
        page.locator('#inventory-query').fill('black wool')
        expected_black=page.evaluate("MMCore.matchedItems(MMData.shops.find(shop=>shop.id==='wolf-wears-wool'),'black wool').length")
        check(page.locator('#inventory-rows tr').count()==expected_black,'Inventory search is independent')
        check(page.locator('.coordinates code').nth(1).inner_text()=='87','Known Y remains visible as its exact integer')
        page.locator('#modal [data-action="coords"]').click()
        check(page.locator('#modal #toast').count()==1,'Copy feedback is visible in the modal top layer')
        if args.inline_fixture:check(page.evaluate('window.__copied')=='-35 87 385','Known coordinates retain the exact X Y Z copy format')
        page.locator('#modal [data-action="share"]').click()
        if args.inline_fixture:check('shop=wolf-wears-wool' in page.evaluate('window.__copied'),'Shared link contains shop deep link')
        page.keyboard.press('Escape')
        check(not page.locator('#modal').evaluate('d=>d.open'),'Escape closes details')
        check(page.evaluate('document.activeElement.dataset.action')=='open','Focus returns to the launching control')
        page.locator('[data-action="theme"]').click()
        check(page.locator('html').get_attribute('data-theme')=='dark','Dark theme works')
        if args.inline_fixture:
            stored=page.evaluate('window.__storage')
            fresh=new_page(stored=stored)
            check(fresh.locator('html').get_attribute('data-theme')=='dark','Theme bootstrap restores stored preference')
            fresh.close()
        page.locator('[data-action="theme"]').click()
        page.locator('.header-list').click()
        fields={'name':'A New Shop','owner':'Player_1','x':'-120','z':'44','description':'A new shop selling useful building materials.','items':'Stone, Oak logs'}
        for name,value in fields.items():page.locator(f'#listing-form [name="{name}"]').fill(value)
        page.locator('#listing-form [name="currency"]').select_option('diamond_block')
        page.locator('#listing-form [type="submit"]').click()
        check(page.locator('#listing-output').is_visible(),'Local listing form produces a reviewable draft')
        draft=page.evaluate("jsyaml.load(document.getElementById('listing-yaml').value, {schema:jsyaml.CORE_SCHEMA})")
        check(draft['status']=='unverified' and draft['demo'] is False and draft['coords']=={'x':-120,'y':None,'z':44},'Draft preserves a blank Y as explicit null')
        check(draft['currency']=='diamond_block' and draft['items'][0]['currency']=='diamond_block','YAML proposal keeps the selected currency')
        check(page.locator('#listing-yaml').input_value().startswith('#'),'YAML proposal includes comments')
        check(page.locator('#listing-yaml').evaluate("el => getComputedStyle(el).display === 'block' && getComputedStyle(el).resize === 'vertical'"),'YAML output keeps the full-width styled editor')
        if args.inline_fixture:
            page.locator('[data-action="download-listing"]').click()
            check(page.evaluate('window.__download.name')=='a-new-shop.yml','YAML export prepares the correct filename')
        else:
            with page.expect_download() as download:page.locator('[data-action="download-listing"]').click()
            check(download.value.suggested_filename=='a-new-shop.yml','YAML export downloads a file')
        page.locator('[data-action="edit-listing"]').click()
        check(page.locator('#listing-form [name="name"]').input_value()=='A New Shop','Editing preserves form values')
        page.locator('#modal [data-action="close"]').click()
        page.locator('.footer-links [data-action="community"]').click()
        discord_url=page.evaluate('MMData.config.links.discord')
        if discord_url:
            check(page.locator('.simple-content a[href="'+discord_url+'"]').count()==1,'Configured Discord link is presented unchanged')
        else:
            check('isn’t configured' in page.locator('.configuration-note').inner_text(),'Missing Discord link is disclosed instead of invented')
        page.locator('#modal [data-action="close"]').click()
        page.locator('#directory-heading').focus();page.keyboard.press('/')
        check(page.locator('#query').evaluate('q=>q===document.activeElement'),'Slash shortcut focuses search')
        enchanted_name=page.evaluate("MMData.shops.find(shop=>shop.id==='enchanted-archives').name")
        deep=new_page(route='q=Mending&shop=enchanted-archives')
        check(deep.locator('#dialog-title').inner_text()==enchanted_name,'Incoming Mending deep link opens Enchanted Archives')
        check(deep.locator('.shop-card').count()==1,'Incoming query state is restored')
        deep.close()
        if args.inline_fixture:
            blocked=new_page(blocked=True)
            blocked.locator('.save-button').first.click()
            check('only for this session' in blocked.locator('#toast').inner_text(),'Blocked localStorage degrades to session-only favorites')
            blocked.close()
        for width in [320,390,540,768,1024,1440,1920,3440]:
            responsive=new_page(width=width,height=900)
            check(responsive.evaluate('document.documentElement.scrollWidth<=innerWidth'),'No horizontal page overflow at '+str(width)+'px')
            bounds=responsive.locator('h1').bounding_box();hero=responsive.locator('.directory-intro').bounding_box()
            check(bounds['x']+bounds['width']<=hero['x']+hero['width']+1,'Directory heading stays inside its container at '+str(width)+'px')
            if width==390:
                responsive.locator('[data-action="filters"]').last.click()
                check(responsive.locator('#filters').is_visible(),'Mobile filters expand')
                responsive.locator('[data-action="category"][data-value="nature"]').click()
                check(responsive.locator('.shop-card').count()==nature_count,'Mobile category selection filters actual results')
                responsive.locator('[data-action="menu"]').click()
                check(responsive.locator('#mobile-nav').is_visible(),'Mobile navigation opens')
                responsive.locator('#mobile-nav [data-action="directory"]').click()
                responsive.locator('[data-action="open"][data-id="wolf-wears-wool"]').first.click()
                check(responsive.locator('#modal').evaluate('d=>d.scrollWidth<=d.clientWidth+1'),'Mobile details have no horizontal overflow')
                responsive.keyboard.press('Escape')
            if args.screenshots and width in [390,1440]:
                args.screenshots.mkdir(parents=True,exist_ok=True)
                responsive.evaluate('window.scrollTo(0,0)')
                responsive.screenshot(path=str(args.screenshots/f'preview-{width}.png'))
            responsive.close()
        if args.inline_fixture:
            invalid_path=page.evaluate("window.__yamlRequests.find(path=>path.startsWith('shops/')&&path!=='shops/index.yml')")
            invalid=new_page(overrides={invalid_path:'name: First\nname: Second\n'})
            check(invalid.locator('#retry-data').is_visible(),'Malformed YAML gives a recoverable loading error')
            check(invalid_path in invalid.locator('.load-error pre').inner_text(),'Error identifies the YAML file')
            check('(2:1)' in invalid.locator('.load-error pre').inner_text(),'Parser error includes line and column')
            check(invalid.locator('.shop-card').count()==0,'Bad data is not silently omitted from a partial catalog')
            invalid.close()
            empty=new_page(overrides={'shops/index.yml':'shops: []'})
            check(empty.locator('.empty-state').is_visible(),'An empty YAML manifest renders a valid empty state')
            empty.close()
        currency_page=new_page(route='shop=calliopes-cat-cafe')
        check(currency_page.locator('.coordinates code').nth(1).inner_text()=='Not specified','Unknown Y is displayed without a fabricated height')
        currency_page.locator('#modal [data-action="coords"]').click()
        if args.inline_fixture:check(currency_page.evaluate('window.__copied')=='X: 10, Z: 380','Unknown Y is omitted from copied coordinates')
        check(currency_page.locator('[data-currency="diamond_block"]').count()==2,'Cat cafe services use two diamond-block prices')
        check(currency_page.locator('[data-currency="diamond"]').count()==3,'The same shop also shows three diamond prices')
        block_labels=currency_page.locator('[data-currency="diamond_block"]').evaluate_all("nodes=>nodes.map(node=>node.getAttribute('aria-label')).sort()")
        check(block_labels==['1 diamond block','2 diamond blocks'],'Mixed diamond-block amounts retain their exact labels')
        if args.screenshots:
            args.screenshots.mkdir(parents=True,exist_ok=True)
            currency_page.screenshot(path=str(args.screenshots/'currency-detail.png'))
        currency_page.close()
        check(not all_errors,'No JavaScript runtime errors: '+str(all_errors))
        browser.close()
    if server:server.shutdown()
    print(json.dumps({'passed':len(checks),'mode':'embedded-source fixture with YAML/fetch/storage/clipboard/download test doubles; not real navigation' if args.inline_fixture else 'local HTTP server','checks':checks,'runtime_errors':all_errors},indent=2))

if __name__=='__main__':main()
