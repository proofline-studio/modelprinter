import { expect, test } from "bun:test"
import {
  getNemaMotorReferencePoints,
  modelDefinitionSchema,
  mp,
  nemaMotorModelPropsSchema,
} from "../src"

test("NEMA23 rear side tabs use a rectangular pattern independent of the front flange", () => {
  const definition = mp.string("nema23").json()
  expect(definition).toMatchObject({
    mountingHoleSpacing: 47.14,
    mountingHoleDiameter: 5,
    bodyCornerChamfer: 9 * Math.SQRT2,
    bodyCornerRecessRadius: 5,
    bodyCornerFilletRadius: 2.5,
    stepped: true,
    chamfered: false,
    rearStepped: true,
    rearChamfered: false,
    rearCornerRecessRadius: 5,
    rearCornerFilletRadius: 2.5,
    backFaceHoleSpacingX: 50,
    backFaceHoleSpacingY: 32,
    backFaceScrewSize: "M3",
  })
  expect(modelDefinitionSchema.parse(definition)).toEqual(definition)
  expect(
    mp.string("nema23_holespacing46mm_facechamfer3mm").json(),
  ).toMatchObject({
    backFaceHoleSpacingX: 50,
    backFaceHoleSpacingY: 32,
  })
})

test("rear axis overrides and the legacy square pitch work in strings and direct props", () => {
  expect(mp.string("nema23_backholespacing30mm").json()).toMatchObject({
    backFaceHoleSpacingX: 30,
    backFaceHoleSpacingY: 30,
  })
  const source =
    "nema23_backholespacingx48mm_backholespacingy30mm_rearrecess4mm_rearfillet2mm"
  const definition = mp.string(source).json()
  if (definition.fn !== "nema") throw new Error("Expected NEMA")
  expect(definition).toMatchObject({
    backFaceHoleSpacingX: 48,
    backFaceHoleSpacingY: 30,
    rearCornerRecessRadius: 4,
    rearCornerFilletRadius: 2,
  })
  const { fn, ...props } = definition
  expect(nemaMotorModelPropsSchema.parse(props)).toEqual(props)
  expect(
    mp.string("nema23_rearchamfered_backholespacing47.14mm_backscrewm4").json(),
  ).toMatchObject({
    rearChamfered: true,
    rearStepped: false,
    backFaceHoleSpacingX: 47.14,
    backFaceHoleSpacingY: 47.14,
  })
})

test("rear bores and screw heads cannot cross recessed corners or rounded tab edges", () => {
  for (const source of [
    "nema23_backfaceholes_backholespacing47.14mm",
    "nema23_backholespacingy38mm",
    "nema23_backscrewm4",
    "nema23_backholespacingx52mm",
    "nema23_rearrecess8mm",
    "nema23_rearfillet5mm",
    "nema23_rearstepped_rearchamfered",
    "nema23_rearstepped0",
    "nema23_backholespacingx50mm_backholespacingx48mm",
  ])
    expect(() => mp.string(source).json()).toThrow()
})

test("NEMA23 diagonal wire references stay on the curved rear cap in every rear mode", () => {
  const p = { nemaSize: 23 as const, wireSideAngle: 45 }
  const wire = getNemaMotorReferencePoints(p).wireside
  expect(wire.position.x).toBeCloseTo(24.2 - 5 / Math.SQRT2, 8)
  expect(wire.position.y).toBeCloseTo(wire.position.x, 8)
  expect(wire.position.z).toBe(-48.5)
  for (const mode of [
    { noWires: true },
    { backFacePlain: true },
    { backFaceHoles: true },
  ])
    expect(getNemaMotorReferencePoints({ ...p, ...mode }).wireside).toEqual(
      wire,
    )
})

test("NEMA23 body arcs can be overridden without changing the rear or front flange", () => {
  const source = "nema23_bodyrecess4mm_bodyfillet2mm"
  const definition = mp.string(source).json()
  expect(definition).toMatchObject({
    bodyCornerRecessRadius: 4,
    bodyCornerFilletRadius: 2,
    rearCornerRecessRadius: 5,
    rearCornerFilletRadius: 2.5,
    mountingHoleSpacing: 47.14,
  })
  expect(modelDefinitionSchema.parse(definition)).toEqual(definition)
  expect(
    mp.string("nema23_chamfered_backholespacing47.14mm_backscrewm4").json(),
  ).toMatchObject({
    bodyCornerChamfer: 15,
    chamfered: true,
    rearChamfered: true,
  })
})

test("curved body shoulders must clear the complete front through-hole radius", () => {
  for (const source of [
    "nema23_bodyrecess8mm",
    "nema23_bodyfillet5mm",
    "nema23_bodychamfer11mm",
    "nema23_bodyrecess9mm_bodyfillet0mm",
  ])
    expect(() => mp.string(source).json()).toThrow()
  expect(mp.string("nema23_bodyrecess6mm_bodyfillet2mm").json()).toMatchObject({
    bodyCornerRecessRadius: 6,
    bodyCornerFilletRadius: 2,
  })
})
