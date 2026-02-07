/**
 * Existing MCP Agent Tools
 *
 * Creates agent-accessible tools for existing MCP providers.
 * Tools are lazy-loaded and do NOT auto-inject context.
 */

import { tool } from '@opencode-ai/plugin'
import type { RemoteMcpConfig } from './types'
import { mcpLoader } from './mcp-loader'
import { websearch } from './websearch'
import { context7 } from './context7'
import { grep_app } from './grep-app'

/**
 * Websearch Agent Tool
 *
 * Exa AI web search. Does NOT auto-inject results.
 */
export const websearchTool = tool({
  name: 'websearch',
  description:
    'Search web using Exa AI. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    query: tool.schema.string().min(1).describe('Search query'),
    numResults: tool.schema
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe('Number of results to return'),
  },
  async execute(args) {
    const result = await mcpLoader.callTool('search', args, websearch)
    return JSON.stringify(result)
  },
})

/**
 * Webfetch Agent Tool
 *
 * Fetch and parse web content from a specific URL. Does NOT auto-inject results.
 */
export const webfetchTool = tool({
  name: 'webfetch',
  description:
    'Fetch and parse web content from a specific URL using Exa AI. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    url: tool.schema.string().url().describe('URL to fetch content from'),
    format: tool.schema
      .enum(['markdown', 'text', 'html'])
      .optional()
      .default('markdown')
      .describe('Output format'),
  },
  async execute(args) {
    const result = await mcpLoader.callTool('fetch', args, websearch)
    return JSON.stringify(result)
  },
})

/**
 * Context7 Search Agent Tool
 *
 * Search official documentation. Does NOT auto-inject results.
 */
export const context7SearchTool = tool({
  name: 'context7_search',
  description:
    'Search official documentation using Context7. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    query: tool.schema.string().min(1).describe('Search query for documentation'),
    maxTokens: tool.schema.number().optional().describe('Maximum tokens for results'),
  },
  async execute(args) {
    const result = await mcpLoader.callTool('search', args, context7)
    return JSON.stringify(result)
  },
})

/**
 * Context7 Get Agent Tool
 *
 * Fetch specific documentation page. Does NOT auto-inject results.
 */
export const context7GetTool = tool({
  name: 'context7_get',
  description:
    'Fetch and parse specific documentation page using Context7. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    library: tool.schema.string().min(1).describe('Library name (e.g., react, express)'),
    path: tool.schema.string().optional().describe('Documentation path (e.g., hooks/useState)'),
  },
  async execute(args) {
    const result = await mcpLoader.callTool('get', args, context7)
    return JSON.stringify(result)
  },
})

/**
 * Grep App Search Agent Tool
 *
 * Search GitHub repositories and code. Does NOT auto-inject results.
 */
export const grepSearchTool = tool({
  name: 'grep_search',
  description:
    'Search GitHub repositories and code using Grep.app. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    query: tool.schema.string().min(1).describe('Search query for GitHub code'),
  },
  async execute(args) {
    const result = await mcpLoader.callTool('search', args, grep_app)
    return JSON.stringify(result)
  },
})

/**
 * Grep App Get File Agent Tool
 *
 * Fetch file contents from GitHub. Does NOT auto-inject results.
 */
export const grepGetFileTool = tool({
  name: 'grep_get_file',
  description:
    'Fetch file contents from GitHub repositories using Grep.app. Does NOT auto-inject results into conversation context - you must explicitly read and use results.',
  args: {
    repository: tool.schema.string().min(1).describe('Repository in format "owner/repo"'),
    path: tool.schema.string().min(1).describe('File path within repository'),
  },
  async execute(args) {
    const result = await mcpLoader.callTool('get_file', args, grep_app)
    return JSON.stringify(result)
  },
})

/**
 * All Existing MCP Agent Tools
 */
export const existingMcpAgentTools = {
  websearch: websearchTool,
  webfetch: webfetchTool,
  context7_search: context7SearchTool,
  context7_get: context7GetTool,
  grep_search: grepSearchTool,
  grep_get_file: grepGetFileTool,
}
