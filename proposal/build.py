#!/usr/bin/env python3
"""Render agreement.html to a self-contained PDF.

Fonts and the logo are inlined as base64 so the PDF renders identically
anywhere, then Chromium prints it. Run: python3 build.py
"""
import base64, os, pathlib, re, subprocess, sys, urllib.request

HERE = pathlib.Path(__file__).parent
REPO = HERE.parent
BUILD = HERE / "build"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FONT_CSS = ("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600"
            "&family=IBM+Plex+Mono:wght@400;500"
            "&family=Big+Shoulders+Display:wght@500;600;700&display=swap")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def fetch(url, ua=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA} if ua else {})
    return urllib.request.urlopen(req).read()


def embedded_fonts():
    """Latin-subset @font-face blocks with the woff2 payloads inlined."""
    cached = BUILD / "fonts.css"
    if cached.exists():
        return cached.read_text()
    css = fetch(FONT_CSS, ua=True).decode()
    out, seen = [], {}
    for block in re.findall(r"@font-face\s*\{.*?\}", css, re.S):
        rng = re.search(r"unicode-range:\s*([^;]+);", block)
        if rng and "U+0000-00FF" not in rng.group(1):
            continue  # non-latin subsets this document never reaches for
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        seen.setdefault(url, base64.b64encode(fetch(url)).decode())
        out.append(re.sub(r"url\(https://[^)]+\)",
                          "url(data:font/woff2;base64,%s)" % seen[url], block))
    css = "\n".join(out)
    cached.write_text(css)
    return css


def main():
    BUILD.mkdir(exist_ok=True)
    html = (HERE / "agreement.html").read_text()
    logo = base64.b64encode((REPO / "ctl-roofing/public/ctl/logo.png").read_bytes()).decode()
    html = (html.replace("/* FONTS_PLACEHOLDER */", embedded_fonts())
                .replace("LOGO_SRC", "data:image/png;base64," + logo))
    src = BUILD / "agreement.build.html"
    src.write_text(html)
    pdf = HERE / "CTL-Roofing-Website-Agreement.pdf"
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
                    "--no-pdf-header-footer", f"--print-to-pdf={pdf}", src.as_uri()],
                   check=True, capture_output=True)
    print(f"{pdf} — {pdf.stat().st_size // 1024} KB")


if __name__ == "__main__":
    sys.exit(main())
