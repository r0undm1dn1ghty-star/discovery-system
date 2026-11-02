# -*- coding: utf-8 -*-
"""
build-premium-v2.py — собирает index-premium-v2.html из живого index.html.

Отличия от v1: другой CSS (ds-hero-premium-v2.css) — пересобран по замерам
linear.app / vercel.com / stripe.com / vernik.me / overchat.ai, а не по вкусу.

Живой index.html не трогается: читается, из него берётся первый экран и копирайт
дословно, меняется только расстановка — и только в мокапе.
"""
import json
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "index.html"
OUT = ROOT / "index-premium-v2.html"
ARTIFACT = ROOT / "prepared-hero-field.json"

html = SRC.read_text(encoding="utf-8")

# ── 1. head ────────────────────────────────────────────────────────────────
head_add = ('<meta name="robots" content="noindex,nofollow">\n'
            '<link rel="stylesheet" href="ds-hero-premium-v2.css"/>\n')
assert html.count("</head>") == 1, "ожидался один </head>"
html = html.replace("</head>", head_add + "</head>", 1)

# ── 2. плазма → условный загрузчик ────────────────────────────────────────
plasma_tag = '<script src="ds-plasma.js" defer></script>'
assert plasma_tag in html, "не найден тег плазмы"
conditional = (
    '<script>(function(){var on=!!navigator.gpu&&window.innerWidth>=760&&'
    '!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&'
    '!sessionStorage.getItem("gpu-crashed");'
    'if(on)return;var s=document.createElement("script");s.src="ds-plasma.js";'
    's.defer=true;s.setAttribute("data-ds-plasma","1");document.head.appendChild(s);})();</script>'
)
html = html.replace(plasma_tag, conditional, 1)

# ── 3. первый экран ───────────────────────────────────────────────────────
m = re.search(r'<header class="hero">([\s\S]*?)</header>', html)
assert m, "не найден <header class=\"hero\">"
old_block, inner = m.group(0), m.group(1)

op = re.search(r'(<div class="own-price[\s\S]*)\n</header>', old_block)
assert op, "не найден блок own-price"
own_price = op.group(1).rstrip()
grid = inner[:inner.index('<div class="own-price')].rstrip()

meta_line = '<p class="hero-meta">связка на твоём сервере · данные у тебя · без VPN</p>'
assert meta_line in grid, "не найдена строка hero-meta"
grid = grid.replace(meta_line, "")

cta_close = '<span class="cta-note">7 вопросов · без регистрации</span>\n</div>'
assert cta_close in grid, "не найден cta-row"
facts = '''<a class="btn btn-ghost" href="#work"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="M13 6.5l5.5 5.5-5.5 5.5"/></svg>Что делает агент</a>
''' + cta_close + '''
<ul class="hero-facts rv" style="transition-delay:.26s">
<li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>связка на твоём сервере</li>
<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9.4 12.3l1.9 1.9 3.4-3.7"/></svg>данные у тебя</li>
<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 3L6 13.5h5l-.8 7.5L18 10.5h-5z"/></svg>без VPN</li>
</ul>
'''
grid = grid.replace(cta_close, facts, 1)

new_hero = ('<header class="hero" id="hero">\n'
            '<div class="hero-light" aria-hidden="true"></div>\n'
            + grid + '\n</header>\n\n'
            '<section class="price-band" aria-label="Состав цены"><div class="wrap">\n'
            + own_price + '\n</div></section>')
html = html.replace(old_block, new_hero, 1)

# ── 4. артефакт + слой ────────────────────────────────────────────────────
art = json.loads(ARTIFACT.read_text(encoding="utf-8"))
art_json = json.dumps(art, separators=(",", ":")).replace("</", "<\\/")
tail = (
    '<script id="hero-field-artifact" type="application/json">' + art_json + '</script>\n'
    '<script src="ds-hero-field.js" defer></script>\n'
)
assert html.count("</body>") == 1
html = html.replace("</body>", tail + "</body>", 1)

OUT.write_text(html, encoding="utf-8")
print("собрано:", OUT.name, OUT.stat().st_size, "байт")
