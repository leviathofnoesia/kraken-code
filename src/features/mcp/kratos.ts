import { spawn, type ChildProcess } from "child_process"
import * as path from "path"
import * as os from "os"
import * as fs from "fs"
import { tool } from '@opencode-ai/plugin'
import type { MCPTool } from "./types"

const z = tool.schema

let kratosProcess: ChildProcess | null = null
let requestId = 0
const pendingRequests = new Map<number, { resolve: (value: any) => void, reject: (reason: any) => void }>()

const KRATOS_STORAGE_PATH = path.join(os.homedir(), ".kratos")

export async function initializeKratos() {
  if (kratosProcess) {
    console.log("[Kratos MCP] Already initialized")
    return
  }

  // Ensure kratos directory exists
  if (!fs.existsSync(KRATOS_STORAGE_PATH)) {
    fs.mkdirSync(KRATOS_STORAGE_PATH, { recursive: true })
  }

  // Start kratos-mcp as subprocess
  kratosProcess = spawn('npx', ['--yes', 'kratos-mcp@latest'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      KRATOS_STORAGE_PATH: KRATOS_STORAGE_PATH
    }
  })

  if (!kratosProcess.stdin || !kratosProcess.stdout) {
    console.error("[Kratos MCP] Failed to create stdio pipes")
    return
  }

  kratosProcess.on('error', (err) => {
    console.error("[Kratos MCP] Failed to start:", err)
    kratosProcess = null
  })

  kratosProcess.on('exit', (code) => {
    console.log(`[Kratos MCP] Process exited with code ${code}`)
    kratosProcess = null
    // Reject all pending requests
    for (const [id, { reject }] of pendingRequests.entries()) {
      reject(new Error(`Kratos process exited: code ${code}`))
      pendingRequests.delete(id)
    }
  })

  // Handle stderr
  kratosProcess.stderr?.on('data', (data) => {
    console.error(`[Kratos MCP] ${data}`)
  })

  // Handle stdout (JSON-RPC responses)
  kratosProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter((line: string) => line.trim())
    for (const line of lines) {
      try {
        const response = JSON.parse(line)
        if (response.id !== undefined) {
          const pending = pendingRequests.get(response.id)
          if (pending) {
            if (response.error) {
              pending.reject(new Error(response.error.message || 'Kratos MCP error'))
            } else {
              pending.resolve(response.result)
            }
            pendingRequests.delete(response.id)
          }
        }
      } catch (e) {
        // Ignore non-JSON output (like logs)
      }
    }
  })

  console.log("[Kratos MCP] Initialized")
}

export async function shutdownKratos() {
  if (kratosProcess) {
    kratosProcess.kill()
    kratosProcess = null
    console.log("[Kratos MCP] Shutdown")
  }
}

async function sendKratosRequest(method: string, params: any = {}): Promise<any> {
  if (!kratosProcess || !kratosProcess.stdin) {
    throw new Error("Kratos MCP not initialized. Call initializeKratos() first.")
  }

  const id = ++requestId

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject })

    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params
    }

    if (kratosProcess?.stdin) {
      kratosProcess.stdin.write(JSON.stringify(request) + '\n')
    }

    // Set timeout
    const timeout = setTimeout(() => {
      pendingRequests.delete(id)
      reject(new Error('Kratos MCP request timeout'))
    }, 30000)

    // Store timeout to clear it when response arrives
    const originalResolve = resolve
    const wrappedResolve = (value: any) => {
      clearTimeout(timeout)
      originalResolve(value)
    }
    pendingRequests.set(id, { resolve: wrappedResolve, reject })
  })
}

// Memory Save Tool
const memorySaveToolImpl = tool({
  description: "Save a memory to Kratos project database",
  args: {
    summary: z.string().describe("Short 1-2 line summary of memory"),
    text: z.string().describe("Full memory content"),
    tags: z.array(z.string()).describe("Tags for categorization"),
    paths: z.array(z.string()).describe("Related file paths"),
    importance: z.number().min(1).max(5).default(3).describe("Importance 1-5")
  },
  async execute(args, context) {
    try {
      const result = await sendKratosRequest('call_tool', {
        name: 'memory_save',
        arguments: args
      })

      return result?.content?.[0]?.text || "Memory saved successfully"
    } catch (error: any) {
      console.error(`[Kratos] Error saving memory:`, error)
      throw new Error(`Failed to save memory: ${error.message}`)
    }
  }
})

export const memorySaveTool: MCPTool = {
  ...memorySaveToolImpl,
  serverName: 'kratos',
  category: 'utility'
}

// Memory Search Tool
const memorySearchToolImpl = tool({
  description: "Search Kratos memories by query or tags",
  args: {
    q: z.string().describe("Search query or keywords"),
    k: z.number().default(10).describe("Maximum results"),
    tags: z.array(z.string()).describe("Filter by tags")
  },
  async execute(args, context) {
    try {
      const result = await sendKratosRequest('call_tool', {
        name: 'memory_search',
        arguments: args
      })

      return result?.content?.[0]?.text || JSON.stringify(result)
    } catch (error: any) {
      console.error(`[Kratos] Error searching memory:`, error)
      throw new Error(`Failed to search memory: ${error.message}`)
    }
  }
})

export const memorySearchTool: MCPTool = {
  ...memorySearchToolImpl,
  serverName: 'kratos',
  category: 'utility'
}

// Memory Get Recent Tool
const memoryGetRecentToolImpl = tool({
  description: "Get recent memories from Kratos",
  args: {
    k: z.number().default(10).describe("Maximum results"),
    path_prefix: z.string().describe("Filter by path prefix")
  },
  async execute(args, context) {
    try {
      const result = await sendKratosRequest('call_tool', {
        name: 'memory_get_recent',
        arguments: args
      })

      return result?.content?.[0]?.text || JSON.stringify(result)
    } catch (error: any) {
      console.error(`[Kratos] Error getting recent memories:`, error)
      throw new Error(`Failed to get recent memories: ${error.message}`)
    }
  }
})

export const memoryGetRecentTool: MCPTool = {
  ...memoryGetRecentToolImpl,
  serverName: 'kratos',
  category: 'utility'
}

// Memory Ask Tool
const memoryAskToolImpl = tool({
  description: "Ask Kratos natural language questions",
  args: {
    question: z.string().describe("Natural language question"),
    limit: z.number().default(5).describe("Maximum results")
  },
  async execute(args, context) {
    try {
      const result = await sendKratosRequest('call_tool', {
        name: 'memory_ask',
        arguments: args
      })

      return result?.content?.[0]?.text || JSON.stringify(result)
    } catch (error: any) {
      console.error(`[Kratos] Error asking question:`, error)
      throw new Error(`Failed to ask question: ${error.message}`)
    }
  }
})

export const memoryAskTool: MCPTool = {
  ...memoryAskToolImpl,
  serverName: 'kratos',
  category: 'utility'
}
