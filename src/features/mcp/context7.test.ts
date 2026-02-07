import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { createContext7Config, context7 } from './context7'

describe('context7 MCP provider configuration', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    delete process.env.CONTEXT7_API_KEY
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  test('returns remote config with correct URL', () => {
    const config = createContext7Config()
    expect(config.type).toBe('remote')
    expect(config.url).toBe('https://mcp.context7.com/mcp')
    expect(config.enabled).toBe(true)
    expect(config.oauth).toBe(false)
  })

  test('includes Authorization header when CONTEXT7_API_KEY is set', () => {
    const apiKey = 'test-context7-key'
    process.env.CONTEXT7_API_KEY = apiKey

    const config = createContext7Config()
    expect(config.headers).toEqual({
      Authorization: `Bearer ${apiKey}`,
    })
  })

  test('has no headers when CONTEXT7_API_KEY not set', () => {
    const config = createContext7Config()
    expect(config.headers).toBeUndefined()
  })

  test('default config (module export) uses environment at load time', () => {
    expect(context7.type).toBe('remote')
    expect(context7.url).toBe('https://mcp.context7.com/mcp')
    expect(context7.enabled).toBe(true)
    expect(context7.oauth).toBe(false)
  })
})
