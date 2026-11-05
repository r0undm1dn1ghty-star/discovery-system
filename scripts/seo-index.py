#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
seo-index.py — SEO/AEO-слой для discovery-system.ru

Что делает (идемпотентно, повторный запуск ничего не дублирует):
  1. Вставляет управляемый блок SEO:CORE в <head> каждой индексируемой страницы
     (robots, author, RSS-autodiscovery, article:modified_time, verification-токены).
  2. Добавляет BreadcrumbList JSON-LD (кроме главной).
  3. Дополняет Person/Organization sameAs внешними профилями (LinkedIn, X, GitHub).
  4. Ставит noindex на служебные страницы (thanks, fail).
  5. Пересобирает sitemap.xml и feed.xml по фактическому состоянию файлов и git-датам.
  6. Валидирует: все <script type="application/ld+json"> парсятся как JSON.

Запуск:
  python3 scripts/seo-index.py                    # записать
  python3 scripts/seo-index.py --dry              # показать, не писать
  python3 scripts/seo-index.py --google TOKEN --yandex TOKEN   # + verification-меты
"""
import os, re, sys, json, subprocess, datetime, html

ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
SITE = "https://discovery-system.ru"
AUTHOR = "Виктор Зайцев"
LINKEDIN = "https://www.linkedin.com/in/victor-zaitsev-product/"

# страницы, которые отдаём поисковикам
INDEXABLE = [
    "index.html", "clarity.html", "calculator.html", "system.html", "market.html",
    "karta-resheniy.html", "value-chain.html", "channel.html", "nacenka.html",
    "agent-failures.html", "lost-accounts.html", "proof.html", "pay.html",
    "oferta.html", "policy.html", "claude-alternativa.html",
    "reviews.html", "tseny-vnedreniy.html",
]
# служебные — только noindex
NOINDEX = ["thanks.html", "fail.html"]
# не трогаем: черновики и редиректы
UNTOUCHED = ["index-premium-v1.html", "index-premium-v2.html", "IA-JOURNEY.html",
             "SERVICE-BLUEPRINT.html", "lost-accounts-infographic.html", "polygon.html",
             "services.html"]

BLOCK_START = "<!-- SEO:CORE v1 — собирается scripts/seo-index.py, руками не править -->"
BLOCK_END = "<!-- /SEO:CORE -->"


def git_date(path):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%ad", "--date=short", "--", path],
                             capture_output=True, text=True, timeout=20, cwd=ROOT).stdout.strip()
        return out or datetime.date.today().isoformat()
    except Exception:
        return datetime.date.today().isoformat()


def head_text(h):
    m = re.search(r"<title>(.*?)</title>", h, re.S)
    return html.unescape(re.sub(r"\s+", " ", m.group(1))).strip() if m else ""


def desc_text(h):
    m = re.search(r'<meta name="description" content="(.*?)"', h, re.S)
    return html.unescape(re.sub(r"\s+", " ", m.group(1))).strip() if m else ""


def build_block(page, date, first_date, tokens):
    lines = [BLOCK_START,
             '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>',
             f'<meta name="author" content="{AUTHOR}"/>',
             f'<link rel="alternate" type="application/rss+xml" title="Discovery System — обновления" href="{SITE}/feed.xml"/>',
             f'<meta property="article:published_time" content="{first_date}"/>',
             f'<meta property="article:modified_time" content="{date}"/>']
    if tokens.get("google"):
        lines.append(f'<meta name="google-site-verification" content="{tokens["google"]}"/>')
    if tokens.get("yandex"):
        lines.append(f'<meta name="yandex-verification" content="{tokens["yandex"]}"/>')
    lines.append(BLOCK_END)
    return "\n".join(lines)


LD_RE = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
CANON_RE = r'<link[^>]*canonical[^>]*>'


def inject_block(h, block):
    if BLOCK_START in h:                      # идемпотентность: старый блок заменяем
        h = re.sub(re.escape(BLOCK_START) + r".*?" + re.escape(BLOCK_END), block, h, flags=re.S)
        return h, "updated"
    anchor = re.search(CANON_RE, h)
    if anchor:
        return h[:anchor.end()] + "\n" + block + h[anchor.end():], "inserted"
    anchor = re.search(r"<meta name=\"description\"[^>]*>", h)
    if anchor:
        return h[:anchor.end()] + "\n" + block + h[anchor.end():], "inserted(no-canonical)"
    anchor = re.search(r"</title>", h)
    return h[:anchor.end()] + "\n" + block + h[anchor.end():], "inserted(title)"


def breadcrumb(page, title):
    if page == "index.html":
        return None
    name = re.sub(r"\s*[—-]\s*Discovery System.*$", "", title).strip() or page
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Discovery System", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": name, "item": f"{SITE}/{page}"},
        ],
    }
    return ld(data)


def page_schema(page, title, desc, date):
    """Страница как сущность: даты + автор + связь с сайтом. Нужна там, где ld+json не было."""
    if page == "index.html":
        return None
    data = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": f"{SITE}/{page}#webpage",
        "url": f"{SITE}/{page}",
        "name": title or page,
        "description": desc or title or "",
        "inLanguage": "ru",
        "datePublished": date,
        "dateModified": date,
        "author": {"@id": SITE + "/#author"},
        "publisher": {"@id": SITE + "/#organization"},
        "isPartOf": {"@type": "WebSite", "url": SITE + "/", "name": "Discovery System"},
    }
    return ld(data)


def ld(data):
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "</script>"


def git_first_date(path):
    try:
        out = subprocess.run(["git", "log", "--diff-filter=A", "--format=%ad", "--date=short", "--", path],
                             capture_output=True, text=True, timeout=20, cwd=ROOT).stdout.strip().splitlines()
        return out[-1].strip() if out else git_date(path)
    except Exception:
        return git_date(path)


def dedup_head(h):
    """Убирает дубли robots/author/rss вне SEO:CORE — оставляет только управляемый блок."""
    changed = 0
    core = re.search(re.escape(BLOCK_START) + r".*?" + re.escape(BLOCK_END), h, flags=re.S)
    core_span = core.span() if core else None
    for pat in (r'<meta name="robots"[^>]*>', r'<meta name="author"[^>]*>',
                r'<link rel="alternate"[^>]*>'):
        for m in list(re.finditer(pat, h)):
            if core_span and core_span[0] <= m.start() <= core_span[1]:
                continue
            h = h[:m.start()] + h[m.end():]
            changed += 1
            core = re.search(re.escape(BLOCK_START) + r".*?" + re.escape(BLOCK_END), h, flags=re.S)
            core_span = core.span() if core else None
    return h, changed


def speakable_block():
    data = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "speakable": {"@type": "SpeakableSpecification", "cssSelector": [".lead"]},
    }
    return ld(data)


def inject_schema(h, page, title, desc, date):
    """Кладёт BreadcrumbList (и WebPage, если ld+json не было) после последнего блока или после SEO:CORE."""
    added = []
    blocks = list(re.finditer(LD_RE, h, re.S))
    insert_at = blocks[-1].end() if blocks else (re.search(re.escape(BLOCK_END), h).end() if BLOCK_END in h else None)
    if insert_at is None:
        return h, "no-anchor"
    payload = []
    if '"BreadcrumbList"' not in h:
        bc = breadcrumb(page, title)
        if bc:
            payload.append(bc); added.append("breadcrumb")
    if not blocks:
        ps = page_schema(page, title, desc, date)
        if ps:
            payload.append(ps); added.append("webpage")
    if '"SpeakableSpecification"' not in h and re.search(r'class="lead"', h):
        payload.append(speakable_block()); added.append("speakable")
    if not payload:
        return h, "exists"
    return h[:insert_at] + "\n" + "\n".join(payload) + h[insert_at:], "+".join(added)


def fix_sameas(h):
    """Дополняет sameAs профилями, которые AI-движки используют как entity-подтверждение."""
    out, changed = h, 0

    def repl(m):
        nonlocal changed
        try:
            data = json.loads(m.group(1))
        except Exception:
            return m.group(0)
        touched = False
        nodes = data if isinstance(data, list) else [data]
        for n in nodes:
            if isinstance(n, dict) and n.get("@type") in ("Person", "Organization"):
                sa = n.get("sameAs")
                if isinstance(sa, list) and LINKEDIN not in sa:
                    sa.append(LINKEDIN)
                    touched = True
            if isinstance(n, dict) and isinstance(n.get("founder"), dict):
                f = n["founder"]
                sa = f.get("sameAs")
                if isinstance(sa, list) and LINKEDIN not in sa:
                    sa.append(LINKEDIN)
                    touched = True
        if not touched:
            return m.group(0)
        changed += 1
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "</script>"

    out = re.sub(r'<script type="application/ld\+json">(.*?)</script>', repl, out, flags=re.S)
    return out, changed


def validate_jsonld(path, h):
    bad = []
    for i, b in enumerate(re.findall(LD_RE, h, re.S)):
        try:
            json.loads(b)
        except Exception as e:
            bad.append((i, str(e)[:90]))
    return bad


def main():
    dry = "--dry" in sys.argv
    tokens = {}
    for flag, key in (("--google", "google"), ("--yandex", "yandex")):
        if flag in sys.argv:
            tokens[key] = sys.argv[sys.argv.index(flag) + 1]

    report, pages_meta = [], {}
    for page in INDEXABLE + NOINDEX:
        p = os.path.join(ROOT, page)
        if not os.path.exists(p):
            report.append(f"{page}: НЕТ ФАЙЛА")
            continue
        raw = open(p, encoding="utf-8").read()
        title, date, desc = head_text(raw), git_date(page), desc_text(raw)
        first = git_first_date(page)
        pages_meta[page] = (title, desc, date)

        # canonical: если страницу отдаём поисковикам, у неё должен быть self-canonical
        if not re.search(CANON_RE, raw):
            canon = f'<link rel="canonical" href="{SITE}/" />' if page == "index.html" else f'<link rel="canonical" href="{SITE}/{page}" />'
            if re.search(r"</title>", raw):
                raw = re.sub(r"(</title>)", r"\1\n" + canon, raw, count=1)

        if page in NOINDEX:
            if 'name="robots"' in raw and "noindex" in raw:
                report.append(f"{page}: уже noindex")
            else:
                raw2 = re.sub(r'<meta name="robots"[^>]*>',
                              '<meta name="robots" content="noindex, follow"/>', raw, count=1)
                if raw2 == raw:
                    raw2 = raw.replace("</head>", '<meta name="robots" content="noindex, follow"/>\n</head>', 1)
                if not dry:
                    open(p, "w", encoding="utf-8", newline="").write(raw2)
                report.append(f"{page}: noindex")
            continue

        h, how = inject_block(raw, build_block(page, date, first, tokens))
        h, dd = dedup_head(h)
        h, bc = inject_schema(h, page, title, desc, date)
        h, sa = fix_sameas(h)
        bad = validate_jsonld(page, h)
        if bad:
            report.append(f"{page}: !! JSON-LD СЛОМАН {bad} — НЕ ПИШУ")
            continue
        if not dry and h != raw:
            open(p, "w", encoding="utf-8", newline="").write(h)
        report.append(f"{page}: core={how} dedup={dd} schema={bc} sameAs+={sa}")

    # ---- sitemap ----
    today = datetime.date.today().isoformat()
    urls = []
    for page in INDEXABLE:
        if page not in pages_meta:
            continue
        loc = SITE + "/" if page == "index.html" else f"{SITE}/{page}"
        prio = "1.0" if page == "index.html" else ("0.9" if page in ("calculator.html", "clarity.html", "pay.html") else "0.7")
        urls.append(f'  <url><loc>{loc}</loc><lastmod>{pages_meta[page][2]}</lastmod>'
                    f'<changefreq>weekly</changefreq><priority>{prio}</priority></url>')
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
               + "\n".join(urls) + "\n</urlset>\n")
    if not dry:
        open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="").write(sitemap)
    report.append(f"sitemap.xml: {len(urls)} URL")

    # ---- feed.xml (RSS 2.0 — freshness для краулеров и AI-движков) ----
    items = []
    for page in INDEXABLE:
        if page == "index.html" or page not in pages_meta:
            continue
        t, d, dt = pages_meta[page]
        try:
            pub = datetime.datetime.fromisoformat(dt).strftime("%a, %d %b %Y 00:00:00 +0300")
        except Exception:
            pub = "Thu, 01 Jan 2026 00:00:00 +0300"
        items.append(f"  <item>\n    <title>{html.escape(t)}</title>\n    <link>{SITE}/{page}</link>\n"
                     f"    <guid isPermaLink=\"true\">{SITE}/{page}</guid>\n    <pubDate>{pub}</pubDate>\n"
                     f"    <description>{html.escape(d or t)}</description>\n  </item>")
    feed = ('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n'
            f'  <title>Discovery System — обновления</title>\n  <link>{SITE}/</link>\n'
            f'  <description>ИИ-агенты для малого бизнеса в России: свои связки без VPN, разборы рынка, исследования, калькулятор.</description>\n'
            f'  <language>ru</language>\n  <lastBuildDate>{today}</lastBuildDate>\n'
            + "\n".join(items) + "\n</channel>\n</rss>\n")
    if not dry:
        open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8", newline="").write(feed)
    report.append(f"feed.xml: {len(items)} item")

    print("\n".join(report))
    print("\nDRY RUN — ничего не записано" if dry else "\nЗаписано.")


if __name__ == "__main__":
    main()
