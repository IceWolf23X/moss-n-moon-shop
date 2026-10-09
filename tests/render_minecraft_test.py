"""Validate real generated CoreChatX outputs, not placeholder icons."""
import json
import hashlib
import importlib.util
import tempfile
import zipfile
from pathlib import Path
import unittest
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]

class RenderTests(unittest.TestCase):
    def test_enchanted_book_has_glint_without_changing_its_silhouette(self):
        with Image.open(ROOT/'tests/fixtures/enchanted_book_base.png') as original, Image.open(ROOT/'assets/minecraft/rendered/enchanted_book.png') as rendered:
            base=original.convert('RGBA'); actual=rendered.convert('RGBA')
            self.assertEqual(actual.size,base.size)
            self.assertEqual(actual.getchannel('A').tobytes(),base.getchannel('A').tobytes())
            changed=sum(1 for before,after in zip(base.get_flattened_data(),actual.get_flattened_data()) if before != after)
            self.assertGreater(changed,1000,'Enchanted books must include the CoreChatX glint overlay')
            self.assertTrue(all(before==after for before,after in zip(base.get_flattened_data(),actual.get_flattened_data()) if before[3]==0),'Glint must not extend outside the book')

    def test_catalog_previews_have_native_or_rendered_dimensions_and_no_placeholders(self):
        manifest=ROOT/'assets/minecraft/rendered/manifest.json'
        self.assertTrue(manifest.exists(),'CoreChatX render manifest must exist')
        m=json.loads(manifest.read_text())
        self.assertEqual(m['scale'],16)
        self.assertEqual(m['renderer_commit'],'9d1ef37bd266f18e7451d61db7e8ebaf91a055c2')
        for item in ['white_wool','pale_oak_log','observer','enchanted_book','diamond','hopper','red_bed','clock','compass','recovery_compass']:
            self.assertTrue(item in m['items'], 'Required preview was not rendered: '+item)
            entry=m['items'][item]
            self.assertFalse(entry['used_fallback'])
            with Image.open(ROOT/entry['path']) as im:
                self.assertEqual(im.size,(entry['pixel_size'],entry['pixel_size']))
                self.assertIsNotNone(im.convert('RGBA').getchannel('A').getbbox())
        with Image.open(ROOT/m['items']['red_bed']['path']) as im:
            pillow=sum(1 for r,g,b,a in im.convert('RGBA').get_flattened_data() if a>0 and min(r,g,b)>180)
            self.assertGreater(pillow,100, 'The rendered bed must include the pillow/head section')
        with Image.open(ROOT/m['items']['white_wool']['path']) as im:
            alpha=im.convert('RGBA').getchannel('A')
            self.assertEqual(alpha.getpixel((0,0)),0)
            self.assertGreater(alpha.getpixel((128,128)),0)

class FlatPreviewTests(unittest.TestCase):
    def setUp(self):
        spec=importlib.util.spec_from_file_location('renderer',ROOT/'tools/render_minecraft_previews.py')
        self.renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(self.renderer)
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)

    def test_identical_flat_texture_is_served_without_upscaling(self):
        source=self.root/'source.png';rendered=self.root/'rendered.png'
        im=Image.new('RGBA',(16,16),(0,0,0,0));im.putpixel((4,5),(20,150,220,255));im.save(source)
        im.resize((256,256),Image.Resampling.NEAREST).save(rendered)
        self.assertTrue(self.renderer.original_matches_preview(rendered,source))

    def test_native_png_does_not_transfer_resource_pack_editor_metadata(self):
        from PIL.PngImagePlugin import PngInfo
        site=self.root/'site';pack=self.root/'pack';out=self.root/'output';out.mkdir()
        candidate='assets/minecraft/textures/item/diamond.png'
        source=pack/candidate;source.parent.mkdir(parents=True)
        info=PngInfo();info.add_text('Editor metadata','x'*20000)
        Image.new('RGBA',(16,16),(20,150,220,255)).save(source,pnginfo=info)
        public=site/candidate;public.parent.mkdir(parents=True);public.write_bytes(source.read_bytes())
        Image.new('RGBA',(16,16),(20,150,220,255)).save(out/'diamond.png')
        batch={'items':{'diamond':{'flat':True,'texture_candidate':candidate}}}
        self.renderer.reuse_flat_textures(batch,out,site,pack,self.root/'vanilla')
        selected=site/batch['items']['diamond']['path']
        self.assertLess(selected.stat().st_size,1000,'Native textures must not download unused editor metadata')
        self.assertEqual(public.read_bytes(),source.read_bytes(),'Keep pack provenance unchanged')

    def test_tinted_or_animated_texture_is_not_used_as_an_unchanged_icon(self):
        source=self.root/'source.png';rendered=self.root/'rendered.png'
        Image.new('RGBA',(256,256),(20,150,220,255)).save(rendered)
        Image.new('RGBA',(16,16),(255,255,255,255)).save(source)
        self.assertFalse(self.renderer.original_matches_preview(rendered,source))
        Image.new('RGBA',(16,32),(20,150,220,255)).save(source)
        self.assertFalse(self.renderer.original_matches_preview(rendered,source))

class AssetIsolationTests(unittest.TestCase):
    def setUp(self):
        spec=importlib.util.spec_from_file_location('renderer',ROOT/'tools/render_minecraft_previews.py')
        self.renderer=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.renderer)
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.assertTrue(hasattr(self.renderer,'materialize_resource_pack'),'Rendering must stage only manifest-verified assets')

    def test_removed_assets_do_not_survive_a_manifest_refresh(self):
        site=self.root/'site'
        original=site/'assets/minecraft'
        (original/'models/item').mkdir(parents=True)
        (original/'models/item/current.json').write_bytes(b'{}')
        (original/'models/item/removed.json').write_bytes(b'{"stale":true}')
        manifest={'files':{'models/item/current.json':{'path':'models/item/current.json','sha256':hashlib.sha256(b'{}').hexdigest()},'models/item/removed.json':{'path':'models/item/removed.json','sha256':hashlib.sha256(b'{"stale":true}').hexdigest()}}}
        (original/'manifest.json').write_text(json.dumps(manifest))
        self.renderer.materialize_resource_pack(site,self.root/'first')
        del manifest['files']['models/item/removed.json']
        (original/'manifest.json').write_text(json.dumps(manifest))
        self.renderer.materialize_resource_pack(site,self.root/'refreshed')
        self.assertFalse((self.root/'refreshed/assets/minecraft/models/item/removed.json').exists())
        (original/'models/item/removed.json').unlink()
        self.renderer.materialize_resource_pack(site,self.root/'fresh')
        def files(root):return {str(p.relative_to(root)):p.read_bytes() for p in root.rglob('*') if p.is_file()}
        self.assertEqual(files(self.root/'refreshed'),files(self.root/'fresh'))

    def test_modified_source_assets_fail_checksum_validation(self):
        site=self.root/'site'
        original=site/'assets/minecraft'
        (original/'models/item').mkdir(parents=True)
        (original/'models/item/current.json').write_bytes(b'{"modified":true}')
        (original/'manifest.json').write_text(json.dumps({'files':{'models/item/current.json':{'path':'models/item/current.json','sha256':hashlib.sha256(b'{}').hexdigest()}}}))
        with self.assertRaises(ValueError):self.renderer.materialize_resource_pack(site,self.root/'output')

    def test_vanilla_extraction_refuses_an_existing_contaminated_directory(self):
        self.assertTrue(hasattr(self.renderer,'extract_vanilla_assets'))
        jar=self.root/'client.jar'
        with zipfile.ZipFile(jar,'w') as z:z.writestr('assets/minecraft/items/stone.json','{}')
        output=self.root/'vanilla';output.mkdir();(output/'stale.json').write_text('{}')
        with self.assertRaises(ValueError):self.renderer.extract_vanilla_assets(jar,output)
        clean=self.root/'clean';self.renderer.extract_vanilla_assets(jar,clean)
        self.assertEqual((clean/'assets/minecraft/items/stone.json').read_text(),'{}')

if __name__=='__main__':unittest.main()
