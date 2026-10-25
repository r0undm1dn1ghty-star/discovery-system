#!/usr/bin/env python
"""qa/shots-plasma/measure.py — читает PNG + JSON-диагностику, печатает RGB в точках фона.
Запуск: python qa/shots-plasma/measure.py <before.json> [after.json ...]
Пиксели берутся 1:1 (скриншот снят с deviceScaleFactor=1), т.к. точки заданы в CSS-px.
"""
import json
import sys
from PIL import Image

TARGET = (17, 21, 36)  # #111524


def rgb_at(im, x, y, r=2):
    """средний RGB по квадрату (2r+1)^2 — сглаживает шум ПНГ/дитеринг"""
    px = im.load()
    acc = [0, 0, 0]
    n = 0
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            xx, yy = min(max(x + dx, 0), im.width - 1), min(max(y + dy, 0), im.height - 1)
            p = px[xx, yy]
            acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2]
            n += 1
    return tuple(round(v / n) for v in acc)


def main():
    rows = {}
    for arg in sys.argv[1:]:
        data = json.load(open(arg, encoding='utf-8'))
        png = arg[:-5] + '.png'
        im = Image.open(png).convert('RGB')
        entry = {
            'png': png, 'size': im.size, 'url': data['url'], 'mode': (data.get('plasma') or {}).get('mode'),
            'running': (data.get('plasma') or {}).get('running'), 'canvas': data['canvas'],
            'bodyBg': data['bodyBg'], 'probes': {}, 'empty': {},
        }
        for p in data['probes']:
            entry['probes'][p['name']] = {'xy': (p['x'], p['y']), 'at': p['at'],
                                          'rgb': rgb_at(im, p['x'], p['y'])}
        for (x, y) in data['empty']:
            entry['empty'][f'{x},{y}'] = rgb_at(im, x, y, 1)
        # средний тон всей картинки и доминирующий цвет (квантование 8)
        small = im.resize((im.width // 4 or 1, im.height // 4 or 1))
        px = list(small.getdata())
        mean = tuple(round(sum(c[i] for c in px) / len(px)) for i in range(3))
        hist = {}
        for c in px:
            k = (c[0] // 6 * 6, c[1] // 6 * 6, c[2] // 6 * 6)
            hist[k] = hist.get(k, 0) + 1
        top = sorted(hist.items(), key=lambda kv: -kv[1])[:3]
        entry['mean'] = mean
        entry['dominant'] = [(k, round(100 * v / len(px), 1)) for k, v in top]
        rows[arg] = entry

    for arg, e in rows.items():
        print('=' * 78)
        print(f"{arg}  [{e['mode']}/{e['running']}]  bodyBg={e['bodyBg']}  png={e['png']} {e['size']}")
        print('--- точки фона (CSS-px, RGB средний по 5x5) ---')
        for name, v in e['probes'].items():
            d = tuple(v['rgb'][i] - TARGET[i] for i in range(3))
            flag = 'OK ' if all(abs(x) <= 12 for x in d) else 'ВНЕ'
            print(f"  {name:15s} {str(v['xy']):12s} at={str(v['at']):18s} rgb={v['rgb']}  Δ={d}  {flag}")
        print('--- все пустые точки сетки 7x5 (RGB) ---')
        for k, v in e['empty'].items():
            d = tuple(v[i] - TARGET[i] for i in range(3))
            flag = 'OK ' if all(abs(x) <= 12 for x in d) else 'ВНЕ'
            print(f"  {k:12s} rgb={v}  Δ={d}  {flag}")
        print(f"--- средний тон: {e['mean']}   доминирующий: {e['dominant']}   цель={TARGET}")


if __name__ == '__main__':
    main()
