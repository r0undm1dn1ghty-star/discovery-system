# -*- coding: utf-8 -*-
"""
qa/ia-journey-gen.py — генератор IA-JOURNEY.html (карта пути клиента Discovery System).

Зачем генератор, а не руками: две раскладки (широкая ≥1024px и узкая <1024px) должны
строиться из ОДНИХ данных, иначе они разъедутся при первой же правке текста.
Геометрия: skill diagram-design, references/type-journey.md (широкая = канон каретки:
64px левое поле + 5×200px колонок + 24px гаттеры, полоса настроения 160px с хайрлайнами
через 80px). Узкая раскладка — вынужденное отступление: при 390px канон нечитаем,
поэтому полоса настроения сжимается в мини-график 5 колонок по 62px, а стадии
раскладываются в вертикальные карточки (уровень подписан словами, не числом).

Запуск: python qa/ia-journey-gen.py
"""
import html
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "IA-JOURNEY.html")

# ── палитра Discovery (DIAGRAM-PALETTE-DISCOVERY.md) ─────────────────────────
PAPER = "#111524"
PAPER2 = "rgba(255,255,255,.03)"
INK = "#eef2f9"
BODY = "#b8c3d6"
MUTED = "#8893a8"
FAINT = "#5a6275"
RULE = "rgba(255,255,255,.12)"
RULE_SOFT = "rgba(255,255,255,.07)"
ACCENT = "#7bc4a8"

MONO = "'IBM Plex Mono',ui-monospace,monospace"
SANS = "'IBM Plex Sans',system-ui,sans-serif"
DISPLAY = "'Onest','IBM Plex Sans',system-ui,sans-serif"

NARRATIVE = [
    dict(
        n="01", name="Нашёл", level="MED-LOW", level_ru="ниже нейтрали",
        action="Видит два равных действия: калькулятор и внешний Telegram. Нав — шесть пунктов.",
        where="index.html · .hero · .sticky-cta",
        calc="hero «Посчитать мою цену» · .sticky-cta «Посчитать за минуту»",
        pains=[],
    ),
    dict(
        n="02", name="Понял", level="MED-HIGH", level_ru="выше нейтрали",
        action="Смотрит смену агента в Telegram, читает четыре формата работы.",
        where="system.html · #demo · #formats",
        calc="ссылка под демо · блок #go «посчитать свою рутину»",
        pains=[],
    ),
    dict(
        n="03", name="Проверил", level="LOW", level_ru="низко",
        action="Идёт по наву проверять: Внедрения, Рынок ИИ, Канал — три равных раздела.",
        where="proof.html · market.html · channel.html",
        calc="одна кнопка в конце proof.html — пять экранов от входа",
        pains=["три peer-раздела вместо пути", "дубли: лестница ×3 · кейсы ×2"],
    ),
    dict(
        n="04", name="Увидел цену", level="NEUTRAL", level_ru="нейтрально",
        action="Сравнивает шесть форматов на одной странице, ищет свою цифру в лестнице 0→60К.",
        where="clarity.html · узлы 0–5",
        calc="лид · подсказка «начни с калькулятора» · #node2 · финал",
        pains=[],
    ),
    dict(
        n="05", name="Оплатил", level="HIGH", level_ru="высоко",
        action="Семь ответов — расчёт в ₽/мес и часах, оффер, оплата.",
        where="calculator.html → pay.html",
        calc="сам калькулятор — конечный узел конверсии",
        pains=[],
    ),
]

# ── утилиты ──────────────────────────────────────────────────────────────────
def esc(t):
    return html.escape(t, quote=False)


def wrap(text, limit):
    """Перенос по словам. В SVG нет авто-переноса — считаем сами."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        probe = (cur + " " + w).strip()
        if len(probe) <= limit or not cur:
            cur = probe
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


LEVEL_Y_WIDE = {"HIGH": 104, "MED-HIGH": 144, "NEUTRAL": 184, "MED-LOW": 224, "LOW": 264}
LEVEL_Y_NARROW = {"HIGH": 70, "MED-HIGH": 88, "NEUTRAL": 106, "MED-LOW": 124, "LOW": 142}


def catmull_segments(pts):
    """Catmull-Rom → кубические Безье. Возвращает список d-строк, по одной на отрезок,
    чтобы подсветить провал отдельным путём и не рисовать штрихи друг поверх друга."""
    segs = []
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        segs.append("M{:.1f} {:.1f}C{:.1f} {:.1f} {:.1f} {:.1f} {:.1f} {:.1f}".format(
            p1[0], p1[1], c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]))
    return segs


def txt(x, y, s, size=12, fill=BODY, family=SANS, weight="400", anchor="start",
        spacing=None, upper=False, opacity=None, style=""):
    a = ' text-anchor="{}"'.format(anchor) if anchor != "start" else ""
    ls = ' letter-spacing="{}"'.format(spacing) if spacing else ""
    op = ' opacity="{}"'.format(opacity) if opacity is not None else ""
    wt = ' font-weight="{}"'.format(weight) if weight != "400" else ""
    body = esc(s.upper() if upper else s)
    return ('<text x="{:.1f}" y="{:.1f}" font-family="{}" font-size="{}"{}{} fill="{}"{}{} '
            'style="{}">{}</text>').format(x, y, family, size, wt, a, fill, ls, op, style, body)


def hair(x1, y1, x2, y2, stroke=RULE, w=1, dash=None, opacity=None):
    d = ' stroke-dasharray="{}"'.format(dash) if dash else ""
    op = ' opacity="{}"'.format(opacity) if opacity is not None else ""
    return '<line x1="{:.1f}" y1="{:.1f}" x2="{:.1f}" y2="{:.1f}" stroke="{}" stroke-width="{}"{}{}/>'.format(
        x1, y1, x2, y2, stroke, w, d, op)


# ── широкая раскладка (канон type-journey) ───────────────────────────────────
def wide_svg():
    # сетка: левое поле 160 (в нём живут метки строк, самые длинные — «ВХОД В КАЛЬКУЛЯТОР»),
    # 5 колонок по 176 с гаттером 20 → полоса 160 + 5*176 + 4*20 = 1120
    PL, COL_W, GUT = 160, 176, 20
    n = len(NARRATIVE)
    col_x = lambda i: PL + i * (COL_W + GUT)
    col_cx = lambda i: col_x(i) + COL_W / 2.0
    plot_r = col_x(n - 1) + COL_W
    VB_W = plot_r + 24

    y = 296
    r1 = (y, 462)
    y = 462
    r2 = (y, 540)
    y = 540
    r3 = (y, 640)
    # строки контента: (верх, низ, метка в левом поле)
    rows = [(296, 462, "ДЕЛАЕТ"), (462, 540, "ГДЕ"), (540, 640, "ВХОД В КАЛЬКУЛЯТОР")]
    VB_H = 716

    o = []
    o.append('<title id="ia-journey-wide-title">Путь клиента по сайту Discovery System</title>')
    o.append('<desc id="ia-journey-wide-desc">Пять стадий пути: нашёл, понял, проверил, увидел цену, '
             'оплатил. Провал — на стадии проверки, где в наве три равных раздела и дубли блоков. '
             'Для каждой стадии указан адрес и точка входа в калькулятор.</desc>')

    # 1. шапки стадий
    for i, s in enumerate(NARRATIVE):
        cx = col_cx(i)
        o.append(txt(cx, 16, "СТАДИЯ " + s["n"], 8, MUTED, MONO, spacing=".14em", anchor="middle"))
        o.append(txt(cx, 40, s["name"], 14, INK, DISPLAY, weight="600", anchor="middle"))

    # 2. полоса настроения: провал — заливка колонки (accent #1 группы)
    trough = [i for i, s in enumerate(NARRATIVE) if s["level"] == "LOW"]
    for i in trough:
        o.append('<rect x="{:.1f}" y="88" width="{}" height="{}" rx="6" fill="{}" opacity=".055"/>'.format(
            col_x(i), COL_W, r3[1] - 88, ACCENT))
    for lv, yy in (("HIGH", 104), ("NEUTRAL", 184), ("LOW", 264)):
        o.append(hair(PL, yy, plot_r, yy, RULE, 1, opacity=".1"))
        o.append(txt(PL - 12, yy + 3, {"HIGH": "ВЫСОКО", "NEUTRAL": "НЕЙТРАЛЬНО", "LOW": "НИЗКО"}[lv],
                     8, MUTED, MONO, anchor="end", spacing=".1em"))

    # 3. кривая: базовая линия muted, отрезок входа в провал + точка провала — accent
    pts = [(col_cx(i), LEVEL_Y_WIDE[s["level"]]) for i, s in enumerate(NARRATIVE)]
    segs = catmull_segments(pts)
    for i, d in enumerate(segs):
        accent = (i == trough[0] - 1)
        o.append('<path d="{}" fill="none" stroke="{}" stroke-width="1.5" stroke-linecap="round"/>'.format(
            d, ACCENT if accent else MUTED))
    for i, s in enumerate(NARRATIVE):
        cx, cy = pts[i]
        trough_dot = i in trough
        o.append('<circle cx="{:.1f}" cy="{:.1f}" r="5" fill="{}" stroke="{}" stroke-width="{}"/>'.format(
            cx, cy, PAPER, ACCENT if trough_dot else MUTED, 2 if trough_dot else 1.5))

    # 4. строки контента: хайрлайны во всю полосу + метка в левом поле (anchor=end)
    for top, bot, label in rows:
        o.append(hair(PL - 32, top, plot_r, top, RULE, 1))
        o.append(txt(PL - 12, top + 18, label, 8, MUTED, MONO, spacing=".1em", anchor="end"))
        o.append(hair(PL - 32, bot, plot_r, bot, RULE, 1))

    for i, s in enumerate(NARRATIVE):
        x = col_x(i)
        # ДЕЛАЕТ
        for k, line in enumerate(wrap(s["action"], 27)[:4]):
            o.append(txt(x, r1[0] + 38 + k * 17, line, 12, BODY, SANS))
        # ГДЕ
        for k, line in enumerate(wrap(s["where"], 29)[:2]):
            o.append(txt(x, r2[0] + 38 + k * 15, line, 9.5, MUTED, MONO))
        # ВХОД В КАЛЬКУЛЯТОР
        o.append('<rect x="{:.1f}" y="{:.1f}" width="3" height="46" rx="1.5" fill="{}" opacity=".55"/>'.format(
            x, r3[0] + 30, MUTED))
        for k, line in enumerate(wrap(s["calc"], 25)[:3]):
            o.append(txt(x + 11, r3[0] + 42 + k * 16, line, 11.5, BODY, SANS))
        # метки трения — только на провале
        for j, p in enumerate(s["pains"][:2]):
            ty = r1[0] + 108 + j * 26
            o.append('<rect x="{:.1f}" y="{:.1f}" width="{:.1f}" height="20" rx="2" fill="rgba(123,196,168,.06)" '
                     'stroke="{}" stroke-dasharray="3,3" stroke-opacity=".5"/>'.format(x, ty, COL_W, ACCENT))
            o.append(txt(x + 8, ty + 13.5, p[:33], 8, BODY, MONO))

    # 5. легенда — горизонтальная полоса внизу
    o.append(hair(PL - 32, 668, plot_r, 668, RULE, 1))
    lg = 668 + 22
    x = PL - 32
    o.append('<path d="M{:.1f} {:.1f}C{:.1f} {:.1f} {:.1f} {:.1f} {:.1f} {:.1f}" fill="none" stroke="{}" stroke-width="1.5"/>'.format(
        x, lg, x + 10, lg - 7, x + 20, lg + 7, x + 30, lg, MUTED))
    o.append(txt(x + 38, lg + 4, "кривая настроения", 9, MUTED, MONO))
    x += 240
    o.append('<circle cx="{:.1f}" cy="{:.1f}" r="5" fill="{}" stroke="{}" stroke-width="2"/>'.format(x + 6, lg, PAPER, ACCENT))
    o.append(txt(x + 18, lg + 4, "провал пути", 9, MUTED, MONO))
    x += 240
    o.append('<rect x="{:.1f}" y="{:.1f}" width="18" height="12" rx="2" fill="rgba(123,196,168,.06)" stroke="{}" '
             'stroke-dasharray="3,3" stroke-opacity=".5"/>'.format(x, lg - 6, ACCENT))
    o.append(txt(x + 26, lg + 4, "метка трения", 9, MUTED, MONO))
    x += 240
    o.append('<rect x="{:.1f}" y="{:.1f}" width="3" height="14" rx="1.5" fill="{}" opacity=".55"/>'.format(x + 2, lg - 7, MUTED))
    o.append(txt(x + 12, lg + 4, "вход в калькулятор", 9, MUTED, MONO))

    return ('<svg class="jmap jmap-wide" viewBox="0 0 {} {}" role="img" '
            'aria-labelledby="ia-journey-wide-title ia-journey-wide-desc" '
            'preserveAspectRatio="xMidYMid meet">{}</svg>').format(VB_W, VB_H, "".join(o)), VB_W, VB_H


# ── узкая раскладка (390px) ──────────────────────────────────────────────────
def narrow_svg():
    W = 358
    PAD = 16
    CW, CGUT = 62, 4
    cx = lambda i: PAD + i * (CW + CGUT) + CW / 2.0
    o = []
    o.append('<title id="ia-journey-narrow-title">Путь клиента по сайту Discovery System</title>')
    o.append('<desc id="ia-journey-narrow-desc">Пять стадий пути: нашёл, понял, проверил, увидел цену, оплатил. '
             'Провал — на стадии проверки: три равных раздела в наве и дубли блоков. '
             'Для каждой стадии назван адрес и точка входа в калькулятор.</desc>')

    o.append(hair(PAD, 70, W - PAD, 70, RULE, 1, opacity=".1"))
    o.append(hair(PAD, 106, W - PAD, 106, RULE, 1, opacity=".1"))
    o.append(hair(PAD, 142, W - PAD, 142, RULE, 1, opacity=".1"))

    trough = [i for i, s in enumerate(NARRATIVE) if s["level"] == "LOW"]
    for i in trough:
        o.append('<rect x="{:.1f}" y="52" width="{}" height="108" rx="6" fill="{}" opacity=".055"/>'.format(
            PAD + i * (CW + CGUT), CW, ACCENT))

    pts = [(cx(i), LEVEL_Y_NARROW[s["level"]]) for i, s in enumerate(NARRATIVE)]
    for i, d in enumerate(catmull_segments(pts)):
        o.append('<path d="{}" fill="none" stroke="{}" stroke-width="1.5" stroke-linecap="round"/>'.format(
            d, ACCENT if i == trough[0] - 1 else MUTED))
    for i, s in enumerate(NARRATIVE):
        p = pts[i]
        o.append('<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="{}" stroke="{}" stroke-width="{}"/>'.format(
            p[0], p[1], PAPER, ACCENT if i in trough else MUTED, 2 if i in trough else 1.5))
        o.append(txt(p[0], 162, s["n"], 8, MUTED, MONO, anchor="middle", spacing=".1em"))

    # карточки стадий
    y = 186
    for i, s in enumerate(NARRATIVE):
        is_trough = i in trough
        line_h = 16
        a_lines = wrap(s["action"], 44)[:3]
        c_lines = wrap(s["calc"], 42)[:3]
        h = 20 + 15 + len(a_lines) * line_h + 10 + 11 + 13 + 11 + 12 + len(c_lines) * 15 + 14
        if s["pains"]:
            h += 10 + 23 * len(s["pains"])
        stroke = ACCENT if is_trough else RULE
        fill = "rgba(123,196,168,.05)" if is_trough else PAPER2
        o.append('<rect x="{}" y="{:.1f}" width="{}" height="{:.1f}" rx="8" fill="{}" stroke="{}" '
                 'stroke-opacity="{}"/>'.format(PAD, y, W - 2 * PAD, h, fill, stroke, ".45" if is_trough else "1"))
        o.append(txt(PAD + 14, y + 22, "СТАДИЯ " + s["n"] + " · " + s["name"].upper(), 9.5,
                     ACCENT if is_trough else MUTED, MONO, spacing=".1em"))
        o.append(txt(W - PAD - 14, y + 22, s["level_ru"], 9.5, MUTED, MONO, anchor="end"))
        ay = y + 44
        o.append(txt(PAD + 14, ay, "ДЕЛАЕТ", 8.5, MUTED, MONO, spacing=".12em"))
        for k, line in enumerate(a_lines):
            o.append(txt(PAD + 14, ay + 17 + k * line_h, line, 12, BODY, SANS))
        gy = ay + 17 + len(a_lines) * line_h + 8
        o.append(txt(PAD + 14, gy, "ГДЕ", 8.5, MUTED, MONO, spacing=".12em"))
        o.append(txt(PAD + 14, gy + 15, s["where"], 10.5, MUTED, MONO))
        cy = gy + 26
        o.append(txt(PAD + 14, cy, "ВХОД В КАЛЬКУЛЯТОР", 8.5, MUTED, MONO, spacing=".12em"))
        o.append('<rect x="{:.1f}" y="{:.1f}" width="3" height="{:.1f}" rx="1.5" fill="{}" opacity=".55"/>'.format(
            PAD + 14, cy + 8, len(c_lines) * 15 - 2, MUTED))
        for k, line in enumerate(c_lines):
            o.append(txt(PAD + 25, cy + 21 + k * 15, line, 11.5, BODY, SANS))
        if s["pains"]:
            py = cy + 21 + len(c_lines) * 15 + 4
            for p in s["pains"][:2]:
                o.append('<rect x="{}" y="{:.1f}" width="{}" height="19" rx="2" fill="rgba(123,196,168,.06)" '
                         'stroke="{}" stroke-dasharray="3,3" stroke-opacity=".5"/>'.format(
                    PAD + 14, py, W - 2 * PAD - 28, ACCENT))
                o.append(txt(PAD + 22, py + 13, p[:38], 8.5, BODY, MONO))
                py += 23
        y += h + 10

    # легенда 2×2
    ly = y + 12
    o.append(hair(PAD, ly, W - PAD, ly, RULE, 1))
    lg = ly + 24
    o.append('<path d="M{:.1f} {:.1f}C{:.1f} {:.1f} {:.1f} {:.1f} {:.1f} {:.1f}" fill="none" stroke="{}" stroke-width="1.5"/>'.format(
        PAD, lg, PAD + 6, lg - 5, PAD + 12, lg + 5, PAD + 18, lg, MUTED))
    o.append(txt(PAD + 24, lg + 4, "кривая настроения", 8.5, MUTED, MONO))
    o.append('<circle cx="{:.1f}" cy="{:.1f}" r="4.5" fill="{}" stroke="{}" stroke-width="2"/>'.format(
        190 + 5, lg, PAPER, ACCENT))
    o.append(txt(190 + 16, lg + 4, "провал пути", 8.5, MUTED, MONO))
    lg += 26
    o.append('<rect x="{}" y="{:.1f}" width="16" height="11" rx="2" fill="rgba(123,196,168,.06)" stroke="{}" '
             'stroke-dasharray="3,3" stroke-opacity=".5"/>'.format(PAD, lg - 5, ACCENT))
    o.append(txt(PAD + 24, lg + 4, "метка трения", 8.5, MUTED, MONO))
    o.append('<rect x="{:.1f}" y="{:.1f}" width="3" height="13" rx="1.5" fill="{}" opacity=".55"/>'.format(
        190 + 3, lg - 6, MUTED))
    o.append(txt(190 + 16, lg + 4, "вход в калькулятор", 8.5, MUTED, MONO))
    lg += 22

    return ('<svg class="jmap jmap-narrow" viewBox="0 0 {} {:.0f}" role="img" '
            'aria-labelledby="ia-journey-narrow-title ia-journey-narrow-desc" '
            'preserveAspectRatio="xMidYMid meet">{}</svg>').format(W, lg + 8, "".join(o)), W, lg + 8


def validate():
    """Обрезка строк в SVG молчаливая — здесь она падает громко."""
    WIDE = [("action", 27, 4), ("where", 29, 2), ("calc", 25, 3)]
    NARROW = [("action", 44, 3), ("calc", 42, 3)]
    for s in NARRATIVE:
        for key, lim, cap in WIDE:
            lines = wrap(s[key], lim)
            if len(lines) > cap:
                raise SystemExit("ОБРЕЗКА wide %s/%s: %d строк > %d — %r" % (s["n"], key, len(lines), cap, lines))
        for key, lim, cap in NARROW:
            lines = wrap(s[key], lim)
            if len(lines) > cap:
                raise SystemExit("ОБРЕЗКА narrow %s/%s: %d строк > %d — %r" % (s["n"], key, len(lines), cap, lines))
        for p in s["pains"]:
            if len(p) > 33:
                raise SystemExit("метка трения длиннее 33 знаков (не влезет в тег 176px): %r" % p)
    if len(NARRATIVE) > 6:
        raise SystemExit("стадий больше 6 — предел типа user journey: делить на две карты")
    troughs = [s for s in NARRATIVE if s["level"] == "LOW"]
    if len(troughs) != 1:
        raise SystemExit("провал должен быть один — иначе accent не сигнал, а фон")


def build():
    validate()
    wide, ww, wh = wide_svg()
    narrow, nw, nh = narrow_svg()
    doc = HTML_TEMPLATE.format(wide=wide, narrow=narrow, ww=ww, wh=wh, nw=nw, nh=nh)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(doc)
    print("written:", OUT, os.path.getsize(OUT), "bytes")
    print("wide viewBox:", ww, "x", wh, "| narrow viewBox:", nw, "x", int(nh))


HTML_TEMPLATE = u"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Информационная архитектура: путь клиента — Discovery System</title>
<meta name="description" content="Разбор пути клиента по сайту Discovery System: роли страниц, дубли, точка входа в калькулятор на каждой странице и решение по составу нава."/>
<link href="fonts/fonts.css" rel="stylesheet"/>
<style>
/* Палитра и типографика — DIAGRAM-PALETTE-DISCOVERY.md (роли: paper/ink/muted/rule/accent).
   Гейт diagram-design пройден кастомной палитрой Discovery; шипнутый style-guide не трогался. */
:root{{
  --paper:#111524; --paper-2:rgba(255,255,255,.03); --ink:#eef2f9; --body:#b8c3d6;
  --muted:#8893a8; --faint:#5a6275; --rule:rgba(255,255,255,.12); --rule-soft:rgba(255,255,255,.07);
  --accent:#7bc4a8; --accent-rgb:123,196,168;
  --mono:'IBM Plex Mono',ui-monospace,monospace; --sans:'IBM Plex Sans',system-ui,sans-serif;
  --display:'Onest',var(--sans); --ease:cubic-bezier(.22,1,.36,1);
  --gut:24px; --wrap:1264px;
}}
*{{margin:0;padding:0;box-sizing:border-box}}
html{{-webkit-text-size-adjust:100%}}
body{{background:var(--paper);color:var(--body);font-family:var(--sans);font-size:17px;line-height:1.68;
  overflow-wrap:break-word;-webkit-font-smoothing:antialiased;
  background-image:radial-gradient(900px 600px at 88% -6%,rgba(123,196,168,.08),transparent 60%);background-attachment:fixed}}
.wrap{{width:100%;max-width:var(--wrap);margin:0 auto;padding:0 var(--gut)}}
@media(max-width:760px){{.wrap{{padding:0 16px}}}}
header{{padding:56px 0 0}}
.eyebrow{{font-family:var(--mono);font-size:12px;color:var(--accent);letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px}}
h1{{color:var(--ink);font-family:var(--display);font-weight:700;font-size:clamp(1.7rem,4.6vw,2.7rem);line-height:1.12;letter-spacing:-.01em;text-wrap:balance;max-width:22ch}}
.lead{{font-size:16.5px;color:var(--body);max-width:70ch;margin-top:20px}}
.lead b{{color:var(--ink);font-weight:600}}
.jmap{{display:block;width:100%;height:auto}}
.jmap-wide{{max-width:1144px;margin:0 auto}}
.jmap-narrow{{display:none;max-width:560px;margin:0 auto}}
@media(max-width:1199px){{
  .jmap-wide{{display:none}}
  .jmap-narrow{{display:block}}
}}
.diagram{{margin:36px 0 8px}}
h2{{color:var(--ink);font-family:var(--display);font-weight:700;font-size:clamp(1.2rem,2.4vw,1.55rem);line-height:1.2;margin:0 0 8px}}
.decision{{border-top:1px solid var(--rule);margin-top:40px;padding-top:32px}}
.navrow{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:18px 0 8px}}
.navrow div{{border:1px solid var(--rule);border-radius:8px;padding:12px 14px;background:var(--paper-2);font-size:14px;color:var(--body)}}
.navrow div b{{display:block;color:var(--ink);font-family:var(--display);font-weight:600;font-size:14.5px;margin-bottom:2px}}
.navrow div.cta{{border-color:rgba(var(--accent-rgb),.42);background:rgba(var(--accent-rgb),.05)}}
.navrow span{{font-family:var(--mono);font-size:11.5px;color:var(--muted)}}
.tbl{{width:100%;border-collapse:collapse;margin:18px 0 4px;font-size:14px}}
.tbl th,.tbl td{{text-align:left;padding:10px 12px 10px 0;border-bottom:1px solid var(--rule-soft);vertical-align:top}}
.tbl th{{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:400}}
.tbl td:first-child{{font-family:var(--mono);font-size:12.5px;color:var(--ink);white-space:nowrap}}
.tbl td{{color:var(--body)}}
.scroll{{overflow-x:auto}}
.scroll table{{min-width:620px}}
.note{{font-family:var(--mono);font-size:11.5px;color:var(--faint);line-height:1.7;margin-top:22px}}
footer{{border-top:1px solid var(--rule-soft);margin-top:48px;padding:28px 0 64px}}
footer p{{font-family:var(--mono);font-size:12px;color:var(--faint);margin-bottom:6px}}
footer a{{color:var(--muted)}}
</style>
</head>
<body>
<div class="wrap">
<header>
  <p class="eyebrow">информационная архитектура · разбор 24.10.2026</p>
  <h1>Путь клиента, а не семь разделов</h1>
  <p class="lead">Самозанятый, ИП или МСБ 3–30 человек приходит с одной задачей: <b>рутина съедает больше
  10 часов в неделю</b>. Ему нужен следующий шаг к расчёту своей связки, а не обзор рынка. Ниже — что
  происходит на сайте сейчас: пять стадий, где путь теряется и где на каждой странице лежит вход в калькулятор.</p>
</header>

<div class="diagram">
{wide}
{narrow}
</div>

<section class="decision">
  <h2>Решение: 4 пункта в наве вместо 5</h2>
  <p>Порядок — по пути клиента: сначала «что это», потом «почему верить», потом «сколько», и только
  затем контекст рынка для тех, кто копает. Пятый пункт («Канал») убран: это лента сигналов, а не шаг
  покупки, и его название спорило с кнопкой «Сигналы в канале», которая ведёт в Telegram.</p>
  <div class="navrow">
    <div><b>Система</b><span>system.html</span></div>
    <div><b>Внедрения</b><span>proof.html</span></div>
    <div><b>Цены</b><span>clarity.html</span></div>
    <div><b>Рынок ИИ</b><span>market.html</span></div>
    <div class="cta"><b>Посчитать свою связку</b><span>calculator.html</span></div>
  </div>
  <p class="note">Высота нава на мобилке не меняется: пунктов стало меньше, а не больше.
  channel.html остаётся живой страницей — вход из market.html и из бесплатного узла clarity.html.</p>
</section>

<section class="decision">
  <h2>Где на каждой странице вход в калькулятор</h2>
  <div class="scroll">
  <table class="tbl">
    <thead><tr><th>Страница</th><th>Роль в пути</th><th>Вход в калькулятор</th></tr></thead>
    <tbody>
      <tr><td>index.html</td><td>вход и витрина: проблема → цифры → исследования-тизер → 4 входа → кейсы</td><td>кнопка в hero, строка «Стоимость ИИ-агента в месяц» в #systems, финальный блок, .sticky-cta</td></tr>
      <tr><td>system.html</td><td>«что это»: смена агента в Telegram, форматы, метод</td><td>ссылка под демо, блок #go, .sticky-cta</td></tr>
      <tr><td>proof.html</td><td>доказательства: инструменты, приёмка, кейсы</td><td>только финальный CTA — пять экранов от входа</td></tr>
      <tr><td>market.html</td><td>контекст рынка: цифры, разрыв, спектр цен, четыре разбора</td><td>CTA в #thesis и .sticky-cta</td></tr>
      <tr><td>clarity.html</td><td>цены: лестница 0 → 60К, узлы 0–5</td><td>ссылка в лиде, подсказка «начни с калькулятора», узел #node2, финальный блок, .sticky-cta</td></tr>
      <tr><td>channel.html</td><td>лента сигналов с источниками</td><td>только .sticky-cta</td></tr>
      <tr><td>calculator.html</td><td>конверсия: 7 ответов → расчёт → оффер → оплата</td><td>сам калькулятор; на выходе — pay.html и clarity.html</td></tr>
    </tbody>
  </table>
  </div>
</section>

<footer>
  <p>Discovery System · IA-разбор пути клиента · 24.10.2026 · страница-артефакт, noindex</p>
  <p>Палитра и шрифты: DIAGRAM-PALETTE-DISCOVERY.md · Карта пути: diagram-design / type-journey</p>
  <p><a href="index.html">← на главную сайта</a></p>
</footer>
</div>
</body>
</html>
"""

if __name__ == "__main__":
    build()
