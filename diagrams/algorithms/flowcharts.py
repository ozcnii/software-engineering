#!/usr/bin/env python3
"""Схемы алгоритмов по ГОСТ 19.701-90 (ИСО 5807-85).

Генерирует prim.svg / bfs.svg (и далее prim.png / bfs.png через rsvg-convert).
Раскладка задаётся вручную, чтобы гарантировать требования ГОСТ:
  - строгая вертикаль, «Начало» сверху, «Конец» снизу;
  - терминатор — скруглённый прямоугольник; процесс — прямоугольник;
    данные (ввод/вывод) — параллелограмм; решение — ромб;
  - линии потока ортогональные; направление сверху-вниз/слева-направо без
    стрелок, стрелки — на возвратах цикла и на входах в блоки после поворота;
  - сходящиеся линии СЛИВАЮТСЯ в одну и входят в блок одной линией
    (в каждый блок ведёт ровно одна линия).
Запуск:  python3 flowcharts.py  &&  rsvg-convert -z 2 prim.svg -o prim.png
"""
import os

FONT = "Arial, 'Helvetica Neue', sans-serif"
STROKE = "#333333"; SW = 2; FS = 13; LH = 16
_S = []


def hdr(w, h):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" font-family="{FONT}" font-size="{FS}">'
            f'<rect width="{w}" height="{h}" fill="white"/>'
            f'<defs><marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" '
            f'orient="auto" markerUnits="userSpaceOnUse">'
            f'<path d="M0,0 L8,3 L0,6 z" fill="{STROKE}"/></marker></defs>')


def _txt(cx, cy, lines):
    n = len(lines); y0 = cy - (n - 1) * LH / 2
    t = (f'<text x="{cx}" y="{y0}" text-anchor="middle" '
         f'dominant-baseline="central" fill="{STROKE}">')
    for i, ln in enumerate(lines):
        t += f'<tspan x="{cx}" dy="{0 if i == 0 else LH}">{ln}</tspan>'
    return t + '</text>'


def _shape(nd):
    x, y, w, h, k = nd['x'], nd['y'], nd['w'], nd['h'], nd['k']
    if k == 'rect':
        _S.append(f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" '
                  f'fill="white" stroke="{STROKE}" stroke-width="{SW}"/>')
    elif k == 'term':
        _S.append(f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" '
                  f'rx="{h/2}" ry="{h/2}" fill="white" stroke="{STROKE}" stroke-width="{SW}"/>')
    elif k == 'io':
        s = 16
        pts = f'{x-w/2+s},{y-h/2} {x+w/2},{y-h/2} {x+w/2-s},{y+h/2} {x-w/2},{y+h/2}'
        _S.append(f'<polygon points="{pts}" fill="white" stroke="{STROKE}" stroke-width="{SW}"/>')
    elif k == 'dia':
        pts = f'{x},{y-h/2} {x+w/2},{y} {x},{y+h/2} {x-w/2},{y}'
        _S.append(f'<polygon points="{pts}" fill="white" stroke="{STROKE}" stroke-width="{SW}"/>')
    _S.append(_txt(x, y, nd['t']))


def poly(points, arrow=False):
    p = ' '.join(f'{x},{y}' for x, y in points)
    m = ' marker-end="url(#arr)"' if arrow else ''
    _S.append(f'<polyline points="{p}" fill="none" stroke="{STROKE}" stroke-width="{SW}"{m}/>')


def label(x, y, s):
    _S.append(f'<text x="{x}" y="{y}" fill="{STROKE}" font-size="{FS}">{s}</text>')


def save(path, w, h, nodes):
    for nd in nodes.values():
        _shape(nd)
    open(path, 'w').write(hdr(w, h) + ''.join(_S) + '</svg>')
    _S.clear()


# ---------------------------------------------------------------- helpers
def stack(seq, Xc, top, gap, bigbefore=None, biggap=0):
    N = {}; y = top
    for nid, k, w, h, t in seq:
        if bigbefore and nid == bigbefore:
            y += biggap - gap
        N[nid] = dict(k=k, x=Xc, y=y + h / 2, w=w, h=h, t=t)
        y += h + gap
    return N, y - gap + top


def edges(N, Xc):
    cy = lambda n: N[n]['y']
    t_ = lambda n: N[n]['y'] - N[n]['h'] / 2
    b_ = lambda n: N[n]['y'] + N[n]['h'] / 2
    l_ = lambda n: N[n]['x'] - N[n]['w'] / 2
    r_ = lambda n: N[n]['x'] + N[n]['w'] / 2
    down = lambda a, b, arrow=False: poly([(Xc, b_(a)), (Xc, t_(b))], arrow)
    return cy, t_, b_, l_, r_, down


# ---------------------------------------------------------------- Прим
def build_prim():
    Xc, top, gap = 320, 28, 34
    Xr, Xl = 560, 58
    seq = [
        ('start', 'term', 120, 44, ["Начало"]),
        ('in', 'io', 240, 50, ["Ввести ширину", "и высоту сетки"]),
        ('create', 'rect', 250, 50, ["Создать сетку,", "заполненную стенами"]),
        ('pick', 'rect', 320, 50, ["Случайно выбрать стартовую", "клетку с нечётными координатами"]),
        ('mark', 'rect', 250, 50, ["Пометить стартовую клетку", "как пройденную"]),
        ('addf', 'rect', 280, 50, ["Добавить фронтиры стартовой", "клетки в список фронтиров"]),
        ('d1', 'dia', 230, 94, ["Список фронтиров", "не пуст?"]),
        ('extract', 'rect', 230, 50, ["Случайно извлечь", "фронтир из списка"]),
        ('d2', 'dia', 260, 104, ["Целевая клетка фронтира", "уже посещена?"]),
        ('wall', 'rect', 230, 50, ["Перевести стену", "фронтира в проход"]),
        ('markt', 'rect', 270, 50, ["Пометить целевую клетку", "как пройденную"]),
        ('addt', 'rect', 300, 50, ["Добавить фронтиры целевой", "клетки в список фронтиров"]),
        ('ret', 'io', 240, 50, ["Вернуть готовую", "сетку лабиринта"]),
        ('finish', 'term', 120, 44, ["Конец"]),
    ]
    N, H = stack(seq, Xc, top, gap)
    cy, t_, b_, l_, r_, down = edges(N, Xc)
    for a, b in [('start', 'in'), ('in', 'create'), ('create', 'pick'),
                 ('pick', 'mark'), ('mark', 'addf')]:
        down(a, b)
    down('addf', 'd1', arrow=True)
    down('d1', 'extract'); down('extract', 'd2'); down('d2', 'wall')
    down('wall', 'markt'); down('markt', 'addt')
    down('ret', 'finish', arrow=True)
    ym = t_('d1') - 17
    poly([(r_('addt'), cy('addt')), (Xr, cy('addt')), (Xr, ym), (Xc, ym)])  # возврат
    poly([(r_('d2'), cy('d2')), (Xr, cy('d2'))])                            # d2(да) вливается
    poly([(l_('d1'), cy('d1')), (Xl, cy('d1')), (Xl, cy('ret')), (l_('ret'), cy('ret'))], arrow=True)
    label(Xc + 8, (b_('d1') + t_('extract')) / 2 + 4, "да")
    label(l_('d1') - 30, cy('d1') - 6, "нет")
    label(Xc + 8, (b_('d2') + t_('wall')) / 2 + 4, "нет")
    label(r_('d2') + 6, cy('d2') - 6, "да")
    save(os.path.join(os.path.dirname(__file__), 'prim.svg'), 620, int(H), N)


# ---------------------------------------------------------------- BFS
def build_bfs():
    Xc, top, gap, bigg = 350, 28, 34, 74
    Xr_in, Xr_out, Xl_s, Xl_f = 505, 552, 140, 40
    seq = [
        ('start', 'term', 120, 44, ["Начало"]),
        ('in', 'io', 330, 50, ["Ввести сетку лабиринта,", "клетку входа и клетку выхода"]),
        ('enq0', 'rect', 330, 50, ["Положить клетку входа в очередь", "и в множество посещённых"]),
        ('prevmap', 'rect', 210, 50, ["Создать пустую", "карту предков"]),
        ('dq', 'dia', 180, 92, ["Очередь", "не пуста?"]),
        ('deq', 'rect', 230, 50, ["Извлечь клетку", "из начала очереди"]),
        ('dgoal', 'dia', 280, 104, ["Извлечённая клетка", "совпадает с выходом?"]),
        ('dnb', 'dia', 280, 104, ["Остались необработанные", "соседи?"]),
        ('taken', 'rect', 240, 50, ["Взять очередного", "проходимого соседа"]),
        ('dvis', 'dia', 200, 92, ["Сосед уже", "посещён?"]),
        ('addv', 'rect', 250, 50, ["Добавить соседа в", "множество посещённых"]),
        ('setp', 'rect', 250, 50, ["Записать текущую клетку", "как предка соседа"]),
        ('enq', 'rect', 220, 50, ["Положить соседа", "в конец очереди"]),
        ('restore', 'rect', 300, 50, ["Восстановить путь по карте", "предков от выхода ко входу"]),
        ('invert', 'rect', 230, 50, ["Инвертировать", "последовательность"]),
        ('retpath', 'io', 160, 50, ["Вернуть путь"]),
        ('finish', 'term', 120, 44, ["Конец"]),
    ]
    N, H = stack(seq, Xc, top, gap, bigbefore='restore', biggap=bigg)
    N['nopath'] = dict(k='io', x=160, y=N['retpath']['y'], w=210, h=50,
                       t=["Вернуть признак", "отсутствия пути"])
    cy, t_, b_, l_, r_, down = edges(N, Xc)
    for a, b in [('start', 'in'), ('in', 'enq0'), ('enq0', 'prevmap')]:
        down(a, b)
    down('prevmap', 'dq', arrow=True)
    down('dq', 'deq'); down('deq', 'dgoal'); down('dgoal', 'dnb', arrow=True)
    down('dnb', 'taken'); down('taken', 'dvis'); down('dvis', 'addv')
    down('addv', 'setp'); down('setp', 'enq')
    down('restore', 'invert'); down('invert', 'retpath')
    ydnb = t_('dnb') - 16
    poly([(r_('enq'), cy('enq')), (Xr_in, cy('enq')), (Xr_in, ydnb), (Xc, ydnb)])  # внутр. возврат
    poly([(r_('dvis'), cy('dvis')), (Xr_in, cy('dvis'))])                          # dvis(да)
    ydq = t_('dq') - 16
    poly([(r_('dnb'), cy('dnb')), (Xr_out, cy('dnb')), (Xr_out, ydq), (Xc, ydq)])  # внешн. возврат
    yr = t_('restore') - 16
    poly([(l_('dgoal'), cy('dgoal')), (Xl_s, cy('dgoal')), (Xl_s, yr), (Xc, yr),
          (Xc, t_('restore'))], arrow=True)                                        # да -> restore
    poly([(l_('dq'), cy('dq')), (Xl_f, cy('dq')), (Xl_f, cy('nopath')),
          (l_('nopath'), cy('nopath'))], arrow=True)                               # нет -> nopath
    poly([(Xc, b_('retpath')), (Xc, t_('finish'))], arrow=True)                    # -> Конец
    ym = t_('finish') - 18
    poly([(N['nopath']['x'], b_('nopath')), (N['nopath']['x'], ym), (Xc, ym)])     # слияние
    label(Xc + 8, (b_('dq') + t_('deq')) / 2 + 4, "да")
    label(Xl_f + 4, cy('dq') - 6, "нет")
    label(Xc + 8, (b_('dgoal') + t_('dnb')) / 2 + 4, "нет")
    label(l_('dgoal') - 26, cy('dgoal') - 6, "да")
    label(Xc + 8, (b_('dnb') + t_('taken')) / 2 + 4, "да")
    label(r_('dnb') + 6, cy('dnb') - 6, "нет")
    label(Xc + 8, (b_('dvis') + t_('addv')) / 2 + 4, "нет")
    label(r_('dvis') + 6, cy('dvis') - 6, "да")
    save(os.path.join(os.path.dirname(__file__), 'bfs.svg'), 660, int(H), N)


if __name__ == '__main__':
    build_prim()
    build_bfs()
    print("svg generated")
