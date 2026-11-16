"""Elixir sector — the Workshop (hobby mastery: surfboard making, coding, electrical engineering, art).

Hotspots wired in elixir-explore.js:
  HS_hobby_surfboard_making / HS_hobby_coding / HS_hobby_electrical / HS_hobby_art   one bay each
  HS_hub                         the central island: all four masteries at a glance
  KEEP_screen_code_0..2          coding monitors (JS paints your next milestone + code)
  KEEP_screen_scope              oscilloscope (JS animates a sine wave)
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa

PI = math.pi
H = 22
WALL = 8


def build(out):
    reset()
    rnd = random.Random(5)
    plankA = M('plankA', 0x8A5A3C, .6)
    plankB = M('plankB', 0x7A4E32, .6)
    plaster = M('plaster', 0xD9C8A8, .95)
    brick = M('brick', 0x8C4B3A, .9)
    beam = M('beam', 0x4A3322, .7)
    darkwood = M('darkwood', 0x3A2818, .65)
    oak = M('oak', 0xA67B4B, .6)
    pegboard = M('pegboard', 0x5B4430, .9)
    metal = M('metal', 0x8E979C, .35, metal=.9)
    iron = M('iron', 0x25262B, .5, metal=.8)
    black = M('black', 0x131318, .6)
    white = M('white', 0xF3EFE6, .7)
    orange = M('orange', 0xFF8C42, .5)
    blue = M('blue', 0x3A86FF, .5)
    red = M('red', 0xD64545, .55)
    green = M('green', 0x2BB673, .6)
    yellow = M('yellow', 0xFFBE0B, .5)
    pcb = M('pcb', 0x1F8A5F, .5)
    gold = M('gold', 0xD4AF37, .3, metal=1.0)
    skylight = M('skylight', 0xFFE9C4, .5, emit=0xFFE0A8, strength=2.0)
    pendant = M('pendant', 0xFFE3B0, .4, emit=0xFFC766, strength=3.5)
    window_m = M('window', 0xBFE0FF, .3, emit=0x9CC8F5, strength=1.5)
    screen_blank = M('scrblank', 0x0A1A2E, .3, emit=0x1B4A80, strength=1.0)
    neon_o = M('neonO', 0xFFA466, .3, emit=0xFF8C42, strength=5.0)
    neon_c = M('neonC', 0x8FE8FF, .3, emit=0x39D0FF, strength=5.0)
    led_g = M('ledg', 0x6CFFA8, .3, emit=0x14E070, strength=5.0)
    led_b = M('ledb', 0x8FC4FF, .3, emit=0x3A86FF, strength=5.0)
    led_r = M('ledr', 0xFF8A8A, .3, emit=0xFF2A2A, strength=5.0)
    foam = M('foam', 0xF2E8D2, .9)
    mat_gray = M('matgray', 0x34363C, .95)
    canvas_w = M('canvasw', 0xF1ECE0, .9)
    plant = M('plant', 0x2E9E5B, .8, double=True)
    pot = M('pot', 0xB5653A, .8)
    paints = [M('paint%d' % i, c, .5) for i, c in enumerate((0xE63946, 0xFFBE0B, 0x3A86FF, 0x2BB673, 0x8A5BFF, 0xFF8C42, 0xFF4FA3, 0x00B8C4))]
    board_mats = [M('bd%d' % i, c, .35) for i, c in enumerate((0xFF006E, 0x00B8C4, 0xFFBE0B, 0xFF8C42))]

    # ------------------------------------------------------------ shell
    box((2 * H, .2, 2 * H), (0, -.1, 0), plankA, name='floor')
    for i in range(-21, 21):
        box((.96, .02, 2 * H - 2), (i + .5, .012, 0), plankA if i % 2 else plankB, name='board')
    for (w, d, x, z) in ((2 * H + 2, 1, 0, -H), (2 * H + 2, 1, 0, H), (1, 2 * H + 2, -H, 0), (1, 2 * H + 2, H, 0)):
        box((w, WALL, d), (x, WALL / 2, z), plaster, name='wall')
    # brick wainscot + skirting on all four inner faces
    for (nx, nz, ry) in ((0, -1, 0), (0, 1, PI), (-1, 0, PI / 2), (1, 0, -PI / 2)):
        with group('ws', at=(nx * (H - .5), 0, nz * (H - .5)), ry=ry):
            box((2 * H - 1, 1.6, .14), (0, .8, .07), brick, name='brickband')
            box((2 * H - 1, .12, .2), (0, 1.62, .1), darkwood, name='wcap')
    # ceiling, trusses, skylights
    box((2 * H, .3, 2 * H), (0, WALL + .15, 0), beam, name='ceiling')
    for z in range(-20, 21, 5):
        box((2 * H, .45, .4), (0, WALL - .2, z), beam, name='truss')
    for x in range(-20, 21, 8):
        box((.4, .45, 2 * H), (x, WALL - .5, 0), beam, name='truss2')
    for sx in (-10, 10):
        box((5, .06, 2 * H - 6), (sx, WALL - .02, 0), skylight, name='skylight')
    # big back windows on the north wall + side windows
    for wx in (-6.5, 0, 6.5):
        box((4.2, 3.4, .12), (wx, 4.6, -H + .55), window_m, name='nwin')
        for mx in (-1.4, 0, 1.4):
            box((.07, 3.4, .16), (wx + mx, 4.6, -H + .6), darkwood, name='mull')
        box((4.4, .08, .18), (wx, 4.6, -H + .6), darkwood, name='mull')
        box((4.5, .16, .3), (wx, 2.85, -H + .7), darkwood, name='sill')
    for sz in (-10, 14):
        for sx in (-1, 1):
            box((.12, 3.0, 4.0), (sx * (H - .55), 4.5, sz), window_m, name='swin')
            box((.16, 3.0, .07), (sx * (H - .6), 4.5, sz), darkwood, name='mull')
    # garage door (south wall) with slats
    for k in range(9):
        box((8, .38, .12), (0, .3 + k * .42, H - .56), M('slat', 0xC9C2B4, .6, metal=.3) if k % 2 else M('slat2', 0xBDB6A8, .6, metal=.3), name='slat')
    box((8.4, .2, .2), (0, 4.2, H - .6), darkwood, name='doorhead')
    # pegboard wall (west half of north wall) with tool silhouettes
    box((11, 3.4, .1), (-9, 3.6, -H + .56), pegboard, name='pegs')
    for i in range(10):
        x = -13.5 + i * 1.0
        kind = i % 4
        if kind == 0:
            box((.08, .9, .06), (x, 3.6, -H + .64), metal, name='tool')
            box((.38, .16, .08), (x, 4.1, -H + .64), iron, name='hammerhead')
        elif kind == 1:
            box((.14, 1.0, .05), (x, 3.6, -H + .64), orange, name='tool')
        elif kind == 2:
            tor(.24, .04, (x, 3.7, -H + .64), metal, rot=(PI / 2, 0, 0), seg=16, rseg=5, name='wrench')
            box((.08, .7, .05), (x, 3.2, -H + .64), metal, name='wrench')
        else:
            prism([(0, 0), (.9, 0), (.9, .3), (0, .15)], .04, (x - .2, 3.0, -H + .66), metal, rot=(0, 0, 1.57), name='saw')
    text('ELIXIR WORKSHOP', .95, (0, 6.55, -H + .62), neon_o, extrude=.06, name='sign')
    text('make · break · master', .3, (0, 5.75, -H + .62), neon_c, extrude=.02, name='subsign')
    # pendant lamps
    for (px, pz) in ((-12, -14), (12, -14), (-14, 6), (14, 6), (0, -4), (0, 12)):
        seg((px, WALL, pz), (px, WALL - 2.6, pz), .02, black, sides=4, name='cord')
        cyl(.18, .35, (px, WALL - 2.85, pz), black, seg=14, r2=.6, name='shade')
        sph(.24, (px, WALL - 3.0, pz), pendant, seg=10, name='bulb')
    # plants
    for (px, pz) in ((-20, 19), (20, 19), (-20, -6), (20, -6)):
        cyl(.5, .6, (px, .3, pz), pot, seg=14, r2=.4, name='pot')
        for k in range(8):
            a = k * PI / 4
            ribbon([(px, .6, pz), (px + math.cos(a) * .5, 1.5, pz + math.sin(a) * .5), (px + math.cos(a) * .9, 1.9, pz + math.sin(a) * .9)],
                   [.05, .35, .02], (0, 0, 0), plant, up=(0, 1, 0), name='leaf')

    def sawhorse(x, z, ry=0.0):
        with group('sh', at=(x, 0, z), ry=ry):
            box((.12, .14, 1.0), (0, .95, 0), oak, name='top')
            for sz in (-.4, .4):
                seg((-.18, 0, sz), (0, .92, sz * .6), .04, oak, sides=5, name='leg')
                seg((.18, 0, sz), (0, .92, sz * .6), .04, oak, sides=5, name='leg')

    def bench(w, d=1.5, h=.95, top=oak, legs=darkwood):
        box((w, .1, d), (0, h, 0), top, name='top')
        for sx in (-w / 2 + .15, w / 2 - .15):
            for sz in (-d / 2 + .15, d / 2 - .15):
                box((.12, h, .12), (sx, h / 2, sz), legs, name='leg')
        box((w - .3, .06, d - .3), (0, .3, 0), legs, name='shelf')

    # ------------------------------------------------------------ SURFBOARD BAY (NW)
    with group('HS_hobby_surfboard_making', at=(-12, 0, -18)):
        box((8.5, .03, 5.2), (0, .02, -.2), mat_gray, name='shapemat')
        sawhorse(-1.3, -.8, PI / 2)
        sawhorse(1.3, -.8, PI / 2)
        sph(1, (0, 1.2, -.8), foam, scale=(1.55, .09, .4), seg=26, name='blank')
        box((3.0, .02, .03), (0, 1.29, -.8), darkwood, name='stringer')
        # planer, sanding block, resin bucket, fin set
        box((.5, .1, .16), (.4, 1.36, -.55), orange, name='planer')
        box((.12, .14, .1), (.25, 1.46, -.55), black, name='planer')
        box((.3, .06, .14), (-.5, 1.34, -1.05), yellow, name='sandblock')
        cyl(.22, .42, (2.7, .21, -.4), white, seg=14, name='bucket')
        cyl(.22, .03, (2.7, .43, -.4), orange, seg=14, name='bucket')
        for k in range(3):
            prism([(0, 0), (.22, 0), (.04, .3)], .03, (-2.5 + k * .4, .65, -1.9), board_mats[k], name='fin')
        box((1.8, .08, .5), (-2.5, .55, -1.9), darkwood, name='fintray')
        for k in range(4):
            sph(1, (-3.0 + k * 1.15, 1.35, -2.25), board_mats[k], scale=(.28, 1.25, .045), rot=(-.1, 0, 0), seg=18, name='wallboard%d' % k)
        for k in range(8):   # foam shavings
            sph(.13, (rnd.uniform(-1.4, 1.4), .06, rnd.uniform(-.4, .6)), foam, scale=(1.3, .45, 1), seg=6, name='shave')
        box((1.6, .45, .3), (3.2, .22, -1.7), foam, name='blankstack')
        box((1.5, .4, .28), (3.2, .67, -1.7), foam, name='blankstack')
        text('SHAPING BAY', .32, (0, 3.4, -2.4), orange, extrude=.03, name='baylabel')

    # ------------------------------------------------------------ CODING BAY (NE)
    with group('HS_hobby_coding', at=(12, 0, -18)):
        with group('desk', at=(0, 0, -1.4)):
            bench(6.0, 2.2, .95, oak, black)
        scr = [(-1.9, 1.55, -1.9, .35), (0, 1.7, -2.15, 0), (1.9, 1.55, -1.9, -.35)]
        for k, (sx, sy, sz, ry) in enumerate(scr):
            with group('mon', at=(sx, sy, sz), ry=ry):
                box((1.5, .9, .06), (0, 0, 0), black, name='bezel')
                quad(1.4, .8, (0, 0, .04), screen_blank, name='KEEP_screen_code_%d' % k)
                box((.1, .45, .08), (0, -.65, -.04), iron, name='stand')
                box((.5, .04, .3), (0, -.88, 0), iron, name='stand')
        box((1.2, .04, .4), (0, 1.0, -.8), white, name='kb')
        box((.12, .03, .2), (.85, 1.0, -.8), white, name='mouse')
        cyl(.1, .14, (1.8, 1.05, -1.0), white, seg=12, name='mug')
        sph(.28, (-2.4, 1.2, -1.1), plant, scale=(1, .8, 1), seg=8, name='deskplant')
        # chair
        for k in range(5):
            a = k * 2 * PI / 5
            seg((0, .15, .6), (math.cos(a) * .5, .08, .6 + math.sin(a) * .5), .03, iron, sides=5, name='chairleg')
        cyl(.04, .5, (0, .45, .6), iron, seg=8, name='chairpost')
        box((.6, .1, .6), (0, .75, .6), black, name='seat')
        box((.55, .8, .1), (0, 1.2, .95), black, rot=(.12, 0, 0), name='chairback')
        box((.6, .12, .12), (0, 1.6, 1.0), red, name='headrest')
        # server rack + whiteboard
        box((1.0, 2.3, .9), (3.8, 1.15, -1.7), black, name='rack')
        for k in range(10):
            box((.8, .08, .02), (3.8, .4 + k * .2, -1.24), iron, name='rackunit')
            sph(.025, (3.55, .4 + k * .2, -1.22), [led_g, led_b, led_r][k % 3], seg=6, name='rackled')
        box((3.2, 1.7, .06), (-3.9, 2.4, -2.2), white, name='board')
        box((3.3, .05, .1), (-3.9, 1.5, -2.15), iron, name='boardtray')
        for k, (bx, by, bw, bh) in enumerate(((-4.6, 2.7, .7, .45), (-3.6, 2.7, .7, .45), (-2.8, 2.7, .6, .45), (-4.1, 2.0, .9, .4), (-3.0, 2.0, .9, .4))):
            box((bw, bh, .02), (bx, by, -2.16), [blue, orange, green, red, yellow][k], name='boardnode')
        for a, b in (((-4.25, 2.7), (-3.95, 2.7)), ((-3.25, 2.7), (-3.1, 2.7)), ((-4.4, 2.5), (-4.1, 2.2)), ((-3.4, 2.5), (-3.0, 2.2))):
            seg((a[0], a[1], -2.15), (b[0], b[1], -2.15), .012, black, sides=4, name='boardline')
        for k in range(6):
            box((.18, .18, .01), (-2.4 + (k % 3) * .22, 2.9 - (k // 3) * .22, -2.15), [yellow, orange, green][k % 3], rot=(0, 0, .1 * k), name='sticky')
        text('</> CODE', .5, (0, 3.6, -2.35), neon_c, extrude=.04, name='baylabel')

    # ------------------------------------------------------------ ELECTRICAL BAY (W wall, faces +x)
    with group('HS_hobby_electrical', at=(-18, 0, 6), ry=PI / 2):
        with group('bn', at=(0, 0, -1.4)):
            bench(6.0, 2.0, .95, oak, black)
        # oscilloscope
        box((.95, .6, .7), (-1.9, 1.35, -1.5), M('scopebody', 0x9AA0A6, .5, metal=.5), name='scopebody')
        quad(.62, .45, (-1.82, 1.4, -1.14), screen_blank, name='KEEP_screen_scope')
        for k in range(4):
            cyl(.04, .04, (-2.2 + k * .12, 1.15, -1.13), black, rot=(PI / 2, 0, 0), seg=8, name='knob')
        # bench PSU + multimeter
        box((.7, .3, .5), (-.6, 1.2, -1.5), blue, name='psu')
        quad(.3, .12, (-.6, 1.25, -1.24), led_g, name='psuscr')
        cyl(.05, .05, (-.8, 1.12, -1.24), red, rot=(PI / 2, 0, 0), seg=8, name='terminal')
        cyl(.05, .05, (-.4, 1.12, -1.24), black, rot=(PI / 2, 0, 0), seg=8, name='terminal')
        box((.3, .5, .12), (.5, 1.25, -1.2), yellow, rot=(-.3, 0, 0), name='dmm')
        quad(.2, .12, (.5, 1.38, -1.13), led_g, name='dmmscr')
        # soldering station + PCB + breadboard
        box((.35, .1, .3), (1.5, 1.05, -1.2), black, name='solderbase')
        seg((1.5, 1.1, -1.2), (1.8, 1.0, -.85), .02, metal, sides=6, name='solderiron')
        box((.7, .03, .5), (.2, 1.0, -.7), pcb, name='pcb')
        for k in range(6):
            box((.1, .04, .06), (-.05 + (k % 3) * .2, 1.03, -.8 + (k // 3) * .2), black, name='chip')
        box((.9, .06, .35), (2.0, 1.0, -.4), white, name='breadboard')
        for k in range(8):
            seg((1.7 + k * .1, 1.05, -.38), (1.78 + k * .1, 1.18, -.2), .012, [red, blue, green, yellow][k % 4], sides=4, name='jumper')
        tor(.2, .05, (2.5, 1.08, -1.5), M('copper', 0xB87333, .3, metal=1.0), seg=24, rseg=8, name='coil')
        # component drawers on the wall
        box((5.0, 2.2, .45), (0, 1.9 + .2, -2.35), darkwood, name='drawers')
        for r in range(5):
            for c in range(8):
                box((.5, .32, .03), (-2.1 + c * .6, 1.0 + r * .4 + .4, -2.11), metal, name='drawer')
                box((.16, .04, .04), (-2.1 + c * .6, 1.05 + r * .4 + .4, -2.08), black, name='drawerhandle')
        for k in range(3):   # wire spools
            cyl(.2, .14, (-1.6 + k * .5, 3.8, -2.3), [red, blue, yellow][k], rot=(PI / 2, 0, 0), seg=14, name='spool')
        text('CIRCUIT LAB', .32, (0, 3.5, -2.35), neon_c, extrude=.03, name='baylabel')

    # ------------------------------------------------------------ ART BAY (E wall, faces -x)
    with group('HS_hobby_art', at=(18, 0, 6), ry=-PI / 2):
        box((8.4, .03, 5.0), (0, .02, -.4), M('dropcloth', 0xE8E2D2, .95), name='dropcloth')
        for k in range(14):
            cyl(rnd.uniform(.08, .3), .01, (rnd.uniform(-3.8, 3.8), .04, rnd.uniform(-2.6, 1.6)), paints[k % 8], seg=10, name='splat')

        def easel(x, ry, painting):
            with group('easel', at=(x, 0, -.5), ry=ry):
                for sx in (-.55, .55):
                    seg((sx, 0, .2), (sx * .8, 2.3, -.05), .04, oak, sides=5, name='eleg')
                seg((0, 0, -.7), (0, 2.2, -.1), .04, oak, sides=5, name='eback')
                box((1.3, 1.6, .05), (0, 1.5, .02), canvas_w, rot=(-.12, 0, 0), name='canvasx')
                with group('art', at=(0, 1.5, .06), rot=(-.12, 0, 0)):
                    painting()
                box((1.4, .05, .18), (0, .78, .1), oak, name='ledge')

        def painting_a():
            sph(.5, (-.1, .15, 0), paints[2], scale=(1, 1, .05), seg=14, name='pa')
            sph(.35, (.25, -.1, .01), paints[5], scale=(1, 1, .05), seg=14, name='pb')
            box((1.1, .25, .02), (0, -.45, .0), paints[3], rot=(0, 0, .05), name='pc')
            sph(.18, (-.35, .5, .02), paints[1], scale=(1, 1, .05), seg=10, name='pd')

        def painting_b():
            for k in range(6):
                box((.18, 1.4, .02), (-.5 + k * .2, 0, 0), paints[(k * 3) % 8], name='stripe')
            sph(.3, (0, 0, .02), paints[0], scale=(1, 1, .05), seg=12, name='pe')
            tor(.35, .04, (0, 0, .03), white, rot=(PI / 2, 0, 0), seg=18, rseg=5, name='pf')
        easel(-1.9, .0, painting_a)
        easel(1.9, .0, painting_b)
        # table with palette, jars, brushes, stool
        with group('at', at=(3.4, 0, -1.6)):
            bench(2.4, 1.0, .9, oak, darkwood)
        cyl(.34, .03, (3.2, .98, -1.55), oak, seg=20, name='palette')
        for k in range(6):
            sph(.07, (3.2 + math.cos(k) * .2, 1.02, -1.55 + math.sin(k) * .2), paints[k], scale=(1, .5, 1), seg=8, name='blob')
        for k in range(4):
            cyl(.07, .16, (3.9 + k * .16, 1.07, -1.65), M('jar%d' % k, 0xDFF0F5, .1) , seg=10, name='jar')
            cyl(.06, .03, (3.9 + k * .16, 1.17, -1.65), paints[k + 2], seg=10, name='jarlid')
        cyl(.07, .25, (2.6, 1.1, -1.7), white, seg=10, name='brushcup')
        for k in range(4):
            seg((2.6, 1.15, -1.7), (2.6 + (k - 1.5) * .05, 1.5, -1.7 + (k % 2) * .03), .01, darkwood, sides=4, name='brush')
        cyl(.25, .06, (-3.2, .72, .8), oak, seg=14, name='stool')
        for sx in (-.15, .15):
            seg((-3.2 + sx, 0, .8), (-3.2 + sx * .5, .7, .8), .03, darkwood, sides=5, name='stoolleg')
        # sculpture on a pedestal
        box((.8, 1.1, .8), (-3.6, .55, -1.8), white, name='pedestal')
        sph(.38, (-3.6, 1.5, -1.8), M('clay', 0xB77B5A, .8), scale=(.9, 1.2, .9), seg=14, name='bust')
        sph(.22, (-3.6, 1.95, -1.8), M('clay', 0xB77B5A, .8), seg=12, name='bust')
        # wall: framed pieces + colour wheel
        for k in range(3):
            box((1.1, 1.4, .06), (-3.0 + k * 1.5, 3.9, -2.4), darkwood, name='frame')
            box((.95, 1.25, .02), (-3.0 + k * 1.5, 3.9, -2.36), canvas_w, name='frameinner')
            sph(.3, (-3.0 + k * 1.5, 3.9, -2.34), paints[k * 2], scale=(1, 1, .05), seg=10, name='framepaint')
        for k in range(12):
            a = k * PI / 6
            prism([(0, 0), (.62 * math.cos(-PI / 12), .62 * math.sin(-PI / 12)), (.62 * math.cos(PI / 12), .62 * math.sin(PI / 12))], .04,
                  (3.2, 3.9, -2.34), paints[k % 8], rot=(0, 0, a), name='wheel')
        text('ART STUDIO', .32, (0, 5.1, -2.4), neon_o, extrude=.03, name='baylabel')

    # ------------------------------------------------------------ central island (hub)
    with group('HS_hub', at=(0, 0, -4)):
        bench(5.6, 2.4, .95, oak, darkwood)
        box((3.4, .02, 1.5), (0, 1.02, 0), M('blueprint', 0x2C5AA0, .8), name='blueprint')
        for k in range(7):
            box((3.2, .005, .02), (0, 1.035, -.6 + k * .2), white, name='bpline')
        tor(.4, .015, (-.6, 1.04, 0), white, seg=28, rseg=4, name='bpcircle')
        for k, (mat_, dx) in enumerate(((orange, -2.0), (blue, -.7), (green, .7), (yellow, 2.0))):
            cyl(.26, .3, (dx, 1.25, -.7 if k % 2 == 0 else .7), mat_, seg=16, name='orb_base')
            sph(.2, (dx, 1.52, -.7 if k % 2 == 0 else .7), M('orb%d' % k, 0xFFFFFF, .2, emit=[0xFF8C42, 0x3A86FF, 0x2BB673, 0xFFBE0B][k], strength=4.0), seg=12, name='orb')
        seg((-2.6, 1.0, -1.0), (-2.6, 3.0, -1.0), .03, iron, sides=5, name='hang')
        text('MASTERY', .34, (0, 2.1, 1.4), orange, extrude=.03, ry=0, name='hublabel')

    export(os.path.join(out, 'elixir.glb'))


if __name__ == '__main__':
    build(out_dir())
