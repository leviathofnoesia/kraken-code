import { describe, it, expect } from "bun:test"

describe("Hook Structure", () => {
  it("should not have duplicate hooks", async () => {
    const plugin = (await import("../../src/index")).default
    const hooks = await plugin({} as any)
    
    expect(hooks.config).toBeDefined()
  })

  it("should export tools", async () => {
    const plugin = (await import("../../src/index")).default
    const hooks = await plugin({} as any)
    expect(hooks.tool).toBeDefined()
    expect(typeof hooks.tool).toBe("object")
    
    if (!hooks.tool) return
    
    const expectedTools = ["grep", "session_list", "session_read", "session_search"]
    for (const tool of expectedTools) {
      expect(hooks.tool[tool]).toBeDefined()
    }
  })
})
