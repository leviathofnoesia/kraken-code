/**
 * Learning Stats Tool
 *
 * Get comprehensive statistics across all learning system layers.
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import type { MCPTool } from "../../features/mcp/types"
import type { ExperienceStore } from "../../features/learning/experience-store"
import type { KnowledgeGraphStore } from "../../features/learning/knowledge-graph"
import type { PatternDetector } from "../../features/learning/pattern-detection"
import type { StateMachineEngine } from "../../features/learning/state-machine"
import type { FSRScheduler } from "../../features/learning/fsrs-scheduler"

let experienceStore: ExperienceStore | null = null
let knowledgeGraph: KnowledgeGraphStore | null = null
let patternDetector: PatternDetector | null = null
let stateMachine: StateMachineEngine | null = null
let fsrsScheduler: FSRScheduler | null = null

export function setLearningStatsSystems(systems: {
  experienceStore: ExperienceStore
  knowledgeGraph: KnowledgeGraphStore
  patternDetector: PatternDetector
  stateMachine: StateMachineEngine
  fsrsScheduler?: FSRScheduler
}) {
  experienceStore = systems.experienceStore
  knowledgeGraph = systems.knowledgeGraph
  patternDetector = systems.patternDetector
  stateMachine = systems.stateMachine
  fsrsScheduler = systems.fsrsScheduler || null
  console.log("[LearningStatsTool] Learning systems set")
}

const learningStatsToolImpl = tool({
  description: "Get comprehensive statistics across all learning system layers (experiences, knowledge graph, patterns, state machines, FSRS). Use this to monitor learning progress, identify trends, and assess system performance.",
  args: {
    layer: z.enum(["all", "experience", "knowledge", "pattern", "fsm", "fsrs"]).default("all").describe("Which layer to show stats for. Default: all."),
    detailed: z.boolean().default(false).describe("Show detailed breakdowns. Default: false."),
  },
  async execute(args, context) {
    try {
      switch (args.layer) {
        case "all":
          return await getAllStats(args.detailed)
        case "experience":
          return await getExperienceStats(args.detailed)
        case "knowledge":
          return await getKnowledgeStats(args.detailed)
        case "pattern":
          return await getPatternStats(args.detailed)
        case "fsm":
          return await getFsmStats(args.detailed)
        case "fsrs":
          return await getFsrStats(args.detailed)
        default:
          return await getAllStats(args.detailed)
      }
    } catch (error: any) {
      console.error("[LearningStatsTool] Error:", error)
      throw new Error(`Failed to get stats: ${error.message}`)
    }
  }
})

async function getAllStats(detailed: boolean): Promise<string> {
  const sections: string[] = []

  sections.push("📊 **Learning System Statistics**\n")

  // Experience stats
  if (experienceStore) {
    sections.push(await getExperienceStats(detailed))
    sections.push("")
  }

  // Knowledge graph stats
  if (knowledgeGraph) {
    sections.push(await getKnowledgeStats(detailed))
    sections.push("")
  }

  // Pattern stats
  if (patternDetector) {
    sections.push(await getPatternStats(detailed))
    sections.push("")
  }

  // FSM stats
  if (stateMachine) {
    sections.push(await getFsmStats(detailed))
    sections.push("")
  }

  // FSRS stats
  if (fsrsScheduler) {
    sections.push(await getFsrStats(detailed))
  }

  return sections.join("\n")
}

async function getExperienceStats(detailed: boolean): Promise<string> {
  if (!experienceStore) {
    return "❌ Experience store not initialized"
  }

  const stats = await experienceStore.getStats()
  const experiences = await experienceStore.loadExperiences()

  let output = "## 📈 Layer 1: Experience Store\n\n"
  output += `**Summary:**\n`
  output += `- Total experiences: ${stats.totalExperiences}\n`
  output += `- Success rate: ${(stats.successRate * 100).toFixed(1)}%\n`
  output += `- Average reward: ${stats.avgReward.toFixed(2)}\n\n`

  if (detailed && experiences.length > 0) {
    // Outcome breakdown
    const outcomes = experiences.reduce((acc, exp) => {
      acc[exp.outcome] = (acc[exp.outcome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    output += `**Outcome Breakdown:**\n`
    output += `- Success: ${outcomes.success || 0} (${(((outcomes.success || 0) / experiences.length) * 100).toFixed(1)}%)\n`
    output += `- Failure: ${outcomes.failure || 0} (${(((outcomes.failure || 0) / experiences.length) * 100).toFixed(1)}%)\n`
    output += `- Partial: ${outcomes.partial || 0} (${(((outcomes.partial || 0) / experiences.length) * 100).toFixed(1)}%)\n\n`

    // Top actions
    const actionCounts = experiences.reduce((acc, exp) => {
      acc[exp.action] = (acc[exp.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    output += `**Top Actions:**\n`
    topActions.forEach(([action, count], i) => {
      output += `${i + 1}. ${action} (${count} uses)\n`
    })
  }

  return output
}

async function getKnowledgeStats(detailed: boolean): Promise<string> {
  if (!knowledgeGraph) {
    return "❌ Knowledge graph not initialized"
  }

  const allNodes = knowledgeGraph.getAllNodes()
  const allEdges = knowledgeGraph.getAllEdges()

  let output = "## 🌐 Layer 2: Knowledge Graph\n\n"
  output += `**Summary:**\n`
  output += `- Total nodes: ${allNodes.length}\n`
  output += `- Total edges: ${allEdges.length}\n\n`

  if (detailed && allNodes.length > 0) {
    // Type breakdown
    const byType: Record<string, number> = {}
    for (const node of allNodes) {
      byType[node.type] = (byType[node.type] || 0) + 1
    }

    output += `**Nodes by Type:**\n`
    Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        output += `- ${type}: ${count}\n`
      })

    output += "\n**Top 10 Nodes by Access:**\n"
    const topNodes = [...allNodes]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)

    topNodes.forEach((node, i) => {
      output += `${i + 1}. ${node.id} (${node.type}) - ${node.accessCount} accesses\n`
    })
  }

  return output
}

async function getPatternStats(detailed: boolean): Promise<string> {
  if (!patternDetector) {
    return "❌ Pattern detector not initialized"
  }

  const patterns = patternDetector.getAllPatterns()

  let output = "## 🔍 Layer 3: Pattern Detection\n\n"
  output += `**Summary:**\n`
  output += `- Total patterns: ${patterns.length}\n\n`

  if (detailed && patterns.length > 0) {
    // Type breakdown
    const byType: Record<string, number> = {}
    patterns.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + 1
    })

    output += `**Patterns by Type:**\n`
    Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const emoji = type === "positive" ? "✅" : type === "negative" ? "❌" : "⚪"
        output += `- ${emoji} ${type}: ${count}\n`
      })

    output += "\n**Top 10 Patterns by Frequency:**\n"
    const topPatterns = [...patterns]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    topPatterns.forEach((p, i) => {
      const emoji = p.type === "positive" ? "✅" : p.type === "negative" ? "❌" : "⚪"
      const impactEmoji = p.impact === "critical" ? "🚨" : p.impact === "high" ? "🔴" : p.impact === "medium" ? "⚠️" : "💚"
      output += `${i + 1}. ${emoji} ${impactEmoji} ${p.description} (${p.frequency} occurrences)\n`
    })
  }

  return output
}

async function getFsmStats(detailed: boolean): Promise<string> {
  if (!stateMachine) {
    return "❌ State machine not initialized"
  }

  const machines = stateMachine.getAllMachines()

  let output = "## 🔄 Layer 4: State Machine\n\n"
  output += `**Summary:**\n`
  output += `- Total state machines: ${machines.length}\n\n`

  if (detailed && machines.length > 0) {
    const defaultMachine = machines.find(m => m.id === "default")

    if (defaultMachine) {
      output += `**Default Machine: ${defaultMachine.name}**\n`
      output += `- Current state: ${defaultMachine.currentState}\n`
      output += `- Total states: ${Object.keys(defaultMachine.states).length}\n`
      output += `- Total transitions: ${defaultMachine.history.length}\n\n`

      if (defaultMachine.history.length > 0) {
        // Reward analysis
        const rewards = defaultMachine.history
          .filter(h => h.reward !== undefined)
          .map(h => h.reward!)

        if (rewards.length > 0) {
          const avgReward = rewards.reduce((sum, r) => sum + r, 0) / rewards.length
          const positiveCount = rewards.filter(r => r > 0).length
          const negativeCount = rewards.filter(r => r < 0).length

          output += `**Transition Rewards:**\n`
          output += `- Average: ${avgReward.toFixed(2)}\n`
          output += `- Positive: ${positiveCount} (${(positiveCount / rewards.length * 100).toFixed(1)}%)\n`
          output += `- Negative: ${negativeCount} (${(negativeCount / rewards.length * 100).toFixed(1)}%)\n\n`
        }

        output += `**Recent Transitions (last 5):**\n`
        defaultMachine.history.slice(-5).forEach((t, i) => {
          const emoji = t.reward && t.reward > 0 ? "✅" : t.reward && t.reward < 0 ? "❌" : "→"
          output += `${i + 1}. ${emoji} ${t.fromState} → ${t.toState}\n`
        })
      }
    }
  }

  return output
}

async function getFsrStats(detailed: boolean): Promise<string> {
  if (!fsrsScheduler) {
    return "❌ FSRS scheduler not initialized"
  }

  let output = "## 📅 FSRS Scheduler\n\n"
  output += `**Status:** ✅ Enabled\n`
  output += `**Purpose:** Spaced repetition scheduling for optimal retention\n\n`

  output += `**Intervals (days):** 1, 3, 7, 14, 30, 60, 120, 240, 480\n\n`

  output += `**Ease Factor Scale:**\n`
  output += `- 1 = Very easy (review rarely)\n`
  output += `- 10 = Very hard (review frequently)\n\n`

  if (detailed) {
    output += `**Algorithm:** FSRS (Free Spaced Repetition Scheduler)\n`
    output += `- Optimizes review intervals based on recall performance\n`
    output += `- Adapts to individual learning patterns\n`
    output += `- Follows Ebbinghaus forgetting curve\n`
  }

  return output
}

export const learningStatsTool: MCPTool = {
  ...learningStatsToolImpl,
  serverName: 'learning',
  category: 'learning'
}
