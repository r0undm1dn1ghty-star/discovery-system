import re, io, urllib.parse as up
from html.parser import HTMLParser

files = ["index.html","market.html","system.html","channel.html","service.html","calculator.html"]

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sec = "top"
        self.secstack = []
        self.items = []
        self.cur = None
        self.buf = []
        self.depth = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "section":
            sid = a.get("id") or a.get("class","").split(" ")[0] or "section"
            self.secstack.append(sid); self.sec = sid
        if tag in ("a","button") and self.cur is None:
            cls = (a.get("class") or "")
            href = a.get("href") or ""
            if tag=="a":
                if href.startswith("#") or href=="": return
                iscta = bool(re.search(r'\bbtn\b|btn-|cta|door|shelf-row', cls)) or href.startswith(("https://t.me","calculator.html","service.html"))
                if not iscta: return
            else:
                if not re.search(r'btn|cta|door|shelf-row', cls): return
            self.cur = {"tag":tag,"class":cls,"href":href,"sec":self.sec,"text":""}
            self.depth = 0
            return
        if self.cur is not None:
            self.depth += 1
    def handle_endtag(self, tag):
        if tag == "section" and self.secstack:
            self.secstack.pop(); self.sec = self.secstack[-1] if self.secstack else "top"
        if self.cur is not None:
            if tag == self.cur["tag"] and self.depth == 0:
                self.cur["text"] = " ".join("".join(self.buf).split())[:55]
                self.items.append(self.cur)
                self.cur = None; self.buf = []
            elif self.depth>0:
                self.depth -= 1
    def handle_data(self, d):
        if self.cur is not None:
            self.buf.append(d)

def kind(it):
    c = it["class"]
    if "btn-p" in c: return "PRIMARY"
    if "btn-g" in c: return "ghost"
    if re.search(r'\bbtn\b', c): return "btn(plain)"
    if re.search(r'door|shelf-row', c): return "tile"
    if "btn-tg" in c: return "tgold"
    return "text"

for f in files:
    src = io.open(f, encoding="utf-8").read()
    p = P(); p.feed(src)
    print("="*18, f, "| CTA-ish total:", len(p.items))
    secs = {}
    for it in p.items: secs.setdefault(it["sec"], []).append(it)
    for s, its in secs.items():
        prim = sum(1 for i in its if kind(i) in ("PRIMARY","btn(plain)"))
        print(f"  -- [{s}] n={len(its)} primary-ish={prim}")
        for it in its:
            text = it["href"]
            if "text=" in text:
                try:
                    q = up.unquote(up.parse_qs(up.urlparse(text).query).get("text",[""])[0])
                except Exception: q = "?"
                text = "text=" + q[:45]
            else:
                if len(text)>50: text = text[:47]+"..."
            print(f"      {kind(it):9s} {it['text']!r:40s} -> {text}")