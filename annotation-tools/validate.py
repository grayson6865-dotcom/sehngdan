"""Validate the v1.1 mapping, prototype seed and runtime without writing output."""
from pathlib import Path
import argparse, hashlib, json, re, subprocess, tempfile
ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--html', default=str(ROOT / 'xppen-christmas-2026-annotated.html'))
args = parser.parse_args()
mapping = json.loads((ROOT / 'annotation-tools/mapping.json').read_text())
html = Path(args.html).read_text()
prd = ROOT / mapping['prd']
source = ROOT / 'xppen-christmas-2026-standalone.html'
assert hashlib.sha256(prd.read_bytes()).hexdigest() == mapping['prdSha256'], 'PRD changed since synchronization'
assert hashlib.sha256(source.read_bytes()).hexdigest() == mapping['sourceSha256'], 'Standalone source changed'
seed = json.loads(re.search(r'<script type="application/json" id="prd-annotation-seed">(.*?)</script>', html, re.S)[1])
assert all(seed[k] == mapping[k] for k in ('annotations','flows','related','contentAdditions')), 'HTML and mapping differ'
assert [a['id'] for a in seed['annotations']] == list(range(1,11))
assert len(seed['flows']) == 4 and len(seed['related']) == 6
assert all([p['id'] for p in r['pins']] == [1] for r in seed['related'])
numbered = prd.read_text()
assert '| 版本号 | v1.1 |' in numbered and all(f'[{i}]' in numbered for i in range(1,11))
content = '\n'.join(a['content'] for a in seed['annotations'])
for line in numbered.splitlines():
    if not line.strip() or line.startswith('#'):
        continue
    clean = line.replace('| [4] 普通能量 |', '| 普通能量 |').replace('](../', '](')
    assert clean in content, 'Missing PRD line: ' + clean
markers = ['批注管理','流程图','关联系统','data-prd-related-upload','data-prd-related-manage','data-prd-related-change','data-prd-preview-prev','data-prd-preview-next','data-related-edit-meta','data-related-save-meta','openRelatedPinPopover','syncMainAnnotationChrome']
assert all(m in html for m in markers)
runtime = (ROOT/'annotation-tools/runtime.js').read_text()
assert re.search(r'<script id="prd-annotation-runtime">(.*?)</script>', html, re.S)[1] == runtime, 'Embedded runtime differs'
assert not re.search(r'window\.(prompt|alert)\s*\(', runtime)
assert set(re.findall(r'data-page-node-id="([^"]+)"',source.read_text())) == set(re.findall(r'data-page-node-id="([^"]+)"',html))
assert len(re.findall(r'data-page-node-id="(?:aGSecXBGbbDEDKEm2TDfrC|Pg9iqcKmJQx60SpUDemHKk)">/ 24',html)) == 2
count = 0
with tempfile.TemporaryDirectory() as tmp:
    for match in re.finditer(r'<script([^>]*)>(.*?)</script>',html,re.S):
        if 'application/json' in match[1] or not match[2].strip(): continue
        path = Path(tmp)/f'{count}.js'; path.write_text(match[2]); subprocess.run(['node','--check',str(path)],check=True,capture_output=True); count += 1
subprocess.run(['node',str(ROOT/'annotation-tools/validate-runtime.cjs')],cwd=ROOT,check=True)
print(f'PASS: PRD v1.1 and source hashes, PRD coverage, 10 annotations / 4 flows / 6 related, synchronized runtime, {count} scripts')
