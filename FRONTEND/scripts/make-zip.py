# The plainest zip, like Windows' own "Compressed folder": every file deflated, sizes in the
# local headers (no streaming "data descriptors"), forward-slash paths, no separate folder
# entries, unix permissions. Hostinger's extractor stopped part-way on other variants.
# Run from FRONTEND: npm run zip (after npm run build). Upload dist.zip to Hostinger public_html.
import os
import zipfile

# Videos no code or data uses any more, and a stray lock file.
SKIP = {'1.mp4', 'bhai_banade_video.mp4', 'english_meh_bola_aur_video_ka.mp4', 'webkik-video-desktop.mp4', 'webkik-video-english.mp4', 'package-lock.json'}
root = 'dist'
out = 'dist.zip'
if os.path.exists(out):
    os.remove(out)
n = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for d, dirs, files in os.walk(root):
        dirs.sort()
        rel = os.path.relpath(d, root).replace(os.sep, '/')
        for f in sorted(files):
            if rel == '.' and f in SKIP:
                continue
            path = os.path.join(d, f)
            arc = f if rel == '.' else f'{rel}/{f}'
            zi = zipfile.ZipInfo.from_file(path, arc)
            zi.create_system = 3
            zi.external_attr = 0o100644 << 16
            zi.compress_type = zipfile.ZIP_DEFLATED
            with open(path, 'rb') as fh:
                z.writestr(zi, fh.read())
            n += 1
print('files', n)
