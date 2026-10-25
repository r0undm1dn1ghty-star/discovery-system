
"""Фильтр «чистых» точек фона: плазма гладкая, текст/плашки дают резкий контраст.
Оставляем точки, где в окне 9x9 разброс по каналу <= LIM.""",
import json, sys
from PIL import Image
LIM = 10
for arg in sys.argv[1:]:
    d = json.load(open(arg, encoding='utf-8'))
    im = Image.open(arg[:-5] + '.png').convert('RGB'); px = im.load()
    keep, drop = [], []
    for (x, y) in d['empty']:
        mx = 0
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                p = px[min(max(x+dx,0),im.width-1), min(max(y+dy,0),im.height-1)]
                for k in range(3):
                    mx = max(mx, 0)  # placeholder
        # считаем реальный разброс
        vals = [[],[],[]]
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                p = px[min(max(x+dx,0),im.width-1), min(max(y+dy,0),im.height-1)]
                for k in range(3): vals[k].append(p[k])
        span = max(max(v)-min(v) for v in vals)
        (keep if span <= LIM else drop).append([x, y])
    d['empty_raw'] = d['empty']
    d['empty'] = keep
    d['dropped'] = len(drop)
    out = arg.replace('.json', '-clean.json')
    json.dump(d, open(out, 'w', encoding='utf-8'))
    print(f"{arg.split('/')[-1]:28s} kept={len(keep):3d} dropped={len(drop):3d} -> {out.split('/')[-1]}")
