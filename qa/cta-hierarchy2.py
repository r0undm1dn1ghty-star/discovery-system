# -*- coding: utf-8 -*-
"""СТА-иерархия CTA — часть 2: channel, service, calculator."""
import io, re, urllib.parse as up
R = "C:/Users/Victor/Desktop/hermes_work/discovery-system-repo/"
def read(f): return io.open(R+f, encoding="utf-8").read()
def write(f, s): io.open(R+f, "w", encoding="utf-8", newline="").write(s)
def sub(src, pat, repl, n=1):
    out, cnt = re.subn(pat, repl, src, flags=re.S)
    if cnt != n: raise SystemExit("FAIL %d/%d: %s" % (cnt, n, pat[:80]))
    return out
def tg(t): return "https://t.me/victorpinksight?text=" + up.quote(t, safe="")

# channel
f = "channel.html"; s = read(f)
s = sub(s, r'min-height:54px;padding:14px 30px;border-radius:10px;font-size:15\.5px;font-weight:500;text-decoration:none;border:1px solid transparent',
        'min-height:52px;padding:13px 28px;border-radius:10px;font-size:15.5px;font-weight:500;text-decoration:none;border:1px solid transparent')
s = sub(s, r'<div class="cta fx">\s*<a class="btn btn-p" href="https://t\.me/discoverysystem">Читать канал · 0 ₽</a>\s*'
           r'<a class="btn btn-g" href="(https://t\.me/victorpinksight\?text=[^"]*)">Разбор лично</a>\s*</div>',
        lambda m: ('<div class="cta fx">\n<a class="btn btn-p" href="https://t.me/discoverysystem">Читать канал · 0 ₽</a>\n</div>\n'
                   '<p class="quiet">или личный разбор — <a href="' + m.group(1) + '">t.me/victorpinksight</a></p>'))
s = sub(s, r'<a href="https://t\.me/victorpinksight">t\.me/victorpinksight</a>',
        '<a href="' + tg("Здравствуйте! Пришёл со страницы «Канал» — нужен разбор моей связки.") + '">t.me/victorpinksight</a>')
s = sub(s, r'(\.btn-g:hover\{border-color:var\(--acc\);color:var\(--acc\)\})',
        r'\1\n.quiet{font-size:15px;color:var(--meta);margin-top:24px}\n.zone-dark .quiet{color:rgba(238,242,251,.72)}\n.quiet a{color:var(--acc)}')
write(f, s); print("channel OK")

# service
f = "service.html"; s = read(f)
s = sub(s, r'\.btn-s\{min-height:46px;padding:11px 22px;font-size:14\.5px\}',
        '.btn-s{min-height:48px;padding:12px 22px;font-size:15px}\n.quiet{font-size:15px;color:rgba(238,242,251,.72);margin-top:24px}\n.quiet a{color:#8fa8ff}')
s = sub(s, r'<div class="cta fx" style="animation-delay:\.14s">\s*'
           r'<a class="btn btn-p" href="(https://t\.me/victorpinksight\?text=[^"]*)">Описать задачу</a>\s*'
           r'<a class="btn btn-g" href="calculator\.html">Посчитать связку</a>\s*'
           r'<a class="btn btn-g" href="https://t\.me/discoverysystem">Канал: разборы и сигналы рынка</a>\s*</div>',
        lambda m: ('<div class="cta fx" style="animation-delay:.14s">\n'
                   '<a class="btn btn-p" href="' + m.group(1) + '">Описать задачу</a>\n</div>\n'
                   '<p class="quiet">или сначала прикинуть — <a href="calculator.html">калькулятор 0 ₽</a> · сигналы и разборы — <a href="https://t.me/discoverysystem">в канале</a></p>'))
s = sub(s, r'<a class="btn btn-p btn-s" id="omBtn" href="https://t\.me/victorpinksight">',
        '<a class="btn btn-p btn-s" id="omBtn" href="' + tg("Виктор, привет! Пришёл со страницы «Сервис» — опишу задачу, подскажи формат и цену.") + '">')
s = sub(s, r'<span>Личка: <a href="https://t\.me/victorpinksight">t\.me/victorpinksight</a></span>',
        '<span>Личка: <a href="' + tg("Виктор, привет! Пришёл со страницы «Сервис» — вопрос по двери и цене.") + '">t.me/victorpinksight</a></span>')
write(f, s); print("service OK")

# calculator
f = "calculator.html"; s = read(f)
s = sub(s, r'\.btn-cta\{width:100%;background:var\(--btn\);color:var\(--btn-t\);border:none;border-radius:10px;padding:16px;font-size:16px;font-weight:500;cursor:pointer;transition:\.15s;font-family:inherit\}',
        '.btn-cta{width:100%;min-height:52px;background:var(--btn);color:var(--btn-t);border:none;border-radius:10px;padding:15px 24px;font-size:15.5px;font-weight:500;cursor:pointer;transition:.15s;font-family:inherit}')
s = sub(s, r'<button class="btn-cta" id="orderBtn" style="width:100%">', '<button class="btn-cta btn-cta-ghost" id="orderBtn" style="width:100%">')
s = sub(s, r'<a href="https://t\.me/victorpinksight">t\.me/victorpinksight</a>',
        '<a href="' + tg("Виктор, привет! Пришёл из калькулятора — вопрос по расчёту и связке.") + '">t.me/victorpinksight</a>')
write(f, s); print("calculator OK")
print("PART2 OK")