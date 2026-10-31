#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""indexnow-submit.py — подаёт все URL из sitemap.xml в IndexNow (Bing, Yandex).

Требует: файл <ключ>.txt в корне сайта с ключом внутри (уже лежит в репозитории).
Запуск:  python3 scripts/indexnow-submit.py [--dry]
"""
import os, re, sys, json, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
HOST = "discovery-system.ru"
KEY_PATH = os.path.join(ROOT, "scripts", "indexnow-key.txt")

ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
    "https://www.bing.com/indexnow",
]


def urls():
    xml = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    return sorted(set(re.findall(r"<loc>(.*?)</loc>", xml)))


def main():
    key = open(KEY_PATH, encoding="utf-8").read().strip()
    payload = {
        "host": HOST,
        "key": key,
        "keyLocation": f"https://{HOST}/{key}.txt",
        "urlList": urls(),
    }
    print(f"ключ: {key}\nURL: {len(payload['urlList'])}")
    if "--dry" in sys.argv:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return
    body = json.dumps(payload).encode()
    for ep in ENDPOINTS:
        req = urllib.request.Request(ep, data=body,
                                     headers={"Content-Type": "application/json; charset=utf-8"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                print(f"{ep}: HTTP {r.status} {'OK' if r.status in (200, 202) else ''}")
        except urllib.error.HTTPError as e:
            print(f"{ep}: HTTP {e.code} {e.read()[:200]!r}")
        except Exception as e:
            print(f"{ep}: ошибка {e}")


if __name__ == "__main__":
    main()
