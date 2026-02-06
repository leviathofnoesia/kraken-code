import { describe, it, expect } from 'bun:test'

describe('Plugin Agent Registration', () => {
  it('should register all 12 sea-themed agents', async () => {
    const plugin = (await import('../../src/index')).default
    const mockConfig: any = {}
    const hooks = await plugin({} as any)

    await hooks.config!(mockConfig)

    const expectedAgents = [
      'Kraken',
      'Atlas',
      'Nautilus',
      'Abyssal',
      'Coral',
      'Siren',
      'Scylla',
      'Pearl',
      'Maelstrom',
      'Leviathan',
      'Poseidon',
      'Cartographer',
    ]

    for (const agent of expectedAgents) {
      expect(mockConfig.agent[agent]).toBeDefined()
      expect(mockConfig.agent[agent].description).toBeDefined()
      expect(mockConfig.agent[agent].prompt).toBeDefined()
    }
  })

  it('should set default_agent to Kraken', async () => {
    const plugin = (await import('../../src/index')).default
    const mockConfig: any = {}
    const hooks = await plugin({} as any)
    await hooks.config!(mockConfig)

    expect(mockConfig.default_agent).toBe('Kraken')
  })

  it('should set default_agents to include both primary agents', async () => {
    const plugin = (await import('../../src/index')).default
    const mockConfig: any = {}
    const hooks = await plugin({} as any)
    await hooks.config!(mockConfig)

    expect(mockConfig.default_agents).toContain('Kraken')
    expect(mockConfig.default_agents).toContain('Cartographer')
  })

  it('should ensure Cartographer is added to existing default_agents', async () => {
    const plugin = (await import('../../src/index')).default
    // Simulate a stale config that only has Kraken
    const mockConfig: any = { default_agents: ['Kraken'] }
    const hooks = await plugin({} as any)
    await hooks.config!(mockConfig)

    expect(mockConfig.default_agents).toContain('Kraken')
    expect(mockConfig.default_agents).toContain('Cartographer')
  })

  it('should register Cartographer as a primary agent', async () => {
    const plugin = (await import('../../src/index')).default
    const mockConfig: any = {}
    const hooks = await plugin({} as any)
    await hooks.config!(mockConfig)

    expect(mockConfig.agent['Cartographer']).toBeDefined()
    expect(mockConfig.agent['Cartographer'].mode).toBe('primary')
  })
})
