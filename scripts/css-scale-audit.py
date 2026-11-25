#!/usr/bin/env python3
"""Аудит размеров и отступов: находит значения вне шкалы.

Зачем: на страницах копились «почти одинаковые» отступы (22/18/14/10…),
из-за чего блоки не держат общий ритм, а каждая правка добавляла ещё одно
значение рядом со старым. Скрипт считает такие значения по исходникам —
без браузера, за секунду, и падает, если их снова стало слишком много.

Шкала отступов (4px):  4 8 12 16 20 24 28 32 36 40 48 56 64 72 80 96
Шкала кеглей:         12.5 14 15 17 19 22 28 38 54

Не трогает: значения в calc()/clamp()/vw/%/em, сцену на var(--u)
(она пропорциональная по замыслу), border-width (1px — это линия, не отступ).

    python scripts/css-scale-audit.py            # отчёт
    python scripts/css-scale-audit.py --max 60   # порог для CI (по умолчанию 60)
"""
import glob
import os
import re
import sys

# шкала = сетка 4px до 160 + 2px как оптическая поправка (бордюр, сдвиг на линию)
def on_grid(v):
    return v in (2, 4) or (8 <= v <= 240 and v % 4 == 0)
TYPE = (11, 12.5, 14, 15, 17, 19, 22, 28, 32, 38, 54)
PROPS = ('margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
         'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
         'gap', 'row-gap', 'column-gap')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def css_chunks(text):
    for m in re.finditer(r'<style[^>]*>([\s\S]*?)</style>', text):
        yield m.group(1)
    if not text.lstrip().startswith('<'):
        yield text


def audit(path):
    text = open(path, encoding='utf-8', errors='ignore').read()
    off_space, off_type, total = {}, {}, 0
    for css in css_chunks(text):
        if 'var(--u)' in css and len(css) < 4000:
            continue                      # мелкие блоки сцены — пропорциональные
        for m in re.finditer(r'([a-z-]+)\s*:\s*(-?[\d.]+)px(?![\d.])', css):
            prop, raw = m.group(1), float(m.group(2))
            if prop in PROPS:
                total += 1
                if raw > 0 and not on_grid(raw):
                    off_space[raw] = off_space.get(raw, 0) + 1
            elif prop == 'font-size' and 11 <= raw <= 60 and raw not in TYPE:
                off_type[raw] = off_type.get(raw, 0) + 1
    return off_space, off_type, total


def main():
    limit = 60
    if '--max' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--max') + 1])
    files = sorted(glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, '*.css')))
    grand_space = grand_type = grand_total = 0
    rows = []
    for f in files:
        off_space, off_type, total = audit(f)
        n_sp = sum(off_space.values())
        n_ty = sum(off_type.values())
        if n_sp or n_ty:
            rows.append((os.path.basename(f), n_sp, n_ty, total,
                         sorted(off_space.items(), key=lambda x: -x[1])[:4]))
        grand_space += n_sp
        grand_type += n_ty
        grand_total += total
    rows.sort(key=lambda r: -r[1])
    print(f'{"файл":32} {"вне шкалы":>9} {"кегли":>7} {"всего":>7}  частые')
    for name, n_sp, n_ty, total, top in rows[:20]:
        tops = ', '.join(f'{v:g}px×{c}' for v, c in top)
        print(f'{name:32} {n_sp:>9} {n_ty:>7} {total:>7}  {tops}')
    print(f'\nИтого: отступов вне шкалы {grand_space} из {grand_total} '
          f'({100 * grand_space / max(grand_total, 1):.0f}%), кеглей вне шкалы {grand_type}')
    if grand_space > limit:
        print(f'ПРОВАЛ: больше порога {limit}. Новые значения — только из шкалы.')
        return 1
    print(f'ОК: в пределах порога {limit}.')
    return 0


if __name__ == '__main__':
    sys.exit(main())