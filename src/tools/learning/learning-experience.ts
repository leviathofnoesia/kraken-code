/**
 * Learning Experience Tool
 *
 * Manually record experiences and query the experience store.
 * Part of the unified AI memory system (Layer 1).
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import type { MCPTool } from "../../features/mcp/types"
import type { ExperienceStore } from "../../features/learning/experience-store"

// Global experience store instance
let experienceStore: ExperienceStore | null = null

/**
 * Set the experience store instance
 */
export function setExperienceStore(store: ExperienceStore) {
  experienceStore = store
  console.log("[LearningExperienceTool] Experience store set")
}

/**
 * Get the experience store instance
 */
export function getExperienceStore(): ExperienceStore | null {
  return experienceStore
}

/**
 * Tool: learning_experience
 *
 * Record a new experience or query existing experiences.
 */
const learningExperienceToolImpl = tool({
  description: "Record a new experience or query the experience store. Use this to manually record successful or failed actions for reinforcement learning. Experiences are used for experience replay - reusing successful strategies in similar situations.",
  args: {
    action: z.enum(["add", "query", "stats"]).describe("Action to perform"),
    // Add args
    state: z.string().optional().describe("Current state (e.g., 'debugging', 'implementing'). Required for 'add'."),
    actionUsed: z.string().optional().describe("Tool/method used (e.g., 'grep', 'lsp_hover'). Required for 'add'."),
    outcome: z.enum(["success", "failure", "partial"]).optional().describe("Outcome of the action. Required for 'add'."),
    reward: z.number().min(-1).max(1).optional().describe("Reward (-1 to 1, negative = bad, positive = good). Optional, auto-calculated if not provided."),
    confidence: z.number().min(0).max(1).optional().describe("Confidence in this experience (0-1). Optional, defaults to 0.8."),
    context: z.string().optional().describe("Context description (what you were working on). Required for 'add'."),
    tags: z.array(z.string()).optional().describe("Tags for categorization (e.g., ['bug-fix', 'performance']). Optional."),
    // Query args
    queryState: z.string().optional().describe("State to query for (e.g., 'debugging'). Required for 'query'."),
    queryContext: z.string().optional().describe("Context to match (similar situations). Required for 'query'."),
    limit: z.number().min(1).max(50).default(5).optional().describe("Number of results to return. Default: 5."),
  },
  async execute(args, context) {
    if (!experienceStore) {
      throw new Error("Experience store not initialized. Call setExperienceStore() first.")
    }

    try {
      switch (args.action) {
        case "add":
          return await addExperience(args as any)
        case "query":
          return await queryExperiences(args as any)
        case "stats":
          return await getStats()
        default:
          throw new Error(`Unknown action: ${args.action}`)
      }
    } catch (error: any) {
      console.error("[LearningExperienceTool] Error:", error)
      throw new Error(`Failed to ${args.action}: ${error.message}`)
    }
  }
})

/**
 * Add a new experience
 */
async function addExperience(args: {
  state: string
  actionUsed: string
  outcome: "success" | "failure" | "partial"
  reward?: number
  confidence?: number
  context: string
  tags?: string[]
}): Promise<string> {
  // Validate required fields
  if (!args.state || !args.actionUsed || !args.outcome || !args.context) {
    throw new Error("Missing required fields for 'add': state, actionUsed, outcome, context")
  }

  // Calculate reward if not provided
  let reward = args.reward
  if (reward === undefined) {
    reward = args.outcome === "success" ? 0.8 :
             args.outcome === "failure" ? -0.8 : -0.2
  }

  // Record experience
  const experience = await experienceStore!.addExperience({
    state: args.state,
    action: args.actionUsed,
    outcome: args.outcome,
    reward,
    confidence: args.confidence || 0.8,
    context: {
      sessionId: context?.sessionID || "manual",
      tool: args.actionUsed,
      prompt: args.context
    },
    metadata: {
      tags: args.tags || [],
      source: "manual",
      timestamp: new Date().toISOString()
    }
  })

  const statusEmoji = args.outcome === "success" ? "✅" :
                     args.outcome === "failure" ? "❌" : "⚠️"

  return `${statusEmoji} Experience recorded\n\n` +
         `ID: ${experience.id}\n` +
         `State: ${args.state}\n` +
         `Action: ${args.actionUsed}\n` +
         `Outcome: ${args.outcome}\n` +
         `Reward: ${reward.toFixed(2)}\n` +
         `Context: ${args.context.substring(0, 100)}${args.context.length > 100 ? "..." : ""}\n\n` +
         `*This experience will be used for replay in similar situations.*`
}

/**
 * Query experiences
 */
async function queryExperiences(args: {
  queryState: string
  queryContext?: string
  limit?: number
}): Promise<string> {
  // Validate required fields
  if (!args.queryState) {
    throw new Error("Missing required field for 'query': queryState")
  }

  // Query experiences
  const experiences = await experienceStore!.findRelevant(
    args.queryState,
    args.queryContext || "",
    args.limit || 5
  )

  if (experiences.length === 0) {
    return `No similar experiences found for state: ${args.queryState}`
  }

  let result = `Found ${experiences.length} similar experiences for state: ${args.queryState}\n\n`

  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i]
    const statusEmoji = exp.outcome === "success" ? "✅" :
                       exp.outcome === "failure" ? "❌" : "⚠️"

    result += `${i + 1}. ${statusEmoji} **${exp.action}**\n`
    result += `   Reward: ${exp.reward.toFixed(2)} | Confidence: ${(exp.confidence * 100).toFixed(0)}%\n`
    result += `   Context: ${exp.context.prompt?.substring(0, 80) || "N/A"}...\n`
    result += `   Date: ${new Date(exp.timestamp).toLocaleDateString()}\n\n`
  }

  // Suggest best action
  const bestActionResult = await experienceStore!.getBestAction(
    args.queryState,
    args.queryContext || ""
  )

  if (bestActionResult) {
    result += `**Best Action Recommendation:**\n\n`
    result += `Based on past experience, try: \`${bestActionResult.bestAction}\`\n`
    result += `Expected reward: ${bestActionResult.expectedReward.toFixed(2)}\n`
    result += `Confidence: ${(bestActionResult.confidence * 100).toFixed(0)}%\n\n`
  }

  return result
}

/**
 * Get experience statistics
 */
async function getStats(): Promise<string> {
  const stats = await experienceStore!.getStats()

  return `📊 **Experience Store Statistics**\n\n` +
         `Total experiences: ${stats.totalExperiences}\n` +
         `Success rate: ${(stats.successRate * 100).toFixed(1)}%\n` +
         `Average reward: ${stats.avgReward.toFixed(2)}\n\n` +
         `**Recent Experiences** (${stats.recentExperiences.length}):\n\n` +
         stats.recentExperiences.map((exp, i) => {
           const emoji = exp.outcome === "success" ? "✅" :
                       exp.outcome === "failure" ? "❌" : "⚠️"
           return `${i + 1}. ${emoji} ${exp.action} (${exp.reward.toFixed(2)}) - ${new Date(exp.timestamp).toLocaleDateString()}`
         }).join("\n")
}

export const learningExperienceTool: MCPTool = {
  ...learningExperienceToolImpl,
  serverName: 'learning',
  category: 'learning'
}
