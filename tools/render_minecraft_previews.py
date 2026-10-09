#!/usr/bin/env python3
"""Compile the pinned CoreChatX renderer and export ready-to-serve transparent PNGs."""
import argparse
from contextlib import ExitStack
import hashlib
from io import BytesIO
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tempfile
import urllib.request
import zipfile
from PIL import Image

RENDERER_REPO = 'https://github.com/IceWolf23X/CoreChatX-plugin.git'
RENDERER_COMMIT = '9d1ef37bd266f18e7451d61db7e8ebaf91a055c2'
DEPENDENCIES = {
    'ecj-3.40.0.jar': ('org/eclipse/jdt/ecj/3.40.0/ecj-3.40.0.jar', '05cc22a24e7982970f63a405fc6c820bc80b806f27f3c5a6236fc475f8f7152b'),
    'gson-2.13.2.jar': ('com/google/code/gson/gson/2.13.2/gson-2.13.2.jar', 'dd0ce1b55a3ed2080cb70f9c655850cda86c206862310009dcb5e5c95265a5e0'),
}

def fetch(url):
    if not url.startswith('https://'):
        raise ValueError('Downloads must use HTTPS')
    with urllib.request.urlopen(url, timeout=120) as response:
        return response.read()

def checked_download(url, path, expected, algorithm='sha256'):
    data = path.read_bytes() if path.exists() else fetch(url)
    if hashlib.new(algorithm, data).hexdigest() != expected:
        raise ValueError('Checksum mismatch: ' + str(path))
    if not path.exists():
        path.write_bytes(data)
    return data

def prepare_renderer(cache):
    source = cache / 'corechatx'
    if not source.exists():
        subprocess.run(['git', 'clone', '--quiet', '--no-checkout', RENDERER_REPO, str(source)], check=True)
        subprocess.run(['git', '-C', str(source), 'checkout', '--quiet', '--detach', RENDERER_COMMIT], check=True)
    head = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    dirty = subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain'], text=True)
    if head != RENDERER_COMMIT or dirty:
        raise ValueError('Renderer cache must contain the pinned, unchanged source revision')
    for name, (coordinate, digest) in DEPENDENCIES.items():
        checked_download('https://repo.maven.apache.org/maven2/' + coordinate, cache / name, digest)
    return source

def materialize_resource_pack(site, destination):
    """Render only current, checksum-validated manifest entries, never stale disk files."""
    original = (site / 'assets/minecraft').resolve()
    manifest = json.loads((original / 'manifest.json').read_text())
    if destination.exists() and any(destination.iterdir()):
        raise ValueError('Resource staging directory must be empty')
    for name, record in manifest['files'].items():
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or not re.fullmatch(r'[a-z0-9_./-]+', name) or record['path'] != name:
            raise ValueError('Unsafe manifest path: ' + name)
        source = (original / name).resolve()
        if not source.is_relative_to(original):
            raise ValueError('Manifest asset escapes source directory')
        data = source.read_bytes()
        if hashlib.sha256(data).hexdigest() != record['sha256']:
            raise ValueError('Resource checksum mismatch: ' + name)
        target = destination / 'assets/minecraft' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    return destination

def extract_vanilla_assets(jar, destination):
    if destination.exists() and any(destination.iterdir()):
        raise ValueError('Vanilla extraction directory must be empty')
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(jar) as archive:
        for entry in archive.infolist():
            path = PurePosixPath(entry.filename)
            if path.is_absolute() or '..' in path.parts or '\\' in entry.filename:
                raise ValueError('Unsafe client archive path')
            if entry.filename.startswith('assets/') and not entry.is_dir():
                output = destination / path
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(archive.read(entry))
    return destination

def prepare_vanilla(cache, minecraft_version, destination):
    version_manifest = json.loads(fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'))
    version = next((v for v in version_manifest['versions'] if v['id'] == minecraft_version), None)
    if not version:
        raise ValueError('Unknown official Minecraft version: ' + minecraft_version)
    metadata = fetch(version['url'])
    if hashlib.sha1(metadata).hexdigest() != version['sha1']:
        raise ValueError('Minecraft version metadata checksum mismatch')
    download = json.loads(metadata)['downloads']['client']
    jar = cache / ('minecraft-' + minecraft_version + '.jar')
    checked_download(download['url'], jar, download['sha1'], 'sha1')
    vanilla = extract_vanilla_assets(jar, destination)
    return vanilla, {'version': minecraft_version, 'client_sha1': download['sha1'], 'metadata_sha1': version['sha1']}

def java_environment(cache):
    environment = dict(os.environ)
    system_fonts = Path('/etc/fonts/fonts.conf')
    if system_fonts.exists():
        from xml.sax.saxutils import escape
        font_cache = cache / 'font-cache'
        font_cache.mkdir(exist_ok=True)
        font_config = cache / 'fontconfig.xml'
        font_config.write_text('<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><include>' + str(system_fonts) + '</include><cachedir>' + escape(str(font_cache)) + '</cachedir></fontconfig>')
        environment['FONTCONFIG_FILE'] = str(font_config)
    return environment

def prepare_compatibility(cache, vanilla):
    """Describe legacy single-part bed definitions with the renderer's supported parts."""
    compatibility = cache / 'compatibility-pack'
    items = compatibility / 'assets/minecraft/items'
    items.mkdir(parents=True, exist_ok=True)
    # This directory is exclusively generated by this adapter.
    for old in items.glob('*.json'):
        old.unlink()
    for path in (vanilla / 'assets/minecraft/items').glob('*_bed.json'):
        definition = json.loads(path.read_text())
        model = definition.get('model', {})
        special = model.get('model', {})
        if model.get('type') == 'minecraft:special' and special.get('type') == 'minecraft:bed' and not special.get('part'):
            parts = []
            for part in ['head', 'foot']:
                parts.append({**model, 'model': {**special, 'part': part}, 'transformation': {'translation': [0, 0, 1 if part == 'head' else 0]}})
            (items / path.name).write_text(json.dumps({'model': {'type': 'minecraft:composite', 'models': parts}}))
    return compatibility

def visible_pixels(image):
    """Ignore invisible RGB values: texture encoders can retain hidden colors."""
    return tuple((r,g,b,a) if a else (0,0,0,0) for r,g,b,a in image.convert('RGBA').get_flattened_data())

def original_matches_preview(rendered, original):
    with Image.open(original) as texture, Image.open(rendered) as preview:
        # Animation strips need their selected frame, not the complete source PNG.
        if texture.width != texture.height or getattr(texture, 'n_frames', 1) != 1:
            return False
        scaled=texture.resize(preview.size, Image.Resampling.NEAREST)
        return visible_pixels(scaled)==visible_pixels(preview)

def reuse_flat_textures(batch, output, site, merged_pack, vanilla):
    """Reuse native texture pixels without upscaling or unused PNG metadata."""
    for item, record in batch['items'].items():
        candidate=record.pop('texture_candidate', None)
        record['kind']='compact' if record.get('flat') else 'rendered'
        if not candidate:
            continue
        if not re.fullmatch(r'assets/minecraft/textures/[a-z0-9_/-]+\.png', candidate):
            raise ValueError('Unsafe texture candidate')
        source=merged_pack/candidate
        vanilla_texture=not source.exists()
        if vanilla_texture:
            source=vanilla/candidate
        if not source.exists() or not original_matches_preview(output/(item+'.png'),source):
            continue
        # Reuse the importer's lossless, native-size PNG without editor metadata.
        # If no matching preview exists (e.g. a vanilla-only texture), write one.
        native=Path(candidate.replace('assets/minecraft/textures/','assets/minecraft/previews/',1))
        public=site/native
        with Image.open(source) as texture:
            same_native=False
            if public.exists():
                with Image.open(public) as existing:
                    same_native=existing.size==texture.size and visible_pixels(existing)==visible_pixels(texture)
            if not same_native:
                native=Path(candidate.replace('assets/minecraft/textures/','assets/minecraft/direct/',1))
                public=site/native
                public.parent.mkdir(parents=True,exist_ok=True)
                texture.convert('RGBA').save(public,optimize=True)
            record['pixel_size']=texture.width
        record.update(path=native.as_posix(),kind='texture',
                      texture_path=candidate,texture_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                      sha256=hashlib.sha256(public.read_bytes()).hexdigest())


def optimize_webp(site, manifest):
    """Select WebP only when it is smaller and every decoded RGBA byte is identical."""
    paths={record['path'] for record in manifest['items'].values()}
    choices={}
    for name in sorted(paths):
        relative=PurePosixPath(name)
        if not re.fullmatch(r'assets/minecraft/(?:rendered|previews|direct|textures)/[a-z0-9_/-]+\.(?:png|webp)',name) or '..' in relative.parts:
            raise ValueError('Unsafe preview path')
        source=site/name
        data=source.read_bytes()
        if any(record['sha256']!=hashlib.sha256(data).hexdigest() for record in manifest['items'].values() if record['path']==name):
            raise ValueError('Preview checksum mismatch: '+name)
        if source.suffix=='.webp':
            continue
        with Image.open(source) as image:
            original=image.convert('RGBA')
            encoded=BytesIO()
            original.save(encoded,format='WEBP',lossless=True,exact=True,method=6)
            webp=encoded.getvalue()
            if len(webp)>=len(data):
                continue
            with Image.open(BytesIO(webp)) as decoded:
                if decoded.size!=original.size or decoded.convert('RGBA').tobytes()!=original.tobytes():
                    raise ValueError('Lossless WebP changed pixels: '+name)
        target=source.with_suffix('.webp')
        target.write_bytes(webp)
        choices[name]=(target.relative_to(site).as_posix(),hashlib.sha256(webp).hexdigest())
        # Pack textures and imported previews remain available to the PNG fallback registry.
        if relative.parts[2]=='rendered':
            source.unlink()
    for record in manifest['items'].values():
        if record['path'] in choices:
            record['path'],record['sha256']=choices[record['path']]
        record['format']=Path(record['path']).suffix[1:]
    manifest['encoding']='WebP lossless with exact RGBA verification when smaller; otherwise PNG.'

def write_preview_catalog(site,manifest):
    destination=site/'assets/minecraft/rendered'
    (destination/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    registry={item:record['path'] for item,record in sorted(manifest['items'].items())}
    (site/'js/minecraft-rendered.js').write_text('/* Generated Minecraft previews: native textures, compact 2D and CoreChatX 3D at scale '+str(manifest['scale'])+'. Do not edit. */\n(function(root){root.MMMinecraftRendered=Object.freeze('+json.dumps(registry,indent=2)+');})(globalThis);\n')


def render(site, cache, scale=16, minecraft_version='1.21.11', only=None):
    if not 1 <= scale <= 32:
        raise ValueError('Scale must be between 1 and 32')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+', minecraft_version):
        raise ValueError('Unsafe Minecraft version')
    cache.mkdir(parents=True, exist_ok=True)
    source = prepare_renderer(cache)
    with ExitStack() as work:
        work_root = Path(work.enter_context(tempfile.TemporaryDirectory(prefix='render-inputs-', dir=cache)))
        vanilla, vanilla_info = prepare_vanilla(cache, minecraft_version, work_root / 'vanilla')
        merged_pack = materialize_resource_pack(site, work_root / 'merged-pack')
        compatibility = prepare_compatibility(work_root, vanilla)
        model_root = source / 'corechatx-paper/src/main/java/com/corex/inventorysnapshot'
        classes = work_root / 'classes'
        classes.mkdir(exist_ok=True)
        files = [str(p) for p in sorted(model_root.rglob('*.java')) if p.name not in ('BukkitInventorySnapshotFactory.java', 'InventoryRenderServiceImpl.java')]
        files.append(str(Path(__file__).with_name('CoreChatXPreviewBatch.java').resolve()))
        ecj = cache / 'ecj-3.40.0.jar'
        gson = cache / 'gson-2.13.2.jar'
        subprocess.run(['java', '-jar', str(ecj), '-21', '-proc:none', '-nowarn', '-classpath', str(gson), '-d', str(classes), *files], check=True)
        ids = set()
        for root in [vanilla, merged_pack]:
            for path in (root / 'assets/minecraft/items').glob('*.json'):
                if re.fullmatch(r'[a-z0-9_]+', path.stem):
                    ids.add(path.stem)
        # Legacy pack item models can add objects absent from the vanilla item definitions.
        for path in (merged_pack / 'assets/minecraft/models/item').glob('*.json'):
            if re.fullmatch(r'[a-z0-9_]+', path.stem):
                ids.add(path.stem)
        if only:
            ids = set(only)
        if any(not re.fullmatch(r'[a-z0-9_]+', item) for item in ids):
            raise ValueError('Unsafe item ID')
        ids_file = cache / 'render-ids.json'
        ids_file.write_text(json.dumps(sorted(ids)))
        resources = source / 'corechatx-paper/src/main/resources'
        classpath = os.pathsep.join(map(str, [classes, gson, resources]))
        with tempfile.TemporaryDirectory(prefix='render-batch-', dir=cache) as temporary:
            output = Path(temporary)
            subprocess.run(['java', '-Xmx768m', '-Djava.awt.headless=true', '-cp', classpath, 'CoreChatXPreviewBatch', str(merged_pack), str(vanilla), str(output), str(ids_file), str(scale), str(compatibility)], check=True, env=java_environment(cache))
            batch = json.loads((output / 'batch-report.json').read_text())
            if not batch['items']:
                raise RuntimeError('No item models rendered successfully')
            if not only:
                required = {'white_wool', 'pale_oak_log', 'observer', 'enchanted_book', 'diamond', 'hopper'}
                missing = required - batch['items'].keys()
                if missing:
                    raise RuntimeError('Required catalog previews failed: ' + ', '.join(sorted(missing)))
            reuse_flat_textures(batch, output, site, merged_pack, vanilla)
            manifest = {
                'renderer_repository': RENDERER_REPO, 'renderer_commit': RENDERER_COMMIT,
                'scale': scale, 'pixel_size': 16 * scale, 'vanilla': vanilla_info,
                'resource_manifest_sha256': hashlib.sha256((site / 'assets/minecraft/manifest.json').read_bytes()).hexdigest(),
                'context': {'minecraft:context_dimension': 'minecraft:overworld', 'minecraft:time': '0', 'minecraft:compass': '0'},
                'compatibility': 'Legacy single-part bed definitions adapted to a head/foot composite; renderer source unchanged.',
                'adapter_sha256': {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in [Path(__file__), Path(__file__).with_name('CoreChatXPreviewBatch.java')]},
                'dependency_sha256': {name: digest for name, (_, digest) in DEPENDENCIES.items()},
                **batch,
            }
            destination = site / 'assets/minecraft/rendered'
            destination.mkdir(parents=True, exist_ok=True)
            for item, record in batch['items'].items():
                target=destination/(item+'.png')
                if record['kind']=='texture':
                    target.unlink(missing_ok=True)
                else:
                    shutil.copyfile(output/(item+'.png'),target)
            optimize_webp(site,manifest)
            write_preview_catalog(site,manifest)
            return manifest

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--cache', type=Path, default=Path(os.getenv('MOSS_RENDER_CACHE', str(Path(tempfile.gettempdir()) / 'moss-corechatx-renderer'))))
    parser.add_argument('--scale', type=int, default=16)
    parser.add_argument('--minecraft-version', default='1.21.11')
    parser.add_argument('--only', nargs='+', help='Diagnostic subset; replaces the generated registry. Do not use for publication.')
    parser.add_argument('--optimize-only',action='store_true',help='Optimize the committed preview catalog offline; no Java or downloads.')
    args = parser.parse_args()
    if args.optimize_only:
        site=args.site.resolve()
        manifest=json.loads((site/'assets/minecraft/rendered/manifest.json').read_text())
        optimize_webp(site,manifest)
        manifest['adapter_sha256'][Path(__file__).name]=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        write_preview_catalog(site,manifest)
        print(json.dumps({'optimized':len(manifest['items']),'encoding':manifest['encoding']}))
        return
    result = render(args.site.resolve(), args.cache.resolve(), args.scale, args.minecraft_version, args.only)
    print(json.dumps({'rendered': len(result['items']), 'unavailable': len(result['failures']), 'pixels': result['pixel_size']}))

if __name__ == '__main__':
    main()
