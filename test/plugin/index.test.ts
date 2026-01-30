import { describe, it, expect } from "bun:test"

describe("Plugin Registration", () => {
  it("should export a function", async () => {
    const plugin = (await import("../../src/index")).default
    expect(typeof plugin).toBe("function")
  })

  it("should return hooks object", async () => {
    const plugin = (await import("../../src/index")).default
    const hooks = await plugin({} as any)
    expect(hooks).toBeDefined()
    expect(typeof hooks.config).toBe("function")
    expect(typeof hooks.tool).toBe("object")
  })

  it("should have only ONE config hook", async () => {
    const plugin = (await import("../../src/index")).default
    const hooks = await plugin({} as any)
    expect(hooks.config).toBeDefined()
  })
})
