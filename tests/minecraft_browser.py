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
            page.wait_for_function("[...document.querySelectorAll('#inventory-rows img.minecraft-item')].every(i=>i.complete&&i.naturalWidth>0)")
            images = page.locator('#inventory-rows img.minecraft-item')
            assert images.count() == count, shop
            assert all('/directory/assets/minecraft/' in src for src in images.evaluate_all('(images)=>images.map(i=>i.src)'))
            if shop == 'woolery' and os.getenv('MINECRAFT_SCREENSHOT'):
                page.screenshot(path=os.environ['MINECRAFT_SCREENSHOT'])
            total += count
        page.goto(origin + '#shop=builders-bench', wait_until='networkidle')
        assert page.locator('#inventory-rows img').count() == 0
        page.route('**/previews/block/white_wool.png', lambda route: route.abort())
        page.goto(origin + '#shop=woolery', wait_until='networkidle')
        fallback = page.locator('.item-preview.asset-missing .item-fallback').first
        fallback.wait_for(state='visible')
        assert not errors, errors
        print(json.dumps({'loaded_previews': total, 'repository_subpath': 'passed', 'service_icons': 'passed', 'broken_image_fallback': 'passed', 'runtime_errors': errors}))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
