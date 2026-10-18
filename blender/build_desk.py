"""Builds the desk models, bakes three lighting presets, exports public/models.

Run:  blender -b --python blender/build_desk.py
Outputs:
  public/models/desk.glb            geometry (Draco), Desk has UVs but no texture
  public/models/desk_<preset>.jpg   baked light + albedo for the Desk, one per preset

Coordinates below are in the site's three.js space (x right, y up, z toward viewer);
they are converted to Blender's Z-up on creation and back on export.
Each top-level object keeps its origin at (0,0,0); the web scene positions it.
The screen plane and the realtime lights stay in code.
"""
import bpy, bmesh, math, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
LIVE_DIR = os.path.join(HERE, "..", "public", "models")
# Bake into a staging folder and swap at the end, so the running site never sees new textures
# paired with the old model (their UVs differ, which scrambles every surface).
OUT_DIR = os.path.join(HERE, "out", "staging")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(LIVE_DIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)


def lin(h):
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        x = int(h[i:i + 2], 16) / 255
        out.append(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4)
    return out


_mats = {}


def mat(name, color, rough=0.75, metal=0.0, emit=None):
    if name in _mats:
        return _mats[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*lin(color), 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*lin(emit), 1)
        b.inputs["Emission Strength"].default_value = 2.0
    _mats[name] = m
    return m


def b3(p):  # three -> blender
    return (p[0], -p[2], p[1])


def finish(obj, material, bevel=0.0, smooth=True, segs=3):
    obj.data.materials.append(material)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel:
        m = obj.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = segs
        m.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier="bevel")
    if smooth:
        bpy.ops.object.shade_smooth()
    obj.select_set(False)
    return obj


def box(size, pos, material, bevel=0.0, rot=(0, 0, 0), segs=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=b3(pos))
    o = bpy.context.active_object
    o.scale = (size[0], size[2], size[1])
    o.rotation_euler = (rot[0], 0, rot[1])  # three x-tilt, three y-turn
    return finish(o, material, bevel, segs=segs)


def cyl(r1, r2, h, pos, material, rot=(0, 0, 0), verts=24, cap=True):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=verts, location=b3(pos), end_fill_type="NGON" if cap else "NOTHING")
    o = bpy.context.active_object
    o.rotation_euler = (rot[0], rot[2], rot[1])
    return finish(o, material)


def cable(points, radius, material):
    cu = bpy.data.curves.new("cable", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    sp = cu.splines.new("NURBS")
    sp.points.add(len(points) - 1)
    for p, pt in zip(sp.points, points):
        x, y, z = b3(pt)
        p.co = (x, y, z, 1)
    sp.order_u = 4
    sp.use_endpoint_u = True
    o = bpy.data.objects.new("cable", cu)
    bpy.context.scene.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.active_object
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    o.select_set(False)
    return o


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = name
    o.data.name = name
    # Keep the origin at the world origin. (join() leaves it at the first part's centre, which
    # silently shifts every prop when it is later placed: the walkie sank 70mm, the cork board 150mm.)
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    o.select_set(False)
    return o


# --------------------------------------------------------------------------- materials
body = mat("body", "#DCD4C2", 0.55)
body_dark = mat("body_dark", "#B9B1A0", 0.6)
dark = mat("dark", "#2F2C27", 0.9)
bezel = mat("bezel", "#B4AC9A", 0.9)
keycap = mat("keycap", "#E4DDCB", 0.45)
keybed = mat("keybed", "#9A9282", 0.8)
cable_m = mat("cable", "#CFC7B4", 0.7)
led = mat("led", "#FFB000", 0.3, emit="#FFB000")
badge_m = mat("badge", "#6F675A", 0.5)

# --------------------------------------------------------------------------- Computer
KB_C = Vector((0, 0.0175, 0.33))
KB_T = 0.06  # keyboard tilt, back higher than front


def kb_point(lx, ly, lz):
    y = ly * math.cos(KB_T) - lz * math.sin(KB_T)
    z = ly * math.sin(KB_T) + lz * math.cos(KB_T)
    return (KB_C.x + lx, KB_C.y + y, KB_C.z + z)


comp = [
    box((0.32, 0.34, 0.30), (0, 0.17, 0), body, 0.014, segs=4),
    box((0.26, 0.26, 0.14), (0, 0.20, -0.20), body, 0.022, segs=4),
    box((0.25, 0.195, 0.002), (0, 0.215, 0.151), bezel),
    box((0.264, 0.208, 0.003), (0, 0.215, 0.1495), body_dark, 0.0012),   # screen surround lip
    box((0.092, 0.024, 0.002), (0.07, 0.065, 0.1505), body_dark, 0.001),  # floppy door
    box((0.07, 0.005, 0.002), (0.07, 0.068, 0.1515), dark),               # floppy slot
    box((0.007, 0.007, 0.002), (0.125, 0.04, 0.1515), led),               # power LED
    box((0.12, 0.004, 0.012), (0, 0.341, -0.2), body_dark, 0.001),        # top handle recess
    box((0.03, 0.008, 0.002), (-0.115, 0.04, 0.1515), body_dark, 0.001),  # eject button
    # keyboard
    box((0.41, 0.022, 0.135), (0, 0.0155, 0.33), body, 0.007, rot=(KB_T, 0, 0), segs=4),
    box((0.375, 0.004, 0.1), kb_point(0, 0.0125, 0), keybed, rot=(KB_T, 0, 0)),
    # mouse + button seam
    box((0.048, 0.022, 0.075), (0.32, 0.011, 0.34), body, 0.011, segs=4),
    box((0.046, 0.0012, 0.0015), (0.32, 0.0225, 0.318), dark),
    box((0.20, 0.0012, 0.0012), (0.32, 0.001, 0.34), dark),  # placeholder removed below
]
comp.pop()  # (no-op slot kept small; mouse pad lives in Desk)
# side vent grooves + top vents
comp += [box((0.004, 0.026, 0.002), (-0.1 - i * 0.012, 0.065, 0.1515), dark) for i in range(4)]
comp += [box((0.15, 0.0015, 0.004), (0, 0.3405, -0.03 - i * 0.012), dark) for i in range(7)]
# keys: 4 rows, staggered, individual caps
rows = [(14, 0.0235, 0.036), (13, 0.0235, 0.012), (13, 0.0235, -0.012), (0, 0, 0)]
key_w = 0.0235
for r, (n, _, lz) in enumerate(rows[:3]):
    x0 = -(n - 1) * key_w / 2
    for i in range(n):
        comp.append(box((0.021, 0.006, 0.021), kb_point(x0 + i * key_w, 0.016, lz), keycap, 0.0025, rot=(KB_T, 0, 0), segs=2))
comp.append(box((0.19, 0.006, 0.021), kb_point(0, 0.016, -0.038), keycap, 0.0025, rot=(KB_T, 0, 0), segs=2))  # space bar
# mouse cable to the rear of the machine
comp.append(cable([(0.32, 0.012, 0.302), (0.315, 0.004, 0.23), (0.255, 0.004, 0.14), (0.185, 0.004, 0.05), (0.185, 0.004, -0.14), (0.13, 0.06, -0.285)], 0.0016, cable_m))
# keyboard cable
comp.append(cable([(-0.1, 0.014, 0.262), (-0.1, 0.004, 0.2), (-0.22, 0.004, 0.14), (-0.19, 0.004, 0.0), (-0.19, 0.004, -0.15), (-0.12, 0.07, -0.285)], 0.0018, cable_m))
join(comp, "Computer")

# Digicam
cam = [
    box((0.1, 0.06, 0.04), (0, 0, 0), mat("cam", "#2E2B27", 0.45, 0.35), 0.007),
    box((0.1, 0.018, 0.0405), (0, 0.021, 0), mat("camtop", "#9B968A", 0.35, 0.7), 0.004),
    cyl(0.021, 0.023, 0.026, (0.012, 0, 0.032), mat("lensring", "#444038", 0.35, 0.6), rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.016, 0.016, 0.028, (0.012, 0, 0.033), mat("lens", "#0C0B09", 0.08, 0.2), rot=(math.pi / 2, 0, 0), verts=32),
    box((0.014, 0.009, 0.01), (-0.03, 0.036, 0), mat("shutter", "#9E4A3C", 0.5), 0.002),
]
join(cam, "camera")

# Notebook
nb = [
    box((0.14, 0.016, 0.19), (0, 0, 0), mat("cover", "#4B3E36", 0.8), 0.004),
    box((0.135, 0.012, 0.185), (0.004, 0, 0), mat("pages", "#EFE8D6", 0.95)),
    box((0.006, 0.0165, 0.19), (-0.066, 0, 0), mat("spine", "#3A2F29", 0.8)),
    box((0.008, 0.0005, 0.19), (0.046, 0.0085, 0), mat("band", "#1C1B19", 0.6)),
]
join(nb, "notebook")

# Mug
red = mat("mug", "#E6E2D8", 0.35)
mug = [cyl(0.04, 0.036, 0.09, (0, 0, 0), red, verts=40), cyl(0.034, 0.034, 0.002, (0, 0.045, 0), mat("coffee", "#2A1A12", 0.2), verts=40)]
bpy.ops.mesh.primitive_torus_add(major_radius=0.02, minor_radius=0.006, location=b3((0.048, 0, 0)), rotation=(math.pi / 2, 0, 0), major_segments=32, minor_segments=12)
mug.append(finish(bpy.context.active_object, red))
join(mug, "mug")

# Lamp: weighted base, two-section arm with joints, a closed shade with a pale inside, and a bulb.
# Local origin = centre of the base on the desk. The bulb sits at (0.311, 0.299, 0); Scene.tsx uses it.
metal = mat("lampmetal", "#2E2D2B", 0.4, 0.6)
shade = mat("shade", "#33322F", 0.45, 0.4)
shade_in = mat("shade_in", "#E6E0D2", 0.7)
bulb = mat("bulb", "#F6F1E6", 0.3)


def rod(p0, p1, r, m_):
    mid = tuple((a + b) / 2 for a, b in zip(p0, p1))
    return cable([p0, mid, p1], r, m_)


SH_TILT = -0.7  # shade opening faces forward and down, toward the middle of the desk
lamp = [
    cyl(0.072, 0.08, 0.022, (0, 0.011, 0), metal, verts=48),
    cyl(0.02, 0.024, 0.02, (0, 0.032, 0), metal, verts=24),
    rod((0, 0.04, 0), (0.06, 0.30, 0), 0.0075, metal),
    cyl(0.013, 0.013, 0.03, (0.06, 0.30, 0), metal, rot=(math.pi / 2, 0, 0), verts=20),
    rod((0.06, 0.30, 0), (0.255, 0.362, 0), 0.0065, metal),
    cyl(0.011, 0.011, 0.026, (0.258, 0.36, 0), metal, rot=(math.pi / 2, 0, 0), verts=20),
    cyl(0.066, 0.019, 0.11, (0.295, 0.318, 0), shade, rot=(0, 0, SH_TILT), verts=48, cap=False),
    cyl(0.062, 0.016, 0.104, (0.296, 0.317, 0), shade_in, rot=(0, 0, SH_TILT), verts=48, cap=False),
    cyl(0.02, 0.02, 0.012, (0.267, 0.352, 0), shade, rot=(0, 0, SH_TILT), verts=24),
]
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.021, location=b3((0.311, 0.299, 0)), segments=20, ring_count=12)
lamp.append(finish(bpy.context.active_object, bulb))
join(lamp, "Lamp")

# Desk top + mouse pad + coaster (baked together, so they share lighting)
wood = bpy.data.materials.new("wood")
pad = mat("pad", "#2C2A27", 0.95)
coaster = mat("coaster", "#C8BFAA", 0.9)
desk = [
    box((1.7, 0.04, 1.05), (0, -0.02, 0.075), wood, 0.003),
    box((0.2, 0.003, 0.17), (0.31, 0.0015, 0.33), pad, 0.001),
    cyl(0.05, 0.05, 0.004, (0.56, 0.002, 0.12), coaster, verts=40),
]
join(desk, "Desk")

# Furniture: legs, back panel, drawer pedestal and an office chair. Static scenery, baked unlit.
FLOOR_Y = -0.74
leg_m = mat("leg", "#3C3C41", 0.45, 0.6)
panel_m = mat("panel", "#8C8E92", 0.6)
front_m = mat("drawerfront", "#9B9DA1", 0.55)
handle_m = mat("handle", "#2A2A2D", 0.4, 0.7)
leather = mat("leather", "#6A4E36", 0.55)
chair_metal = mat("chair_metal", "#2E2E32", 0.4, 0.7)
fur = [
    box((0.045, 0.70, 0.045), (-0.80, -0.39, -0.40), leg_m, 0.003),
    box((0.045, 0.70, 0.045), (0.80, -0.39, -0.40), leg_m, 0.003),
    box((0.045, 0.70, 0.045), (0.80, -0.39, 0.55), leg_m, 0.003),
    box((0.045, 0.70, 0.045), (-0.80, -0.39, 0.55), leg_m, 0.003),
    box((1.55, 0.38, 0.012), (0, -0.25, -0.41), panel_m),
    box((0.42, 0.64, 0.80), (-0.58, -0.37, 0.075), panel_m, 0.004),
]
for i, y in enumerate((-0.16, -0.37, -0.58)):
    fur.append(box((0.38, 0.19, 0.012), (-0.58, y, 0.481), front_m, 0.003))
    fur.append(box((0.12, 0.012, 0.016), (-0.58, y + 0.05, 0.497), handle_m, 0.002))

CX, CZ, YAW = 0.62, 0.8, -0.6


def chair_pt(lx, ly, lz):
    return (CX + lx * math.cos(YAW) + lz * math.sin(YAW), FLOOR_Y + ly, CZ - lx * math.sin(YAW) + lz * math.cos(YAW))


fur += [
    box((0.46, 0.07, 0.44), chair_pt(0, 0.46, 0), leather, 0.02, rot=(0, YAW, 0)),
    box((0.42, 0.34, 0.05), chair_pt(0, 0.70, 0.215), leather, 0.02, rot=(0.12, YAW, 0)),
    cyl(0.025, 0.025, 0.40, chair_pt(0, 0.255, 0), chair_metal, verts=20),
    cyl(0.05, 0.05, 0.03, chair_pt(0, 0.07, 0), chair_metal, verts=20),
    box((0.16, 0.025, 0.2), chair_pt(0, 0.42, 0), chair_metal, 0.004, rot=(0, YAW, 0)),
]
for i in range(5):
    t = i * 2 * math.pi / 5 + 0.3
    R = 0.29
    fur.append(box((R, 0.03, 0.045), (CX + R / 2 * math.cos(t), FLOOR_Y + 0.065, CZ + R / 2 * math.sin(t)), chair_metal, 0.006, rot=(0, -t, 0)))
    fur.append(cyl(0.022, 0.022, 0.04, (CX + R * math.cos(t), FLOOR_Y + 0.02, CZ + R * math.sin(t)), chair_metal, verts=16))
# Tall floor plant beside the desk
fp_pot = mat("floorpot", "#B4AEA3", 0.8)
leaf_a = mat("leaf_a", "#5C8450", 0.7)
leaf_b = mat("leaf_b", "#4C7541", 0.7)
fur.append(cyl(0.12, 0.09, 0.30, (1.08, FLOOR_Y + 0.15, -0.20), fp_pot, verts=40))
fur.append(cyl(0.105, 0.105, 0.004, (1.08, FLOOR_Y + 0.30, -0.20), mat("floorsoil", "#2A1D14", 1.0), verts=40))
for i in range(9):
    a = i * (2 * math.pi / 9) + 0.4
    lean = 0.10 + (i % 3) * 0.06
    h = 0.50 + (i % 4) * 0.13
    sx, sz, sy = 1.08, -0.20, FLOOR_Y + 0.30
    tx, tz, ty = sx + math.cos(a) * h * lean * 2.2, sz + math.sin(a) * h * lean * 2.2, sy + h
    mx, mz, my = sx + (tx - sx) * 0.35, sz + (tz - sz) * 0.35, sy + h * 0.55
    fur.append(cable([(sx + math.cos(a) * 0.02, sy, sz + math.sin(a) * 0.02), (mx, my, mz), (tx, ty, tz)], 0.0045, leaf_b))
    # leaf blade: long, broad, tilted up along the stem direction
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=b3((tx + math.cos(a) * 0.12, ty + 0.06, tz + math.sin(a) * 0.12)), segments=24, ring_count=12)
    lf = bpy.context.active_object
    lf.scale = (0.16, 0.065, 0.006)
    lf.rotation_euler = (0.25 if i % 2 else -0.25, -0.75, -a)
    fur.append(finish(lf, leaf_a if i % 2 else leaf_b))
join(fur, "Furniture")

# Floor (only its baked shadow is shown, over the page background)
bpy.ops.mesh.primitive_plane_add(size=8, location=b3((0, FLOOR_Y, 0.075)))
floor_o = bpy.context.active_object
floor_o.name = "Floor"
floor_o.data.materials.append(mat("floor", "#D0D0D0", 0.9))

# Cork board that stands at the back of the desk (sticky notes live on it)
cork = mat("cork", "#86705A", 0.95)
board = [
    box((0.46, 0.30, 0.016), (0, 0.15, -0.002), mat("boardframe", "#4A3A30", 0.6), 0.003),
    box((0.42, 0.26, 0.016), (0, 0.15, 0.001), cork, 0.002),
    box((0.05, 0.02, 0.07), (-0.18, 0.01, 0.03), mat("boardfoot", "#3A2A1E", 0.7)),
    box((0.05, 0.02, 0.07), (0.18, 0.01, 0.03), mat("boardfoot", "#3A2A1E", 0.7)),
]
join(board, "corkboard")


def setup_wood(c1, c2):
    wood.use_nodes = True
    nt = wood.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (0.6, 38, 38)
    n1 = nt.nodes.new("ShaderNodeTexNoise")
    n1.inputs["Scale"].default_value = 1.0
    n1.inputs["Detail"].default_value = 12
    n1.inputs["Roughness"].default_value = 0.62
    n1.inputs["Distortion"].default_value = 0.4
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.38
    ramp.color_ramp.elements[0].color = (*lin(c1), 1)
    ramp.color_ramp.elements[1].position = 0.68
    ramp.color_ramp.elements[1].color = (*lin(c2), 1)
    bsdf.inputs["Roughness"].default_value = 0.55
    nt.links.new(coord.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], n1.inputs["Vector"])
    nt.links.new(n1.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])


# --------------------------------------------------------------------------- more desk objects
# Local origin = centre of the footprint on the desk (y=0 is the desk surface).

def half_torus(center, major, minor, mat_):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, location=b3(center), rotation=(math.pi / 2, 0, 0), major_segments=48, minor_segments=12)
    o = bpy.context.active_object
    o.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.0005], context="VERTS")
    bm.to_mesh(o.data)
    bm.free()
    return finish(o, mat_)


# Headphones on a stand
hp_black = mat("hp_black", "#262626", 0.5)
hp_pad = mat("hp_pad", "#6F5B49", 0.8)
hp_metal = mat("hp_metal", "#9A968C", 0.35, 0.8)
hp = [
    cyl(0.046, 0.046, 0.008, (0, 0.004, 0), hp_metal, verts=40),
    cyl(0.006, 0.006, 0.19, (0, 0.1, 0), hp_metal, verts=16),
    half_torus((0, 0.135, 0), 0.062, 0.0065, hp_black),
    cyl(0.034, 0.034, 0.026, (0.062, 0.135, 0), hp_black, rot=(0, 0, math.pi / 2), verts=40),
    cyl(0.034, 0.034, 0.026, (-0.062, 0.135, 0), hp_black, rot=(0, 0, math.pi / 2), verts=40),
    cyl(0.03, 0.03, 0.01, (0.0495, 0.135, 0), hp_pad, rot=(0, 0, math.pi / 2), verts=40),
    cyl(0.03, 0.03, 0.01, (-0.0495, 0.135, 0), hp_pad, rot=(0, 0, math.pi / 2), verts=40),
]
join(hp, "headphones")

# Binoculars, lying down
bn_body = mat("bn_body", "#2A2D2E", 0.55)
bn_ring = mat("bn_ring", "#8A857A", 0.4, 0.7)
bn_glass = mat("bn_glass", "#1E3340", 0.1, 0.3)
bn = [
    box((0.03, 0.012, 0.05), (0, 0.0300, 0.0), bn_body, 0.003),
    cyl(0.0185, 0.0185, 0.09, (0.024, 0.0235, 0), bn_body, rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.0185, 0.0185, 0.09, (-0.024, 0.0235, 0), bn_body, rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.0235, 0.0215, 0.032, (0.024, 0.0235, 0.052), bn_ring, rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.0235, 0.0215, 0.032, (-0.024, 0.0235, 0.052), bn_ring, rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.0185, 0.0185, 0.004, (0.024, 0.0235, 0.0685), bn_glass, rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.0185, 0.0185, 0.004, (-0.024, 0.0235, 0.0685), bn_glass, rot=(math.pi / 2, 0, 0), verts=32),
    cyl(0.0125, 0.0145, 0.02, (0.024, 0.0235, -0.055), bn_ring, rot=(math.pi / 2, 0, 0), verts=24),
    cyl(0.0125, 0.0145, 0.02, (-0.024, 0.0235, -0.055), bn_ring, rot=(math.pi / 2, 0, 0), verts=24),
]
join(bn, "binoculars")

# Sticky notes (on the wall; faces +z)
ink = mat("noteink", "#4A4637", 0.9)
def sticky(color, name, lines=True):
    n = [box((0.075, 0.075, 0.002), (0, 0, 0), mat("note_" + name, color, 0.9)),
         box((0.075, 0.013, 0.0023), (0, 0.031, 0.0001), mat("note_top_" + name, "#D2BC66" if name == "a" else "#C48F8F", 0.9))]
    if lines:
        n += [box((0.05 - i * 0.012, 0.0025, 0.0024), (-0.006 - i * 0.006, 0.01 - i * 0.015, 0.0002), ink) for i in range(3)]
    return join(n, "note" if name == "a" else "note2")
sticky("#E3CE7E", "a")
sticky("#D6A7A4", "b", lines=False)

# Envelope, lying flat
env_w = mat("env", "#F3EFE6", 0.9)
env = [
    box((0.115, 0.003, 0.078), (0, 0.0015, 0), env_w, 0.0008),
    box((0.116, 0.0006, 0.0012), (0, 0.0032, 0.0), mat("env_line", "#D7CFBD", 0.9)),
    box((0.016, 0.0007, 0.02), (0.038, 0.0034, 0.02), mat("stamp", "#A5584A", 0.8)),
    box((0.04, 0.0007, 0.004), (-0.02, 0.0034, 0.012), ink),
    box((0.03, 0.0007, 0.004), (-0.025, 0.0034, 0.022), ink),
]
join(env, "envelope")

# Manila folder, lying flat. Opens the resume.
fd = mat("folder", "#C6A768", 0.85)
fd_label = mat("folder_label", "#EFEADC", 0.9)
fold = [
    box((0.17, 0.004, 0.12), (0, 0.002, 0), fd, 0.0008),
    box((0.055, 0.004, 0.012), (-0.045, 0.002, -0.066), fd, 0.0008),
    box((0.17, 0.0006, 0.0012), (0, 0.0043, -0.052), mat("folder_crease", "#A98C52", 0.9)),
    box((0.045, 0.0007, 0.0085), (-0.045, 0.0044, -0.066), fd_label),
    box((0.03, 0.0008, 0.0025), (-0.045, 0.0046, -0.066), ink),
]
join(fold, "folder")

# Pill bottle with two loose pills. Opens the Capstone project.
pb_amber = mat("pb_amber", "#B9742A", 0.35)
pb_cap = mat("pb_cap", "#EDE9DD", 0.5)
pb_label = mat("pb_label", "#F1EEE4", 0.9)
pb_pill = mat("pb_pill", "#F6F3EA", 0.4)
pb_pill2 = mat("pb_pill2", "#C95A49", 0.4)
bottle = [
    cyl(0.018, 0.018, 0.07, (0, 0.035, 0), pb_amber, verts=32),
    cyl(0.0196, 0.0196, 0.016, (0, 0.078, 0), pb_cap, verts=32),
    cyl(0.0184, 0.0184, 0.036, (0, 0.036, 0), pb_label, verts=32),
    box((0.022, 0.0032, 0.0012), (0, 0.047, 0.0184), ink),
    box((0.016, 0.0022, 0.0012), (0, 0.040, 0.0184), ink),
    box((0.018, 0.0022, 0.0012), (0, 0.025, 0.0184), ink),
    cyl(0.0038, 0.0038, 0.011, (0.038, 0.0038, 0.012), pb_pill, rot=(0, 0, math.pi / 2), verts=16),
    cyl(0.0038, 0.0038, 0.011, (0.05, 0.0038, -0.004), pb_pill2, rot=(math.pi / 2, 0, 0), verts=16),
]
join(bottle, "capstone")

# Walkie-talkie, standing
wk_body = mat("wk_body", "#2E2E30", 0.5)
wk_acc = mat("wk_acc", "#B8683A", 0.45)
wk = [
    box((0.052, 0.14, 0.03), (0, 0.07, 0), wk_body, 0.006),
    cyl(0.0045, 0.0035, 0.06, (-0.016, 0.17, 0), wk_body, verts=12),
    cyl(0.011, 0.011, 0.012, (0.012, 0.15, 0), wk_acc, verts=24),
    box((0.012, 0.03, 0.01), (-0.028, 0.095, 0.0), wk_acc, 0.002),
    box((0.034, 0.018, 0.002), (0, 0.118, 0.0155), mat("wk_screen", "#7F9B72", 0.3)),
] + [box((0.034, 0.002, 0.002), (0, 0.082 - i * 0.008, 0.0155), mat("wk_grill", "#0F0F10", 0.8)) for i in range(5)]
join(wk, "walkie")

# Desk clock (a live display plane is added in code at z = +0.0215, y = 0.034)
ck = [
    box((0.11, 0.062, 0.042), (0, 0.031, 0), mat("ck_body", "#D8D3C6", 0.5), 0.006),
    box((0.096, 0.044, 0.002), (0, 0.034, 0.0205), mat("ck_bezel", "#1F2220", 0.4), 0.001),
    box((0.012, 0.004, 0.03), (0.04, 0.002, 0), mat("ck_foot", "#8D8574", 0.8)),
    box((0.012, 0.004, 0.03), (-0.04, 0.002, 0), mat("ck_foot", "#8D8574", 0.8)),
]
join(ck, "clock")

# Plant
pot = mat("pot", "#B9B3A8", 0.85)
leaf_a = mat("leaf_a", "#5C8450", 0.7)
leaf_b = mat("leaf_b", "#4C7541", 0.7)
pl = [cyl(0.04, 0.03, 0.07, (0, 0.035, 0), pot, verts=32), cyl(0.036, 0.036, 0.003, (0, 0.069, 0), mat("soil", "#2A1D14", 1.0), verts=32)]
for i in range(9):
    a = i * (2 * math.pi / 9) + (0.3 if i % 2 else 0)
    tilt = 0.55 if i % 2 else 0.9
    ln = 0.065 if i % 2 else 0.05
    r = 0.03 + (0.01 if i % 2 else 0)
    ctr = (math.cos(a) * r, 0.07 + math.sin(tilt) * ln * 0.55, math.sin(a) * r)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=b3(ctr), segments=16, ring_count=8)
    lf = bpy.context.active_object
    lf.scale = (ln, 0.014, 0.0035)
    lf.rotation_euler = (0, -tilt, -a)  # blender: yaw about z follows -a because y_b = -z_three
    pl.append(finish(lf, leaf_a if i % 2 else leaf_b))
join(pl, "plant")

# Pen cup
cup = mat("cup", "#3A4249", 0.5)
pc = [cyl(0.033, 0.033, 0.09, (0, 0.045, 0), cup, verts=40)]
pens = [("#C24A33", "x", 0.16, -0.012, 0.0), ("#1C1B19", "x", -0.2, 0.012, 0.004), ("#E0B93B", "z", 0.18, 0.0, -0.012), ("#3B6EA5", "z", -0.15, 0.004, 0.012)]
for col, axis, t, x0, z0 in pens:
    ln = 0.13
    cx, cz = x0, z0
    cy = 0.012 + ln / 2 * math.cos(t)
    if axis == "x":
        cx += ln / 2 * math.sin(t)
        pc.append(cyl(0.0035, 0.0035, ln, (cx, cy, cz), mat("pen_" + col, col, 0.4), rot=(0, 0, t), verts=12))
    else:
        cz += ln / 2 * math.sin(t)
        pc.append(cyl(0.0035, 0.0035, ln, (cx, cy, cz), mat("pen_" + col, col, 0.4), rot=(t, 0, 0), verts=12))
join(pc, "pencup")

# --------------------------------------------------------------------------- finishing helpers
def edge_highlight(m, strength=0.5, dist=0.0035):
    """Lighten convex edges (like worn paint catching light). Uses a short-range inside AO ray test,
    so it works on any mesh density and lands in the bake."""
    if not m.use_nodes or "Principled BSDF" not in m.node_tree.nodes:
        return
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    sock = b.inputs["Base Color"]
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion")
    ao.inside = True
    ao.samples = 6
    ao.inputs["Distance"].default_value = dist
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(ao.outputs["AO"], inv.inputs[1])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = strength
    nt.links.new(inv.outputs[0], mul.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    if sock.is_linked:
        nt.links.new(sock.links[0].from_socket, mix.inputs["A"])
    else:
        mix.inputs["A"].default_value = sock.default_value
    mix.inputs["B"].default_value = (0.92, 0.88, 0.8, 1)
    nt.links.new(mul.outputs[0], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], sock)


def denoise(path, quality=90):
    """Run the saved bake through Blender's compositor denoiser (OpenImageDenoise)."""
    sc_ = bpy.context.scene
    im = bpy.data.images.load(path)
    w, h = im.size
    sc_.render.resolution_x, sc_.render.resolution_y, sc_.render.resolution_percentage = w, h, 100
    sc_.render.image_settings.file_format = "JPEG"
    sc_.render.image_settings.quality = quality
    sc_.view_settings.view_transform = "Standard"
    sc_.view_settings.look = "None"
    ng = bpy.data.node_groups.new("dn", "CompositorNodeTree")
    sc_.compositing_node_group = ng
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    n_img = ng.nodes.new("CompositorNodeImage")
    n_img.image = im
    n_dn = ng.nodes.new("CompositorNodeDenoise")
    n_out = ng.nodes.new("NodeGroupOutput")
    ng.links.new(n_img.outputs["Image"], n_dn.inputs["Image"])
    ng.links.new(n_dn.outputs["Image"], n_out.inputs[0])
    tmp = path + ".dn.jpg"
    sc_.render.filepath = tmp
    bpy.ops.render.render(write_still=True)
    os.replace(tmp, path)
    bpy.data.node_groups.remove(ng)
    bpy.data.images.remove(im)


# --------------------------------------------------------------------------- bake
PLACE = {  # mirrors src/scene/layout.ts
    "camera": ((-0.40, 0.03, 0.48), 0.5),
    "notebook": ((0.28, 0.008, 0.46), -0.35),
    "mug": ((0.56, 0.045, 0.12), 0.0),
    "Lamp": ((-0.62, 0.0, -0.12), 0.0),
    "headphones": ((-0.44, 0.0, 0.17), 0.4),
    "binoculars": ((0.66, 0.0, 0.40), 0.5),
    "corkboard": ((0.40, 0.0, -0.40), 0.0),
    "note": ((0.31, 0.19, -0.389), 0.0),
    "note2": ((0.45, 0.14, -0.389), 0.0),
    "envelope": ((-0.21, 0.0, 0.52), -0.3),
    "walkie": ((0.66, 0.0, -0.16), 0.35),
    "folder": ((0.50, 0.0, 0.26), -0.2),
    "capstone": ((0.04, 0.0, 0.52), 0.3),
    "clock": ((-0.32, 0.0, -0.05), 0.25),
    "plant": ((0.76, 0.0, -0.30), 0.0),
    "pencup": ((0.24, 0.0, -0.26), 0.0),
}
for n, (pos, ry) in PLACE.items():
    o = bpy.data.objects[n]
    o.location = b3(pos)
    o.rotation_euler = (0, 0, ry)
bpy.data.objects["Lamp"].visible_shadow = False


# Placement audit: every prop should rest on the desk (min y = 0, or the stated base), not sink or float.
def audit():
    from mathutils import Vector as V
    rows = []
    for n in list(PLACE) + ["Computer"]:
        o = bpy.data.objects[n]
        bpy.context.view_layer.update()
        ys = [(o.matrix_world @ V(c)).z for c in o.bound_box]
        rows.append((n, min(ys), max(ys)))
    for n, lo, hi in rows:
        print(f"AUDIT {n:12s} bottom={lo*1000:7.1f}mm top={hi*1000:7.1f}mm")
audit()
if os.environ.get("CHECK_ONLY"):
    raise SystemExit

TARGET = (0.0, -0.25, 0.1)
PRESETS = {
    "studio": dict(lamp=0, key=dict(color="#FFFFFF", W=float(os.environ.get("KEY_W", "450")), pos=(1.5, 2.8, 2.4), size=2.6), world="#EEF0F6", wstr=float(os.environ.get("WORLD", "0.7")), wood=("#34312E", "#403C38")),
    "day": dict(lamp=0, key=dict(color="#FFEBD0", W=float(os.environ.get("KEY_W", "450")) * 1.5, pos=(-2.6, 2.4, 1.6), size=2.6), world="#E2EAF7", wstr=0.6, wood=("#4D463F", "#5A524A")),
    "evening": dict(lamp=140, key=None, world="#A99884", wstr=0.45, wood=("#262220", "#312B27")),
}
ONLY = os.environ.get("ONLY")  # e.g. ONLY=studio to bake a single preset while tuning


def aim(obj, frm, to):
    d = Vector(b3(to)) - Vector(b3(frm))
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = int(os.environ.get("BAKE_SAMPLES", "128"))
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.01
sc.cycles.use_denoising = False
sc.render.image_settings.file_format = "JPEG"
sc.render.image_settings.quality = 88

desk_obj = bpy.data.objects["Desk"]
fur_obj = bpy.data.objects["Furniture"]

# Desk atlas UVs: tabletop and front edge share one texel density.
bm_ = bmesh.new()
bm_.from_mesh(desk_obj.data)
S = 1.8
layer = bm_.loops.layers.uv.verify()


def top_uv(x, y):
    return ((x + 0.85) / S, (y + 0.6) / S)


for f in bm_.faces:
    c = f.calc_center_median()
    for l in f.loops:
        x, y, z = l.vert.co
        if f.normal.z > 0.5:
            l[layer].uv = top_uv(x, y)
        elif f.normal.y < -0.5 or f.normal.y > 0.5:   # front and back edges
            l[layer].uv = ((x + 0.85) / S, 0.62 + (z + 0.04) / S)
        else:  # underside and ends: take the colour of the spot they sit under
            l[layer].uv = top_uv(c.x, c.y)
bm_.to_mesh(desk_obj.data)
bm_.free()

# Furniture: smart unwrap into one atlas
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = fur_obj
fur_obj.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004)
bpy.ops.object.mode_set(mode="OBJECT")
fur_obj.select_set(False)


# Props: every movable model shares one atlas so they get the same soft contact shadows and bounce
# light as the desk. (x, y, size) in 512px cells of a 4096 atlas.
TILES = {
    "Computer": (0, 0, 4), "camera": (4, 0, 2), "notebook": (6, 0, 2), "mug": (4, 2, 2), "Lamp": (6, 2, 2),
    "headphones": (0, 4, 2), "corkboard": (2, 4, 2), "walkie": (4, 4, 2), "plant": (6, 4, 2),
    "note": (0, 6, 1), "note2": (1, 6, 1), "envelope": (0, 7, 1), "clock": (1, 7, 1), "folder": (2, 7, 1), "capstone": (3, 7, 1), "binoculars": (2, 6, 1), "pencup": (3, 6, 1),
}
for nm, (cx, cy, cs) in TILES.items():
    o = bpy.data.objects[nm]
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.012 if cs > 1 else 0.02)
    bpy.ops.object.mode_set(mode="OBJECT")
    bm2 = bmesh.new()
    bm2.from_mesh(o.data)
    lay = bm2.loops.layers.uv.verify()
    for f in bm2.faces:
        for l in f.loops:
            u, v = l[lay].uv
            l[lay].uv = ((cx + u * cs) / 8.0, (cy + v * cs) / 8.0)
    bm2.to_mesh(o.data)
    bm2.free()
    o.select_set(False)

# Edge highlights only where the geometry is thick enough for the inside-AO test to be meaningful.
EDGE_MATS = {"body", "body_dark", "keycap", "keybed", "cam", "camtop", "hp_black", "hp_metal", "bn_body", "bn_ring",
             "mug", "pot", "cup", "wk_body", "wk_acc", "ck_body", "lampmetal", "wood", "leg", "panel", "drawerfront",
             "leather", "chair_metal", "handle", "bezel"}
for m in bpy.data.materials:
    if m.name in EDGE_MATS:
        edge_highlight(m, strength=0.28, dist=0.003)


def bake_to(objs, path, size, margin=8):
    objs = objs if isinstance(objs, list) else [objs]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    img = bpy.data.images.new("bake", size, size)
    added = []
    for o in objs:
        for slot in o.material_slots:
            nt = slot.material.node_tree
            n = nt.nodes.new("ShaderNodeTexImage")
            n.image = img
            nt.nodes.active = n
            added.append((nt, n))
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT", "COLOR"}, margin=margin, use_clear=True)
    img.filepath_raw = path
    img.file_format = "JPEG"
    img.save()
    for nt, n in added:
        nt.nodes.remove(n)
    bpy.data.images.remove(img)
    for o in objs:
        o.select_set(False)
    denoise(path)


for name, P in PRESETS.items():
    if ONLY and name != ONLY:
        continue
    setup_wood(*P["wood"])
    for o in [o for o in bpy.data.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(o)
    if P["lamp"]:
        ld = bpy.data.lights.new("lamp", "SPOT")
        ld.color = lin("#FFC48A")
        ld.energy = P["lamp"]
        ld.spot_size = 1.9
        ld.spot_blend = 1.0
        ld.shadow_soft_size = 0.05
        lo = bpy.data.objects.new("lamp", ld)
        sc.collection.objects.link(lo)
        bulb_w = (-0.62 + 0.311, 0.299, -0.12)  # lamp position + bulb offset
        lo.location = b3(bulb_w)
        aim(lo, bulb_w, (-0.05, 0.0, 0.12))
    if P["key"]:
        k = P["key"]
        ld = bpy.data.lights.new("key", "AREA")
        ld.shape = "SQUARE"
        ld.size = k["size"]
        ld.color = lin(k["color"])
        ld.energy = k["W"]
        lo = bpy.data.objects.new("key", ld)
        sc.collection.objects.link(lo)
        lo.location = b3(k["pos"])
        aim(lo, k["pos"], TARGET)

    world = bpy.data.worlds.new("w_" + name)
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*lin(P["world"]), 1)
    bg.inputs["Strength"].default_value = P["wstr"]
    sc.world = world

    # SKIP=desk,props skips those bakes (their previous textures stay valid while geometry is unchanged).
    skip = set(filter(None, os.environ.get("SKIP", "").split(",")))
    if "desk" not in skip:
        bake_to(desk_obj, os.path.join(OUT_DIR, f"desk_{name}.jpg"), 4096)
    if "furniture" not in skip:
        bake_to(fur_obj, os.path.join(OUT_DIR, f"furniture_{name}.jpg"), 2048, margin=6)
    if "floor" not in skip:
        bake_to(bpy.data.objects["Floor"], os.path.join(OUT_DIR, f"floor_{name}.jpg"), 2048)
    if "props" not in skip:
        bake_to([bpy.data.objects[n] for n in TILES], os.path.join(OUT_DIR, f"props_{name}.jpg"), 4096, margin=4)
    print("baked", name)

# Final export: baked meshes keep their UVs but carry a plain material (the web scene applies the bake).
for o in [o for o in bpy.data.objects if o.type == "LIGHT"]:
    bpy.data.objects.remove(o)
plain = mat("plain", "#FFFFFF", 1.0)
for nm in ["Desk", "Furniture", "Floor"] + list(TILES):
    o = bpy.data.objects[nm]
    o.data.materials.clear()
    o.data.materials.append(plain)
for n in PLACE:
    o = bpy.data.objects[n]
    o.location = (0, 0, 0)
    o.rotation_euler = (0, 0, 0)

out = os.path.join(OUT_DIR, "desk.glb")
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format="GLB",
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_apply=True,
    export_yup=True,
    export_lights=False,
    export_image_format="JPEG",
)
import shutil
for f in os.listdir(OUT_DIR):
    if f.endswith((".jpg", ".glb")):
        shutil.copy2(os.path.join(OUT_DIR, f), os.path.join(LIVE_DIR, f + ".tmp"))
for f in os.listdir(OUT_DIR):
    if f.endswith((".jpg", ".glb")):
        os.replace(os.path.join(LIVE_DIR, f + ".tmp"), os.path.join(LIVE_DIR, f))
print("wrote", os.path.join(LIVE_DIR, "desk.glb"), os.path.getsize(out), "bytes")
