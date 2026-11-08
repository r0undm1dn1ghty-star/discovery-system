import re, sys, json, io
from html.parser import HTMLParser

files = ["index.html","market.html","system.html","channel.html","service.html","calculator.html"]

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sec = "?"
        self.stack = []
        self.items = []
        self.cur = None
        self.buf = []
        self.depth = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("section","div") and a.get("id") and a.get("id") not in ("","top"):
            if self.cur is None:
                self.sec = a.get("id")
        cls = (a.get("class") or "")
        iscta = False
        if tag == "a":
            if re.search(r'\bbtn\b|btn-|cta|link-', cls) or (a.get("href","").startswith(("https://t.me","calculator.html")) ):
                iscta = True
        elif tag == "button":
            iscta = True
        if iscta and self.cur is None:
            self.cur = {"tag":tag,"class":cls,"href":a.get("href",""),"id":a.get("id",""),"sec":self.sec,"text":""}
            self.depth = 0
        elif self.cur is not None:
            self.depth += 1
    def handle_endtag(self, tag):
        if self.cur is not None:
            if tag == self.cur["tag"] and self.depth == 0:
                self.cur["text"] = " ".join("".join(self.buf).split())[:60]
                self.items.append(self.cur)
                self.cur = None; self.buf = []
            elif self.depth>0:
                self.depth -= 1
    def handle_data(self, d):
        if self.cur is not None:
            self.buf.append(d)

for f in files:
    src = io.open(f, encoding="utf-8").read()
    p = P(); p.feed(src)
    print("="*20, f, "total CTA:", len(p.items))
    for i,it in enumerate(p.items,1):
        href = it["href"]
        if len(href)>70: href = href[:67]+"..."
        print(f'{i:2d} [{it["sec"]}] <{it["tag"]} class="{it["class"]}"> {it["text"]!r} -> {href}')