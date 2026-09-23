# Client-facing proposal

`CTL-Roofing-Website-Agreement.pdf` — the commercial agreement put to Robert:
build scope, payment schedule, what the monthly retainer covers, and the
criteria the performance bonus is measured against.

Source is `agreement.html`, one `<section class="page">` per printed page at
8.5×11in. `python3 build.py` inlines the fonts and the logo and prints it with
headless Chromium; `build/` is scratch and is not committed.

Two figures in the PDF are marked *proposed* rather than agreed — the
qualified-lead target on page 7 and the out-of-scope hourly rate on page 6.
Settle both before it is signed.
