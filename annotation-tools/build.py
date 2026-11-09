"""Build a review copy from the current annotated template and version-locked mapping."""
from pathlib import Path
import argparse, hashlib, json, re

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', required=True, help='Output HTML copy; existing files cannot be overwritten')
args = parser.parse_args()
output = Path(args.output).resolve()
if output.exists():
    parser.error('output already exists; choose a new file')
data = json.loads((ROOT / 'annotation-tools/mapping.json').read_text())
prd = ROOT / data['prd']
if hashlib.sha256(prd.read_bytes()).hexdigest() != data['prdSha256']:
    parser.error('PRD changed since mapping was synchronized; review mapping before rebuilding')
template = ROOT / data['template']
html = template.read_text()
pattern = r'(<script type="application/json" id="prd-annotation-seed">)(.*?)(</script>)'
matches = list(re.finditer(pattern, html, re.S))
if len(matches) != 1:
    parser.error('template must contain exactly one annotation seed')
seed = {key: data[key] for key in ('annotations', 'flows', 'related', 'contentAdditions')}
serialized = json.dumps(seed, ensure_ascii=False).replace('</', '<\\/')
m = matches[0]
html = html[:m.start(2)] + serialized + html[m.end(2):]
output.write_text(html, encoding='utf-8')
print(f'Built review copy: {output}; {len(seed["annotations"])} annotations, {len(seed["flows"])} flows, {len(seed["related"])} related pages')
