#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
STATUS_PORT=8787
MOCK_RPC_PORT=8792

python3 - <<'PY' "$STATUS_PORT" "$MOCK_RPC_PORT" "$ROOT_DIR"
import json
import threading
import time
import sys
import subprocess
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

status_port = int(sys.argv[1])
mock_port = int(sys.argv[2])
root_dir = sys.argv[3]

class RPCHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', '0')))
        try:
            data = json.loads(body.decode('utf-8'))
        except Exception:
            data = {}
        if data.get('method') == 'eth_blockNumber':
            resp = {"jsonrpc":"2.0","id":data.get('id',1),"result":"0x2a"}
        else:
            resp = {"jsonrpc":"2.0","id":data.get('id',1),"error":"unsupported"}
        out = json.dumps(resp).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Content-Length', str(len(out)))
        self.end_headers()
        self.wfile.write(out)
    def log_message(self, *_args):
        return

rpc_server = HTTPServer(('127.0.0.1', mock_port), RPCHandler)
threading.Thread(target=rpc_server.serve_forever, daemon=True).start()

env = dict(**os.environ)
env['RPC_URL'] = f'http://127.0.0.1:{mock_port}'
status_proc = subprocess.Popen(['python3','staking/monad/infra/scripts/status_server.py'], env=env)

try:
    time.sleep(1)
    # /status
    out = subprocess.check_output(['curl','-fsS',f'http://127.0.0.1:{status_port}/status'])
    print(out.decode('utf-8')[:300])
    # /status/
    out = subprocess.check_output(['curl','-fsS',f'http://127.0.0.1:{status_port}/status/'])
    print(out.decode('utf-8')[:300])
    # 404 for unknown path
    code = subprocess.check_output(['curl','-s','-o','/dev/null','-w','%{http_code}',f'http://127.0.0.1:{status_port}/unknown'])
    print(f'unknown path HTTP {code.decode().strip()}')

    # check_rpc against mock
    check_rpc = os.path.join(root_dir, 'scripts', 'check_rpc.sh')
    out = subprocess.check_output([check_rpc, f'http://127.0.0.1:{mock_port}', 'eth_blockNumber'])
    print(out.decode('utf-8')[:200])
finally:
    status_proc.terminate()
    rpc_server.shutdown()
    rpc_server.server_close()
PY

# Optional Foundry/Cast checks if installed
if command -v forge >/dev/null 2>&1; then
  echo "forge detected: $(forge --version | head -n 1)"
else
  echo "forge not installed; skipping forge checks"
fi

if command -v cast >/dev/null 2>&1; then
  cast block-number --rpc-url "http://127.0.0.1:${MOCK_RPC_PORT}" || true
else
  echo "cast not installed; skipping cast checks"
fi
