#!/usr/bin/env python3
"""Fail the build if the site references a file that will not be deployed.

website/ and errors/ both sync to the root of the same bucket, so a reference
resolves against the union of the two, not against its own directory.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
if not (ROOT / "website").is_dir():          # running from the repo root in CI
    ROOT = pathlib.Path.cwd()

deployed = set()
for d in ("website", "errors"):
    base = ROOT / d
    if base.is_dir():
        for f in base.rglob("*"):
            if f.is_file():
                deployed.add(f.relative_to(base).as_posix())

REF = re.compile(r'(?:src|href)\s*=\s*["\']([^"\']+)["\']', re.I)
SKIP = re.compile(r'^(?:[a-z][a-z0-9+.-]*:|//|#|$)', re.I)

problems = []
for d in ("website", "errors"):
    base = ROOT / d
    if not base.is_dir():
        continue
    for page in sorted(base.rglob("*.html")):
        for ref in REF.findall(page.read_text(encoding="utf-8", errors="replace")):
            ref = ref.strip()
            if SKIP.match(ref):
                continue
            target = ref.split("?", 1)[0].split("#", 1)[0].lstrip("/")
            if not target or target.endswith("/"):
                continue
            if target not in deployed:
                problems.append(f"{page.relative_to(ROOT)} -> {target}")

# The page has shipped without this tag before, and nothing on it ran in
# production for months while local previews looked fine.
home = ROOT / "website" / "home.html"
if home.is_file():
    text = home.read_text(encoding="utf-8", errors="replace")
    for required in ("home.css", "home.js", "metrics.js"):
        if required not in text:
            problems.append(f"website/home.html does not reference {required}")
else:
    problems.append("website/home.html is missing")

if problems:
    print(f"{len(problems)} problem(s):")
    for p in problems:
        print("  " + p)
    sys.exit(1)

print(f"OK - {len(deployed)} deployable files, every reference resolves")
