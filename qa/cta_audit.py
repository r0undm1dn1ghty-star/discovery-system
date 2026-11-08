# -*- coding: utf-8 -*-
"""Full CTA inventory: every preset link, button, quiet link, with section context + decoded ?text=."""
import io, re, sys, json, urllib.parse as up
from html.parser import HTMLParser

R = "C:/Users/Victor/Desktop/hermes_work/discovery-system-repo/"
FILES = sys.argv[1:] or ["index.html","market.html","system.html","channel.html","service.html","calculator.html"]

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.stack=[]; self.sec="top"; self.items=[]; self.cur=None; self.depth=0; self.buf=[]
        self.marker=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=="section":
            sid=a.get("id") or a.get("class") or "section"
            self.stack.append(sid); self.sec=sid
        if self.cur is None and tag=="a":
            href=a.get("href") or ""
            self.cur={"tag":tag,"class":a.get("class") or "","href":href,"sec":self.sec,"id":a.get("id") or "","text":""}
            self.depth=0; return
        if self.cur is not None:
            self.depth+=1
    def handle_startendtag(self, tag, attrs):
        pass
    def handle_endtag(self, tag):
        if tag=="section" and self.stack:
            self.stack.pop(); self.sec=self.stack[-1] if self.stack else "top"
        if self.cur is not None:
            if tag=="a" and self.depth==0:
                self.cur["text"]=" ".join("".join(self.buf).replace("&amp;","&").split())[:70]
                self.items.append(self.cur); self.cur=None; self.buf=[]
            elif self.depth>0:
                self.depth-=1
    def handle_data(self,d):
        if self.cur is not None: self.buf.append(d)

def decode(h):
    if "?text=" not in h: return None
    q=h.split("text=",1)[1]
    return up.unquote(q).replace("+"," ")

for f in FILES:
    src=io.open(R+f,encoding="utf-8").read()
    p=P(); p.feed(src)
    rows=[]
    for it in p.items:
        h=it["href"]
        t=decode(h)
        if not (t is not None or h.startswith(("calculator.html","service.html","https://t.me/","#"))):
            continue
        if h.startswith("#"): continue
        c=it["class"]
        kind = "PRIMARY" if "btn-p" in c else ("ghost" if "btn-g" in c else ("btn" if re.search(r"\bbtn\b",c) else ("tile" if re.search(r"door|shelf",c) else "link")))
        rows.append({**it,"kind":kind,"text_dec":t})
    presets=[r for r in rows if r["text_dec"]]
    uniq={}
    for r in presets: uniq.setdefault(r["text_dec"],[]).append(r)
    print("="*16, f, "| links:",len(rows), "| presets:",len(presets), "| unique:",len(uniq),
          "| primaries:",sum(1 for r in rows if r["kind"]=="PRIMARY"))
    for r in rows:
        t=(r["text_dec"] or r["href"])[:110].replace("\n"," ")
        print(f'  [{r["sec"]:<12}] {r["kind"]:<8} {r["text"]!r:<46} -> {t}')
    d=[k for k,v in uniq.items() if len(v)>1]
    if d:
        print("  DUP presets:", len(d))
        for k in d: print("    x%d %s" % (len(uniq[k]), k[:110]))