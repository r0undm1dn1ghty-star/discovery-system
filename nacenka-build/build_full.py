#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_full.py — сборка полной (heavy) версии nacenka.html.
Замена build_nacenka.py: все выводные числа считаются из атомарных таблиц
data.json; в prose heavy найдены расхождения с таблицами (см. report).
Запуск: python nacenka-build/build_full.py -> nacenka.html + отчёт.
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

d = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
html = BASE.read_text(encoding="utf-8")

def ru(n):
    s = f"{n:,.0f}".replace(",", " ")
    return s.replace("-", "−")

def signed(n):
    return ("+" if n >= 0 else "−") + ru(abs(n))

def fx(x):
    if x >= 100: return f"×{x:.0f}"
    if x >= 10: return "×" + f"{x:.1f}".replace(".", ",")
    return "×" + f"{x:.2f}".replace(".", ",")

def impl(delta):
    k = round(abs(delta) / 49990)
    return (f"{'+' if delta >= 0 else '−'}{k}") if k >= 1 else "—"

def rub2(v):
    return str(v).replace(".", ",")

log = []

# ================= 1. производные =================
bt = {r["model"]: r for r in d["bigtech"]}
FLASH = bt["DeepSeek V4 Flash"]
SEL = bt["DeepSeek V4.1 Flash · контроль"]

x_flash_in = FLASH["platform"]["in"] / FLASH["vendor"]["in"]
x_flash_cache = FLASH["platform"]["cache"] / FLASH["vendor"]["cache"]
x_sel_in = SEL["platform"]["in"] / SEL["vendor"]["in"]
x_sel_cache = SEL["platform"]["cache"] / SEL["vendor"]["cache"]
assert abs(x_flash_cache - 153) < 1 and abs(x_flash_in - 12.2) < 0.15

year_rows = [{**r, "delta": r["platform_year"] - r["vendor_year"]} for r in d["year"]["rows"]]
year_sum = lambda p: sum(r["delta"] for r in year_rows if r["platform"] == p)
sum_cloud, sum_mts, sum_sel = year_sum("Cloud.ru"), year_sum("МТС MWS"), year_sum("Selectel ИИ-роутер")
cloud_in = [bt["DeepSeek V4 Pro"]["x_in"], d["bigtech"][2]["x_in"]]
flash_cloud = next(r for r in year_rows if r["model"].startswith("DeepSeek V4 Flash") and r["platform"] == "Cloud.ru")
model45 = next(r for r in year_rows if r["model"] == d["year"]["rows"][4]["model"])
mts_in = [bt["Qwen3.6 35B"]["x_in"], bt["GLM 5.3"]["x_in"]]
m5 = next(c for c in d["matrix"][1]["cells"] if c["who"] == "ProxyAPI")
BT46 = d["bigtech"][2]["model"]
M5 = d["matrix"][1]["model"]

log += [
    f"x_flash_in={x_flash_in:.2f} x_flash_cache={x_flash_cache:.1f} x_sel_in={x_sel_in:.2f} x_sel_cache={x_sel_cache:.2f}",
    f"flash_cloud_delta={flash_cloud['delta']} (heavy: +32 040)",
    f"sum_cloud={sum_cloud} (heavy: +3 386 556)",
    f"sum_mts={sum_mts} (heavy: +1 600 308)",
    f"sum_sel={sum_sel} (heavy: −642 996)",
]

# ================= 2. генерация =================
HERO_STATS = (f'<div class="hero-stats rv"><div class="hero-stat"><strong>4</strong><span>платформы бигтеха в замере</span></div>'
              f'<div class="hero-stat"><strong class="loss">{fx(x_flash_in)}</strong><span>максимум на входе: Яндекс, DeepSeek V4 Flash</span></div>'
              f'<div class="hero-stat"><strong class="loss">{fx(x_flash_cache)}</strong><span>наценка на кэш: Яндекс, DeepSeek V4 Flash</span></div>'
              f'<div class="hero-stat"><strong class="accent">{fx(x_sel_in)}</strong><span>бывает и дешевле вендора: Selectel, та же модель</span></div></div>')

HERO_FOCUS = (f'<div class="hero-focus rv"><span class="focus-label">главный разрыв · DeepSeek V4 Flash, чтение из кэша</span>'
              f'<div class="focus-line"><b>{rub2(FLASH["vendor"]["cache"])} ₽</b><span class="arrow">→</span>'
              f'<b>{ru(FLASH["platform"]["cache"])} ₽</b><span class="delta">{fx(x_flash_cache)} за 1 млн токенов</span></div>'
              f'<p class="focus-note">Вендор берёт $0,006 за миллион токенов, прочитанных из кэша DeepSeek. Яндекс AI Studio берёт 0,075 ₽ за 1 000 токенов — это {ru(FLASH["platform"]["cache"])} ₽ за миллион. Модель та же, кэш тот же. Вход подорожал в 12 раз, кэш — в 153.</p>'
              f'<p class="focus-note hero-cache"><b>Дело не в «российском облаке»:</b> Selectel на той же модели берёт за вход {rub2(SEL["platform"]["in"])} ₽ за миллион — дешевле вендора. Разницу делает не страна, а то, сколько платформа кладёт сверху за «законную архитектуру».</p></div>')

FIND_BIGTECH = (f'<div class="finding-grid"><div class="finding hot"><b>Яндекс: кэш {fx(x_flash_cache)}</b>'
                f'<span>За миллион токенов из кэша DeepSeek вендор берёт {rub2(FLASH["vendor"]["cache"])} ₽, Яндекс — {ru(FLASH["platform"]["cache"])} ₽. Это самый большой разрыв на странице, и он спрятан во второй строке счёта.</span></div>'
                f'<div class="finding"><b>Cloud.ru: наценка умеренная, рекорд у Яндекса</b>'
                f'<span>По юридическому тарифу Cloud.ru DeepSeek V4 Pro стоит {ru(bt["DeepSeek V4 Pro"]["platform"]["in"])} ₽ за вход ({fx(bt["DeepSeek V4 Pro"]["x_in"])}) — скромно. Дороже у Cloud.ru партнёрские Claude и Kimi: ×2,4 на входе. Максимум страницы — Яндекс: {fx(x_flash_in)} на входе и {fx(x_flash_cache)} на кэше.</span></div>'
                f'<div class="finding"><b>Даже дешёвое облако наценивает кэш</b>'
                f'<span>Selectel на той же модели дешевле вендора по входу ({fx(x_sel_in)}), но кэш отдаёт за {rub2(SEL["platform"]["cache"])} ₽ против {rub2(SEL["vendor"]["cache"])} ₽ — {fx(x_sel_cache)} (кэш Selectel — по промо-странице V4.1 Flash). Кэш дорожает у всех, кто перепродаёт доступ.</span></div></div>')

def pp_row(r):
    cls = (" pp-hot" if r.get("hot") else "") + (" pp-cheap" if r.get("cheap") else "")
    hot = r.get("hot") or r.get("cheap")
    delta_html = (f'<span class="shock-counter" data-target="{abs(r["delta"])}" data-prefix="{"+" if r["delta"]>=0 else "−"}">{signed(r["delta"])}</span>'
                  if hot else signed(r["delta"]))
    note = f'<div class="pp-n">{r["note"]}</div>' if r.get("note") else ""
    return (f'<div class="pp-row{cls}" role="row"><div class="pp-m">{r["model"]}</div>'
            f'<div class="pp-p">{r["platform"]}</div>'
            f'<div class="pp-v">{ru(r["vendor_year"])} ₽</div>'
            f'<div class="pp-pl">{ru(r["platform_year"])} ₽</div>'
            f'<div class="pp-d{" pp-cheap" if r.get("cheap") else ""}">{delta_html} ₽</div>'
            f'<div class="pp-i">{impl(r["delta"])}</div>{note}</div>')

YEAR_ROWS = "\n".join(pp_row(r) for r in year_rows)

FIND_CACHE = (f'<div class="finding-grid"><div class="finding hot"><b>Кэш Claude: ×3,67</b>'
              f'<span>ProxyAPI берёт 60 ₽/1 млн за чтение кэша против 16,33 ₽ у вендора. Агент с длинной памятью платит эту наценку на каждом шаге диалога.</span></div>'
              f'<div class="finding"><b>Кэш DeepSeek: ×6,9</b>'
              f'<span>AITunnel: 3,36 ₽ против {rub2(FLASH["vendor"]["cache"])} ₽ у вендора днём. Против ночного тарифа вендора разница доходит до ×14.</span></div>'
              f'<div class="finding"><b>Кэш дороже вендорского входа</b>'
              f'<span>Yandex AI Studio берёт {ru(FLASH["platform"]["cache"])} ₽/1 млн за кэш DeepSeek — больше, чем вендор просит за обычный вход ({rub2(FLASH["vendor"]["in"])} ₽). Данные llmoney.ru; цены Яндекса закрыты панелью.</span></div></div>')

prov_nums = {
    "yandex": [[fx(x_flash_in), "наценка на вход", "loss"], [fx(x_flash_cache), "наценка на кэш", "loss"], ["+" + ru(year_sum("Яндекс AI Studio")) + " ₽", "переплата за год", "loss"]],
    "cloud": [[f"{fx(min(cloud_in))}–{fx(max(cloud_in))}", "наценка на вход", "loss"], ["×2,4", "наценка на кэш, где опубликован", "loss"], ["+" + ru(sum_cloud) + " ₽", "переплата за год, 4 модели", "loss"]],
    "mts": [[f"{fx(min(mts_in))}–{fx(max(mts_in))}", "наценка на вход", "loss"], ["×1,5–×2,1", "наценка на выход", "loss"], ["+" + ru(sum_mts) + " ₽", "переплата за год, 3 модели", "loss"]],
    "selectel": [[fx(x_sel_in), "вход к вендору", "accent"], [fx(x_sel_cache), "кэш всё равно дороже", "loss"], ["−" + ru(abs(sum_sel)) + " ₽", "экономия за год, 2 модели", "accent"]],
}

CONCL = (f'<div class="concl-grid">\n'
         f'<article class="concl hot"><span class="n">01</span><b>Бигтех продаёт архитектуру, а наценку прячет в кэше</b><p>Яндекс берёт {ru(FLASH["platform"]["cache"])} ₽ за миллион токенов из кэша DeepSeek при вендорских {rub2(FLASH["vendor"]["cache"])} ₽ — {fx(x_flash_cache)}. Вход подорожал в 12 раз, кэш — в 153. Наценку на вход рынок хотя бы считает, наценку на кэш — нет. А агент живёт именно на кэше.</p></article>\n'
         f'<article class="concl"><span class="n">02</span><b>Наценка {fx(min(mts_in))}–{fx(x_flash_in)} на той же модели — норма платформы</b><p>Яндекс берёт {fx(x_flash_in)} на входе DeepSeek V4 Flash, Cloud.ru — {fx(min(cloud_in))}–{fx(max(cloud_in))} на DeepSeek V4 Pro и the model 4.6, MWS — {fx(max(mts_in))} на Qwen и {fx(min(mts_in))} на GLM. Модель одна, продавцы разные — и счёт отличается в разы.</p></article>\n'
         f'<article class="concl"><span class="n">03</span><b>«РФ-облако» ≠ «дорого»</b><p>Selectel на той же модели DeepSeek берёт за вход {rub2(SEL["platform"]["in"])} ₽ — дешевле вендора. Разницу делает не страна и не 152-ФЗ, а аппетит платформы. Законную архитектуру можно купить без наценки ×12. Но кэш Selectel всё равно наценивает — {fx(x_sel_cache)}.</p></article>\n'
         f'<article class="concl"><span class="n">04</span><b>Кэш — слепая зона всего рынка</b><p>Вендор отдаёт кэш за 2–10% цены входа, платформы берут за него почти как за вход. Наценку на кэш никто не публикует отдельной строкой — её видно только через множитель к вендору. Спрашивай не «сколько стоит вход», а «сколько стоит чтение из кэша и сколько его у моего агента».</p></article>\n'
         f'<article class="concl"><span class="n">05</span><b>Перекупы — второй слой, и там своя наценка</b><p>Даже между дешёвыми кассами разброс ×2–×3,7: {M5} у ProxyAPI {m5["ratio"]} к прямому счёту, DeepSeek у AITunnel ×6,9 по кэшу. Бигтех — это «законная архитектура с наценкой». Перекуп — «та же модель без архитектуры, но тоже с наценкой».</p></article></div>')

# ================= 3. подстановка =================
def sub(pat, repl, what):
    global html
    html, n = pat.subn(repl, html, count=1)
    if n != 1: sys.exit("anchor not found: " + what)
    log.append(what + ": ok")

sub(re.compile(r'<div class="hero-stats rv">.*?</div>\n<div class="hero-focus rv">.*?</div>\n<div class="cta-row rv">', re.S),
    HERO_STATS + "\n" + HERO_FOCUS + '\n<div class="cta-row rv">', "hero stats+focus")
sub(re.compile(r'<div class="finding-grid"><div class="finding hot"><b>Яндекс: кэш ×153</b>.*?(?=<div class="bt-note">)', re.S),
    FIND_BIGTECH, "findings bigtech")
sub(re.compile(r'<div class="pp-row pp-hot" role="row".*?(?=<p class="pp-foot">)', re.S),
    YEAR_ROWS + "\n", "year rows")
sub(re.compile(r'<div class="finding-grid"><div class="finding hot"><b>Кэш Claude: ×3,67</b>.*?(?=<div class="cache-calc rv">)', re.S),
    FIND_CACHE, "findings cache")

for pid, nums in prov_nums.items():
    js_arr = json.dumps(nums, ensure_ascii=False)
    pat = re.compile(r"(" + pid + r":\{name:'[^']*',n:'[^']*',\s*nums:\[)\[.*?\]\](,\s*note:)", re.S)
    global_html = html
    html, n = pat.subn(lambda m, a=js_arr: m.group(1) + a[1:-1] + "]" + m.group(2), html, count=1)
    if n != 1: sys.exit("prov card not found: " + pid)
    log.append(f"prov nums {pid}: ok")

NB = "[\u00a0 ]"
def rn(n):
    """число с неразрывным И обычным пробелом в паттерне"""
    return re.escape(ru(n)).replace("\\ ", NB)

html = re.sub(
    r"от \+32(?:\u00a0| )040 ₽ на Flash до \+1(?:\u00a0| )553(?:\u00a0| )436 ₽",
    f"от +{ru(flash_cloud['delta'])} ₽ на Flash до +{ru(model45['delta'])} ₽",
    html)
html = re.sub(
    r"Вход ×0,46 и выход ×0,23 от цены вендора",
    f"Вход {fx(x_sel_in)} и выход {fx(SEL['platform']['out'] / SEL['vendor']['out'])} от цены вендора",
    html)
html, _n16 = re.subn(
    r"от ×1,6 \(DeepSeek V4 Pro\) до ×2,3 \([^)]+\)",
    f"от {fx(min(cloud_in))} (DeepSeek V4 Pro) до {fx(max(cloud_in))} ({BT46})",
    html)
log.append(f"prov note x1.6: subn={_n16}")
html = re.sub(
    r"но чтение из кэша Selectel отдаёт за 2,32 ₽ против 0,51 ₽ — ×4,5",
    f"но чтение из кэша Selectel отдаёт за {rub2(SEL['platform']['cache'])} ₽ против {rub2(SEL['vendor']['cache'])} ₽ — {fx(x_sel_cache)}",
    html)
log.append("prov notes: synced")

sub(re.compile(r'<div class="concl-grid">\s*<article class="concl hot"><span class="n">01</span>.*?(?=<p class="next rv">)', re.S),
    CONCL, "conclusions")

# меты
html = html.replace("<title>Наценка платформ на ИИ: одна модель, разная цена</title>",
                    "<title>Наценка на ИИ: каталог 18 моделей, бигтех и кэш — где прячется переплата</title>")
html = html.replace(
    '<meta name="description" content="Замер 04.11.2026: та же модель у разработчика и у посредника. Чтение из кэша дороже в 153 раза, вход — в 12. Как проверить свою платформу.">',
    '<meta name="description" content="Полный замер: 18 моделей в каталоге от 21 до 12 937 ₽/мес, платформа бигтеха — ×12 на входе и ×153 на кэше. Проверка своей платформы по трём строкам прайса.">')
html = html.replace('<meta property="og:title" content="Одна модель: вендор против бигтеха — наценка на токены и кэш">',
                    '<meta property="og:title" content="Наценка на ИИ: каталог, бигтех и кэш — где прячется переплата">')
html = html.replace(
    '<meta property="og:description" content="Яндекс, Cloud.ru, MWS против вендора. Одна модель, наценка на вход ×1,5–×12, на кэш ×153. Selectel — дешевле вендора.">',
    '<meta property="og:description" content="18 моделей: разброс 629× ещё до наценки. Платформа бигтеха: ×12 на входе, ×153 на кэше. Selectel — дешевле вендора. Проверь свою платформу по трём строкам прайса.">')
log.append("meta: ok")

# ================= 4. каталог 18 моделей =================
TICK, DEC = 24.5, (96.0 - 24.5) / 2
def bar_w(v):
    return max(1.2, min(100.0, TICK + (math.log10(v) - 2) * DEC))
def fmt_rub(v):
    if v >= 1000: return ru(v)
    if v >= 100: return f"{v:.0f}"
    return f"{v:.1f}".replace(".", ",")

spread = d["models18"]["groups"][3]["models"][2][3] / d["models18"]["groups"][0]["models"][0][3]
spread_label = math.ceil(spread)

bars, table_rows = [], []
for g in d["models18"]["groups"]:
    bars.append(f'<div class="tg">— {g["label"]} —</div>')
    for name, fin, fout, month in g["models"]:
        bars.append(f'<div class="cbr {g["tier"]}" title="{name}: {fmt_rub(month)} ₽/мес"><span class="cbn">{name}</span><span class="cbt"><i style="width:{bar_w(month):.1f}%"></i></span><span class="cbv">{fmt_rub(month)} ₽</span></div>')
        table_rows.append(f"<tr><td>{name}</td><td class=\"n\">{fin}</td><td class=\"n\">{fout}</td><td class=\"n\">{fmt_rub(month)}</td></tr>")

CAT_CSS = """
/* каталог 18 моделей: полосы на лог-шкале (тёмная тема) */
.cbr{display:grid;grid-template-columns:196px 1fr 104px;align-items:center;gap:12px;padding:3px 0}
.cbn{font-size:14px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbt{position:relative;height:15px;background:rgba(255,255,255,.07);border-radius:3px}
.cbt i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;display:block}
.t1 .cbt i{background:rgba(143,168,255,.42)}.t2 .cbt i{background:rgba(143,168,255,.6)}
.t3 .cbt i{background:rgba(143,168,255,.8)}.t4 .cbt i{background:#8fa8ff}
.cbv{font:500 14px/1 var(--mono);text-align:right;color:var(--body);font-variant-numeric:tabular-nums}
.cax{position:relative;height:18px;margin:6px 0 4px;margin-left:208px;margin-right:116px}
.ctk{position:absolute;top:0;transform:translateX(-50%);font:400 13px/1 var(--mono);color:var(--meta);white-space:nowrap}
.ctk.lgs{left:0!important;transform:none;color:var(--meta)}
.cgl-zone{position:absolute;left:208px;right:116px;top:0;bottom:0;pointer-events:none}
.cgl{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.14)}
.cbr{position:relative;z-index:1}
@media(max-width:720px){
 .cbr{grid-template-columns:1fr 74px;grid-template-areas:"n v" "b b";gap:2px 10px;padding:6px 0}
 .cbn{grid-area:n}.cbt{grid-area:b}.cbv{grid-area:v}.cbn{white-space:normal}
 .cax{margin-left:0;margin-right:0}.cgl-zone{left:0;right:0}.ctk{font-size:12px}
}
@media(prefers-reduced-motion:no-preference){.cbt i{transition:width .6s cubic-bezier(.22,.61,.36,1)}}
"""
cax = ('<div class="cax"><span class="ctk lgs">лог. шкала →</span><span class="ctk" style="left:24.5%">100 ₽</span>'
       '<span class="ctk" style="left:60.3%">1 000 ₽</span><span class="ctk" style="left:96.0%">10 000 ₽</span></div>')
gls = "".join(f'<i class="cgl" style="left:{x}%"></i>' for x in (24.5, 60.3, 96.0))
big = "".join(f'<div><b>{b["b"]}</b><span>{b["s"]}</span></div>' for b in d["models18"]["big"])

CATALOG = f"""<style>{CAT_CSS}</style>
<section id="catalog"><div class="wrap"><div class="section-head"><div><p class="eyebrow rv">каталог · 09.11.2026 · курс ЦБ {d['meta']['catalog_rate']} ₽/$</p><h2 class="rv">Разброс в {spread_label} раз — ещё до всякой наценки</h2></div><p>18 моделей, одна нагрузка: 1 000 обращений в месяц, 3 вызова на сообщение, 1 500 токенов входа и 400 выхода на вызов. Это каталожные цены провайдеров — так считает весь рынок. Платить по ним из РФ картой нельзя.</p></div>
{cax}
<div class="chart-wrap" style="position:relative"><div class="cgl-zone">{gls}</div>{''.join(bars)}</div>
<p class="pp-foot">Шкала логарифмическая, иначе дешёвые сливаются в точку. Проверяется в любой момент: цены публичные.</p>
<div class="hero-stats rv" style="margin-top:34px">{big}</div>
<details style="margin-top:26px;border-top:1px solid var(--line-soft);padding-top:14px"><summary>Открыть таблицу: вход, выход, стоимость в месяц</summary>
<table><thead><tr><th>Модель</th><th class="n">Вход, $/1М</th><th class="n">Выход, $/1М</th><th class="n">₽/мес</th></tr></thead>
<tbody>{''.join(table_rows)}</tbody></table>
<p class="pp-foot" style="margin-top:14px">{d['models18']['published_note']}. Методика: счёт = цена за 1 млн токенов × объём (4,5 млн входа + 1,2 млн выхода) × курс {d['meta']['catalog_rate']} ₽. Без скидок за кэш и батч, без ретраев и «служебных» вызовов агента — реальный счёт выше на 10–40%. У РФ-каналов другой прайс: там кэш учтён по их политике (45–70% входа читается дешевле) — поэтому «то же самое дешевле» здесь не сравнивают напрямую, а показывают вилку 4 700–7 400 ₽.</p>
</details>
<p class="bridge">Это цена модели в витрине. <b>Дальше — то, чем реально платят из РФ</b>: платформа бигтеха берёт ту же модель и добавляет «законную архитектуру». Главный разрыв прячется не на входе.</p>
</div></section>
"""
html = html.replace('<section id="bigtech">', CATALOG + '\n<section id="bigtech">', 1)
log.append("catalog: inserted")

# ================= 5. финал + share =================
FUNNEL = """<section id="chto-delat"><div class="wrap">
<p class="eyebrow rv">что с этим делать</p>
<h2 class="rv">Дешёвая модель не экономит. Экономит связка под задачу.</h2>
<p class="rv">В гайде «20 конфигураций» — какая модель под какую задачу, что живёт без VPN, сколько выходит в месяц по РФ-каналам оплаты и что окупается за первый месяц. Разово 3 000 ₽, доступ навсегда. Ставишь сам за 3–4 часа, без кода.</p>
<div class="cta-row rv"><a class="btn btn-primary" href="pay.html">Забрать гайд — 3 000 ₽</a><a class="btn btn-ghost" href="calculator.html">Посчитать своё владение →</a></div>
<p class="pp-foot">Агент уже стоит, но счёт растёт — переезд на модели с оплатой из РФ: от 25 000 ₽, с промокодом <b>KLODNAOBOROT</b> 22 500 ₽. <a href="service.html#optimization">Что входит →</a></p>
</div></section>
"""
html = html.replace("</main>", FUNNEL + "</main>", 1)
log.append("funnel: ok")
html = html.replace("бигтехa", "бигтеха")  # латинская a в лид-прозе heavy

old_tail = '<script src="ds-mnav.js?v=20261109b" defer></script>\n</body>'
assert old_tail in html
html = html.replace(old_tail, '<script src="ds-mnav.js?v=20261109b" defer></script>\n<script src="ds-share.js" defer></script>\n</body>', 1)
log.append("ds-share: ok")

# ================= 6. проверки =================
checks = [
    ("ym-slot", "ym-slot.js" in html),
    ("18 строк таблицы", html.count("<tr><td>") == 18),
    ("prov-pick", "prov_pick" in html),
    ("cache-calc", "ccRange" in html),
    ("законы", "152-ФЗ" in html),
    ("share", "ds-share.js" in html),
    ("каталог", 'id="catalog"' in html),
    ("нет «в 148»", "в 148" not in html),
    ("нет «0,51 ₽»", "0,51 ₽" not in html),
    ("нет «32 040»", re.search(r"32(?:\u00a0| )040", html) is None),
    ("нет «3 386 556»", re.search(r"3(?:\u00a0| )386(?:\u00a0| )556", html) is None),
    ("нет «1 600 308»", re.search(r"1(?:\u00a0| )600(?:\u00a0| )308", html) is None),
    ("нет «×3,58»", "×3,58" not in html),
    ("нет «×0,46-в-карточке»", "Вход ×0,46" not in html),
    ("нет «1 553 436»", re.search(r"1(?:\u00a0| )553(?:\u00a0| )436", html) is None),
    ("нет «2,32 ₽»", "2,32 ₽" not in html),
    ("нет «от ×1,6 (»", "от ×1,6 (" not in html),
]
log.append("--- checks ---")
log += [f"{n}: {'ok' if ok else 'FAIL'}" for n, ok in checks]
fails = [n for n, ok in checks if not ok]
if fails:
    print("\n".join(log))
    for n in fails:
        if n.startswith("нет «"):
            probe = n[4:-1].lstrip("«").rstrip("»")
            i = html.find(probe)
            if i >= 0:
                print(f"CONTEXT {probe!r}: {html[max(0,i-120):i+140]!r}")
    sys.exit("CHECK FAIL: " + ", ".join(fails))

OUT.write_text(html, encoding="utf-8")
log.append(f"--- written: {OUT} ({OUT.stat().st_size} bytes) ---")
print("\n".join(log))
