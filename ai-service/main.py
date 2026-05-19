"""
Graph-Based Financial Crime Detection Engine
Python AI Service - Standard Library HTTP Server

This service exposes the same /health and /analyze endpoints without external
web framework dependencies so it can run on the current Python environment.
"""

from __future__ import annotations

import json
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

from detection_engine import DetectionEngine
from suspicion_scorer import SuspicionScorer


class _JSONResponseMixin:
    def send_json(self, status_code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)


class AIRequestHandler(_JSONResponseMixin, BaseHTTPRequestHandler):
    server_version = "TraceRingAI/1.0"

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/health":
            self.send_json(200, {"status": "healthy", "service": "ai-detection"})
            return
        self.send_json(404, {"detail": "Not found"})

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path != "/analyze":
            self.send_json(404, {"detail": "Not found"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b""
            payload = json.loads(raw_body.decode("utf-8") or "{}")
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"detail": "Invalid JSON payload"})
            return

        transactions = payload.get("transactions")
        if not transactions:
            self.send_json(400, {"detail": "No transactions provided"})
            return

        start_time = time.perf_counter()
        engine = DetectionEngine(transactions)
        detection_results = engine.run_all_detections()

        scorer = SuspicionScorer(
            transactions=transactions,
            cycles=detection_results["cycles"],
            fan_in=detection_results["smurfing"]["fan_in"],
            fan_out=detection_results["smurfing"]["fan_out"],
            shell_networks=detection_results["shell_networks"],
            high_velocity=detection_results["high_velocity"],
            merchants=detection_results["merchants"],
            self_loops=detection_results.get("self_loops", []),
            cycle_participants=detection_results.get("cycle_participants", []),
        )

        account_scores = scorer.calculate_all_scores()
        fraud_rings = scorer.build_fraud_rings(detection_results["cycles"])

        for ring in fraud_rings:
            for account in ring["member_accounts"]:
                if account in account_scores and not account_scores[account]["ring_id"]:
                    account_scores[account]["ring_id"] = ring["ring_id"]

        processing_time = round(time.perf_counter() - start_time, 4)

        self.send_json(
            200,
            {
                "cycles": detection_results["cycles"],
                "smurfing": detection_results["smurfing"],
                "shell_networks": detection_results["shell_networks"],
                "high_velocity": detection_results["high_velocity"],
                "merchants": detection_results["merchants"],
                "account_scores": account_scores,
                "fraud_rings": fraud_rings,
                "processing_time": processing_time,
            },
        )

    def log_message(self, format: str, *args: Any) -> None:
        return


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", 8000), AIRequestHandler)
    print("AI service listening on http://0.0.0.0:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
