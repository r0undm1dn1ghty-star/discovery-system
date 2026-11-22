#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_nacenka.py — сборка полной версии nacenka.html.

База: _archive/nacenka-2026-11-09-heavy.html (дизайн и контент замера 04.11 —
проверенная поверхность, не перекрашивается). Сверху:
  1) меты под полную версию;
  2) секция каталога 18 моделей (09.11, курс 82,14) — ширины полос считаются
     из data.json по лог-шкале, ни одна цифра не набрана руками;
  3) финальная секция-воронка из лёгкой версии (гайд 3 000 / калькулятор /
     переезд 25 000 KLODNAOBOROT);
  4) ds-share.js.

Запуск: python nacenka-build/build_nacenka.py
Печатает отчёт проверки (множители, токены) и пишет nacenka.html в корень репо.
"""

import json
import math
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
BASE = REPO / "_archive" / "nacenka-2026-11-09-heavy.html"
OUT = REPO / "nacenka.html"
DATA = HERE / "data.json"

d = json.loads(DATA.read_text(encoding="utf-8"))
html = BASE.read_text(encoding="utf-8")

report = []

# ---------- 1. верификация данных heavy против пересчёта ----------
for row in d["bigtech"]:
    v, p = row["vendor"], row["platform"]
    x_in = p["in"] / v["in"]
    ok_in = abs(x_in - row["x_in"]) / row["x_in"] < 0.03
    line = f"bigtech {row['model']}: x_in {x_in:.2f} vs {row['x_in']} -> {'ok' if ok_in else 'FAIL'}"
    report.append(line)
    if not ok_in:
        sys.exit("DATA MISMATCH: " + line)
    if row.get("x_cache") and p["cache"] and v["cache"]:
        x_c = p["cache"] / v["cache"]
        ok_c = abs(x_c - row["x_cache"]) / row["x_cache"] < 0.03
        report.append(f"  x_cache {x_c:.1f} vs {row['x_cache']} -> {'ok' if ok_c else 'FAIL'}")
        if not ok_c:
            sys.exit("DATA MISMATCH cache: " + row["model"])
for row in d["year"]["rows"]:
    delta = row["platform_year"] - row["vendor_year"]
    ok = delta == row["delta"]
    report.append(f"year {row['model']} / {row['platform']}: delta {delta} vs {row['delta']} -> {'ok' if ok else 'FAIL'}")
    if not ok:
        sys.exit("DATA MISMATCH year: " + row["model"])

# разброс каталога: 12937 / 20.6 = 628 -> заголовок «в 629 раз» (шаг шкалы)
spread = d["models18"]["groups"][3]["models"][2][3] / d["models18"]["groups"][0]["models"][0][3]
spread_label = math.ceil(spread)
report.append(f"catalog spread: {spread:.1f}x -> headline 'в {spread_label} раз'")

# ---------- 2. секция каталога: ширины полос по лог-шкале ----------
# Ось: 100 ₽ -> 24.5%, 1 000 ₽ -> 60.3%, 10 000 ₽ -> 96.0% (десятилетие 35.75%)
TICK = 24.5
DEC = (96.0 - 24.5) / 2  # 35.75
def bar_w(v):
    w = TICK + (math.log10(v) - 2) * DEC
    return max(1.2, min(100.0, w))

def fmt_rub(v):
    if v >= 1000:
        s = f"{v:,.0f}".replace(",", " ")
    elif v >= 100:
        s = f"{v:.0f}"
    else:
        s = f"{v:.1f}".replace(".", ",")
    return s

bars, table_rows = [], []
for g in d["models18"]["groups"]:
    bars.append(f'<div class="tg">— {g["label"]} —</div>')
    for name, fin, fout, month in g["models"]:
        w = bar_w(month)
        bars.append(
            f'<div class="br {g["tier"]}" title="{name}: {fmt_rub(month)} ₽/мес">'
            f'<span class="bn">{name}</span><span class="bt"><i style="width:{w:.1f}%"></i></span>'
            f'<span class="bv">{fmt_rub(month)} ₽</span></div>'
        )
        table_rows.append(
            f"<tr><td>{name}</td><td class=\"n\">{fin}</td><td class=\"n\">{fout}</td>"
            f"<td class=\"n\">{fmt_rub(month)}</td></tr>"
        )

cat_css = """
/* каталог 18 моделей: полосы на лог-шкале (тёмная тема) */
.cbr{display:grid;grid-template-columns:196px 1fr 104px;align-items:center;gap:12px;padding:3px 0}
.cbn{font-size:14px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbt{position:relative;height:15px;background:rgba(255,255,255,.07);border-radius:3px}
.cbt i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;display:block}
.c1 .cbt i{background:rgba(143,168,255,.42)}.c2 .cbt i{background:rgba(143,168,255,.6)}
.c3 .cbt i{background:rgba(143,168,255,.8)}.c4 .cbt i{background:#8fa8ff}
.cbv{font:500 14px/1 var(--mono);text-align:right;color:var(--body);font-variant-numeric:tabular-nums}
.cax{position:relative;height:18px;margin:6px 0 4px;margin-left:208px;margin-right:104px}
.ctk{position:absolute;top:0;transform:translateX(-50%);font:400 13px/1 var(--mono);color:var(--meta);white-space:nowrap}
.ctk.lgs{left:0!important;transform:none;color:var(--meta)}
.cgl{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.14);pointer-events:none}
.cbr{position:relative;z-index:1}
@media(max-width:720px){
 .cbr{grid-template-columns:1fr 74px;grid-template-areas:"n v" "b b";gap:2px 10px;padding:6px 0}
 .cbn{grid-area:n}.cbt{grid-area:b}.cbv{grid-area:v}.cbn{white-space:normal}
 .cax{margin-left:0;margin-right:74px}.ctk{font-size:12px}
}
@media(prefers-reduced-motion:no-preference){.cbt i{transition:width .6s cubic-bezier(.22,.61,.36,1)}}
"""

cax = ('<div class="cax"><span class="ctk lgs">лог. шкала →</span>'
       '<span class="ctk" style="left:24.5%">100 ₽</span>'
       '<span class="ctk" style="left:60.3%">1 000 ₽</span>'
       '<span class="ctk" style="left:96.0%">10 000 ₽</span></div>')
gl_lines = "".join(f'<i class="cgl" style="left:{x}%"></i>' for x in (24.5, 60.3, 96.0))

big_blocks = "".join(
    f'<div><b>{b["b"]}</b><span>{b["s"]}</span></div>' for b in d["models18"]["big"]
)

catalog_section = f"""<style>{cat_css}</style>
<section id="catalog"><div class="wrap"><div class="section-head"><div><p class="eyebrow rv">каталог · 09.11.2026 · курс ЦБ {d['meta']['catalog_rate']} ₽/$</p><h2 class="rv">Разброс в {spread_label} раз — ещё до всякой наценки</h2></div><p>18 моделей, одна нагрузка: 1 000 обращений, 3 вызова на сообщение, 1 500 токенов входа и 400 выхода на вызов. Это каталожные цены провайдеров — так считает весь рынок. Платить по ним из РФ картой нельзя.</p></div>
{cax}
<div class="chart-wrap" style="position:relative">{gl_lines}{''.join(bars)}</div>
<p class="pp-foot">Шкала логарифмическая, иначе дешёвые сливаются в точку. Проверяется в любой момент: цены публичные.</p>
<div class="hero-stats rv" style="margin-top:34px">{big_blocks}</div>
<details style="margin-top:26px;border-top:1px solid var(--line-soft);padding-top:14px"><summary>Открыть таблицу: вход, выход, стоимость в месяц</summary>
<table><thead><tr><th>Модель</th><th class="n">Вход, $/1М</th><th class="n">Выход, $/1М</th><th class="n">₽/мес</th></tr></thead>
<tbody>{''.join(table_rows)}</tbody></table>
<p class="pp-foot" style="margin-top:14px">{d['models18']['published_note']}. Методика: счёт = цена за 1 млн токенов × объём (4,5 млн входа + 1,2 млн выхода) × курс {d['meta']['catalog_rate']} ₽. Без скидок за кэш и батч, без ретраев и «служебных» вызовов агента — реальный счёт выше на 10–40%. У РФ-каналов другой прайс: там кэш учтён по их политике (45–70% входа читается дешевле) — поэтому «то же самое дешевле» здесь не сравнивают напрямую, а показывают вилку 4 700–7 400 ₽.</p>
</details>
<p class="bridge">Это цена модели в витрине. <b>Дальше — то, чем реально платят из РФ</b>: платформа бигтеха берёт ту же модель и добавляет «законную архитектуру». Главный разрыв прячется не на входе.</p>
</div></section>
"""

# ---------- 3. сборка ----------
# 3.1 меты
html = html.replace(
    "<title>Наценка платформ на ИИ: одна модель, разная цена</title>",
    "<title>Наценка на ИИ: каталог 18 моделей, бигтех и кэш — где прячется переплата</title>")
html = html.replace(
    '<meta name="description" content="Замер 04.11.2026: та же модель у разработчика и у посредника. Чтение из кэша дороже в 153 раза, вход — в 12. Как проверить свою платформу.">',
    '<meta name="description" content="Полный замер: 18 моделей в каталоге от 21 до 12 937 ₽/мес, платформа бигтеха — ×12 на входе и ×153 на кэше. Проверка своей платформы по трём строкам прайса.">')
html = html.replace(
    '<meta property="og:title" content="Одна модель: вендор против бигтеха — наценка на токены и кэш">',
    '<meta property="og:title" content="Наценка на ИИ: каталог, бигтех и кэш — где прячется переплата">')
html = html.replace(
    '<meta property="og:description" content="Яндекс, Cloud.ru, MWS против вендора. Одна модель, наценка на вход ×1,5–×12, на кэш ×153. Selectel — дешевле вендора.">',
    '<meta property="og:description" content="18 моделей: разброс 629× ещё до наценки. Платформа бигтеха: ×12 на входе, ×153 на кэше. Selectel — дешевле вендора. Проверь свою платформу по трём строкам прайса.">')

# 3.2 каталог — перед секцией бигтеха
assert '<section id="bigtech">' in html
html = html.replace('<section id="bigtech">', catalog_section + '\n<section id="bigtech">', 1)
report.append("catalog section: inserted before #bigtech")

# 3.3 финальная воронка (проза из лёгкой версии) — перед </main>
funnel = """<section id="chto-delat"><div class="wrap">
<p class="eyebrow rv">что с этим делать</p>
<h2 class="rv">Дешёвая модель не экономит. Экономит связка под задачу.</h2>
<p class="rv">В гайде «20 конфигураций» — какая модель под какую задачу, что живёт без VPN, сколько выходит в месяц по РФ-каналам оплаты и что окупается за первый месяц. Разово 3 000 ₽, доступ навсегда. Ставишь сам за 3–4 часа, без кода.</p>
<div class="cta-row rv"><a class="btn btn-primary" href="pay.html">Забрать гайд — 3 000 ₽</a><a class="btn btn-ghost" href="calculator.html">Посчитать своё владение →</a></div>
<p class="pp-foot">Агент уже стоит, но счёт растёт — переезд на модели с оплатой из РФ: от 25 000 ₽, с промокодом <b>KLODNAOBOROT</b> 22 500 ₽. <a href="service.html#optimization">Что входит →</a></p>
</div></section>
"""
assert "</main>" in html
html = html.replace("</main>", funnel + "</main>", 1)
report.append("funnel section: appended before </main>")

# 3.4 ds-share.js — после ds-mnav
old_tail = '<script src="ds-mnav.js?v=20261109b" defer></script>\n</body>'
assert old_tail in html
html = html.replace(old_tail, '<script src="ds-mnav.js?v=20261109b" defer></script>\n<script src="ds-share.js" defer></script>\n</body>', 1)
report.append("ds-share.js: wired")

# 3.5 проверка: у heavy верстка reveal .rv — контент виден без JS (страховка уже в heavy)
checks = [
    ("ym-slot", "ym-slot.js" in html),
    ("моделей в таблице", html.count("<tr><td>") == 18),
    ("prov-pick script", "prov_pick" in html),
    ("cache-calc script", "ccRange" in html),
    ("законы", "152-ФЗ" in html),
    ("выводы 01–05", "concl hot" in html),
    ("share block", "ds-share.js" in html),
    ("каталог-секция", 'id="catalog"' in html),
]
report.append("--- checks ---")
for name, ok in checks:
    report.append(f"{name}: {'ok' if ok else 'FAIL'}")
    if not ok:
        sys.exit("CHECK FAIL: " + name)

OUT.write_text(html, encoding="utf-8")
report.append(f"--- written: {OUT} ({OUT.stat().st_size} bytes) ---")
print("\n".join(report))
