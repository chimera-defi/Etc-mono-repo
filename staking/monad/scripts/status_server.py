#!/usr/bin/env python3
import json
import os
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime, timezone

HOST = "0.0.0.0"
PORT = 8787
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

        block_hex, err = _rpc_call("eth_blockNumber")
        block_height = int(block_hex, 16) if block_hex else None

        payload = {
            "status": "ok",
            "timestamp": _utc_now(),
            "block_height": block_height,
            "last_seen": _utc_now() if block_height is not None else None,
            "rpc_error": err,
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
