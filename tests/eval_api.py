# Hook AI — automated evaluation suite
# Run:  python tests/eval_api.py
# Hits the deployed /api/* endpoints with known prompts and asserts output quality.
# This doubles as CI for LLM outputs — an interview talking point.

import json
import os
import sys
import urllib.request

BASE = os.environ.get("HOOKAI_BASE", "https://hook-ai-marketing-engine.vercel.app")

PASS = 0
FAIL = 0


def call(path, body):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def check(name, ok, detail=""):
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name} — {detail}")


def test_analyze():
    print("[analyze]")
    status, data = call("/api/analyze", {"topic": "organic skincare for busy moms", "audience": "busy moms", "goal": "signups"})
    check("returns 200", status == 200, f"got {status}: {data.get('error')}")
    check("has hooks", isinstance(data.get("hooks"), list) and len(data["hooks"]) > 0, "hooks missing")
    check("hooks have score + psychology", all("score" in h and "psychology" in h for h in data.get("hooks", [])))
    check("has angles", isinstance(data.get("angles"), list) and len(data["angles"]) > 0)
    check("has usp", "usp" in data and isinstance(data.get("usp", {}).get("differentiators"), list))
    check("has competitor gaps", isinstance(data.get("gaps"), list))


def test_analyze_invalid():
    print("[analyze:validation]")
    status, data = call("/api/analyze", {})
    check("empty topic -> 400", status == 400, f"got {status}")
    status, data = call("/api/analyze", {"topic": "x" * 500})
    check("long topic -> 400", status == 400, f"got {status}")


def test_ai_tools():
    print("[ai-tools]")
    # Build a minimal result payload first so tools have input.
    _, result = call("/api/analyze", {"topic": "email marketing automation", "audience": "ecommerce store owners", "goal": "free trials"})
    hook = result["hooks"][0]
    status, data = call("/api/ai-tools", {"tool": "improve", "hook": hook, "mode": "stronger"})
    check("improve works", status == 200 and data.get("rewrites"), f"got {status}")
    status, data = call("/api/ai-tools", {"tool": "explain", "hook": hook, "audience": "store owners"})
    check("explain works", status == 200 and data.get("explanation"), f"got {status}")
    status, data = call("/api/ai-tools", {"tool": "angles", "topic": "project management software", "audience": "founders", "goal": "trials"})
    check("angles works", status == 200 and data.get("angles"), f"got {status}")
    status, data = call("/api/ai-tools", {"tool": "persona", "topic": "project management software", "audience": "busy founders and small teams"})
    check("persona works", status == 200 and data.get("personas"), f"got {status}: {data}")
    status, data = call("/api/ai-tools", {"tool": "seo", "bestHook": result["hooks"][0], "topic": "project management"})
    check("seo works", status == 200 and data.get("meta"), f"got {status}")
    status, data = call("/api/ai-tools", {"tool": "budget", "result": result, "totalBudget": 1000})
    check("budget works", status == 200 and data.get("allocations"), f"got {status}")


def test_adcopy():
    print("[adcopy]")
    _, result = call("/api/analyze", {"topic": "home workouts", "audience": "busy professionals", "goal": "app downloads"})
    status, data = call("/api/adcopy", {"result": result, "channel": "ad"})
    check("adcopy works", status == 200 and data.get("copies"), f"got {status}")


def test_health():
    print("[health]")
    req = urllib.request.Request(BASE + "/api/health", method="GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            check("health returns 200", resp.status == 200, f"got {resp.status}")
            check("health reports ok", data.get("status") == "ok", str(data))
    except urllib.error.HTTPError as e:
        check("health returns 200", False, f"got {e.code}")


if __name__ == "__main__":
    test_health()
    test_analyze()
    test_analyze_invalid()
    test_ai_tools()
    test_adcopy()
    print(f"\n=== {PASS} passed, {FAIL} failed ===")
    sys.exit(1 if FAIL else 0)
