#!/usr/bin/env bash
set -euo pipefail

q="${*:-}"
export Q="$q"
if [[ -z "$q" ]]; then
  echo "usage: web_search_ddg.sh <query>" >&2
  exit 2
fi

# DuckDuckGo HTML endpoint (no JS). Best-effort parsing.
enc=$(python3 - <<'PY'
import os, urllib.parse
q=os.environ.get('Q','')
print(urllib.parse.quote_plus(q))
PY
)
url="https://duckduckgo.com/html/?q=${enc}"

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
curl -fsSL -A 'Mozilla/5.0' "$url" >"$tmp"

# Extract result links and titles (rough but works).
python3 - "$tmp" <<'PY'
import re, sys
html = open(sys.argv[1],'r',encoding='utf-8',errors='ignore').read()
# result links look like: <a rel="nofollow" class="result__a" href="...">TITLE</a>
pat = re.compile(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', re.I|re.S)
results=[]
for m in pat.finditer(html):
  url=m.group(1)
  title=re.sub('<.*?>','',m.group(2))
  title=re.sub(r'\s+',' ',title).strip()
  results.append((title,url))
  if len(results)>=10:
    break
for i,(t,u) in enumerate(results,1):
  print(f"{i}. {t}\n   {u}")
PY
