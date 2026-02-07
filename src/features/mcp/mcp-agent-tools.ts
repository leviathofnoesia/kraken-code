/**
 * New MCP Agent Tools
 *
 * Creates agent-accessible tools for new MCP providers.
 * Tools are lazy-loaded and do NOT auto-inject context.
 */

import { tool } from '@opencode-ai/plugin'
import type { RemoteMcpConfig } from './types'
import { mcpLoader } from './mcp-loader'
import { additionalMcpConfigs, additionalMcpNames } from './additional-mcps'

/**
 * Create MCP tool for agent use
 *
 * Creates a tool that wraps remote MCP server access.
 * Tools are lazy-loaded and do NOT auto-inject context.
 */
function createMCPTool(
  name: string,
  description: string,
  mcpName: AdditionalMcpName,
  remoteToolName: string,
): MCPTool {
  return {
    name,
    description,
    mcpConfig: additionalMcpConfigs[mcpName],
    toolName: remoteToolName,
  }
}

/**
 * Deepwiki Search Tool
 *
 * Search Wikipedia and knowledge bases.
 */
export const mcpDeepwikiSearch = tool({
  name: 'mcp_deepwiki_search',
  description:
    'Search Wikipedia and knowledge bases using DeepWiki API. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    query: tool.schema.string().min(1).describe('Search query for DeepWiki'),
    maxResults: tool.schema
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe('Maximum number of results to return'),
  },
  async execute(args) {
    const mcpConfig = additionalMcpConfigs.deepwiki
    const result = await mcpLoader.callTool('search', args, mcpConfig)
    return JSON.stringify(result)
  },
})

/**
 * Semgrep Search Tool
 *
 * Semantic code search using AI-powered grep.
 */
export const mcpSemgrepSearch = tool({
  name: 'mcp_semgrep_search',
  description:
    'Search code semantically using AI-powered grep. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    query: tool.schema.string().min(1).describe('Search query for Semgrep'),
    filePattern: tool.schema.string().optional().describe('File pattern to search (e.g., "*.ts")'),
    maxResults: tool.schema
      .number()
      .min(1)
      .max(50)
      .optional()
      .describe('Maximum number of results'),
  },
  async execute(args) {
    const mcpConfig = additionalMcpConfigs.semgrep
    const result = await mcpLoader.callTool('search', args, mcpConfig)
    return JSON.stringify(result)
  },
})

/**
 * Sequential Thinking Tool
 *
 * Chain-of-thought reasoning tool.
 */
export const mcpSequentialThinking = tool({
  name: 'mcp_sequential_thinking',
  description:
    'Perform chain-of-thought reasoning using Sequential Thinking MCP. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    prompt: tool.schema.string().min(1).describe('Task or question to reason through'),
    maxIterations: tool.schema
      .number()
      .min(1)
      .max(10)
      .optional()
      .describe('Maximum number of reasoning iterations'),
  },
  async execute(args) {
    const mcpConfig = additionalMcpConfigs.sequential_thinking
    const result = await mcpLoader.callTool('think', args, mcpConfig)
    return JSON.stringify(result)
  },
})

/**
 * Bridgemind Tool
 *
 * Mind mapping and brainstorming.
 */
export const mcpBridgemind = tool({
  name: 'mcp_bridgemind',
  description:
    'Create mind maps and brainstorm ideas using Bridgemind MCP. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    topic: tool.schema.string().min(1).describe('Central topic or idea to brainstorm'),
    branches: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe('Branches or sub-topics to explore'),
  },
  async execute(args) {
    const mcpConfig = additionalMcpConfigs.bridgemind
    const result = await mcpLoader.callTool('create', args, mcpConfig)
    return JSON.stringify(result)
  },
})

/**
 * All MCP Agent Tools (new MCPs only)
 */
export const mcpAgentTools = {
  mcp_deepwiki_search: mcpDeepwikiSearch,
  mcp_semgrep_search: mcpSemgrepSearch,
  mcp_sequential_thinking: mcpSequentialThinking,
  mcp_bridgemind: mcpBridgemind,
}
