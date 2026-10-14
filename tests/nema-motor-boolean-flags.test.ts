import { expect, test } from "bun:test"
import { mp, nemaMotorModelPropsSchema } from "../src"

test("NEMA geometry choices resolve to exclusive booleans for each frame", () => {
  for (const size of [8, 17, 23, 34] as const) {
    const definition = mp.string(`nema${size}`).json()
    if (definition.fn !== "nema") throw new Error("Expected NEMA")
    const { fn, ...props } = definition
    expect(nemaMotorModelPropsSchema.parse(props)).toEqual(props)
    expect(nemaMotorModelPropsSchema.parse({ nemaSize: size })).toEqual(props)
    expect(props.roundShaft).toBe(size === 8 || size === 34)
    expect(props.dShaft).toBe(size === 17 || size === 23)
    expect(props.chamfered).toBe(size !== 23 && size !== 34)
    expect(props.stepped).toBe(size === 23 || size === 34)
    expect(props.backFacePlain).toBe(size === 34)
    expect(props.backFaceHoles).toBe(false)
    expect(props.backFaceScrews).toBe(size !== 34)
    expect(props.noWires).toBe(false)
    expect(props.wireStubs).toBe(true)
    for (const key of [
      "backFace",
      "shaftShape",
      "cornerProfile",
      "wireConnection",
    ])
      expect(props).not.toHaveProperty(key)
    for (const [token, flag] of [
      ["round", "roundShaft"],
      ["roundshaft", "roundShaft"],
      ["dshaft", "dShaft"],
      ["plainbackface", "backFacePlain"],
      ["backfaceplain", "backFacePlain"],
      ["backfaceholes", "backFaceHoles"],
      ["backfacescrews", "backFaceScrews"],
      ["stepped", "stepped"],
      ["chamfered", "chamfered"],
      ["nowires", "noWires"],
      ["wirestubs", "wireStubs"],
    ] as const) {
      const flagged = mp
        .string(`nema${size}_${token}_backholespacing12mm`)
        .json()
      expect(flagged).toMatchObject({ [flag]: true })
      expect(flagged).toEqual({
        fn: "nema",
        ...nemaMotorModelPropsSchema.parse({
          nemaSize: size,
          backFaceHoleSpacing: 12,
          [flag]: true,
        }),
      })
    }
  }
  const jst = nemaMotorModelPropsSchema.parse({
    nemaSize: 17,
    wireConnection: "jst-sh-4",
  })
  expect(jst).toMatchObject({
    noWires: false,
    wireStubs: false,
    wireConnection: "jst-sh-4",
  })
  expect(nemaMotorModelPropsSchema.parse(jst)).toEqual(jst)
})
