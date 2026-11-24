"""Entrepreneur sector — the Surf Shack beach (businesses, daily ZERV posts, weekly goal, journal).

Hotspots wired in beach-explore.js:
  HS_shack          businesses: tasks + journal            (the shack)
  HS_post_ig        daily ZERV post — Instagram            (ring-light station)
  HS_post_tiktok    daily ZERV post — TikTok               (ring-light station)
  HS_goal           weekly business goal                   (flagpole)
  HS_journal        notes across all businesses            (picnic table logbook)
  HS_rack           your rank, shown as 7 surfboards       (KEEP_board_0..6 are dimmed until earned)
  HS_revenue        revenue stand at the pier: income log + monthly target
  KEEP_buoy_0..3    pier buoys that light at 25/50/75/100% of this month's target
  KEEP_lighthouse_lamp  lights when the month's target is hit
The ocean, foam, sun and sky are live in JS.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa

PI = math.pi
BOARD_COLORS = [0xFF006E, 0x00B8C4, 0xFFBE0B, 0x2BD94A, 0xFF8C42, 0x8A5BFF, 0xD4AF37]
BOARD_LEN = [1.7, 2.1, 2.0, 2.2, 2.5, 2.8, 2.6]


def build(out):
    reset()
    sand = M('sand', 0xEBCB8B, 1.0)
    wet = M('wetsand', 0xC9A66B, .9)
    dune = M('dune', 0xE3C07F, 1.0)
    grass = M('grass', 0x7C8C3A, .9, double=True)
    plank = M('plank', 0x9A6B43, .75)
    plank2 = M('plank2', 0x86593A, .75)
    weathered = M('weathered', 0xB59A78, .85)
    dark_wood = M('darkwood', 0x4B3220, .7)
    roof = M('tin', 0xA9B3B8, .45, metal=.7)
    roof_ridge = M('ridge', 0x7B868C, .4, metal=.8)
    teal = M('teal', 0x00A8B0, .6)
    pinkp = M('pinkp', 0xFF006E, .55)
    white = M('white', 0xF4F0E6, .7)
    yellow = M('yellow', 0xFFBE0B, .5)
    black = M('black', 0x15151C, .6)
    glass_warm = M('glasswarm', 0xFFD9A0, .3, emit=0xFFB866, strength=1.6)
    interior = M('interior', 0x2B1A10, .9, emit=0x5A3012, strength=.9)
    bulb = M('bulb', 0xFFF2C8, .3, emit=0xFFDC8A, strength=4.0)
    flame = M('flame', 0xFFBE0B, .5, emit=0xFF9A00, strength=4.0)
    bark = M('bark', 0x7A5A3A, .9)
    bark2 = M('bark2', 0x6A4C30, .9)
    frond = M('frond', 0x2E9E5B, .7, double=True)
    frond2 = M('frond2', 0x1F8A4F, .7, double=True)
    coconut = M('coconut', 0x4A3322, .8)
    rope = M('rope', 0xD8C497, .9)
    metal = M('metal', 0x8E979C, .4, metal=.9)
    van_b = M('vanbody', 0x2E8F8A, .5, metal=.2)
    van_w = M('vanwood', 0xA8723F, .6)
    tire = M('tire', 0x1B1B1F, .9)
    parch = M('parch', 0xEFE3C4, .9)
    leather = M('leather', 0x6A3A22, .7)
    neon_pink = M('neonpink', 0xFF4FA3, .3, emit=0xFF2E93, strength=5.0)
    neon_cyan = M('neoncyan', 0x6FF5FF, .3, emit=0x1FE6F5, strength=5.0)
    ring_light = M('ringlight', 0xFFFFFF, .3, emit=0xFFF6E0, strength=6.0)
    backdrop_ig = M('bdig', 0xC13584, .6)
    backdrop_tt = M('bdtt', 0x14141C, .6)
    rock = M('rock', 0x7F8083, .95)
    concrete = M('concrete', 0xB9B6AE, .95)
    gold = M('goldball', 0xD4AF37, .3, metal=1.0)
    cloth_goal = M('goalflag', 0xFF006E, .6, double=True)
    cloth_goal2 = M('goalflag2', 0xFFBE0B, .6, double=True)
    stripe_a = M('stripeA', 0x00A8B0, .7, double=True)
    stripe_b = M('stripeB', 0xF4F0E6, .7, double=True)
    um_a = M('umA', 0xFF006E, .7, double=True)
    um_b = M('umB', 0xF4F0E6, .7, double=True)
    towel = [M('tw%d' % i, c, .9) for i, c in enumerate((0xFF8C42, 0x3A86FF, 0xFFBE0B))]
    board_mats = [M('board%d' % i, c, .35) for i, c in enumerate(BOARD_COLORS)]

    rnd = random.Random(11)

    # ------------------------------------------------------------ ground
    box((260, .2, 260), (0, -.1, 0), sand, name='ground')
    box((260, .02, 12), (0, .005, -31), wet, name='wetsand')
    for (dx, dz, sx, sz, h) in ((-34, -6, 9, 5, .5), (30, 4, 8, 4, .45), (-30, 22, 10, 6, .55), (36, 26, 9, 5, .5),
                                (0, 52, 14, 5, .5), (-48, -12, 8, 6, .5), (48, -10, 8, 5, .45), (10, 38, 7, 3, .35)):
        sph(1, (dx, 0, dz), dune, scale=(sx, h, sz), seg=18, name='dune')

    def tuft(x, z):
        for _ in range(7):
            a = rnd.uniform(0, 2 * PI)
            hgt = rnd.uniform(.5, .95)
            bend = rnd.uniform(.15, .4)
            pts = [(x, 0, z), (x + math.cos(a) * bend * .5, hgt * .55, z + math.sin(a) * bend * .5),
                   (x + math.cos(a) * bend, hgt, z + math.sin(a) * bend)]
            ribbon(pts, [.07, .05, .01], (0, 0, 0), grass, up=(math.sin(a), 0, -math.cos(a)), name='blade')
    for _ in range(70):
        tuft(rnd.uniform(-50, 50), rnd.uniform(-22, 48))

    # ------------------------------------------------------------ boardwalk
    z = 34.0
    k = 0
    while z > -2.2:
        box((2.7, .09, .3), (0, .06, z), plank if k % 2 else plank2, name='bw')
        z -= .33
        k += 1
    for sx in (-1.45, 1.45):
        box((.12, .1, 36.4), (sx, .03, 15.5), dark_wood, name='stringer')
    for pz in range(32, -1, -6):
        for sx in (-1.5, 1.5):
            cyl(.07, 1.0, (sx, .55, pz), dark_wood, seg=8, name='bwpost')
            sph(.08, (sx, 1.08, pz), gold, seg=8, name='bwcap')
        if pz > 0:
            for sx in (-1.5, 1.5):
                seg((sx, .95, pz), (sx, .95, pz - 6), .025, rope, sides=5, name='rope')

    # ------------------------------------------------------------ THE SHACK
    with group('HS_shack', at=(0, 0, -8)):
        fl = .5
        for px in (-3.2, 0, 3.2):
            for pz in (-2.2, 0, 2.2):
                cyl(.14, fl, (px, fl / 2, pz), dark_wood, seg=8, name='pier')
        box((7.3, .14, 5.3), (0, fl, 0), dark_wood, name='floor')

        def wall_planks(x0, x1, y0, y1, z, ry=0.0, alt=0):
            n = max(1, int(round((x1 - x0) / .36)))
            wd = (x1 - x0) / n
            for i in range(n):
                with group('wp', at=(0, 0, 0)):
                    box((wd - .012, y1 - y0, .14), (x0 + wd * (i + .5), (y0 + y1) / 2, z), plank if (i + alt) % 2 else plank2, name='wplank')

        wy0, wy1 = fl + .07, 3.75
        # front: door gap |x|<.8, windows at x in [-3.05,-1.7] and [1.7,3.05], y 1.5..2.6
        door_h = 2.45
        wall_planks(-3.5, -3.05, wy0, wy1, 2.5)
        wall_planks(-1.7, -.8, wy0, wy1, 2.5)
        wall_planks(.8, 1.7, wy0, wy1, 2.5)
        wall_planks(3.05, 3.5, wy0, wy1, 2.5)
        for (a, b) in ((-3.05, -1.7), (1.7, 3.05)):
            wall_planks(a, b, wy0, 1.5, 2.5)
            wall_planks(a, b, 2.6, wy1, 2.5)
            cx = (a + b) / 2
            quad(b - a, 1.1, (cx, 2.05, 2.46), glass_warm, name='glass')
            for fx in (a, b, cx):
                box((.07, 1.2, .12), (fx, 2.05, 2.55), white, name='mullion')
            box((b - a + .2, .08, .16), (cx, 1.5, 2.57), white, name='sill')
            box((b - a + .2, .08, .16), (cx, 2.6, 2.57), white, name='head')
            # shutters
            for sx in (a - .4, b + .4):
                box((.45, 1.18, .06), (sx, 2.05, 2.58), teal, name='shutter')
        wall_planks(-.8, .8, wy0 + door_h, wy1, 2.5)
        quad(1.6, door_h, (0, wy0 + door_h / 2, 2.44), interior, name='doorway')
        box((.1, door_h + .1, .14), (-.85, wy0 + door_h / 2, 2.55), white, name='doorframe')
        box((.1, door_h + .1, .14), (.85, wy0 + door_h / 2, 2.55), white, name='doorframe')
        box((1.8, .1, .14), (0, wy0 + door_h + .05, 2.55), white, name='doorframe')
        box((.08, door_h - .1, .8), (-.8, wy0 + door_h / 2, 2.9), teal, rot=(0, -1.1, 0), name='door_leaf')
        # back + sides
        wall_planks(-3.5, 3.5, wy0, wy1, -2.5, alt=1)
        for sx in (-3.5, 3.5):
            n = 14
            for i in range(n):
                box((.14, wy1 - wy0, 5 / n - .012), (sx, (wy0 + wy1) / 2, -2.5 + 5 / n * (i + .5)), plank if i % 2 else plank2, name='splank')
        # gable end + roof
        prism([(-3.75, 0), (3.75, 0), (0, 2.2)], .14, (0, wy1, 2.52), plank, name='gable')
        ang = math.atan2(2.2, 3.75)
        slope = math.hypot(3.75, 2.2) + .5
        for sg in (-1, 1):
            cx = sg * (3.75 / 2 + .05)
            box((slope, .09, 6.6), (cx, wy1 + 1.1 + .05, -.1), roof, rot=(0, 0, -sg * ang), name='tin')
            for rz in range(-14, 15):
                with group('rib', at=(cx, wy1 + 1.1 + .05, -.1), rot=(0, 0, -sg * ang)):
                    box((slope, .05, .045), (0, .07, rz * .22), roof_ridge, name='corr')
        box((.22, .12, 6.7), (0, wy1 + 2.24, -.1), roof_ridge, name='ridge')
        # sign
        box((4.6, 1.0, .12), (0, wy1 + .75, 2.7), white, name='signboard')
        box((4.7, .08, .14), (0, wy1 + 1.27, 2.7), teal, name='signtrim')
        box((4.7, .08, .14), (0, wy1 + .23, 2.7), teal, name='signtrim')
        text('ZERV', .62, (-.75, wy1 + .75, 2.78), pinkp, extrude=.05, name='zerv')
        text('SURF SHACK', .27, (1.55, wy1 + .75, 2.78), teal, extrude=.04, name='surfshack')

        # porch deck + steps + railings + awning
        for i in range(12):
            box((8.4, .07, .24), (0, fl + .07, 2.62 + i * .262), plank if i % 2 else plank2, name='deck')
        for (sx) in (-4.1, 4.1):
            for pz in (3.0, 4.4, 5.6):
                cyl(.05, 1.0, (sx, fl + .6, pz), white, seg=6, name='rail_post')
            box((.07, .07, 3.0), (sx, fl + 1.1, 4.3), white, name='rail')
        for i in range(3):
            box((2.0, .13, .45), (0, fl - .12 - i * .15, 5.85 + i * .4 - .2), plank2, name='step')
        for i in range(10):
            with group('awn', at=(-3.6 + i * .8 + .4, 3.35, 4.3), rot=(.24, 0, 0)):
                box((.8, .05, 3.3), (0, 0, 0), stripe_a if i % 2 else stripe_b, name='awning')
        for sx in (-3.9, 3.9):
            cyl(.07, 3.0, (sx, fl + 1.5, 5.85), white, seg=8, name='awn_post')
        for i in range(17):
            x = -3.9 + i * .49
            sph(.07, (x, 2.9 - .22 * math.sin(math.pi * (i / 16.0)), 5.85), bulb, seg=8, name='bulb')
        # leaning boards, counter, stools
        for bx, col, ry in ((-1.35, 0, .0), (1.5, 2, .0)):
            sph(1, (bx * 1.0 + (-1.0 if bx < 0 else 1.0) * 1.0, fl + 1.15, 2.3), board_mats[col], scale=(.28, 1.15, .05), rot=(-.09, 0, 0), seg=18, name='leanboard')
        box((2.6, .12, .55), (-2.35, 1.5 + .05, 2.9), plank2, name='counter')
        for sx in (-3.0, -2.35, -1.7):
            cyl(.17, .06, (sx, fl + .6, 3.5), plank, seg=12, name='stool')
            cyl(.04, .55, (sx, fl + .3, 3.5), dark_wood, seg=6, name='stool_leg')
        text('OPEN', .28, (2.35, 2.05, 2.52), neon_cyan, extrude=.02, name='open')

    # ------------------------------------------------------------ HS_post_ig / HS_post_tiktok
    def post_station(id_, at, ry, backdrop, accent, label, label_mat):
        with group('HS_post_' + id_, at=at, ry=ry):
            box((2.6, 2.8, .1), (0, 1.4, -.9), backdrop, name='backdrop')
            box((2.75, .1, .14), (0, 2.85, -.9), white, name='bdtop')
            for sx in (-1.25, 1.25):
                cyl(.05, 2.9, (sx, 1.45, -.92), white, seg=6, name='bdpost')
            text(label, .5, (0, 1.9, -.82), label_mat, extrude=.04, name='bdtext')
            text('@zerv', .24, (0, 1.2, -.82), white, extrude=.02, name='bdhandle')
            # tripod + phone + ring light
            for a in (0, 2 * PI / 3, 4 * PI / 3):
                seg((math.sin(a) * .5, 0, math.cos(a) * .5 + .4), (0, 1.35, .4), .025, black, sides=6, name='leg')
            box((.22, .38, .035), (0, 1.55, .4), black, name='phone')
            quad(.19, .33, (0, 1.55, .42), glass_warm, name='phonescr')
            tor(.38, .035, (0, 1.55, .38), ring_light, rot=(PI / 2, 0, 0), seg=40, rseg=8, name='ring')
            seg((0, 1.17, .4), (0, 1.55 - .38, .4), .03, black, sides=6, name='ringstem')
            box((.5, .5, .5), (-1.0, .25, 1.0), black, name='speaker')
            cyl(.14, .03, (-1.0, .52, 1.0), accent, seg=16, name='speakercone')
            tor(.62, .02, (0, .02, 1.0), accent, seg=36, rseg=5, name='mark')

    post_station('ig', (-6.3, 0, -1.6), .35, backdrop_ig, neon_pink, 'IG', neon_pink)
    post_station('tiktok', (6.3, 0, -1.6), -.35, backdrop_tt, neon_cyan, 'TikTok', neon_cyan)

    # ------------------------------------------------------------ HS_goal flagpole
    with group('HS_goal', at=(9.5, 0, 4.0)):
        cyl(1.0, .5, (0, .25, 0), concrete, seg=18, r2=.8, name='gbase')
        cyl(.09, 7.4, (0, 3.9, 0), white, seg=10, name='pole')
        sph(.17, (0, 7.65, 0), gold, seg=12, name='ball')
        for i in range(2):
            pts = [(0.1, 6.6 - i * 1.55, 0)] + [(.1 + 2.6 * u, 6.6 - i * 1.55 - .08 * u + .26 * math.sin(u * 7), 0) for u in (.15, .35, .55, .75, 1.0)]
            ribbon(pts, [1.45, 1.45, 1.4, 1.3, 1.1, .8], (0, 0, 0), cloth_goal if i == 0 else cloth_goal2, up=(0, 0, 1), name='flag')
        text('WEEKLY', .4, (1.3, 6.1, .02), white, extrude=.01, name='ftxt')
        text('GOAL', .5, (1.25, 5.55, .02), black, extrude=.01, name='ftxt2')
        for i in range(5):
            a = i * 2 * PI / 5
            sph(.28 + (i % 2) * .08, (math.cos(a) * 1.15, .15, math.sin(a) * 1.15), rock, scale=(1, .6, 1), seg=8, name='rock')

    # ------------------------------------------------------------ HS_journal picnic table
    with group('HS_journal', at=(-9.5, 0, 5.0), ry=.5):
        for i in range(5):
            box((.38, .07, 2.4), (-.8 + i * .4, .85, 0), weathered if i % 2 else plank, name='ttop')
        for sz in (-1.2, 1.2):
            seg((-.8, .1, sz * .8), (-.35, .83, sz * .35), .05, dark_wood, name='tleg')
            seg((.8, .1, sz * .8), (.35, .83, sz * .35), .05, dark_wood, name='tleg')
        for sx in (-1.55, 1.55):
            box((.5, .06, 2.4), (sx, .5, 0), weathered, name='bench')
            box((.08, .5, .08), (sx, .26, -1.0), dark_wood, name='bleg')
            box((.08, .5, .08), (sx, .26, 1.0), dark_wood, name='bleg')
        # open logbook, pencil, lantern, mug
        box((.55, .035, .75), (-.28, .92, .1), leather, rot=(0, .15, 0), name='bkcover')
        box((.26, .03, .7), (-.42, .95, .1), parch, rot=(0, .15, .06), name='bkL')
        box((.26, .03, .7), (-.14, .95, .1), parch, rot=(0, .15, -.06), name='bkR')
        seg((.15, .91, .5), (.38, .91, .22), .015, yellow, sides=6, name='pencil')
        lathe([(.12, 0), (.12, .06), (.09, .5), (.13, .56), (.0, .56)], (.5, .89, -.5), dark_wood, seg=14, name='lantern_base')
        cyl(.1, .42, (.5, 1.18, -.5), glass_warm, seg=14, name='lantern_glass')
        cyl(.04, .1, (.5, 1.46, -.5), dark_wood, seg=8, name='lantern_cap')
        cyl(.07, .12, (.62, .95, .4), white, seg=14, name='mug')

    # ------------------------------------------------------------ HS_rack: seven rank boards
    with group('HS_rack', at=(12.5, 0, -3.8), ry=-.9):
        for sx in (-2.7, 2.7):
            cyl(.08, 1.7, (sx, .85, -.5), dark_wood, seg=8, name='rackpost')
        box((5.6, .12, .14), (0, 1.55, -.5), dark_wood, name='rackbeam')
        box((5.6, .1, .9), (0, .12, -.1), plank2, name='rackbase')
        box((5.5, .08, .16), (0, .95, -.45), dark_wood, name='rackrail')
        for i in range(7):
            x = -2.1 + i * .7
            L = BOARD_LEN[i]
            sph(1, (x, .22 + L / 2 * .92, -.2), board_mats[i], scale=(.26, L / 2, .05), rot=(-.12, 0, 0), seg=20, name='KEEP_board_%d' % i)
        box((3.4, .55, .1), (0, 2.1, -.5), plank, name='ranksign')
        text('RANK BOARDS', .26, (0, 2.1, -.43), black, extrude=.02, name='ranktxt')

    # ------------------------------------------------------------ palms
    def palm(x, z, yaw, height, seed):
        r = random.Random(seed)
        lean = r.uniform(.5, 1.3)
        with group('palm', at=(x, 0, z), ry=yaw):
            n = 8
            pts = [(lean * (i / n) ** 2, height * i / n, 0) for i in range(n + 1)]
            for i in range(n):
                seg(pts[i], pts[i + 1], .24 - .09 * i / n, bark if i % 2 else bark2, r2=.24 - .09 * (i + 1) / n, sides=8, name='trunk')
            top = pts[-1]
            for f in range(11):
                ang = 2 * PI * f / 11 + r.uniform(-.2, .2)
                L = r.uniform(2.4, 3.2)
                droop = r.uniform(.9, 1.7)
                path, wid = [], []
                for q in range(8):
                    u = q / 7.0
                    rr = L * u
                    path.append((top[0] + math.cos(ang) * rr, top[1] + .9 * math.sin(PI * u * .55) - droop * u * u, top[2] + math.sin(ang) * rr))
                    wid.append(.62 * math.sin(PI * min(1, u * 1.05)) ** .6 + .03)
                ribbon(path, wid, (0, 0, 0), frond if f % 2 else frond2, name='frond')
            for c in range(3):
                a = c * 2.1
                sph(.15, (top[0] + math.cos(a) * .2, top[1] - .25, top[2] + math.sin(a) * .2), coconut, seg=8, name='coco')
    palms = [(-9, -17), (-16, 2), (-11, 19), (10, -19), (16, 5), (13, 20), (-24, -22), (23, -21), (-5, -26), (6, -27),
             (-26, 9), (25, 12), (-19, -9), (20, -8), (30, -4), (-34, 14)]
    for i, (x, z) in enumerate(palms):
        palm(x, z, rnd.uniform(0, 2 * PI), rnd.uniform(5.2, 7.4), 100 + i)

    # ------------------------------------------------------------ woodie wagon
    with group('van', at=(-16.5, 0, -6.5), ry=.55):
        box((4.6, 1.0, 2.0), (0, .95, 0), van_b, name='vbody')
        box((3.0, .9, 1.96), (-.2, 1.85, 0), van_b, name='vcab')
        box((2.9, .8, 2.02), (-.2, 1.85, 0), van_w, name='vwood')
        for sx in (-1.0, .6):
            quad(1.3, .6, (sx, 1.9, 1.02), glass_warm, name='vwin')
            quad(1.3, .6, (sx, 1.9, -1.02), glass_warm, ry=PI, name='vwin')
        box((4.7, .12, 2.1), (0, .46, 0), white, name='vbump')
        for wx in (-1.5, 1.5):
            for wz in (-1.02, 1.02):
                cyl(.42, .3, (wx, .42, wz), tire, rot=(PI / 2, 0, 0), seg=18, name='wheel')
                cyl(.22, .32, (wx, .42, wz), metal, rot=(PI / 2, 0, 0), seg=12, name='hub')
        for sz in (-.35, .35):
            sph(1, (-.2, 2.55, sz), board_mats[1 if sz < 0 else 4], scale=(1.6, .05, .22), seg=14, name='roofboard')
        box((3.0, .06, 1.7), (-.2, 2.35, 0), dark_wood, name='rack')
        cyl(.18, .1, (2.32, 1.0, .5), white, rot=(0, 0, PI / 2), seg=12, name='headlight')
        cyl(.18, .1, (2.32, 1.0, -.5), white, rot=(0, 0, PI / 2), seg=12, name='headlight')

    # ------------------------------------------------------------ lifeguard tower
    with group('tower', at=(21, 0, 3), ry=-1.2):
        for sx in (-1.0, 1.0):
            for sz in (-1.0, 1.0):
                seg((sx * 1.2, 0, sz * 1.2), (sx * .95, 2.8, sz * .95), .09, white, sides=6, name='tleg')
        box((2.8, .12, 2.8), (0, 2.8, 0), plank, name='tdeck')
        box((2.5, 1.5, .1), (0, 3.6, -1.2), white, name='tbackwall')
        for sx in (-1.2, 1.2):
            box((.1, 1.5, 2.5), (sx, 3.6, 0), white, name='tside')
        box((3.2, .14, 3.2), (0, 4.45, 0), pinkp, name='troof')
        for i in range(7):
            seg((-.4, .15 + i * .38, 1.5 - i * .02), (.4, .15 + i * .38, 1.5 - i * .02), .035, white, sides=5, name='rung')
        for sx in (-.4, .4):
            seg((sx, 0, 1.55), (sx, 2.8, 1.0), .04, white, sides=6, name='rail')

    # ------------------------------------------------------------ umbrellas, towels, volleyball, torches, pier
    def umbrella(x, z, tilt):
        with group('umb', at=(x, 0, z)):
            seg((0, 0, 0), (math.sin(tilt) * .3, 2.6, 0), .035, white, sides=6, name='upole')
            for k in range(10):
                a0, a1 = 2 * PI * k / 10, 2 * PI * (k + 1) / 10
                path_a = [(0, 2.62, 0), (math.cos(a0) * 1.0, 2.5, math.sin(a0) * 1.0), (math.cos(a0) * 1.8, 2.15, math.sin(a0) * 1.8)]
                am = (a0 + a1) / 2
                ribbon([(0, 2.66, 0), (math.cos(am) * 1.0, 2.52, math.sin(am) * 1.0), (math.cos(am) * 1.85, 2.15, math.sin(am) * 1.85)],
                       [.05, .85, 1.1], (0, 0, 0), um_a if k % 2 else um_b, up=(0, 1, 0), name='ugore')
    umbrella(-4.6, 7.5, .1)
    umbrella(4.4, 9.0, -.12)
    umbrella(-12, -1.5, .08)
    for i, (tx, tz, ry) in enumerate(((-4.2, 8.6, .3), (4.8, 10.2, -.4), (-1.6, 12.5, .1))):
        box((.9, .02, 1.9), (tx, .03, tz), towel[i], rot=(0, ry, 0), name='towel')
    box((.9, .6, .6), (-3.2, .3, 8.0), teal, name='cooler')
    box((.95, .08, .65), (-3.2, .62, 8.0), white, name='coolerlid')
    sph(.22, (2.2, .22, 11.5), white, seg=14, name='volleyball')

    for (x, z) in ((-2.6, 24), (2.6, 24), (-2.6, 12), (2.6, 12)):
        seg((x, 0, z), (x, 2.2, z), .05, dark_wood, sides=6, name='torchpole')
        cyl(.12, .2, (x, 2.3, z), dark_wood, seg=10, r2=.16, name='torchcup')
        cyl(.1, .3, (x, 2.55, z), flame, seg=8, r2=0, name='torchflame')

    # volleyball net
    for sx in (-3.2, 3.2):
        cyl(.07, 2.5, (sx - 14, 1.25, 18), white, seg=8, name='netpost')
    for hy in range(6):
        box((6.4, .02, .02), (-14, 1.35 + hy * .2, 18), white, name='netline')
    for vx in range(-15, 16):
        box((.015, 1.0, .015), (-14 + vx * .21, 1.85, 18), white, name='netline')

    # pier into the sea
    px = -23
    for i in range(80):
        box((3.2, .08, .3), (px, .85, -27 - i * .31), plank if i % 2 else plank2, name='pierplank')
    for i in range(0, 12):
        for sx in (-1.5, 1.5):
            cyl(.13, 3.4, (px + sx, -.6, -28 - i * 2.1), dark_wood, seg=8, name='pierpile')
    for i in range(0, 12, 3):
        for sx in (-1.55, 1.55):
            seg((px + sx, .9, -28 - i * 2.1), (px + sx, 1.9, -28 - i * 2.1), .05, white, sides=6, name='pierrail')
    for sx in (-1.55, 1.55):
        box((.07, .07, 24.8), (px + sx, 1.75, -40), white, name='pierrailtop')
    seg((px, .85, -51), (px, 4.0, -51), .08, dark_wood, sides=8, name='pierlamp')
    sph(.3, (px, 4.1, -51), bulb, seg=12, name='pierlampbulb')

    # driftwood + rocks
    for (x, z, ry) in ((15, 10, .4), (-20, 28, 1.2), (6, 32, 2.0), (-8, -30, .2)):
        seg((x - 1.2 * math.cos(ry), .2, z - 1.2 * math.sin(ry)), (x + 1.2 * math.cos(ry), .3, z + 1.2 * math.sin(ry)), .16, weathered, r2=.1, sides=7, name='driftwood')
    for (x, z) in ((-27, -26), (30, -28), (36, -24), (-38, -28), (14, -29)):
        for k in range(4):
            sph(rnd.uniform(.5, 1.1), (x + rnd.uniform(-1.5, 1.5), .2, z + rnd.uniform(-1.5, 1.5)), rock, scale=(1, .65, 1), seg=8, name='rock')

    # ------------------------------------------------------------ founder's formulas chalkboard (knowledge)
    chalk_bd = M('chalkbd', 0x1E2A26, .9)
    with group('formulas', at=(-4.6, 0, 29.0), ry=.85):
        for sx in (-.75, .75):
            seg((sx, 0, -.5), (sx * .9, 1.55, 0), .04, dark_wood, sides=6, name='fleg')
        box((2.0, 1.6, .09), (0, 1.15, 0), dark_wood, rot=(-.1, 0, 0), name='fframe')
        box((1.84, 1.44, .02), (0, 1.15, .06), chalk_bd, rot=(-.1, 0, 0), name='fboard')
        text("FOUNDER'S FORMULAS", .14, (0, 1.72, .1), white, extrude=.005, name='ft0')
        text('REVENUE - COSTS = PROFIT', .115, (0, 1.42, .09), white, extrude=.005, name='ft1')
        text('PROFIT IS NOT CASH', .115, (0, 1.15, .09), white, extrude=.005, name='ft2')
        text('LTV >= 3 x CAC', .115, (0, .88, .09), white, extrude=.005, name='ft3')
        text('PRICE ON VALUE, NOT COST', .095, (0, .62, .09), white, extrude=.005, name='ft4')

    # ------------------------------------------------------------ revenue stand, milestone buoys, lighthouse
    greenled = M('greenled', 0x6CFFA8, .3, emit=0x14E070, strength=4.0)
    bill = M('bill', 0x6FAF7A, .8)
    sack = M('sack', 0xB89B6A, .9)
    with group('HS_revenue', at=(-19.2, 0, -23.0), ry=.64):
        box((2.6, .9, 1.0), (0, .45, 0), plank, name='counter')
        box((2.9, .09, 1.2), (0, .94, 0), dark_wood, name='countertop')
        for sx in (-1.3, 1.3):
            cyl(.07, 2.8, (sx, 1.4, .5), white, seg=8, name='stallpost')
        for i in range(8):
            with group('slat', at=(-1.4 + i * .4 + .2, 2.78, -.05), rot=(.2, 0, 0)):
                box((.4, .05, 1.5), (0, 0, 0), stripe_a if i % 2 else stripe_b, name='stallroof')
        box((2.4, .6, .08), (0, 2.4, .55), dark_wood, name='stallsign')
        text('REVENUE', .34, (0, 2.4, .6), M('signgold', 0xFFD36B, .5, emit=0xFFB000, strength=1.2), extrude=.03, name='signtxt')
        # vintage register
        box((.7, .38, .5), (-.5, 1.18, -.05), gold, name='register')
        box((.6, .2, .4), (-.5, 1.42, -.1), metal, rot=(-.4, 0, 0), name='regtop')
        quad(.34, .13, (-.5, 1.62, -.04), greenled, name='regscreen')
        for r in range(2):
            for c in range(4):
                box((.1, .04, .1), (-.72 + c * .15, 1.4, .1 + r * .12), white, name='regkey')
        box((.62, .12, .04), (-.5, 1.04, .22), dark_wood, name='regdrawer')
        # coin stacks, sack, bills
        for k, (cx, cz, n) in enumerate(((.3, .1, 6), (.55, .2, 9), (.8, .05, 4), (.5, -.2, 12))):
            for q in range(n):
                cyl(.14, .045, (cx, .98 + q * .047, cz), gold, seg=14, name='coin')
        sph(.3, (1.05, 1.22, -.15), sack, scale=(1, 1.1, 1), seg=12, name='sack')
        text('$', .3, (1.05, 1.22, .13), dark_wood, extrude=.02, name='sacktxt')
        for k in range(3):
            box((.3, .01, .15), (.1 + k * .05, .985 + k * .011, .3 - k * .04), bill, rot=(0, .3 * k - .3, 0), name='bill')
        box((.7, .9, .06), (2.0, .65, .4), dark_wood, rot=(-.15, 0, 0), name='easel')
        text('THIS', .16, (2.0, .9, .43), white, extrude=.005, name='easeltxt')
        text('MONTH', .16, (2.0, .68, .43), white, extrude=.005, name='easeltxt')

    for i, (pct, bz) in enumerate(((25, -33.0), (50, -38.5), (75, -44.0), (100, -49.5))):
        bx = -27.2
        sph(.5, (bx, .15, bz), M('buoy%d' % i, 0xC9C9CF, .5), seg=14, name='KEEP_buoy_%d' % i)
        cyl(.1, .35, (bx, .75, bz), white, seg=10, name='buoytop')
        seg((bx, .3, bz), (bx, 1.5, bz), .03, white, sides=6, name='buoypole')
        text('%d%%' % pct, .42, (bx + .05, 1.85, bz), white, ry=PI / 2, extrude=.04, name='buoytxt')

    lx, lz = -23.0, -66.0
    sph(1, (lx, .2, lz), rock, scale=(5.5, 1.3, 5.5), seg=14, name='lhrock')
    lh_w = M('lhwhite', 0xF1EDE3, .6)
    lh_r = M('lhred', 0xC8302E, .6)
    bands = ((0.0, 3.0, lh_w), (3.0, 6.0, lh_r), (6.0, 9.0, lh_w), (9.0, 11.5, lh_r))
    def lr(hh):
        return 2.3 - (hh / 11.5) * 1.0
    for (h0, h1, mm) in bands:
        lathe([(lr(h0), 0.8 + h0), (lr(h1), 0.8 + h1)], (lx, 0, lz), mm, seg=20, name='lhband')
    tor(1.6, .09, (lx, 12.3, lz), black, seg=24, rseg=6, name='lhgallery')
    cyl(1.55, .15, (lx, 12.2, lz), black, seg=24, name='lhdeck')
    cyl(.95, 1.5, (lx, 13.1, lz), M('lhglass', 0xFFF2C8, .2), seg=18, name='KEEP_lighthouse_lamp')
    cyl(1.15, .2, (lx, 14.0, lz), black, seg=18, name='lhcap')
    cyl(1.1, 1.1, (lx, 14.7, lz), lh_r, seg=18, r2=.05, name='lhroof')
    box((1.0, 1.6, .1), (lx, 2.0, lz + 1.9), black, name='lhdoor')

    export(os.path.join(out, 'beach.glb'))


if __name__ == '__main__':
    build(out_dir())
