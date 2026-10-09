#!/usr/bin/env python3
"""Import supplied packs, first pack wins; apply compatible overlays within each pack."""
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import zipfile
from PIL import Image

SAFE = re.compile(r'^[a-z0-9_./-]+$')

def version(value):
    return tuple(value) if isinstance(value, list) else (int(value), 0)

def compatible(entry, pack_format):
    minimum = entry.get('min_format')
    maximum = entry.get('max_format')
    if minimum is None or maximum is None:
        formats = entry.get('formats')
        if isinstance(formats, dict):
            minimum, maximum = formats['min_inclusive'], formats['max_inclusive']
        elif isinstance(formats, list):
            minimum, maximum = formats
        else:
            minimum = maximum = formats
    return minimum is not None and version(minimum) <= (pack_format, 0) <= version(maximum)

def selected(path):
    return bool(SAFE.fullmatch(path)) and (
        path.startswith('textures/') and path.endswith(('.png', '.png.mcmeta'))
        or path.startswith(('models/block/', 'models/item/', 'blockstates/', 'items/')) and path.endswith('.json'))

def read_pack(path, pack_format):
    with zipfile.ZipFile(path) as archive:
        members = {}
        for entry in archive.infolist():
            p = PurePosixPath(entry.filename)
            if p.is_absolute() or '..' in p.parts or '\\' in entry.filename or ((entry.external_attr >> 16) & 0o170000) == 0o120000:
                raise ValueError('Unsafe archive member: ' + entry.filename)
            if entry.file_size > 16 * 1024 * 1024:
                raise ValueError('Archive member exceeds size limit: ' + entry.filename)
            if entry.filename in members:
                raise ValueError('Duplicate archive member: ' + entry.filename)
            members[entry.filename] = entry
        metadata = json.loads(archive.read('pack.mcmeta'))
        prefixes = ['']
        for entry in metadata.get('overlays', {}).get('entries', []):
            if compatible(entry, pack_format):
                directory = entry['directory']
                if not re.fullmatch(r'[a-z0-9_-]+', directory):
                    raise ValueError('Unsafe overlay directory')
                prefixes.append(directory + '/')
        files = {}
        for prefix in prefixes:
            asset_root = prefix + 'assets/minecraft/'
            for name, entry in members.items():
                if not entry.is_dir() and name.startswith(asset_root):
                    relative = name[len(asset_root):]
                    if selected(relative):
                        files[relative] = (archive.read(name), name)
        return files, metadata

def preview(data, metadata):
    with Image.open(io.BytesIO(data)) as image:
        if image.format != 'PNG':
            raise ValueError('Texture is not a PNG')
        animation = metadata.get('animation', {})
        width = animation.get('width', image.width)
        height = animation.get('height', min(width, image.height))
        frames = animation.get('frames', [0])
        frame = frames[0] if frames else 0
        if isinstance(frame, dict):
            frame = frame['index']
        columns = image.width // width
        if width < 1 or height < 1 or columns < 1 or not isinstance(frame, int) or frame < 0:
            raise ValueError('Invalid animation frame')
        x, y = (frame % columns) * width, (frame // columns) * height
        if x + width > image.width or y + height > image.height:
            raise ValueError('Animation frame is outside texture')
        output = io.BytesIO()
        image.crop((x, y, x + width, y + height)).save(output, format='PNG')
        return output.getvalue()

def import_packs(paths, site, pack_format=75):
    site = Path(site)
    destination = site / 'assets/minecraft'
    roles = ['base', 'updated', 'extra']
    merged, packs = {}, []
    for role, path in zip(roles, paths):
        path = Path(path)
        files, metadata = read_pack(path, pack_format)
        packs.append({'role': role, 'filename': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'metadata': metadata})
        for name, (data, member) in files.items():
            merged.setdefault(name, (data, member, role))
    # Validate every preview before writing any generated files.
    previews = {}
    for name, (data, member, role) in merged.items():
        if name.startswith(('textures/block/', 'textures/item/')) and name.endswith('.png'):
            animation = json.loads(merged[name + '.mcmeta'][0]) if name + '.mcmeta' in merged else {}
            previews[name.removeprefix('textures/')] = preview(data, animation)
    manifest = {'pack_format': pack_format, 'precedence': roles[:len(paths)], 'packs': packs, 'files': {}}
    registry = {}
    for name, (data, member, role) in sorted(merged.items()):
        output = destination / name
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
        manifest['files'][name] = {'path': name, 'pack': role, 'member': member, 'sha256': hashlib.sha256(data).hexdigest()}
    for name, data in sorted(previews.items()):
        output = destination / 'previews' / name
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
        registry[name.removesuffix('.png')] = 'assets/minecraft/previews/' + name
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    (site / 'js').mkdir(parents=True, exist_ok=True)
    (site / 'js/minecraft-assets.js').write_text('/* Generated by tools/import_minecraft_assets.py. Do not edit. */\n(function(root){root.MMMinecraftAssets=Object.freeze(' + json.dumps(registry, indent=2) + ');})(globalThis);\n')
    return manifest

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', type=Path, required=True)
    parser.add_argument('--updated', type=Path, required=True)
    parser.add_argument('--extra', type=Path, required=True)
    parser.add_argument('--site', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--pack-format', type=int, default=75, help='Default: Minecraft Java 1.21.11')
    args = parser.parse_args()
    manifest = import_packs([args.base, args.updated, args.extra], args.site, args.pack_format)
    counts = {role: sum(entry['pack'] == role for entry in manifest['files'].values()) for role in manifest['precedence']}
    print(json.dumps({'imported_files': len(manifest['files']), 'sources': counts}))

if __name__ == '__main__':
    main()
