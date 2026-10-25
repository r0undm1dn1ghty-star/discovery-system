#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""qa/shots-plasma/liveness.py — «плазма живая?»: временная динамика + пространственный разброс.
Запуск: python qa/shots-plasma/liveness.py <points.json> <shotA.png> <shotB.png> [<shotC.png> <shotD.png>]
Сравнивает попарно (A,B) и (C,D) на одних и тех же точках фона.
"""
import json
import sys
from PIL import Image
from compare import patch, smooth, load, LIM

TARGET = (17, 21, 36)


def build_set(pairs):
    js = json.load(open(pairs[0][1], encoding='utf-8'))
    ims = [load(p)[0] for p in pairs[0]]
    W, H = ims[0].size
    pts = [tuple(p) for p in js['empty']]
    pxs = [load(p)[1] for p in pairs[0]]
    return [p for p in pts if all(smooth(px, W, H, *p) for px in pxs)], W, H


def main():
    pts_file = sys.argv[1]
    pairs = [(sys.argv[2], sys.argv[3])]
    if len(sys.argv) > 5:
        pairs.append((sys.argv[4], sys.argv[5]))
    # общий набор точек: берём из первого шота каждой пары + фильтр гладкости
    allshots = [p for pr in pairs for p in pr]
    im0 = load(allshots[0])[0]
    W, H = im0.size
    pts = [tuple(p) for p in json.load(open(pts_file, encoding='utf-8'))['empty']]
    pxs = [load(p)[1] for p in allshots]
    clean = [p for p in pts if all(smooth(px, W, H, *p) for px in pxs)]
    print(f"точек фона для проверки: {len(clean)}  ({W}x{H})")
    for i, (a, b) in enumerate(pairs):
        pa, pb = load(a)[1], load(b)[1]
        va = [patch(pa, W, H, x, y, 4) for x, y in clean]
        vb = [patch(pb, W, H, x, y, 4) for x, y in clean]
        d = [tuple(abs(va[i2][k] - vb[i2][k]) for k in range(3)) for i2 in range(len(clean))]
        mean_d = [round(sum(x[k] for x in d) / len(d), 2) for k in range(3)]
        moved = sum(1 for x in d if max(x) >= 3)
        spread = [round(max(v[k] for v in va) - min(v[k] for v in va)) for k in range(3)]
        print(f"  пара {i+1}: {a.split('/')[-1]} vs {b.split('/')[-1]}")
        print(f"     кадр-A: пространственный разброс фона R/G/B = {spread}  (0 = плоско/не живая)")
        print(f"     сдвиг кадра между снимками: средний |Δ| = {mean_d}, точек сдвинулось ≥3: {moved}/{len(clean)}")
        sd = dict(A=va); 
        print(f"     кадр-A в точках: min={tuple(min(v[k] for v in va) for k in range(3))} max={tuple(max(v[k] for v in va) for k in range(3))}")


if __name__ == '__main__':
    main()
