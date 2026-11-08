import re, io, urllib.parse as up
from html.parser import HTMLParser

files = ["index.html","market.html","system.html","channel.html","service.html","calculator.html"]

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sec = "top"; self.n = 0; self.b = 0
        self.stack = []; self.items = []
        self.cur=None; self.buf=[]; self.depth=0
        self.in_nav=0; self.in_footer=0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "nav" and not a.get("class"): self.in_nav += 1
        if tag == "footer": self.in_footer += 1
        if tag == "section":
            self.n += 1
            sid = a.get("id") or "s%d(%s)" % (self.n, (a.get("class") or "").split(" ")[0] or "")
            self.stack.append(sid); self.sec = sid
        elif tag == "div" and a.get("id") and not self.stack:
            self.b += 1; self.sec = "block:" + a["id"]
        if tag in ("a","button") and self.cur is None:
            cls=(a.get("class") or ""); href=a.get("href") or ""
            if tag=="a":
                if not href or href.startswith("#"): return
                if not (re.search(r'\bbtn\b|btn-|cta|door|shelf-row', cls) or href.startswith(("https://t.me","calculator.html","service.html"))): return
            else:
                if not re.search(r'btn|cta|door|shelf-row', cls): return
            ctx = "NAV" if self.in_nav else ("FOOTER" if self.in_footer else self.sec)
            self.cur={"tag":tag,"class":cls,"href":href,"sec":ctx,"text":""}; self.depth=0; return
        if self.cur is not None: self.depth += 1
    def handle_endtag(self, tag):
        if tag=="nav" and self.in_nav: self.in_nav-=1
        if tag=="footer" and self.in_footer: self.in_footer-=1
        if tag=="section" and self.stack:
            self.stack.pop(); self.sec = self.stack[-1] if self.stack else "top"
        if self.cur is not None:
            if tag==self.cur["tag"] and self.depth==0:
                self.cur["text"]=" ".join("".join(self.buf).split())[:50]
                self.items.append(self.cur); self.cur=None; self.buf=[]
            elif self.depth>0: self.depth-=1
    def handle_data(self,d):
        if self.cur is not None: self.buf.append(d)

def kind(it):
    c=it["class"]
    if "btn-cta-ghost" in c or "btn-g" in c or "btn-ghost" in c: return "ghost"
    if "btn-p" in c or "btn-cta" in c or re.search(r'\bbtn\b',c): return "PRIMARY"
    if re.search(r'door|shelf-row',c): return "tile"
    return "text"

tot=0
for f in files:
    p=P(); p.feed(io.open(f,encoding="utf-8").read())
    secs={}
    for it in p.items: secs.setdefault(it["sec"],[]).append(it)
    tp=sum(1 for i in p.items if kind(i)=="PRIMARY")
    print("="*16,f,"| CTA:",len(p.items),"| PRIMARY:",tp)
    for s,its in secs.items():
        prim=sum(1 for i in its if kind(i)=="PRIMARY")
        flag=" <<<" if prim>1 else ""
        print("  [%s] n=%d primary=%d%s %s"%(s,len(its),prim,flag,
              " ".join(kind(i)[:2] for i in its)))