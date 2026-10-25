#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""qa/shots-plasma/compare.py — честное «до/после» по пикселям фона.

Для каждой пары (до, после) берёт ТОЛЬКО точки, которые в обоих прогонах
классифицированы как пустой фон И гладкие (плазма гладка; текст/края плашек дают
резкий разброс > LIM) — иначе в замер попадает контент, а не фон.

Запуск: python qa/shots-plasma/compare.py beforeF.json afterF.json [--label L]
"""
import json
import sys
from PIL import Image

TARGET = (17, 21, 36)   # #111524
TOL = 12
LIM = 10                # допустимый разброс в окне 9x9 (плазма гладкая)


def load(png):
    im = Image.open(png).convert('RGB')
    return im, im.load()


def patch(px, w, h, x, y, r):
    acc = [0, 0, 0]; n = 0
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            p = px[min(max(x + dx, 0), w - 1), min(max(y + dy, 0), h - 1)]
            for k in range(3):
                acc[k] += p[k]
            n += 1
    return tuple(round(v / n) for v in acc)


def smooth(px, w, h, x, y, r=4):
    vals = [[], [], []]
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            p = px[min(max(x + dx, 0), w - 1), min(max(y + dy, 0), h - 1)]
            for k in range(3):
                vals[k].append(p[k])
    return max(max(v) - min(v) for v in vals) <= LIM


def stats(vals):
    mean = [round(sum(v[k] for v in vals) / len(vals)) for k in range(3)]
    mn = [round(min(v[k] for v in vals)) for k in range(3)]
    mx = [round(max(v[k] for v in vals)) for k in range(3)]
    out = sum(1 for v in vals if any(abs(v[k] - TARGET[k]) > TOL for k in range(3)))
    print(f"    mean={tuple(mean)} min={tuple(mn)} max={tuple(mx)} вне±{TOL}={out}/{len(vals)}")
    return mean, mn, mx, out


def main():
    bef_json, aft_json = sys.argv[1], sys.argv[2]
    label = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == '--label' else ''
    B = json.load(open(bef_json, encoding='utf-8'))
    A = json.load(open(aft_json, encoding='utf-8'))
    bim, bpx = load(bef_json[:-5] + '.png')
    aim, apx = load(aft_json[:-5] + '.png')
    W, H = bim.size

    bset, aset = {tuple(p) for p in B['empty']}, {tuple(p) for p in A['empty']}
    common = sorted(bset & aset)
    clean = [p for p in common if smooth(bpx, W, H, *p) and smooth(apx, W, H, *p)]
    print('=' * 92)
    print(f"ДО: {bef_json.split('/')[-1]}   ПОСЛЕ: {aft_json.split('/')[-1]}   {label}")
    print(f"  точек-кандидатов общих={len(common)}, прошли фильтр гладкости={len(clean)} "
          f"(обе картинки {W}x{H})")

    bv = [patch(bpx, W, H, x, y, 2) for x, y in clean]
    av = [patch(apx, W, H, x, y, 2) for x, y in clean]
    print('  ДО    (фон):'); stats(bv)
    print('  ПОСЛЕ (фон):'); stats(av)

    # именованные точки-пробы
    bmap = {(p['x'], p['y']): p for p in B['probes']}
    amap = {(p['x'], p['y']): p for p in A['probes']}
    print('  --- именованные точки (до / после) ---')
    for key in bmap:
        if key not in amap:
            continue
        x, y = key
        pb, pa = bmap[key], amap[key]
        bc = 'чисто' if pb.get('empty') else 'контент:' + ','.join(pb.get('reasons', []))[:28]
        ac = 'чисто' if pa.get('empty') else 'контент:' + ','.join(pa.get('reasons', []))[:28]
        b, a = patch(bpx, W, H, x, y, 2), patch(apx, W, H, x, y, 2)
        db = tuple(b[i] - TARGET[i] for i in range(3))
        da = tuple(a[i] - TARGET[i] for i in range(3))
        f = (lambda v: 'OK ' if all(abs(c) <= TOL for c in v) else 'ВНЕ')
        print(f"    {pb['name']:14s} ({x:4d},{y:4d}) до={str(b):16s} Δ{db} {f(db)}  ->  после={str(a):16s} Δ{da} {f(da)}   [{bc} | {ac}]")

    # средний тон всей картинки
    for name, im in (('ДО', bim), ('ПОСЛЕ', aim)):
        sm = im.resize((im.width // 4 or 1, im.height // 4 or 1))
        px = list(sm.getdata())
        mean = tuple(round(sum(c[k] for c in px) / len(px)) for k in range(3))
        hist = {}
        for c in px:
            k = (c[0] // 6 * 6, c[1] // 6 * 6, c[2] // 6 * 6)
            hist[k] = hist.get(k, 0) + 1
        top = sorted(hist.items(), key=lambda kv: -kv[1])[:2]
        print(f"  средний тон {name}: {mean}  доминирующий: {[(k, round(100 * v / len(px))) for k, v in top]}")


if __name__ == '__main__':
    main()
