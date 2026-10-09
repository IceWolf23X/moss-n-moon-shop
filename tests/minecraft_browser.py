"""Optional real-HTTP browser check for local previews and broken-image fallback."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if not self.path.startswith('/directory/'):
            self.send_error(404)
            return
        self.path = self.path.removeprefix('/directory')
        super().do_GET()

    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), headless=True)
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        origin = f'http://127.0.0.1:{server.server_port}/directory/'
        total = 0
        for shop, count in [('woolery', 17), ('pale-found', 5), ('moonbound', 5), ('circuit', 6)]:
            page.goto(origin + '#shop=' + shop, wait_until='networkidle')
            page.locator('#modal').wait_for(state='visible')
            images = page.locator('#inventory-rows img.minecraft-item')
            page.wait_for_function("count=>document.querySelectorAll('#inventory-rows img.minecraft-item').length===count", arg=count)
            # Enlarged rows can place lazy-loaded previews outside the dialog viewport.
            for image in images.all():
                image.scroll_into_view_if_needed()
            page.wait_for_function("[...document.querySelectorAll('#inventory-rows img.minecraft-item')].every(i=>i.complete&&i.naturalWidth>0)")
            assert images.count() == count, shop
            assert all('/directory/assets/minecraft/rendered/' in src for src in images.evaluate_all('(images)=>images.map(i=>i.src)'))
            if shop == 'woolery' and os.getenv('MINECRAFT_SCREENSHOT'):
                page.screenshot(path=os.environ['MINECRAFT_SCREENSHOT'])
            assert all(size == [256,256] for size in images.evaluate_all('(images)=>images.map(i=>[i.naturalWidth,i.naturalHeight])'))
            total += count
        page.goto(origin + '#shop=preview-test', wait_until='networkidle')
        expected=len(json.loads((ROOT/'assets/minecraft/rendered/manifest.json').read_text())['items'])
        page.wait_for_function("count=>document.querySelectorAll('#inventory-rows tr').length===count", arg=expected)
        assert page.locator('#inventory-rows img.minecraft-item').count()==expected
        for item in ['enchanted_book','observer','white_wool']:
            page.locator('#inventory-query').fill('minecraft:'+item)
            assert page.locator('#inventory-rows img.minecraft-item').count()==1
            page.wait_for_function("document.querySelector('#inventory-rows img').naturalWidth===256")
        page.set_viewport_size({'width':390,'height':900})
        assert page.locator('#modal').evaluate('d=>d.scrollWidth<=d.clientWidth+1')
        page.goto(origin + '#shop=builders-bench', wait_until='networkidle')
        assert page.locator('#inventory-rows img').count() == 0
        page.route('**/rendered/white_wool.png', lambda route: route.abort())
        page.goto(origin + '#shop=woolery', wait_until='networkidle')
        fallback = page.locator('.item-preview.asset-missing .item-fallback').first
        fallback.wait_for(state='visible')
        assert not errors, errors
        print(json.dumps({'loaded_previews': total, 'repository_subpath': 'passed', 'service_icons': 'passed', 'test_shop_items': expected, 'test_shop_search': 'passed', 'broken_image_fallback': 'passed', 'runtime_errors': errors}))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
