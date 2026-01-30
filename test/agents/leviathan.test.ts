import { describe, it, expect } from "bun:test"
import { leviathanAgent } from "../../src/agents/leviathan"

describe(" leviathan Agent", () => {
  it("should export leviathanAgent", () => {
    expect(leviathanAgent).toBeDefined()
  })

  it("should have required properties", () => {
    expect(leviathanAgent.description).toBeDefined()
    expect(leviathanAgent.prompt).toBeDefined()
  })

  it("should have valid prompt structure", () => {
    const prompt = leviathanAgent.prompt
    expect(prompt).toBeDefined()
    if (prompt) {
      expect(typeof prompt).toBe("string")
      expect(prompt.length).toBeGreaterThan(100)
    }
  })

  it("should have description", () => {
    expect(leviathanAgent.description).toBeDefined()
    expect(typeof leviathanAgent.description).toBe("string")
  })
})
