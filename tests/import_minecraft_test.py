"""Exercise archive precedence, overlays and safe extraction with real PNG files."""
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / 'tools/import_minecraft_assets.py'

class ImportTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SCRIPT.exists(), 'Resource pack importer must exist')
        spec = importlib.util.spec_from_file_location('import_assets', SCRIPT)
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def pack(self, name, files, overlays=None):
        p = self.root / name
        with zipfile.ZipFile(p, 'w') as z:
            z.writestr('pack.mcmeta', json.dumps({'pack': {'description': name}, 'overlays': {'entries': overlays or []}}))
            for path, color in files.items():
                stream = io.BytesIO()
                Image.new('RGBA', (16, 32), color).save(stream, format='PNG')
                z.writestr(path, stream.getvalue())
        return p

    def test_base_wins_and_lower_packs_fill_only_missing_paths(self):
        key='assets/minecraft/textures/block/white_wool.png'
        base=self.pack('base.zip',{key:'red'})
        updated=self.pack('updated.zip',{key:'blue','assets/minecraft/textures/item/diamond.png':'green'})
        extra=self.pack('extra.zip',{'assets/minecraft/textures/item/diamond.png':'blue','assets/minecraft/textures/item/stick.png':'yellow'})
        out=self.root/'site'
        manifest=self.module.import_packs([base,updated,extra],out,75)
        self.assertEqual(manifest['files']['textures/block/white_wool.png']['pack'],'base')
        self.assertEqual(manifest['files']['textures/item/diamond.png']['pack'],'updated')
        self.assertEqual(manifest['files']['textures/item/stick.png']['pack'],'extra')
        with Image.open(out/'assets/minecraft/previews/block/white_wool.png') as im:
            self.assertEqual(im.size,(16,16))
            self.assertEqual(im.getpixel((0,0)),(255,0,0,255))
        before=(out/'js/minecraft-assets.js').read_bytes()
        self.module.import_packs([base,updated,extra],out,75)
        self.assertEqual(before,(out/'js/minecraft-assets.js').read_bytes())

    def test_compatible_overlay_overrides_only_within_its_pack(self):
        key='assets/minecraft/textures/block/stone.png'
        overlays=[{'directory':'active','formats':[70,75]},{'directory':'future','formats':[76,99]}]
        base=self.pack('base.zip',{key:'red','active/'+key:'green','future/'+key:'blue'},overlays)
        m=self.module.import_packs([base],self.root/'site',75)
        self.assertEqual(m['files']['textures/block/stone.png']['member'],'active/'+key)

    def test_unsafe_archive_paths_are_rejected(self):
        p=self.pack('unsafe.zip',{'../assets/minecraft/textures/block/stone.png':'red'})
        with self.assertRaises(ValueError):self.module.import_packs([p],self.root/'site',75)

if __name__=='__main__':unittest.main()
