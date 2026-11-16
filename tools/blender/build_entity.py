"""Entity sector — The Vitruvian Study (body & spirit habits, Sprint Quest, weekly vows).

Hotspots (empties named HS_*), wired up in entity-explore.js:
  HS_vitruvian            rank / all-time score          (the gilded figure)
  HS_deed_<id> x5         today's physical + spiritual deeds
  HS_sprint               Sprint Quest stopwatch
  HS_weekly               weekly personal / spiritual vows (lectern)
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa

PI = math.pi
H = 24            # half-size of the square study
WALL = 9          # wall height


def build(out):
    reset()
    stone = M('stone', 0xE8DCC0, .85)
    wall = M('wall', 0xD8C9A3, .92)
    wainscot = M('wainscot', 0x5A3D22, .6)
    walnut = M('walnut', 0x3B2A18, .65)
    oakA = M('oakA', 0x6B4A2A, .55)
    oakB = M('oakB', 0x7A5632, .55)
    brass = M('brass', 0xC9A227, .28, metal=1.0)
    sang = M('sanguine', 0x9C4A3C, .8)
    parch = M('parchment', 0xEFE3C4, .9)
    pane = M('pane', 0xFFE3B0, .5, emit=0xFFD9A0, strength=1.25)
    flame = M('flame', 0xFFBE0B, .5, emit=0xFFA400, strength=4.0)
    dome_m = M('dome', 0xE9DCC0, .9, emit=0xD9C7A0, strength=.55, double=True)
    ceil_m = M('ceil', 0xD8C9A3, .95, emit=0xC9B88F, strength=.45, double=True)
    leather = M('leather', 0x7A3B24, .6)
    cream = M('cream', 0xF2E6C8, .6)
    iron = M('iron', 0x2A2A2E, .45, metal=.9)
    chrome = M('chrome', 0xC8CCD2, .25, metal=1.0)
    track = M('track', 0x9C4A3C, .9)
    white = M('white', 0xF4EFE2, .8)
    black = M('black', 0x15110D, .7)
    glass = M('ink', 0x1B2A3C, .15)
    book_cols = [M('bk%d' % i, c, .75) for i, c in enumerate((0x7A2A22, 0x2F4A3A, 0x2C3E5E, 0x8A6A2A, 0x5A3A52, 0x3A2A1A))]

    # ------------------------------------------------------------ floor
    box((2 * H, .2, 2 * H), (0, -.1, 0), walnut, name='floor')
    for i in range(-23, 23):
        box((.97, .03, 2 * H - 2), (i + .5, .015, 0), oakA if i % 2 == 0 else oakB, name='board')
    R = 9.0
    tor(R, .09, (0, .05, 0), brass, seg=96, rseg=6, name='ring')
    tor(R + .55, .035, (0, .05, 0), brass, seg=96, rseg=6, name='ring2')
    tor(14.6, .06, (0, .05, 0), brass, seg=120, rseg=6, name='ring3')
    s_in = R * math.sqrt(2)
    for sx, sz, ry in ((0, -s_in / 2, 0), (0, s_in / 2, 0), (-s_in / 2, 0, PI / 2), (s_in / 2, 0, PI / 2)):
        box((s_in + .14, .05, .14), (sx, .045, sz), brass, rot=(0, ry, 0), name='sq')
    for sx, sz, ry in ((0, -R, 0), (0, R, 0), (-R, 0, PI / 2), (R, 0, PI / 2)):
        box((2 * R + .1, .04, .07), (sx, .04, sz), sang, rot=(0, ry, 0), name='sq2')
    for ry, w in ((0, .06), (PI / 2, .06), (PI / 4, .05), (-PI / 4, .05)):
        box((2 * R, .04, w), (0, .04, 0), sang, rot=(0, ry, 0), name='dia')
    for k in range(72):
        a = 2 * PI * k / 72
        L = .45 if k % 6 == 0 else .22
        box((.05, .035, L), (14.6 * math.sin(a), .045, 14.6 * math.cos(a)), brass, rot=(0, a, 0), name='tick')

    # ------------------------------------------------------------ shell
    for (w, d, x, z) in ((2 * H + 2, 1, 0, -H), (2 * H + 2, 1, 0, H), (1, 2 * H + 2, -H, 0), (1, 2 * H + 2, H, 0)):
        box((w, WALL, d), (x, WALL / 2, z), wall, name='wall')
    for (nx, nz, ry) in ((0, -1, 0), (0, 1, PI), (-1, 0, PI / 2), (1, 0, -PI / 2)):
        with group('wallset', at=(nx * (H - .5), 0, nz * (H - .5)), ry=ry):
            box((2 * H - 1, 2.3, .16), (0, 1.15, .08), wainscot, name='wains')
            box((2 * H - 1, .14, .24), (0, 2.38, .12), brass, name='rail')
            box((2 * H - 1, .35, .22), (0, .18, .11), walnut, name='skirt')
            box((2 * H - 1, .55, .5), (0, WALL - .3, .25), stone, name='cornice')
            box((2 * H - 1, .16, .72), (0, WALL - .62, .36), brass, name='cornice2')
            for px in (-16, -8, 0, 8, 16):
                box((1.3, WALL - .6, .5), (px, (WALL - .6) / 2, .25), stone, name='pil')
                box((1.6, .35, .7), (px, WALL - .75, .35), stone, name='cap')
                box((1.6, .45, .7), (px, .22, .35), stone, name='base')
            for px in (-12, -4, 4, 12):
                w_, h_ = 2.6, 5.4
                r_ = w_ / 2
                arch = [(-r_, 0), (r_, 0), (r_, h_ - r_)] + \
                    [(r_ * math.cos(i * PI / 12), h_ - r_ + r_ * math.sin(i * PI / 12)) for i in range(1, 12)] + [(-r_, h_ - r_)]
                prism([(x * 1.14, y) for x, y in arch], .12, (px, 2.4, .08), brass, name='wframe')
                prism(arch, .08, (px, 2.4, .13), pane, name='wpane')
                box((.07, h_ - r_, .1), (px, 2.4 + (h_ - r_) / 2, .17), brass, name='mull')
                box((w_, .07, .1), (px, 2.4 + 2.2, .17), brass, name='mull')

    # ------------------------------------------------------------ dome + ceiling
    top_r = 23.0
    th_max = math.radians(78)
    prof = [(top_r * math.cos(th_max * i / 16), WALL + 9.5 * math.sin(th_max * i / 16)) for i in range(17)]
    lathe(prof, (0, 0, 0), dome_m, seg=64, outward=False, name='dome')
    tor(prof[-1][0], .22, (0, prof[-1][1], 0), brass, seg=48, rseg=8, name='oculus')
    tor(top_r, .3, (0, WALL, 0), brass, seg=96, rseg=8, name='drum')
    for k in range(16):
        a = 2 * PI * k / 16
        pts = [(top_r * math.cos(th_max * i / 24) * .995, WALL + 9.5 * math.sin(th_max * i / 24) * .995 - .02) for i in range(25)]
        for i in range(24):
            (r1, y1), (r2, y2) = pts[i], pts[i + 1]
            seg((r1 * math.sin(a), y1, r1 * math.cos(a)), (r2 * math.sin(a), y2, r2 * math.cos(a)), .12, stone, sides=4, smooth=False, name='rib')
    for ring_th in (20, 40, 58):
        th = math.radians(ring_th)
        tor(top_r * math.cos(th) * .995, .08, (0, WALL + 9.5 * math.sin(th) * .995 - .02, 0), brass, seg=64, rseg=4, name='cring')
    for qx, qz in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        pts = [(qx * (H - .5), WALL, qz * (H - .5))]
        arcs = [(qx * top_r * math.cos((PI / 2) * i / 12), WALL, qz * top_r * math.sin((PI / 2) * i / 12)) for i in range(13)]
        pts += arcs
        poly(pts, (0, 0, 0), ceil_m, facing='down', name='ceilcorner')

    # ------------------------------------------------------------ the Vitruvian figure (hotspot)
    with group('HS_vitruvian', at=(0, 0, 0)):
        cyl(2.9, .28, (0, .14, 0), stone, seg=48, name='dais0')
        cyl(2.5, .26, (0, .41, 0), stone, seg=48, r2=2.45, name='dais1')
        tor(2.52, .06, (0, .55, 0), brass, seg=64, rseg=6, name='dais_ring')
        fy = .55
        sph(.5, (0, fy + 2.65, 0), brass, scale=(1.0, .95, .55), seg=20, name='chest')
        seg((0, fy + 2.5, 0), (0, fy + 1.85, 0), .38, brass, r2=.3, sides=16, name='abs')
        sph(.34, (0, fy + 1.7, 0), brass, scale=(1.05, .75, .7), seg=18, name='pelvis')
        seg((0, fy + 3.1, 0), (0, fy + 3.3, 0), .1, brass, name='neck')
        sph(.27, (0, fy + 3.55, 0), brass, scale=(.88, 1.08, .95), seg=20, name='head')
        for sx in (-1, 1):
            sh = (sx * .5, fy + 2.9, 0)
            for hand, elb in (((sx * 1.9, fy + 2.9, 0), (sx * 1.2, fy + 2.9, 0)), ((sx * 1.5, fy + 3.45, 0), (sx * 1.0, fy + 3.2, 0))):
                seg(sh, elb, .11, brass, r2=.09, name='uarm')
                seg(elb, hand, .09, brass, r2=.06, name='farm')
                sph(.095, elb, brass, seg=10, name='elbow')
                sph(.075, hand, brass, scale=(1.2, 1, .6), seg=10, name='hand')
            sph(.14, sh, brass, seg=12, name='shoulder')
            hip = (sx * .22, fy + 1.55, 0)
            for foot in ((sx * .34, fy + .06, 0), (sx * 1.35, fy + .06, 0)):
                knee = ((hip[0] + foot[0]) / 2, (hip[1] + foot[1]) / 2 + .05, 0)
                seg(hip, knee, .17, brass, r2=.12, name='thigh')
                seg(knee, foot, .12, brass, r2=.08, name='shin')
                sph(.12, knee, brass, seg=10, name='knee')
                box((.16, .09, .34), (foot[0], foot[1], .08), brass, name='foot')
            sph(.18, hip, brass, seg=12, name='hip')
        cy = fy + 1.78
        tor(2.3, .035, (0, cy, 0), brass, rot=(PI / 2, 0, 0), seg=96, rseg=6, name='vcircle')
        sq = 1.85
        for a, b in (((-sq, cy - sq, 0), (sq, cy - sq, 0)), ((-sq, cy + sq, 0), (sq, cy + sq, 0)),
                     ((-sq, cy - sq, 0), (-sq, cy + sq, 0)), ((sq, cy - sq, 0), (sq, cy + sq, 0))):
            seg(a, b, .035, brass, sides=6, name='vsq')

    # ------------------------------------------------------------ deed plinths
    def plinth(deed_id, label, ang_deg, props):
        a = math.radians(ang_deg)
        x, z = 12.3 * math.sin(a), -12.3 * math.cos(a)
        with group('HS_deed_' + deed_id, at=(x, 0, z), ry=math.atan2(-x, -z)):
            lathe([(.85, 0), (.85, .14), (.62, .18), (.55, .3), (.55, .95), (.68, 1.02), (.72, 1.14), (0.0, 1.14)],
                  (0, 0, 0), stone, seg=24, name='plinth')
            box((.78, .2, .05), (0, .72, .56), brass, rot=(-.12, 0, 0), name='plaque')
            text(label, .095, (0, .72, .59), black, extrude=.004, name='plabel')
            props()

    T = 1.14

    def sprint_props():
        y = T + .34
        cyl(.07, .12, (0, T + .06, 0), brass, name='sw_stand')
        cyl(.25, .06, (0, y, 0), white, rot=(PI / 2, 0, 0), seg=32, name='sw_face')
        tor(.25, .035, (0, y, 0), brass, rot=(PI / 2, 0, 0), seg=32, rseg=8, name='sw_ring')
        cyl(.045, .09, (0, y + .3, 0), brass, name='sw_crown')
        for k in range(12):
            ang = 2 * PI * k / 12
            box((.012, .035, .01), (.2 * math.sin(ang), y + .2 * math.cos(ang), .035), black, rot=(0, 0, -ang), name='tick')
        box((.014, .17, .01), (0, y + .075, .04), sang, name='hand')
        box((.01, .1, .01), (.035, y + .0, .04), black, rot=(0, 0, -1.0), name='hand')
        box((.22, .03, .3), (.34, T + .015, .02), iron, name='block_base')
        box((.22, .15, .03), (.34, T + .11, -.1), iron, rot=(-.55, 0, 0), name='block_pad')

    def strength_props():
        y = T + .2
        seg((-.46, y, 0), (.46, y, 0), .03, chrome, name='bar')
        for sg in (-1, 1):
            cyl(.2, .07, (sg * .28, y, 0), iron, rot=(0, 0, PI / 2), name='plate')
            cyl(.15, .07, (sg * .36, y, 0), iron, rot=(0, 0, PI / 2), name='plate2')
            cyl(.05, .05, (sg * .42, y, 0), chrome, rot=(0, 0, PI / 2), name='collar')
        sph(.16, (0, T + .16, .35), iron, scale=(1, .95, 1), name='kettle')
        tor(.1, .025, (0, T + .34, .35), iron, rot=(0, 0, 0), seg=16, rseg=6, name='kettle_h')

    def surf_props():
        box((.5, .06, .24), (0, T + .03, 0), oakB, name='stand')
        sph(1, (0, T + .74, 0), cream, scale=(.19, .66, .04), seg=24, rot=(0, 0, .08), name='board')
        box((.035, 1.05, .05), (.0, T + .74, 0), sang, rot=(0, 0, .08), name='stripe')
        prism([(0, 0), (.13, 0), (.02, .17)], .03, (-.06, T + .16, -.06), sang, rot=(0, PI / 2, 0), name='fin')

    def read_props():
        with group('book', at=(0, T + .13, .03), rot=(.5, 0, 0)):
            box((.74, .04, .48), (0, 0, 0), leather, name='cover')
            box((.34, .04, .44), (-.18, .03, 0), parch, rot=(0, 0, .09), name='pageL')
            box((.34, .04, .44), (.18, .03, 0), parch, rot=(0, 0, -.09), name='pageR')
            for k in range(5):
                box((.26, .004, .0035), (-.18, .056, -.14 + k * .07), black, rot=(0, 0, .09), name='line')
                box((.26, .004, .0035), (.18, .056, -.14 + k * .07), black, rot=(0, 0, -.09), name='line')
        box((.5, .1, .06), (0, T + .05, -.18), oakB, name='lectern_back')

    def journal_props():
        box((.36, .085, .48), (-.05, T + .045, .02), leather, rot=(0, .3, 0), name='journal')
        box((.04, .09, .1), (.14, T + .05, .1), brass, rot=(0, .3, 0), name='clasp')
        box((.03, .005, .3), (-.16, T + .09, .05), sang, rot=(0, .3, 0), name='ribbon')
        lathe([(.07, 0), (.07, .08), (.045, .11), (.045, .14)], (.27, T, -.18), glass, seg=14, name='ink')
        seg((.27, T + .1, -.18), (.16, T + .62, -.22), .01, white, name='quill')
        seg((.2, T + .34, -.2), (.15, T + .74, -.23), .04, cream, r2=.0, sides=6, name='feather')

    plinth('sprint_training', 'SPRINT', 18, sprint_props)
    plinth('strength_training', 'STRENGTH', 90, strength_props)
    plinth('surf_session', 'SURF', 162, surf_props)
    plinth('reading', 'READ', 234, read_props)
    plinth('journaling', 'JOURNAL', 306, journal_props)

    # ------------------------------------------------------------ sprint quest lane + kiosk
    box((2.6, .03, 20), (19, .02, 0), track, name='lane')
    for lx in (17.75, 20.25):
        box((.07, .04, 20), (lx, .035, 0), white, name='lane_line')
    box((2.6, .04, .12), (19, .035, 9), white, name='start_line')
    for k in range(10):
        box((.26, .042, .13), (17.8 + k * .26 + (.13 if k % 2 else 0), .036, -9), black if k % 2 else white, name='finish_chk')
    for lx in (17.7, 20.3):
        cyl(.09, 3.2, (lx, 1.6, -9), white, name='finish_post')
    box((2.9, .55, .08), (19, 3.1, -9), sang, name='finish_banner')
    text('FINISH', .4, (19, 3.1, -8.95), white, extrude=.02, name='finish_txt')
    with group('HS_sprint', at=(19, 0, 9.2), ry=-PI / 2):
        for dz in (-.45, .45):    # starting blocks
            box((.5, .04, .22), (.1, .02, dz), iron, name='sb_base')
            box((.04, .24, .2), (.0, .16, dz), black, rot=(0, 0, .6), name='sb_pad')
            box((.04, .24, .2), (.28, .14, dz), black, rot=(0, 0, .6), name='sb_pad')
        lathe([(.5, 0), (.5, .12), (.2, .2), (.15, 1.1), (.3, 1.2), (.0, 1.2)], (0, 0, 2.4), stone, seg=20, name='kiosk')
        cyl(.7, .1, (0, 1.85, 2.4), white, rot=(PI / 2, 0, 0), seg=40, name='bigface')
        tor(.7, .07, (0, 1.85, 2.4), brass, rot=(PI / 2, 0, 0), seg=40, rseg=8, name='bigring')
        cyl(.09, .16, (0, 2.62, 2.4), brass, name='bigcrown')
        for k in range(12):
            ang = 2 * PI * k / 12
            box((.03, .1, .02), (.56 * math.sin(ang), 1.85 + .56 * math.cos(ang), 2.46), black, rot=(0, 0, -ang), name='bigtick')
        box((.035, .5, .02), (0, 1.85 + .22, 2.47), sang, rot=(0, 0, -.5), name='bighand')
        box((.025, .34, .02), (0, 1.85 + .12, 2.47), black, rot=(0, 0, .9), name='bighand')
        box((1.3, .3, .06), (0, 3.0, 2.4), brass, name='kiosk_sign')
        text('SPRINT QUEST', .15, (0, 3.0, 2.44), black, extrude=.004, name='kiosk_txt')

    # ------------------------------------------------------------ weekly vows lectern
    with group('HS_weekly', at=(-19, 0, 0), ry=PI / 2):
        lathe([(.7, 0), (.7, .15), (.4, .25), (.3, .5), (.34, 1.0), (.48, 1.1), (.0, 1.1)], (0, 0, 0), stone, seg=20, name='lect_col')
        with group('desk', at=(0, 1.32, .05), rot=(.45, 0, 0)):
            box((1.2, .09, .8), (0, 0, 0), oakB, name='lect_top')
            box((1.0, .02, .66), (0, .06, 0), parch, name='scroll_sheet')
            for k in range(6):
                box((.7 - (k % 3) * .12, .005, .02), (0, .075, -.22 + k * .09), black, name='scroll_line')
            box((.09, .03, .09), (.38, .08, .28), sang, name='seal')
        quad(2.4, 4.4, (0, 3.4, -4.28), sang, name='banner')
        box((2.6, .1, .1), (0, 5.65, -4.25), brass, name='banner_rod')
        box((2.4, .08, .02), (0, 1.25, -4.26), brass, name='banner_trim')
        text('WEEKLY', .38, (0, 4.1, -4.25), cream, extrude=.012, name='b_txt1')
        text('VOWS', .38, (0, 3.5, -4.25), cream, extrude=.012, name='b_txt2')
        tor(.45, .03, (0, 2.7, -4.25), brass, rot=(PI / 2, 0, 0), seg=32, rseg=6, name='b_ring')

        def candelabra(cx):
            lathe([(.3, 0), (.3, .06), (.08, .12), (.06, 1.1), (.14, 1.2), (.2, 1.4), (.0, 1.4)], (cx, 0, -.3), brass, seg=14, name='cand')
            for dx in (-.14, 0, .14):
                cyl(.04, .26, (cx + dx, 1.52, -.3), cream, seg=8, name='candle')
                cyl(.04, .14, (cx + dx, 1.72, -.3), flame, seg=6, r2=0, name='flame')
        candelabra(-1.6)
        candelabra(1.6)

    # ------------------------------------------------------------ atmosphere (non-interactive)
    rnd = random.Random(7)
    with group('bookcase', at=(-H + .6, 0, -10), ry=PI / 2):
        box((9, 6.2, .14), (0, 3.1, -.42), walnut, name='bc_back')
        for sx in (-4.5, 4.5):
            box((.2, 6.2, .9), (sx, 3.1, 0), walnut, name='bc_side')
        for sy in (.1, 1.3, 2.5, 3.7, 4.9, 6.1):
            box((9, .1, .9), (0, sy, 0), walnut, name='bc_shelf')
        for lvl in (.15, 1.35, 2.55, 3.75, 4.95):
            x = -4.25
            while x < 4.2:
                bw = rnd.uniform(.13, .3)
                bh = rnd.uniform(.7, 1.1)
                box((bw, bh, .55), (x + bw / 2, lvl + bh / 2 + .05, -.08), rnd.choice(book_cols), name='book')
                x += bw + .01
    with group('table', at=(-16, 0, -19), ry=.55):
        box((3.6, .12, 2.0), (0, 1.15, 0), oakB, rot=(-.2, 0, 0), name='tbl_top')
        box((3.0, .01, 1.6), (0, 1.22, 0), parch, rot=(-.2, 0, 0), name='tbl_sheet')
        tor(.55, .012, (0, 1.235, 0), sang, rot=(-.2 + 0, 0, 0), seg=40, rseg=4, name='tbl_circle')
        for sx in (-1.5, 1.5):
            for sz in (-.75, .75):
                cyl(.07, 1.1, (sx, .55, sz), oakA, seg=8, name='tbl_leg')
        seg((.5, 1.3, .3), (.9, 1.45, .0), .02, brass, name='divider')
        seg((.5, 1.3, .3), (.75, 1.45, .45), .02, brass, name='divider')
        cyl(.07, 1.3, (-.9, 1.3, .1), parch, rot=(0, 0, PI / 2), seg=10, name='scroll')

    def candle_stand(cx, cz):
        lathe([(.32, 0), (.32, .08), (.08, .16), (.06, 1.35), (.16, 1.45), (.0, 1.45)], (cx, 0, cz), brass, seg=14, name='cs')
        cyl(.06, .3, (cx, 1.6, cz), cream, seg=8, name='cs_candle')
        cyl(.05, .17, (cx, 1.84, cz), flame, seg=6, r2=0, name='cs_flame')
    for cx, cz in ((-21, -21), (21, -21), (-21, 21), (21, 21), (-12, 22), (12, 22), (0, -21.5)):
        candle_stand(cx, cz)

    export(os.path.join(out, 'entity.glb'))


if __name__ == '__main__':
    build(out_dir())
