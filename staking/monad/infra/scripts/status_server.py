#!/usr/bin/env python3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime, timezone

HOST = os.getenv("STATUS_HOST", "127.0.0.1")
PORT = int(os.getenv("STATUS_PORT", "8787"))
RPC_URL = os.getenv("RPC_URL", "")
RPC_TIMEOUT_SECS = 5

def _utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def _rpc_call(method):
    if not RPC_URL:
        return None, "RPC_URL not set"

    payload = json.dumps(
        {"jsonrpc": "2.0", "id": 1, "method": method, "params": []}
    ).encode("utf-8")
    req = urllib.request.Request(
        RPC_URL, data=payload, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=RPC_TIMEOUT_SECS) as resp:
            body = resp.read().decode("utf-8")
    except Exception as exc:
        return None, f"RPC error: {exc}"

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return None, "RPC invalid JSON"

    if "error" in data:
        return None, f"RPC error: {data['error']}"

    return data.get("result"), None

class StatusHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in ("/status", "/status/"):
            self.send_response(404)
            self.end_headers()
            return

        payload = {
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "block_height": None,
            "last_seen": None,
        }

        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, _format, *_args):
        return

if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), StatusHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
