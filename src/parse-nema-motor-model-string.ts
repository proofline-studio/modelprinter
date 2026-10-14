import { normalizeNemaMotorModelString } from "./normalize-nema-motor-model-string"
import { nemaMotorModelDefinitionSchema } from "./nema-motor-schema"
import type { RawModelprinterParams } from "./parse-model-string"

const lengths = {
  wirelength: "wireLength",
  wirediameter: "wireDiameter",
  l: "bodyLength",
  length: "bodyLength",
  bodylength: "bodyLength",
  bodywidth: "bodyWidth",
  backholespacing: "backFaceHoleSpacing",
  backholespacingx: "backFaceHoleSpacingX",
  backholespacingy: "backFaceHoleSpacingY",
  backholediameter: "backFaceHoleDiameter",
  backholedepth: "backFaceHoleDepth",
  shaftlength: "shaftLength",
  shaftdiameter: "shaftDiameter",
  flatdepth: "shaftFlatDepth",
  flatlength: "shaftFlatLength",
  holespacing: "mountingHoleSpacing",
  holediameter: "mountingHoleDiameter",
  holedepth: "mountingHoleDepth",
  pilotdiameter: "pilotDiameter",
  pilotlength: "pilotLength",
  frontcap: "frontCapLength",
  rearcap: "rearCapLength",
  facechamfer: "faceCornerChamfer",
  bodychamfer: "bodyCornerChamfer",
  bodyrecess: "bodyCornerRecessRadius",
  bodyfillet: "bodyCornerFilletRadius",
  rearchamfer: "rearCornerChamfer",
  rearrecess: "rearCornerRecessRadius",
  rearfillet: "rearCornerFilletRadius",
} as const

const flags = {
  backfaceplain: "backFacePlain",
  plainbackface: "backFacePlain",
  backfaceholes: "backFaceHoles",
  backfacescrews: "backFaceScrews",
  round: "roundShaft",
  roundshaft: "roundShaft",
  dshaft: "dShaft",
  chamfered: "chamfered",
  stepped: "stepped",
  rearstepped: "rearStepped",
  rearchamfered: "rearChamfered",
  nowires: "noWires",
  wirestubs: "wireStubs",
} as const

export function parseNemaMotorModelParams(raw: RawModelprinterParams) {
  const tokens = normalizeNemaMotorModelString(raw.string).split("_")
  const match = tokens[0]?.match(/^nema(8|17|23|34)$/i)
  if (!match) throw new Error("Expected nema8, nema17, nema23 or nema34")
  const props: Record<string, unknown> = {
    fn: "nema",
    nemaSize: Number(match[1]),
  }
  for (const token of tokens.slice(1)) {
    const match = token.match(/^([a-z]+)(.*)$/i)
    if (!match) throw new Error(`Invalid NEMA token "${token}"`)
    const name = match[1]!.toLowerCase(),
      value = match[2]!
    let property: string, parsed: unknown
    if (name in lengths) {
      property = lengths[name as keyof typeof lengths]
      parsed = value
    } else if (name in flags) {
      if (value) throw new Error(`NEMA flag "${name}" does not accept a value`)
      property = flags[name as keyof typeof flags]
      parsed = true
    } else if (name === "jstph" || name === "jstsh") {
      if (!/^[1-9][0-9]*$/.test(value))
        throw new Error(`Invalid wire connection token "${token}"`)
      property = "wireConnection"
      parsed = `jst-${name.slice(3)}-${value}`
    } else if (name === "wirecount") {
      property = "wireCount"
      if (!/^\d+$/.test(value)) throw new Error("wirecount requires an integer")
      parsed = Number(value)
    } else if (name === "backscrewm") {
      property = "backFaceScrewSize"
      parsed = `M${value}`
    } else if (name === "flatangle" || name === "wireangle") {
      property = name === "flatangle" ? "shaftFlatAngle" : "wireSideAngle"
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:deg)?$/i.test(value))
        throw new Error(`${name} requires a numeric angle in degrees`)
      parsed = Number(value.replace(/deg$/i, ""))
    } else if (name === "throughholes" || name === "blindholes") {
      if (value) throw new Error(`NEMA flag "${name}" does not accept a value`)
      property = "mountingHoleThrough"
      parsed = name === "throughholes"
    } else throw new Error(`Unknown NEMA motor token "${token}"`)
    if (property in props)
      throw new Error(`NEMA property "${property}" is set more than once`)
    props[property] = parsed
  }
  return nemaMotorModelDefinitionSchema.parse(props)
}
