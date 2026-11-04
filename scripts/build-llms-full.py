#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build-llms-full.py — перегенерирует llms-full.txt из llms.txt + фактических страниц.

Питфолл, ради которого скрипт существует: llms-full — генерируемый дамп. Править руками —
получить устаревшие цены рядом с живым сайтом. После любых правок страниц: прогон этого скрипта.
"""
import os, re, html

ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
PAGES = [
    "index.html", "market.html", "karta-resheniy.html", "system.html", "proof.html",
    "clarity.html", "channel.html", "calculator.html", "agent-bez-vpn.html",
    "claude-alternativa.html", "lost-accounts.html", "agent-failures.html",
    "nacenka.html", "value-chain.html", "pay.html", "reviews.html",
]

SKIP_TAGS = re.compile(r"<(script|style|noscript)[^>]*>.*?</\1>", re.S | re.I)
BLOCK_RE = re.compile(r"<(script|style|noscript)[^>]*>.*?</\1>", re.S | re.I)
TAG_RE = re.compile(r"<[^>]+>")


def visible_text(path):
    h = open(os.path.join(ROOT, path), encoding="utf-8").read()
    h = BLOCK_RE.sub(" ", h)
    h = re.sub(r"<(br|/p|/h[1-6]|/li|/tr)[^>]*>", "\n", h, flags=re.I)
    txt = TAG_RE.sub(" ", h)
    txt = html.unescape(txt)
    txt = re.sub(r"[ \t]+", " ", txt)
    txt = re.sub(r"\n\s*\n+", "\n\n", txt)
    return txt.strip()


def title_of(h):
    m = re.search(r"<title>(.*?)</title>", h, re.S)
    return html.unescape(re.sub(r"\s+", " ", m.group(1))).strip() if m else path


out = ["# Discovery System — llms-full", "",
       "> Полный дамп контента для LLM. Источник: https://discovery-system.ru/ "
       "(актуальные цены и факты — в llms.txt, этот файл — развернутое содержимое страниц).", ""]
for p in PAGES:
    path = os.path.join(ROOT, p)
    if not os.path.exists(path):
        print(f"пропущен, нет файла: {p}")
        continue
    h = open(path, encoding="utf-8").read()
    out += [f"### {title_of(h)}", "", visible_text(p), ""]
    print(f"+ {p}: {len(out[-2])} символов")

open(os.path.join(ROOT, "llms-full.txt"), "w", encoding="utf-8", newline="\n").write("\n".join(out))
print(f"\nllms-full.txt перегенерирован: {PAGES and len(PAGES)} страниц")
