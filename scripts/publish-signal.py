# -*- coding: utf-8 -*-
"""Публикация сигнала спроса (TG-радар) в граф channel.html.

Вход: JSON-файл вида
  {"date": "2026-11-05", "category": "hot|warm",
   "title": "суть заказа одной строкой", "budget": "до 50 000 ₽ | нет в посте",
   "url": "https://t.me/channel/123", "source": "имя канала", "note": ""}

Что делает: добавляет узел «спрос» + источник + ребро в var DATA channel.html,
перегенерирует llms/feed/sitemap, коммитит явным списком и пушит (деплой Pages).
Дедуп по URL сигнала. Файл после успеха переименовывается в published/.

Запуск:  python scripts/publish-signal.py <файл.json> [--dry-run]
"""
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHANNEL = ROOT / "channel.html"

COLOR = {"background": "rgba(22,27,48,.95)", "border": "#f0b24a"}
FONT = {"color": "#eef1f8", "size": 13, "face": "IBM Plex Sans"}
SRC_COLOR = {"background": "rgba(35,42,63,.9)", "border": "#8fa3c8"}
SRC_FONT = {"color": "#aab4c8", "size": 12}
EDGE_COLOR = {"color": "rgba(143,163,200,.35)"}


def load_data(html):
    i = html.find("var DATA")
    dec = json.JSONDecoder()
    obj, end = dec.raw_decode(html[i + len("var DATA"):].lstrip()[1:].rjust(0) if False else html[i:].split("=", 1)[1].lstrip())
    return obj, html[i:].split("=", 1)[1].lstrip()[end:].lstrip().lstrip(";").strip()


def main():
    args = [a for a in sys.argv[1:]]
    dry = "--dry-run" in args
    args = [a for a in args if not a.startswith("--")]
    if not args:
        print("SIGNAL_PUBLISH_ERR=no_input_file")
        sys.exit(1)
    src = Path(args[0])
    sig = json.loads(src.read_text(encoding="utf-8"))
    for k in ("date", "category", "title", "url", "source"):
        if not sig.get(k):
            print(f"SIGNAL_PUBLISH_ERR=missing_field:{k}")
            sys.exit(1)
    if sig["category"] not in ("hot", "warm"):
        print("SIGNAL_PUBLISH_ERR=bad_category:" + sig["category"])
        sys.exit(1)

    html = CHANNEL.read_text(encoding="utf-8")
    if sig["url"] in html:
        print("SIGNAL_PUBLISH_SKIP=already_in_page:" + sig["url"])
        src.rename(src.parent / "published" / src.name)
        sys.exit(0)

    i = html.find("var DATA")
    dec = json.JSONDecoder()
    tail = html[i:].split("=", 1)[1].lstrip()
    data, end = dec.raw_decode(tail)
    rest = tail[end:].lstrip().lstrip(";").strip()

    d = datetime.strptime(sig["date"], "%Y-%m-%d")
    dmy = d.strftime("%d.%m.%Y")
    ts = d.strftime("%Y%m%d") + "-" + datetime.now().strftime("%H%M%S")
    sid, srcid = f"sR{ts}", f"srcR{ts}"
    budget = sig.get("budget") or "бюджет не указан"
    note = sig.get("note") or ""
    esc = lambda s: s.replace("<", "&lt;")
    claim = esc(sig["title"])
    node = {
        "id": sid, "label": claim[:60] + ("…" if len(claim) > 60 else ""),
        "group": "signal",
        "title": (f"<b>{dmy}</b><br>Заказ: {claim}. Бюджет: {esc(budget)}<br><br>"
                  f"<i>{esc(note) or 'проверь, что это внедрение агента, а не чат-бота'}</i><br>"
                  f"<a href=\"{esc(sig['url'])}\" target=\"_blank\">{esc(sig['source'])} · сигнал спроса</a>"),
        "shape": "box", "color": COLOR, "font": FONT, "borderWidth": 2, "margin": 10,
        "date": dmy, "type": "спрос", "topics": ["Спрос и заказы"],
    }
    snode = {"id": srcid, "label": esc(sig["source"])[:40], "group": "source",
             "shape": "hexagon", "color": SRC_COLOR, "font": SRC_FONT, "margin": 8}
    edge = {"from": sid, "to": srcid, "color": EDGE_COLOR, "width": 1}
    data["nodes"] = [node, snode] + data["nodes"]
    data["edges"] = [edge] + data.get("edges", [])

    new_obj = json.dumps(data, ensure_ascii=False, separators=(",", ": "))

    # корректная склейка хвоста: rest уже без ';'
    new_html = html[:i] + "var DATA = " + new_obj + ";\n" + rest
    CHANNEL.write_text(new_html, encoding="utf-8", newline="\n")

    # JSON-валидность: повторный разбор
    chk_html = CHANNEL.read_text(encoding="utf-8")
    chk_tail = chk_html[chk_html.find("var DATA"):].split("=", 1)[1].lstrip()
    json.JSONDecoder().raw_decode(chk_tail)

    if not dry:
        subprocess.run([sys.executable, str(ROOT / "scripts" / "seo-index.py")], check=True, cwd=ROOT)
        subprocess.run([sys.executable, str(ROOT / "scripts" / "build-llms-full.py")], check=True, cwd=ROOT)
        files = ["channel.html", "llms-full.txt", "llms.txt", "feed.xml", "sitemap.xml"]
        files = [f for f in files if (ROOT / f).exists()]
        subprocess.run(["git", "add", *files], check=True, cwd=ROOT)
        msg = f"signal: {sig['title'][:70]} ({sig['category']}, {dmy}, {sig['source']})"
        r = subprocess.run(["git", "commit", "-m", msg], cwd=ROOT, capture_output=True, text=True)
        if r.returncode != 0:
            print("SIGNAL_PUBLISH_ERR=commit:" + r.stdout[-200:] + r.stderr[-200:])
            sys.exit(1)
        subprocess.run(["git", "push", "origin", "main"], check=True, cwd=ROOT)
        src.rename(src.parent / "published" / src.name)
    print(f"SIGNAL_PUBLISH_OK={sid} dry={dry}")


if __name__ == "__main__":
    main()
