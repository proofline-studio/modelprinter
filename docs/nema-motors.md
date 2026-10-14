# NEMA stepper motors

`mp.string("nema8").json()`, `nema17`, `nema23`, and `nema34` resolve to `fn: "nema"`
and `nemaSize: 8 | 17 | 23 | 34`. Lengths are millimeters or unit-bearing strings.
`nemaMotorModelPropsSchema` validates direct props with a required `nemaSize`.

| Default | NEMA 8 | NEMA 17 | NEMA 23 | NEMA 34 |
| --- | --- | --- | --- | --- |
| Body width × length | 20.3 × 33 | 42.3 × 38 | 56.4 × 51 | 86 × 80 |
| Square hole pitch | 16 | 31 | 47.14 | 69.6 |
| Hole center coordinates | (±8, ±8) | (±15.5, ±15.5) | (±23.57, ±23.57) | (±34.8, ±34.8) |
| Hole diameter / depth | 2 / 2 blind | 3 / 4.5 blind | 5 / through front flange | 6.5 / through front flange |
| Pilot diameter × height | 15 × 1.5 | 22 × 2 | 38.1 × 1.6 | 73 × 1.6 |
| Shaft diameter × length from face | 4 × 15 | 5 × 24 | 6.35 × 20.6 | 14 × 32 |
| Shaft shape | round | D | D | round (keyway omitted) |
| D flat depth / length | 0.5 / 10 when enabled | 0.5 / 15 | 0.5 / 15 | 0.5 / 15 when enabled |

Mounting, pilot and shaft dimensions follow representative Nanotec drawings:
[SCA2018](https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_SCA2018.pdf),
[ST4118](https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_ST4118.pdf),
[ST5918](https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_ST5918.pdf).
NEMA34 envelope, mounting, pilot and shaft dimensions follow the
[STEPPERONLINE 34HS31-6004S1 drawing](https://www.omc-stepperonline.com/download/34HS31-6004S1.pdf).
Its keyway is omitted and the default shaft is round; `_dshaft` enables an illustrative flat.
Frame names do not guarantee body length or shaft details. D cuts, cap lengths
and corner chamfers are illustrative defaults; no screw threads or wires are modeled.

The shaft axis is +Z. The mounting face is Z=0, the body spans -bodyLength to 0,
and the shaft tip is at shaftLength (measured from the face, including the pilot).
The flat runs back from the tip for shaftFlatLength. Flat depth is radial material
removed, so a 5 mm shaft with a 0.5 mm cut measures 4.5 mm from flat to opposite
side. Flat angle is degrees counterclockwise around +Z, starting on the +X side.

```ts
mp.string("nema17_l48mm_shaftlength24mm_dshaft_flatdepth0.5mm_flatlength15mm_flatangle90deg").json()
// Alternative small-motor mounting geometry:
mp.string("nema8_holespacing15.4mm_pilotdiameter16mm").json()
// 8 mm NEMA 23 shaft:
mp.string("nema23_shaftdiameter8mm_shaftlength25mm_flatdepth0.5mm_flatlength20mm").json()
```

Modifiers: `l` / `length` / `bodylength`, `bodywidth`, `shaftlength`,
`shaftdiameter`, `round` / `dshaft`, `flatdepth`, `flatlength`, `flatangle`,
`holespacing`, `holediameter`, `holedepth`, `throughholes` / `blindholes`,
`pilotdiameter`, `pilotlength`, `frontcap`, `rearcap`, `facechamfer`, `bodychamfer`, `rearchamfer`, `stepped` / `chamfered`.
Duplicate, unknown and geometrically invalid parameters fail validation.
Direct props use mutually exclusive `roundShaft` / `dShaft` and
`chamfered` / `stepped` booleans. Each resolved group contains one true flag
and false for its other flags. Explicit groups must select exactly one true flag.
`_roundshaft` and `_backfaceplain` also match their prop names; `_round` and
`_plainbackface` remain value-free flag spellings. Enum properties `shaftShape`,
`backFace` and `cornerProfile`, and value-bearing selector tokens, are rejected.

This package defines parameters and parses model strings; it does not generate
motor geometry. The corresponding components in jscad-electronics build the
JSCAD solids and own the visual snapshots and geometry tests.

## Rear face

The rear face is Z=-bodyLength. NEMA8/17/23 model strings show four installed socket-head
cap screws; NEMA34 defaults to a plain rear casting. `_backfaceholes` removes the screws and exposes four blind bores;
`_backfacescrews` explicitly selects installed screws. `_plainbackface` omits both.
These flags are mutually exclusive. Direct props use `backFaceHoles`,
`backFaceScrews` or `backFacePlain` booleans. Resolved definitions contain exactly
one true flag and false for the other rear-face flags.

Rear fasteners are representative configurable details, not guaranteed by a NEMA
frame number. Rear patterns default to 16 × 16 / 31 × 31 / 50 × 32 / 40 × 40 mm.
`backFaceHoleSpacing` / `_backholespacing` still sets both axes to a square
pattern when supplied. `backFaceHoleSpacingX` / `_backholespacingx` and
`backFaceHoleSpacingY` / `_backholespacingy` independently override each axis.
NEMA34 follows the rounded, stepped shoulders and plain rear casting visible in
STEPPERONLINE product photos. The rear follows the body profile instead of
repeating the mounting flange. Front assembly screws sit in edge recesses
separately from the mounting holes. The side wire bundle has a grommet, a 90 degree
default exit angle, 2 mm wires, and 25 mm visible length. Threads, laminations,
and the shaft keyway are omitted.

These visual details are photo-based approximations, not manufacturing dimensions.
`stepped` / `chamfered` booleans and `rearCornerChamfer` / `rearchamfer`
configure the profiles. In stepped mode, the chamfer value divided by sqrt(2)
sets the corner shoulder depth, with fillets up to 4 mm. Default body and rear
values are both 24 mm. Rear bores/screws remain opt-in with an illustrative
40 mm square pitch and can be overridden to match a specific motor.
NEMA8/17 retain their existing profiles. NEMA23 uses matching curved body/rear
profiles with 9 mm shoulders, R5 recesses and R2.5 fillets; front holes are unchanged.

`rearStepped` / `_rearstepped` and `rearChamfered` / `_rearchamfered` override the
rear profile independently of `stepped` / `chamfered`. Body and rear arc radii
use `bodyCornerRecessRadius`, `bodyCornerFilletRadius`, `rearCornerRecessRadius`
and `rearCornerFilletRadius` (`bodyrecess`, `bodyfillet`, `rearrecess`, `rearfillet`).
`nema23_chamfered_backholespacing47.14mm_backscrewm4` retains the previous depiction.

| Rear default (mm) | NEMA8 | NEMA17 | NEMA23 | NEMA34 |
| --- | --- | --- | --- | --- |
| Screw size | M2 | M3 | M3 | M5 |
| Bore diameter / depth | 2 / 2 | 3 / 4.5 | 3 / 4.5 | 5 / 6 |
| Head diameter / height | 3.8 / 2 | 5.5 / 3 | 5.5 / 3 | 8.5 / 5 |

`backFaceScrewSize` / `_backscrewm3` selects the existing ISO 4762 bolt
head/socket dimensions. `backFaceHoleDiameter` / `_backholediameter` and
`backFaceHoleDepth` / `_backholedepth` override the bores. Heads extend outward
along -Z, increasing the complete model's length beyond the body length.
Screw shanks are smooth and only occupy the rear bore; internal tie rods and
threads are not represented. Validation rejects bores without floors,
screws larger than the bore, and holes or heads that cross the rear-face edge.

```ts
mp.string("nema17_backfaceholes").json()
mp.string("nema23_backfacescrews_backholespacingx48mm_backholespacingy30mm").json()
```

## Wire connection aliases

JST PH supports 2–16 pins and JST SH supports 2–15 pins, matching cableprinter.
For either family, model strings accept `jstN_ph` / `jstN_sh`,
`jst_ph_N` / `jst_sh_N`, and `jst-ph-N` / `jst-sh-N`; these normalize to
`jstphN` / `jstshN` before token parsing. For example, `nema17_jst4_sh`
and `nema17_jstsh4` produce the same definition.

Resolved definitions retain the existing `jst-family-N` spelling; existing
PH definitions and dimensions are preserved. Header dimensions vary with
family and pin count, and headers that cannot fit on the motor are rejected.
`none` / `stubs` remain value-free aliases for `nowires` / `wirestubs`.
Direct props use `noWires` or `wireStubs` booleans, with visible stubs by default.
`wireConnection` accepts only JST catalog identifiers; it cannot be combined with
a true `noWires` or `wireStubs` flag. Resolved wire booleans are both false for
JST terminations, and `wireConnection` is omitted for no-wire and stub choices. Duplicate,
unsupported, and out-of-range connections still fail validation.
