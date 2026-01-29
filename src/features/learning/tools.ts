/**
 * Learning & Improvement Framework Tools
 *
 * Manual, user-driven tools for structured reflection and learning.
 * No autonomous agents. No cron jobs.
 *
 * Tools:
 * - learning_reflection - Capture a reflection on what happened
 * - learning_mistake - Record a mistake with lessons learned
 * - learning_improvement - Track what changed/improved
 * - learning_pattern - Identify recurring patterns (wins/losses)
 * - learning_goal - Set and track goals
 * - learning_review - Generate a review summary
 * - learning_search - Search across all learning data
 * - learning_stats - Get learning statistics
 */

import { tool } from '@opencode-ai/plugin'
import { z } from 'zod'
import type { MCPTool } from '../mcp/types'
import { LearningFramework } from './framework'
import type {
  Reflection,
  Mistake,
  Improvement,
  Pattern,
  Goal,
  ReviewSummary
} from './types'

// Global learning instance
let learningFramework: LearningFramework | null = null

/**
 * Initialize learning framework
 */
export function initializeLearning(config?: any) {
  if (!learningFramework) {
    learningFramework = new LearningFramework(config?.learning)
    console.log("[LearningTools] Learning framework initialized")
  }
  return learningFramework
}

/**
 * Get learning framework instance
 */
export function getLearningFramework(): LearningFramework | null {
  return learningFramework
}

/**
 * Shutdown learning framework
 */
export async function shutdownLearning() {
  learningFramework = null
  console.log("[LearningTools] Learning framework shutdown")
}

// ============================================================================
// Tool 1: learning_reflection
// ============================================================================

const learningReflectionToolImpl = tool({
  description: "Capture a structured reflection on what happened, your thoughts, and what you learned. Use this to pause and document insights after completing work.",
  args: {
    context: z.string().describe("What were you working on? What was the situation?"),
    whatHappened: z.string().describe("Brief description of what happened"),
    thoughts: z.string().describe("Your reflection on the situation - what did you think? What did you learn?"),
    tags: z.array(z.string()).default([]).describe("Tags for categorization (e.g., 'coding', 'design', 'meeting', 'productivity')")
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const reflection = await learningFramework.saveReflection({
        context: args.context,
        whatHappened: args.whatHappened,
        thoughts: args.thoughts,
        tags: args.tags
      })

      return `✓ Reflection saved\n\nID: ${reflection.id}\nTimestamp: ${reflection.timestamp}\n\nWhat happened: ${args.whatHappened.substring(0, 100)}...`

    } catch (error: any) {
      console.error("[LearningTools] Error saving reflection:", error)
      throw new Error(`Failed to save reflection: ${error.message}`)
    }
  }
})

export const learningReflectionTool: MCPTool = {
  ...learningReflectionToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 2: learning_mistake
// ============================================================================

const learningMistakeToolImpl = tool({
  description: "Record a mistake with root cause analysis and lessons learned. This is for structured learning from failures.",
  args: {
    context: z.string().describe("What were you working on when this happened?"),
    whatWentWrong: z.string().describe("The mistake that happened"),
    whyItHappened: z.string().describe("Root cause analysis - why did this happen?"),
    lessons: z.array(z.string()).min(1).describe("What did you learn from this? List key lessons"),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium").describe("Impact level of this mistake"),
    tags: z.array(z.string()).default([]).describe("Tags for categorization (e.g., 'bug', 'performance', 'communication', 'process')")
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const mistake = await learningFramework.saveMistake({
        context: args.context,
        whatWentWrong: args.whatWentWrong,
        whyItHappened: args.whyItHappened,
        lessons: args.lessons,
        severity: args.severity,
        tags: args.tags
      })

      const severityEmoji = {
        low: "💚",
        medium: "⚠️",
        high: "🔴",
        critical: "🚨"
      }

      return `${severityEmoji[args.severity]} Mistake recorded\n\nID: ${mistake.id}\nSeverity: ${args.severity}\nContext: ${args.context}\n\nWhat went wrong: ${args.whatWentWrong.substring(0, 100)}...\n\nLessons (${args.lessons.length}):\n${args.lessons.map((l, i) => `${i + 1}. ${l}`).join("\n")}`

    } catch (error: any) {
      console.error("[LearningTools] Error saving mistake:", error)
      throw new Error(`Failed to save mistake: ${error.message}`)
    }
  }
})

export const learningMistakeTool: MCPTool = {
  ...learningMistakeToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 3: learning_improvement
// ============================================================================

const learningImprovementToolImpl = tool({
  description: "Track an improvement you made. What changed and why it helped. Use this to document wins and build on success.",
  args: {
    context: z.string().describe("What was the problem or situation?"),
    whatChanged: z.string().describe("What improvement did you make? What changed?"),
    whyItHelped: z.string().describe("Why did this help? What's the benefit?"),
    evidence: z.string().optional().describe("Optional: Metrics, before/after comparisons, or evidence of improvement"),
    tags: z.array(z.string()).default([]).describe("Tags for categorization (e.g., 'performance', 'ux', 'process', 'quality')")
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const improvement = await learningFramework.saveImprovement({
        context: args.context,
        whatChanged: args.whatChanged,
        whyItHelped: args.whyItHelped,
        evidence: args.evidence,
        tags: args.tags
      })

      return `✓ Improvement tracked\n\nID: ${improvement.id}\nContext: ${args.context}\n\nWhat changed: ${args.whatChanged.substring(0, 100)}...\n\nWhy it helped: ${args.whyItHelped.substring(0, 100)}...`

    } catch (error: any) {
      console.error("[LearningTools] Error saving improvement:", error)
      throw new Error(`Failed to save improvement: ${error.message}`)
    }
  }
})

export const learningImprovementTool: MCPTool = {
  ...learningImprovementToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 4: learning_pattern
// ============================================================================

const learningPatternToolImpl = tool({
  description: "Identify and record a recurring pattern (positive or negative). Use this to track what keeps happening so you can reinforce wins or fix recurring issues.",
  args: {
    type: z.enum(["positive", "negative"]).describe("Is this a positive pattern (win) or negative pattern (issue)?"),
    description: z.string().describe("Describe the pattern clearly"),
    examples: z.array(z.string()).min(1).describe("Concrete examples of when this pattern occurred"),
    tags: z.array(z.string()).default([]).describe("Tags for categorization")
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const pattern = await learningFramework.savePattern({
        type: args.type,
        description: args.description,
        examples: args.examples,
        tags: args.tags
      })

      const emoji = args.type === "positive" ? "✨" : "🔁"

      return `${emoji} Pattern identified\n\nID: ${pattern.id}\nType: ${args.type}\n\nDescription: ${args.description.substring(0, 100)}...\n\nExamples (${args.examples.length}):\n${args.examples.map((e, i) => `${i + 1}. ${e}`).join("\n")}`

    } catch (error: any) {
      console.error("[LearningTools] Error saving pattern:", error)
      throw new Error(`Failed to save pattern: ${error.message}`)
    }
  }
})

export const learningPatternTool: MCPTool = {
  ...learningPatternToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 5: learning_goal
// ============================================================================

const learningGoalToolImpl = tool({
  description: "Set a goal and track progress. Link mistakes to learn from and improvements to track progress toward the goal.",
  args: {
    title: z.string().describe("The goal title"),
    description: z.string().describe("Detailed description of the goal"),
    target: z.string().describe("Target date, milestone, or success criteria"),
    tags: z.array(z.string()).default([]).describe("Tags for categorization")
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const goal = await learningFramework.saveGoal({
        title: args.title,
        description: args.description,
        target: args.target,
        tags: args.tags
      })

      return `🎯 Goal set\n\nID: ${goal.id}\nTitle: ${args.title}\n\nTarget: ${args.target}\n\nDescription: ${args.description.substring(0, 100)}...`

    } catch (error: any) {
      console.error("[LearningTools] Error saving goal:", error)
      throw new Error(`Failed to save goal: ${error.message}`)
    }
  }
})

export const learningGoalTool: MCPTool = {
  ...learningGoalToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 6: learning_review
// ============================================================================

const learningReviewToolImpl = tool({
  description: "Generate a review summary for a time period (e.g., '2024-Q4', '2024-12'). Shows reflections, mistakes, improvements, patterns, and goals.",
  args: {
    period: z.string().describe("Time period for review (e.g., '2024-Q4', '2024-12', 'last-week', 'last-month')"),
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const summary = await learningFramework.generateReview(args.period)

      const lines: string[] = []
      
      lines.push(`# Review: ${args.period}`)
      lines.push("")
      
      // Reflections
      lines.push(`## Reflections`)
      lines.push(`Total: ${summary.reflectionCount}`)
      lines.push("")
      
      // Mistakes
      lines.push(`## Mistakes`)
      lines.push(`Total: ${summary.mistakes.total}`)
      lines.push(`Open: ${summary.mistakes.byStatus.open}`)
      lines.push(`Addressed: ${summary.mistakes.byStatus.addressed}`)
      lines.push(`Resolved: ${summary.mistakes.byStatus.resolved}`)
      if (summary.topMistakes.length > 0) {
        lines.push(`\nTop mistakes by severity:`)
        for (const mistake of summary.topMistakes.slice(0, 5)) {
          lines.push(`  ${mistake.whatWentWrong.substring(0, 60)}... (${mistake.severity})`)
        }
      }
      lines.push("")
      
      // Improvements
      lines.push(`## Improvements`)
      lines.push(`Total: ${summary.improvements.total}`)
      if (summary.topImprovements.length > 0) {
        lines.push(`\nTop improvements:`)
        for (const improvement of summary.topImprovements.slice(0, 5)) {
          lines.push(`  ${improvement.whatChanged.substring(0, 60)}...`)
        }
      }
      lines.push("")
      
      // Patterns
      lines.push(`## Patterns`)
      lines.push(`Total: ${summary.patterns.total}`)
      lines.push(`Positive: ${summary.patterns.positive} | Negative: ${summary.patterns.negative}`)
      lines.push(`Active: ${summary.patterns.active} | Resolved: ${summary.patterns.resolved}`)
      lines.push("")
      
      // Goals
      lines.push(`## Goals`)
      lines.push(`Total: ${summary.goals.total}`)
      lines.push(`Completed: ${summary.goals.completed}`)
      lines.push(`In Progress: ${summary.goals.inProgress}`)
      lines.push(`Blocked: ${summary.goals.blocked}`)

      return lines.join("\n")

    } catch (error: any) {
      console.error("[LearningTools] Error generating review:", error)
      throw new Error(`Failed to generate review: ${error.message}`)
    }
  }
})

export const learningReviewTool: MCPTool = {
  ...learningReviewToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 7: learning_search
// ============================================================================

const learningSearchToolImpl = tool({
  description: "Search across all learning data (reflections, mistakes, improvements, patterns, goals). Find past learnings and context.",
  args: {
    query: z.string().describe("Search query or keywords"),
    scope: z.enum(["all", "reflections", "mistakes", "improvements", "patterns", "goals"]).default("all").describe("What to search"),
    limit: z.number().default(10).describe("Maximum results per type")
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const results = await learningFramework.search(args.query, args.scope)

      const lines: string[] = []
      lines.push(`🔍 Search results for: "${args.query}"`)
      lines.push(`\nScope: ${args.scope}\n`)

      if (results.reflections.length > 0) {
        lines.push(`## Reflections (${results.reflections.length})`)
        for (const r of results.reflections.slice(0, args.limit)) {
          lines.push(`[${r.timestamp}] ${r.context}: ${r.whatHappened.substring(0, 50)}...`)
        }
        lines.push("")
      }

      if (results.mistakes.length > 0) {
        lines.push(`## Mistakes (${results.mistakes.length})`)
        for (const m of results.mistakes.slice(0, args.limit)) {
          lines.push(`[${m.timestamp}] ${m.context}: ${m.whatWentWrong.substring(0, 50)}... (${m.severity})`)
        }
        lines.push("")
      }

      if (results.improvements.length > 0) {
        lines.push(`## Improvements (${results.improvements.length})`)
        for (const i of results.improvements.slice(0, args.limit)) {
          lines.push(`[${i.timestamp}] ${i.context}: ${i.whatChanged.substring(0, 50)}...`)
        }
        lines.push("")
      }

      if (results.patterns.length > 0) {
        lines.push(`## Patterns (${results.patterns.length})`)
        for (const p of results.patterns.slice(0, args.limit)) {
          lines.push(`[${p.type}] ${p.description.substring(0, 60)}... (${p.frequency}x)`)
        }
        lines.push("")
      }

      if (results.goals.length > 0) {
        lines.push(`## Goals (${results.goals.length})`)
        for (const g of results.goals.slice(0, args.limit)) {
          lines.push(`[${g.status}] ${g.title}: ${g.description.substring(0, 50)}...`)
        }
        lines.push("")
      }

      const totalCount = results.reflections.length + results.mistakes.length + results.improvements.length + results.patterns.length + results.goals.length

      if (totalCount === 0) {
        lines.push("No results found.")
      }

      return lines.join("\n")

    } catch (error: any) {
      console.error("[LearningTools] Error searching:", error)
      throw new Error(`Failed to search: ${error.message}`)
    }
  }
})

export const learningSearchTool: MCPTool = {
  ...learningSearchToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Tool 8: learning_stats
// ============================================================================

const learningStatsToolImpl = tool({
  description: "Get statistics about your learning data. Shows totals, open items, and overview of learning progress.",
  args: {},
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const stats = await learningFramework.getStats()

      const lines: string[] = []
      
      lines.push("📊 Learning Statistics")
      lines.push("")
      
      lines.push("## Totals")
      lines.push(`Reflections: ${stats.totalReflections}`)
      lines.push(`Mistakes: ${stats.totalMistakes}`)
      lines.push(`Improvements: ${stats.totalImprovements}`)
      lines.push(`Patterns: ${stats.totalPatterns}`)
      lines.push(`Goals: ${stats.totalGoals}`)
      lines.push("")
      
      lines.push("## Action Items")
      lines.push(`📋 Open mistakes: ${stats.openMistakes}`)
      lines.push(`✅ Completed goals: ${stats.completedGoals}`)
      lines.push(`🔁 Active patterns to watch: ${stats.activePatterns}`)
      lines.push("")

      // Calculate rates
      if (stats.totalMistakes > 0) {
        const resolvedRate = Math.round(((stats.totalMistakes - stats.openMistakes) / stats.totalMistakes) * 100)
        lines.push(`## Resolution Rate`)
        lines.push(`Mistakes resolved: ${resolvedRate}%`)
        lines.push("")
      }

      if (stats.totalGoals > 0) {
        const completionRate = Math.round((stats.completedGoals / stats.totalGoals) * 100)
        lines.push(`## Goal Completion`)
        lines.push(`Goals completed: ${completionRate}%`)
        lines.push("")
      }

      // Tips based on stats
      lines.push("## Tips")
      
      if (stats.openMistakes > 5) {
        lines.push("⚠️ You have many open mistakes. Consider reviewing and addressing them.")
      }
      
      if (stats.activePatterns > 5) {
        lines.push("🔁 Several active patterns. Identify if you need to break or reinforce them.")
      }
      
      if (stats.completedGoals === 0 && stats.totalGoals > 0) {
        lines.push("🎯 No goals completed yet. Focus on making progress on existing goals.")
      }

      if (stats.totalReflections < 10) {
        lines.push("💭 Consider capturing more reflections to build learning momentum.")
      }

      return lines.join("\n")

    } catch (error: any) {
      console.error("[LearningTools] Error getting stats:", error)
      throw new Error(`Failed to get stats: ${error.message}`)
    }
  }
})

export const learningStatsTool: MCPTool = {
  ...learningStatsToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Additional Tool: learning_update_mistake (update status)
// ============================================================================

const learningUpdateMistakeToolImpl = tool({
  description: "Update a mistake's status (e.g., mark as 'addressed' or 'resolved'). Use this after you've taken action on a mistake.",
  args: {
    id: z.string().describe("The mistake ID"),
    status: z.enum(["open", "addressed", "resolved"]).describe("New status for the mistake"),
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      await learningFramework.updateMistakeStatus(args.id, args.status)

      const emoji = args.status === "resolved" ? "✅" : args.status === "addressed" ? "🔄" : "📋"

      return `${emoji} Mistake status updated\n\nID: ${args.id}\nNew status: ${args.status}`

    } catch (error: any) {
      console.error("[LearningTools] Error updating mistake:", error)
      throw new Error(`Failed to update mistake: ${error.message}`)
    }
  }
})

export const learningUpdateMistakeTool: MCPTool = {
  ...learningUpdateMistakeToolImpl,
  serverName: 'learning',
  category: 'learning'
}

// ============================================================================
// Additional Tool: learning_update_goal (update status)
// ============================================================================

const learningUpdateGoalToolImpl = tool({
  description: "Update a goal's status or link mistakes/improvements to it. Use this to track progress.",
  args: {
    id: z.string().describe("The goal ID"),
    status: z.enum(["not_started", "in_progress", "blocked", "completed", "abandoned"]).optional().describe("New status for the goal"),
    relatedMistakes: z.array(z.string()).optional().describe("Mistake IDs to learn from"),
    relatedImprovements: z.array(z.string()).optional().describe("Improvement IDs tracking progress"),
  },
  async execute(args, context) {
    try {
      if (!learningFramework) {
        throw new Error("Learning framework not initialized. Call initializeLearning() first.")
      }

      const update: any = {}
      if (args.status) update.status = args.status
      if (args.relatedMistakes) update.relatedMistakes = args.relatedMistakes
      if (args.relatedImprovements) update.relatedImprovements = args.relatedImprovements

      await learningFramework.updateGoal(args.id, update)

      const lines: string[] = []
      lines.push(`🎯 Goal updated\n\nID: ${args.id}`)
      
      if (args.status) {
        const emoji = args.status === "completed" ? "✅" : args.status === "in_progress" ? "🔄" : args.status === "blocked" ? "🚫" : "⏸️"
        lines.push(`Status: ${emoji} ${args.status}`)
      }
      
      if (args.relatedMistakes?.length) {
        lines.push(`Linked ${args.relatedMistakes.length} mistake(s)`)
      }
      
      if (args.relatedImprovements?.length) {
        lines.push(`Linked ${args.relatedImprovements.length} improvement(s)`)
      }

      return lines.join("\n")

    } catch (error: any) {
      console.error("[LearningTools] Error updating goal:", error)
      throw new Error(`Failed to update goal: ${error.message}`)
    }
  }
})

export const learningUpdateGoalTool: MCPTool = {
  ...learningUpdateGoalToolImpl,
  serverName: 'learning',
  category: 'learning'
}
