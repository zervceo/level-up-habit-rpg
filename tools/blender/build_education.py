"""Education sector — Wall Street at dusk (finance mastery ladder, classes, deadlines, schoolwork goal).

Hotspots wired in education-explore.js:
  HS_topic_<id> x5   the five finance topics, one pavilion each (log study time, see Wall Street title)
  HS_exchange        the Trading Floor: assignments / deadlines / classes / weekly schoolwork goal
  HS_bull            the Charging Bull: overall rank
  KEEP_ticker        the Exchange's LED marquee (JS paints your upcoming deadlines onto it)
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa

PI = math.pi
ST_W = 16.0          # street width
SIDE = ST_W / 2 + 5  # outer sidewalk edge (13)


def build(out):
    reset()
    rnd = random.Random(21)
    asphalt = M('asphalt', 0x1B1C25, .95)
    granite = M('granite', 0x8C93A3, .85)
    curb = M('curb', 0xB8BDC9, .8)
    gold = M('gold', 0xD4AF37, .3, metal=1.0)
    gold_flat = M('goldflat', 0xD4AF37, .5)
    white = M('white', 0xEDEFF4, .7)
    black = M('black', 0x14151C, .6)
    navy = M('navy', 0x16305C, .7)
    slate = M('slate', 0x2F3B55, .7)
    stone = M('stone', 0x8A837B, .85)
    brick = M('brick', 0x5A3A35, .9)
    limestone = M('limestone', 0xE8E2D2, .8)
    bldg = [navy, slate, stone, brick]
    win_lit = M('winlit', 0xFFD98A, .3, emit=0xFFC766, strength=1.7)
    win_dark = M('windark', 0x0B1428, .25, metal=.5)
    pier = M('pier', 0x232B3F, .8)
    green_led = M('greenled', 0x22FF7A, .3, emit=0x00E060, strength=4.0)
    red_led = M('redled', 0xFF5560, .3, emit=0xFF2030, strength=4.0)
    lamp = M('lamp', 0xFFF0C0, .3, emit=0xFFD27A, strength=5.0)
    iron = M('iron', 0x20222B, .5, metal=.8)
    bronze = M('bronze', 0xB5812E, .32, metal=.85)
    bronze_dk = M('bronzedk', 0x8A6324, .4, metal=.8)
    red = M('red', 0xC8302E, .6)
    taxi_y = M('taxi', 0xF7B500, .4, metal=.3)
    glass = M('glass', 0x1B2A3C, .15, metal=.4)
    tire = M('tire', 0x16161A, .9)
    wood = M('wood', 0x7A5632, .7)
    leaf = M('leaf', 0x2D6B3F, .85)
    bark = M('bark', 0x4A3828, .9)
    green = M('green', 0x00C853, .6)
    parch = M('parch', 0xF1E8CF, .9)
    ink_line = M('inkline', 0x3A8A5A, .9)
    paper_g = M('paperg', 0xDFF0DD, .9)

    # ------------------------------------------------------------ street + sidewalks
    box((260, .2, 260), (0, -.1, 0), pier, name='ground')
    box((ST_W, .08, 150), (0, .04, 0), asphalt, name='road')
    for sx in (-1, 1):
        box((5, .22, 150), (sx * 10.5, .11, 0), granite, name='sidewalk')
        box((.35, .26, 150), (sx * 8.1, .13, 0), curb, name='curb')
    for z in range(-70, 71, 4):
        box((.22, .02, 2.2), (0, .1, z), gold_flat, name='dash')
    for z0 in (34, 8, -22):
        for i in range(11):
            box((.7, .02, 3.0), (-7.4 + i * 1.48, .1, z0), white, name='zebra')

    # ------------------------------------------------------------ skyscraper canyon
    def facade(side, xface, zc, width_z, y0, y1, seed):
        r = random.Random(seed)
        cols = max(2, int(width_z / 1.7))
        rows = max(2, int((y1 - y0) / 2.5))
        dx = width_z / cols
        dy = (y1 - y0) / rows
        windows(cols, rows, dx, dy, dx * .52, dy * .6, (side * xface - side * .04, (y0 + y1) / 2, zc), win_lit, win_dark,
                ry=(PI / 2 if side < 0 else -PI / 2), lit=r.uniform(.35, .7), seed=seed, name='wins')
        for i in range(cols + 1):
            box((.28, y1 - y0, .5), (side * xface - side * .12, (y0 + y1) / 2, zc - width_z / 2 + i * dx), limestone, name='pil')

    def tower(side, zc, wz, h1, h2, h3, m_i, seed):
        mat = bldg[m_i % 4]
        y = 0
        specs = ((0.0, wz, h1), (2.4, wz - 3.0, h2), (5.0, max(5.0, wz - 6.6), h3))
        for t, (inset, dz, hh) in enumerate(specs):
            Wx = 16 - inset * .9
            xface = SIDE + inset
            cx = side * (xface + Wx / 2)
            box((Wx, hh, dz), (cx, y + hh / 2, zc), mat, name='tier')
            box((Wx + .5, .45, dz + .5), (cx, y + hh, zc), gold, name='cornice')
            box((Wx + .3, .2, dz + .3), (cx, y + hh - .7, zc), limestone, name='cornice2')
            facade(side, xface, zc, dz - .6, y + 1.2, y + hh - 1.0, seed * 10 + t)
            y += hh
        cx = side * (SIDE + 5.0 + 5.5)
        cyl(2.2, 6.0, (cx, y + 3.0, zc), limestone, seg=4, r2=.15, rot=(0, PI / 4, 0), smooth=False, name='spire')
        cyl(.08, 3.0, (cx, y + 7.4, zc), gold, seg=6, name='mast')

    z = 46.0
    i = 0
    while z > -30:
        wz = rnd.choice((11.5, 12.5, 13.5, 12.0))
        zc = z - wz / 2
        for side in (-1, 1):
            tower(side, zc, wz, rnd.uniform(16, 24), rnd.uniform(10, 18), rnd.uniform(8, 16), rnd.randint(0, 3), 100 + i * 7 + (1 if side > 0 else 0))
        z -= wz + .4
        i += 1
    # wings flanking the Exchange + skyline backdrop
    for sx in (-1, 1):
        box((26, 26, 26), (sx * 28, 13, -46), stone, name='wing')
        box((26.6, .5, 26.6), (sx * 28, 26, -46), gold, name='wingcornice')
        windows(12, 8, 2.0, 2.9, 1.0, 1.6, (sx * (28 - sx * 0) - sx * 0, 13, -32.9), win_lit, win_dark, ry=0, lit=.5, seed=300 + sx, name='wingwins')
    for k in range(16):
        x = rnd.uniform(-70, 70)
        if abs(x) < 20:
            x += 40 * (1 if x >= 0 else -1)
        hh = rnd.uniform(30, 80)
        box((rnd.uniform(9, 14), hh, rnd.uniform(9, 14)), (x, hh / 2, rnd.uniform(-95, -70)), bldg[k % 4], name='far')
    for k in range(14):
        x = rnd.uniform(-60, 60)
        hh = rnd.uniform(24, 60)
        box((rnd.uniform(9, 13), hh, 10), (x, hh / 2, rnd.uniform(60, 90)), bldg[k % 4], name='backfar')

    # ------------------------------------------------------------ the Exchange (hotspot)
    with group('HS_exchange', at=(0, 0, -46)):
        for i in range(7):
            box((34 - i * 1.2, .28, 14 - i * .9 + 4), (0, .14 + i * .28, 7.5 - i * .45), limestone, name='step')
        box((30, 15.6, 17), (0, 1.96 + 7.8, -4.5), limestone, name='body')
        box((32, 1.6, 4.4), (0, 1.96 + 15.6 + .8, 1.9), limestone, name='entab')
        box((32.2, .35, 4.6), (0, 1.96 + 15.6 + 1.7, 1.9), gold, name='entab_gold')
        prism([(-16, 0), (16, 0), (0, 5.2)], 4.0, (0, 1.96 + 17.4, 1.9), limestone, name='pediment')
        prism([(-13.5, .4), (13.5, .4), (0, 4.1)], .3, (0, 1.96 + 17.4, 4.0), stone, name='tympanum')
        cyl(1.4, .3, (0, 1.96 + 20.3, 4.12), gold, rot=(PI / 2, 0, 0), seg=40, name='emblem')
        for k in range(8):
            cx = -12.6 + k * 3.6
            lathe([(1.15, 0), (1.15, .35), (.82, .45), (.76, 1.0), (.74, 12.2), (.8, 12.5), (1.05, 12.7), (1.05, 13.2), (.0, 13.2)],
                  (cx, 1.96, 6.2), limestone, seg=18, name='col')
        box((30, 1.8, 3.4), (0, 1.96 + 14.8 + 1.0, 6.2), limestone, name='colcap')
        box((14, 8.5, .4), (0, 1.96 + 4.5, 4.1), black, name='door_hole')
        box((15.2, .5, .6), (0, 1.96 + 8.9, 4.3), gold, name='lintel')
        quad(13.2, 8.0, (0, 1.96 + 4.3, 4.32), M('hall', 0x2B1D0D, .8, emit=0x7A4510, strength=1.2), name='hallglow')
        for k in range(4):
            box((.1, 8.0, .12), (-4.95 + k * 3.3, 1.96 + 4.3, 4.34), gold, name='doormull')
        text('THE TRADING FLOOR', 1.05, (0, 1.96 + 16.45, 4.3), gold, extrude=.12, name='exname')
        box((26.4, 1.25, .12), (0, 1.96 + 12.9, 4.6), black, name='tickerframe')
        quad(26.0, 1.0, (0, 1.96 + 12.9, 4.68), M('tickerblank', 0x0A0A0A, .3, emit=0x0A3A1A, strength=1.0), name='KEEP_ticker')
        for sx in (-1, 1):
            seg((sx * 15.4, 1.96 + 18.5, 4.2), (sx * 15.4, 1.96 + 25.5, 4.2), .1, gold, sides=8, name='fpole')
            ribbon([(sx * 15.4, 1.96 + 25.2, 4.2), (sx * 15.4 + sx * 1.4, 1.96 + 25.0, 4.2), (sx * 15.4 + sx * 2.8, 1.96 + 25.2, 4.2)],
                   [1.6, 1.5, 1.2], (0, 0, 0), navy, up=(0, 0, 1), name='fflag')

    # ------------------------------------------------------------ the Charging Bull (hotspot)
    with group('HS_bull', at=(0, 0, 31), ry=0.0):
        box((5.4, .8, 8.6), (0, .4, 0), granite, name='bplinth')
        box((5.8, .18, 9.0), (0, .8, 0), curb, name='bplinthcap')
        by = .9
        sph(1, (0, by + 1.55, -.55), bronze, scale=(1.0, 1.05, 1.85), seg=24, name='bbody')
        sph(1, (0, by + 2.0, .55), bronze, scale=(1.05, 1.0, 1.0), seg=20, name='bshoulder')
        sph(1, (0, by + 1.3, -1.9), bronze, scale=(.9, .85, .9), seg=18, name='brump')
        sph(1, (0, by + 1.5, 1.9), bronze, scale=(.68, .72, .95), seg=18, rot=(.35, 0, 0), name='bhead')
        sph(1, (0, by + 1.18, 2.75), bronze, scale=(.45, .38, .55), seg=14, rot=(.35, 0, 0), name='bsnout')
        for sx in (-1, 1):
            p = [(sx * .55, by + 1.95, 2.0), (sx * 1.05, by + 2.1, 2.15), (sx * 1.4, by + 2.6, 2.25), (sx * 1.3, by + 3.0, 2.4)]
            for a, b, r1, r2 in ((0, 1, .12, .1), (1, 2, .1, .07), (2, 3, .07, .02)):
                seg(p[a], p[b], r1, M('horn', 0xE8DCC0, .4, metal=.2), r2=r2, sides=8, name='horn')
            sph(.12, (sx * .62, by + 1.95, 1.4), bronze, scale=(.4, .7, .5), seg=8, name='ear')
            sph(.07, (sx * .32, by + 1.55, 2.5), black, seg=8, name='eye')
            sph(.045, (sx * .18, by + 1.1, 3.15), black, seg=6, name='nostril')
        for (lx, lz, ph) in ((-.55, 1.0, 0), (.55, 1.0, 1), (-.5, -1.5, 1), (.5, -1.5, 0)):
            kneex = (lx, by + .85, lz + (.5 if ph else -.35))
            seg((lx, by + 1.2, lz), kneex, .3, bronze, r2=.2, sides=10, name='thigh')
            seg(kneex, (lx, by + .12, lz + (.9 if ph else -.55)), .2, bronze, r2=.14, sides=10, name='shin')
            cyl(.19, .16, (lx, by + .08, lz + (.95 if ph else -.6)), bronze_dk, seg=10, name='hoof')
        seg((0, by + 1.7, -2.5), (0, by + 1.2, -3.4), .12, bronze, r2=.05, sides=8, name='tail')
        seg((0, by + 1.2, -3.4), (.15, by + .5, -3.5), .05, bronze, r2=.14, sides=8, name='tail2')
        text('CHARGING BULL', .34, (0, .6, 4.32), gold, extrude=.02, name='bplaque')
        text('Arturo Di Modica, 1989', .2, (0, .32, 4.32), white, extrude=.01, name='bplaque2')

    # ------------------------------------------------------------ five topic pavilions (hotspots)
    def pavilion(topic, side, zc, label, props, formula=''):
        with group('HS_topic_' + topic, at=(side * (SIDE - 2.5), 0, zc), ry=(PI / 2 if side < 0 else -PI / 2)):
            box((4.8, .16, 4.4), (0, .26, 0), curb, name='pbase')
            for sx in (-2.15, 2.15):
                cyl(.07, 3.6, (sx, 2.0, -1.8), iron, seg=8, name='ppost')
            box((4.6, 1.0, .16), (0, 4.0, -1.8), navy, name='psign')
            box((4.8, .12, .22), (0, 4.55, -1.8), gold, name='psigntrim')
            box((4.8, .12, .22), (0, 3.45, -1.8), gold, name='psigntrim')
            text(label, .34, (0, 4.14, -1.7), gold, extrude=.03, name='plabel')
            if formula:
                text(formula, .17, (0, 3.74, -1.7), white, extrude=.01, name='pformula')
            props()

    def accounting_props():
        # giant open ledger on a lectern, calculator, abacus
        lathe([(.7, .34), (.7, .45), (.3, .6), (.25, 1.2), (.5, 1.3), (.0, 1.3)], (0, 0, -.2), wood, seg=16, name='lect')
        with group('led', at=(0, 1.72, -.15), rot=(.5, 0, 0)):
            box((2.5, .08, 1.6), (0, 0, 0), M('ledcover', 0x4B1E1E, .6), name='ledcover')
            box((1.15, .06, 1.45), (-.6, .06, 0), parch, rot=(0, 0, .05), name='pageL')
            box((1.15, .06, 1.45), (.6, .06, 0), parch, rot=(0, 0, -.05), name='pageR')
            for k in range(9):
                box((1.0, .01, .03), (-.6, .1, -.6 + k * .15), ink_line, name='rule')
                box((1.0, .01, .03), (.6, .1, -.6 + k * .15), ink_line, name='rule')
            box((.03, .012, 1.4), (-.25, .105, 0), red, name='margin')
        box((.62, .1, .85), (1.7, .4, .5), black, name='calc')
        for r in range(4):
            for c in range(3):
                box((.14, .04, .14), (1.52 + c * .18, .47, .25 + r * .17), white, name='calckey')
        quad(.5, .18, (1.7, .5, .12), green_led, name='calcscr')
        box((1.3, .06, .8), (-1.7, .36, .6), wood, name='abbase')
        for sx in (-.62, .62):
            box((.06, .7, .06), (-1.7 + sx, .72, .6), wood, name='abframe')
        box((1.3, .06, .1), (-1.7, 1.08, .6), wood, name='abframe')
        for k in range(7):
            seg((-2.3, .5 + k * .09, .6), (-1.1, .5 + k * .09, .6), .008, gold, sides=4, name='abrod')
            for b in range(5):
                sph(.05, (-2.2 + b * .1 + (.55 if b > 2 else 0), .5 + k * .09, .6), red if k % 2 else white, seg=8, name='abbead')

    def statements_props():
        box((4.2, 2.8, .1), (0, 2.1, -1.55), M('chartbg', 0xF4F1E8, .8), name='chartbg')
        for k in range(8):
            hgt = .4 + k * .26 + (.2 if k % 3 == 0 else 0)
            box((.34, hgt, .12), (-1.6 + k * .46, .8 + hgt / 2, -1.45), green if k % 4 != 2 else red_led, name='bar')
        seg((-1.8, 1.0, -1.35), (-.6, 1.4, -1.35), .035, black, sides=5, name='trend')
        seg((-.6, 1.4, -1.35), (.4, 1.2, -1.35), .035, black, sides=5, name='trend')
        seg((.4, 1.2, -1.35), (1.9, 2.4, -1.35), .035, black, sides=5, name='trend')
        box((4.0, .05, .14), (0, .78, -1.4), black, name='axis')
        box((.05, 2.2, .14), (-1.9, 1.88, -1.4), black, name='axis')
        for k in range(3):
            box((1.1, .08, .6), (-1.2 + k * 1.3, .72 + .05, .5), white, name='report')
            box((1.1, .08, .6), (-1.2 + k * 1.3, .72 + .13, .5), parch, rot=(0, .15 * (k - 1), 0), name='report')
        box((3.8, .1, 1.1), (0, .56, .5), wood, name='reportdesk')
        for sx in (-1.7, 1.7):
            box((.12, .4, .12), (sx, .36, .5), wood, name='deskleg')

    def corp_props():
        for k in range(4):
            lathe([(.3, 0), (.3, .12), (.22, .2), (.2, 2.7), (.26, 2.85), (.0, 2.85)], (-1.5 + k * 1.0, .34, -1.0), limestone, seg=12, name='ccol')
        box((4.3, .3, 1.2), (0, 3.4, -1.0), limestone, name='cent')
        prism([(-2.15, 0), (2.15, 0), (0, .9)], 1.0, (0, 3.55, -1.0), limestone, name='cped')
        for k in range(3):
            box((4.6 - k * .3, .14, 2.0 - k * .1), (0, .26 + .14 * k + .07, -.55 + k * .08), limestone, name='cstep')
        tor(.62, .07, (0, 1.2, .35), M('vault', 0x9AA0AA, .3, metal=1.0), rot=(PI / 2, 0, 0), seg=36, rseg=8, name='vring')
        cyl(.58, .16, (0, 1.2, .35), M('vault2', 0x6E747E, .35, metal=1.0), rot=(PI / 2, 0, 0), seg=36, name='vdoor')
        for k in range(4):
            a = k * PI / 4
            seg((math.cos(a) * .5, 1.2 + math.sin(a) * .5, .5), (-math.cos(a) * .5, 1.2 - math.sin(a) * .5, .5), .035, gold, sides=6, name='vspoke')
        sph(.1, (0, 1.2, .5), gold, seg=10, name='vhub')
        for k in range(4):
            box((.5, .22, .3), (1.5, .45 + k * .22, .5), gold, name='bullion')
        for k in range(2):
            box((.5, .22, .3), (1.5, .45 + k * .22, 1.0), gold, name='bullion')

    def markets_props():
        box((1.2, .5, 1.2), (0, .5, -.4), granite, name='mbase')
        cyl(.38, 4.2, (0, 2.8, -.4), black, seg=20, name='mcol')
        for k in range(4):
            tor(.4, .045, (0, 1.4 + k * .8, -.4), green_led if k % 3 != 1 else red_led, seg=24, rseg=6, name='mband')
        prism([(-.3, 0), (.3, 0), (.3, .5), (.8, .5), (0, 1.3), (-.8, .5), (-.3, .5)], .18,
              (0, 5.35, -.4), green_led, name='marrow')
        box((2.6, 1.4, .1), (-1.3, 2.4, .6), black, name='mscreen')
        quad(2.4, 1.2, (-1.3, 2.4, .66), M('mscr', 0x06140C, .3, emit=0x083A1C, strength=1.0), name='mscr')
        pts = [(-2.4, 1.9), (-2.0, 2.2), (-1.7, 2.0), (-1.3, 2.5), (-1.0, 2.3), (-.6, 2.8), (-.3, 2.9)]
        for a, b in zip(pts, pts[1:]):
            seg((a[0], a[1], .7), (b[0], b[1], .7), .028, green_led, sides=5, name='mline')
        sph(.12, (-.3, 2.9, .7), green_led, seg=8, name='mdot')

    def valuation_props():
        box((1.2, .4, 1.2), (0, .46, -.3), granite, name='vbase')
        cyl(.14, 3.0, (0, 2.1, -.3), gold, seg=14, name='vpillar')
        seg((-1.7, 3.55, -.3), (1.7, 3.35, -.3), .07, gold, sides=8, name='vbeam')
        sph(.14, (0, 3.6, -.3), gold, seg=10, name='vtop')
        for sx, yy in ((-1.7, 3.55), (1.7, 3.35)):
            for dz in (-.35, .35):
                seg((sx, yy, -.3), (sx * .82, yy - 1.2, -.3 + dz * .6), .015, gold, sides=4, name='vchain')
            cyl(.62, .08, (sx * .82, yy - 1.25, -.3), gold, seg=24, name='vpan')
        for k in range(5):
            cyl(.18, .06, (-1.4, 2.3 + k * .065 - .05 + .1 - 1.15 + .12, -.3 + (k % 2) * .06), gold, seg=14, name='coin')
        for k in range(2):
            cyl(.18, .06, (1.4, 2.12 + k * .065, -.3), gold, seg=14, name='coin')
        text('$', .5, (0, 1.0, .35), gold, extrude=.06, name='vdollar')

    pavilion('accounting', -1, 20, 'ACCOUNTING', accounting_props, 'ASSETS = LIABILITIES + EQUITY')
    pavilion('statements', 1, 6, 'STATEMENTS', statements_props, 'INCOME  |  BALANCE  |  CASH FLOW')
    pavilion('corp_finance', -1, -8, 'CORP FINANCE', corp_props, 'PV = FV / (1 + r)^n')
    pavilion('investing', 1, -20, 'MARKETS', markets_props, 'RULE OF 72: YEARS = 72 / RATE')
    pavilion('valuation', -1, -30, 'VALUATION', valuation_props, 'EV = MKT CAP + DEBT - CASH')

    # ------------------------------------------------------------ street furniture
    def lamppost(x, z, side):
        lathe([(.3, 0), (.3, .4), (.16, .55), (.1, 4.8), (.14, 5.0), (.0, 5.0)], (x, 0.2, z), iron, seg=12, name='lp')
        seg((x, 5.0, z), (x - side * .9, 5.4, z), .06, iron, sides=6, name='lparm')
        sph(.3, (x - side * .9, 5.1, z), lamp, seg=12, name='lglobe')
        box((.04, 1.5, .6), (x + side * .25, 3.8, z), navy, name='lbanner')
        box((.05, .06, .66), (x + side * .25, 4.55, z), gold, name='lbannertrim')
    for zz in range(40, -42, -12):
        lamppost(-8.9, zz, -1)
        lamppost(8.9, zz - 6, 1)

    def hydrant(x, z):
        cyl(.14, .55, (x, .5, z), red, seg=10, name='hyd')
        sph(.16, (x, .82, z), red, seg=10, name='hyd')
        cyl(.07, .4, (x + .14, .55, z), red, rot=(0, 0, PI / 2), seg=8, name='hyd')
    for (hx, hz) in ((8.8, 26), (-8.8, 2), (8.8, -14), (-8.8, -26)):
        hydrant(hx, hz)

    def tree(x, z):
        box((1.2, .3, 1.2), (x, .35, z), granite, name='planter')
        seg((x, .5, z), (x + .1, 3.0, z), .16, bark, r2=.1, sides=8, name='trunk')
        for (dx, dy, dz, rr) in ((0, 3.6, 0, 1.3), (.8, 3.2, .3, .9), (-.7, 3.3, -.2, .9), (.1, 4.3, .4, .8)):
            sph(rr, (x + dx, dy, z + dz), leaf, seg=10, name='canopy')
    for (tx, tz) in ((-10.5, 14), (10.5, 30), (-10.5, -14), (10.5, -2), (10.5, -26), (-10.5, 36), (10.5, 41)):
        tree(tx, tz)

    def bench(x, z, ry):
        with group('bench', at=(x, 0, z), ry=ry):
            for k in range(4):
                box((1.7, .05, .12), (0, .5, -.2 + k * .14), wood, name='bslat')
            box((1.7, .5, .06), (0, .8, -.34), wood, name='bback')
            for sx in (-.75, .75):
                box((.06, .5, .6), (sx, .28, 0), iron, name='bleg')
    bench(-10.8, 27, PI / 2)
    bench(10.8, 12, -PI / 2)
    bench(-10.8, -3, PI / 2)

    def taxi(x, z, ry):
        with group('taxi', at=(x, 0, z), ry=ry):
            box((1.95, .72, 4.5), (0, .68, 0), taxi_y, name='tbody')
            box((1.75, .66, 2.3), (0, 1.38, -.15), taxi_y, name='tcab')
            box((1.77, .5, 2.2), (0, 1.42, -.15), glass, name='tglass')
            box((.7, .22, .32), (0, 1.84, -.15), M('taxisign', 0xFFF3C2, .4, emit=0xFFE08A, strength=2.5), name='tsign')
            for sx in (-.9, .9):
                for sz in (-1.4, 1.4):
                    cyl(.38, .26, (sx, .38, sz), tire, rot=(0, 0, PI / 2), seg=16, name='wheel')
                    cyl(.2, .28, (sx, .38, sz), iron, rot=(0, 0, PI / 2), seg=10, name='hub')
            for sx in (-.65, .65):
                box((.4, .18, .06), (sx, .78, 2.26), lamp, name='hl')
                box((.4, .16, .06), (sx, .78, -2.26), red_led, name='tl')
    cars = ((-5.6, 36, 0.0), (5.6, 24, PI), (-5.6, 12, .02), (5.6, -4, PI), (-5.6, -14, 0.0), (5.6, -26, PI))
    for (cx, cz, cry) in cars:
        taxi(cx, cz, cry)

    export(os.path.join(out, 'education.glb'))


if __name__ == '__main__':
    build(out_dir())
