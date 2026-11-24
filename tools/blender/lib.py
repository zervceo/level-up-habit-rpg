"""
Shared Blender (bpy) helpers for the ZERV LEVEL UP 3D scenes.

Works with Blender's bundled Python or the `bpy` PyPI module:
    blender -b -P tools/blender/build_all.py
    python tools/blender/build_all.py            # with `pip install bpy`

Scene scripts describe geometry in *Three.js* coordinates (x right, y up,
z toward the viewer) so they read the same as the JS side. This module
converts to Blender's Z-up frame, and the glTF exporter converts back.

Conventions the JS side relies on:
  - an Empty named  HS_<id>   becomes a clickable hotspot (everything
    parented to it is the hit area);
  - a mesh named    KEEP_<x>  is never merged (JS can find it by name to
    swap in a live texture, e.g. a monitor screen).
"""
import bpy
import bmesh
import math
import random
import os
import sys
from mathutils import Vector, Matrix

_C = Matrix(((1, 0, 0), (0, 0, 1), (0, -1, 0)))  # blender -> three basis


def V(x, y, z):
    """Three-style point -> Blender point."""
    return Vector((x, -z, y))


def Rt(*steps):
    """Compose Three-frame rotations. Rt(('x', a), ('y', b)) applies x then y."""
    m = Matrix.Identity(3)
    for axis, ang in steps:
        m = Matrix.Rotation(ang, 3, axis.upper()) @ m
    return _C.transposed() @ m @ _C


def _euler(rot):
    if isinstance(rot, Matrix):
        return rot.to_euler()
    rx, ry, rz = rot
    return Rt(('z', rz), ('y', ry), ('x', rx)).to_euler()  # == Three Euler XYZ


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()
    del _stack[:]


# ----------------------------------------------------------------- materials
_mats = {}


def _hex(c):
    if isinstance(c, str):
        c = int(c.lstrip('#'), 16)
    r, g, b = (c >> 16) & 255, (c >> 8) & 255, c & 255

    def lin(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def M(name, color, rough=0.75, metal=0.0, emit=None, strength=1.0, double=False):
    if name in _mats:
        return _mats[name]
    m = bpy.data.materials.new(name)
    if double:
        m.use_backface_culling = False
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = _hex(color)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emit is not None:
        bsdf.inputs['Emission Color'].default_value = _hex(emit)
        bsdf.inputs['Emission Strength'].default_value = strength
    _mats[name] = m
    return m


# -------------------------------------------------------------------- groups
_stack = []


class group:
    """Empty that parents everything created inside the `with` block."""

    def __init__(self, name, at=(0, 0, 0), ry=0.0, rot=None, scale=1.0):
        e = bpy.data.objects.new(name, None)
        bpy.context.scene.collection.objects.link(e)
        e.location = V(*at)
        e.rotation_euler = _euler(rot if rot is not None else (0, ry, 0))
        e.scale = (scale, scale, scale)
        if _stack:
            e.parent = _stack[-1]
        self.e = e

    def __enter__(self):
        _stack.append(self.e)
        return self.e

    def __exit__(self, *a):
        _stack.pop()


def _place(o, at, rot, m, smooth, name):
    if name:
        o.name = name
    if _stack:
        o.parent = _stack[-1]
    o.location = V(*at)
    o.rotation_euler = _euler(rot)
    if m is not None:
        o.data.materials.append(m)
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    return o


# ---------------------------------------------------------------- primitives
def box(size, at, m, rot=(0, 0, 0), name='box'):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.scale = (size[0], size[2], size[1])
    return _place(o, at, rot, m, False, name)


def cyl(r, h, at, m, rot=(0, 0, 0), seg=16, r2=None, smooth=True, name='cyl'):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=h)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r, radius2=r2, depth=h)
    return _place(bpy.context.active_object, at, rot, m, smooth, name)


def sph(r, at, m, scale=(1, 1, 1), rot=(0, 0, 0), seg=16, smooth=True, name='sph'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=max(6, seg // 2), radius=r)
    o = bpy.context.active_object
    o.scale = (scale[0], scale[2], scale[1])
    return _place(o, at, rot, m, smooth, name)


def tor(R, r, at, m, rot=(0, 0, 0), seg=32, rseg=8, name='tor'):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg, minor_segments=rseg)
    return _place(bpy.context.active_object, at, rot, m, True, name)


def plane(w, d, at, m, rot=(0, 0, 0), name='plane'):
    """Horizontal plane (normal +Y)."""
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.active_object
    o.scale = (w, d, 1)
    return _place(o, at, rot, m, False, name)


def quad(w, h, at, m, ry=0.0, name='quad'):
    """Vertical plane facing +Z, then spun by ry about Y."""
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.active_object
    o.scale = (w, h, 1)
    return _place(o, at, Rt(('x', math.pi / 2), ('y', ry)), m, False, name)


def seg(a, b, r, m, r2=None, sides=8, smooth=True, name='seg'):
    """Cylinder / tapered limb between two points (group-local, Three coords)."""
    p0, p1 = V(*a), V(*b)
    d = p1 - p0
    L = d.length
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=r, depth=L)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=r, radius2=r2, depth=L)
    o = bpy.context.active_object
    o.name = name
    if _stack:
        o.parent = _stack[-1]
    o.location = (p0 + p1) / 2
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    o.data.materials.append(m)
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def text(body, size, at, m, ry=0.0, extrude=0.03, align='CENTER', name='text'):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = body
    cu.size = size
    cu.extrude = extrude
    cu.resolution_u = 3          # glyph curve detail; the default is far more than a sign needs
    cu.align_x = align
    cu.align_y = 'CENTER'
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.active_object
    o.select_set(False)
    o.rotation_euler = Rt(('x', math.pi / 2), ('y', ry)).to_euler()
    o.location = V(*at)
    if _stack:
        o.parent = _stack[-1]
    o.data.materials.append(m)
    return o


def _mesh_obj(name, bm, at, rot, m, smooth):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    if _stack:
        o.parent = _stack[-1]
    o.location = V(*at)
    o.rotation_euler = _euler(rot)
    if m is not None:
        me.materials.append(m)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return o


def lathe(profile, at, m, seg=24, rot=(0, 0, 0), smooth=True, name='lathe', outward=True):
    """Revolve [(radius, y), ...] (bottom -> top) around the local Y axis."""
    bm = bmesh.new()
    rings = []
    for r, y in profile:
        if r < 1e-6:
            rings.append([bm.verts.new(V(0, y, 0))] * seg)
        else:
            rings.append([bm.verts.new(V(r * math.cos(2 * math.pi * j / seg), y, r * math.sin(2 * math.pi * j / seg)))
                          for j in range(seg)])
    for i in range(len(rings) - 1):
        for j in range(seg):
            j2 = (j + 1) % seg
            a, b, c, d = rings[i][j], rings[i][j2], rings[i + 1][j2], rings[i + 1][j]
            quad_ = [a, d, c, b] if outward else [a, b, c, d]
            ded = []
            for v in quad_:
                if not ded or ded[-1] is not v:
                    ded.append(v)
            if len(ded) > 1 and ded[0] is ded[-1]:
                ded.pop()
            if len(ded) >= 3:
                bm.faces.new(ded)
    return _mesh_obj(name, bm, at, rot, m, smooth)


def prism(pts, depth, at, m, rot=(0, 0, 0), name='prism'):
    """Extrude a polygon given in local (x, y) pts along Z, centred on z=0."""
    area = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    if area < 0:
        pts = list(reversed(pts))
    bm = bmesh.new()
    f = [bm.verts.new(V(x, y, depth / 2)) for x, y in pts]
    k = [bm.verts.new(V(x, y, -depth / 2)) for x, y in pts]
    bm.faces.new(f)
    bm.faces.new(list(reversed(k)))
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new([f[i], k[i], k[j], f[j]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return _mesh_obj(name, bm, at, rot, m, False)


def poly(pts, at, m, facing='up', name='poly'):
    """Single flat/planar n-gon from Three-space points, normal forced up or down."""
    bm = bmesh.new()
    vs = [bm.verts.new(V(*p)) for p in pts]
    f = bm.faces.new(vs)
    f.normal_update()
    up = f.normal.z > 0          # blender z == three y
    if up != (facing == 'up'):
        f.normal_flip()
    return _mesh_obj(name, bm, at, (0, 0, 0), m, False)


def ribbon(points, widths, at, m, up=(0, 1, 0), rot=(0, 0, 0), name='ribbon'):
    """Flat strip following `points` (Three coords). Each width is the strip's
    full width at that point; the strip's side vector is tangent x up."""
    bm = bmesh.new()
    pts = [V(*p) for p in points]
    upv = V(*up).normalized()
    left, right = [], []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        side = t.cross(upv)
        if side.length < 1e-6:
            side = Vector((1, 0, 0))
        side.normalize()
        w = widths[i] / 2.0
        left.append(bm.verts.new(p + side * w))
        right.append(bm.verts.new(p - side * w))
    for i in range(len(pts) - 1):
        try:
            bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
        except ValueError:
            pass
    return _mesh_obj(name, bm, at, rot, m, False)


def windows(cols, rows, dx, dy, w, h, at, m_lit, m_dark, ry=0.0, lit=0.55, seed=1, name='windows'):
    """cols x rows grid of small quads on a vertical wall facing +Z (spun by ry),
    centred on `at`. Lit windows use m_lit, the rest m_dark."""
    rnd = random.Random(seed)
    out = []
    for mat_, want in ((m_lit, True), (m_dark, False)):
        bm = bmesh.new()
        count = 0
        for i in range(cols):
            for j in range(rows):
                is_lit = rnd.random() < lit
                if is_lit != want:
                    continue
                cx = (i - (cols - 1) / 2) * dx
                cy = (j - (rows - 1) / 2) * dy
                v = [bm.verts.new(V(cx + sx * w / 2, cy + sy * h / 2, 0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
                bm.faces.new(v)
                count += 1
        if count:
            out.append(_mesh_obj(name, bm, at, (0, ry, 0), mat_, False))
        else:
            bm.free()
    return out


# ----------------------------------------------------------------- optimize
def _hs_ancestor(o):
    p = o.parent
    while p is not None:
        if p.name.startswith('HS_'):
            return p
        p = p.parent
    return None


def optimize():
    """Bake transforms and merge meshes per material (per hotspot)."""
    bpy.context.view_layer.update()
    # pull hotspot empties out to the root, keeping their world transform
    for e in [o for o in bpy.data.objects if o.type == 'EMPTY' and o.name.startswith('HS_')]:
        mw = e.matrix_world.copy()
        e.parent = None
        e.matrix_world = mw
    bpy.context.view_layer.update()

    buckets = {}
    for o in [o for o in bpy.data.objects if o.type == 'MESH']:
        hs = _hs_ancestor(o)
        mw = o.matrix_world.copy()
        if hs is not None:
            o.data.transform(hs.matrix_world.inverted() @ mw)
        else:
            o.data.transform(mw)
        o.parent = hs
        o.matrix_parent_inverse = Matrix.Identity(4)
        o.location = (0, 0, 0)
        o.rotation_euler = (0, 0, 0)
        o.scale = (1, 1, 1)
        if o.name.startswith('KEEP_'):
            continue
        mat = o.data.materials[0].name if o.data.materials else ''
        buckets.setdefault((hs.name if hs else '', mat), []).append(o)
    bpy.context.view_layer.update()

    for objs in buckets.values():
        if len(objs) < 2:
            continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()

    for o in [o for o in bpy.data.objects if o.type == 'EMPTY' and not o.name.startswith('HS_')]:
        bpy.data.objects.remove(o, do_unlink=True)


def export(path):
    optimize()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', export_apply=True, export_yup=True,
        export_cameras=False, export_lights=False, export_extras=False,
    )
    tris = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print('EXPORTED', path, '%.0f KB' % (os.path.getsize(path) / 1024.0), 'faces~', tris)


def out_dir():
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, '..', '..', 'models'))
