/**
 * Learning & Improvement Framework
 * 
 * A solud framework for structured improvement and learning from mistakes.
 * No autonomous agents. No cron jobs. No proactive messaging.
 * User decides when to use it.
 * 
 * Philosophy:
 * - Manual, user-driven
 * - Structured reflection
 * - Learning from mistakes
 * - Tracking improvements over time
 * - Identifying patterns (wins & losses)
 */

export interface Reflection {
  id: string
  timestamp: string // YYYY-MM-DD HH:MM
  context: string // What were you working on?
  whatHappened: string // Brief description
  thoughts: string // Your reflection on the situation
  tags: string[] // For filtering/categorization
}

export interface Mistake {
  id: string
  timestamp: string // YYYY-MM-DD HH:MM
  context: string // What were you working on?
  whatWentWrong: string // The mistake
  whyItHappened: string // Root cause analysis
  lessons: string[] // What did you learn?
  severity: "low" | "medium" | "high" | "critical" // Impact level
  tags: string[] // For filtering/categorization
  status: "open" | "addressed" | "resolved"
}

export interface Improvement {
  id: string
  timestamp: string // YYYY-MM-DD HH:MM
  context: string // What was the problem?
  whatChanged: string // The improvement made
  whyItHelped: string // Explanation of benefit
  evidence?: string // Metrics, before/after, etc.
  tags: string[] // For filtering/categorization
}

export interface Pattern {
  id: string
  type: "positive" | "negative"
  description: string // The pattern
  examples: string[] // Concrete instances
  frequency: number // How often does it happen?
  firstSeen: string // When first observed
  lastSeen: string // When last observed
  status: "active" | "resolved" | "monitoring"
}

export interface Goal {
  id: string
  title: string
  description: string
  created: string // YYYY-MM-DD
  target: string // Target date or milestone
  status: "not_started" | "in_progress" | "blocked" | "completed" | "abandoned"
  relatedMistakes: string[] // Mistake IDs to learn from
  relatedImprovements: string[] // Improvement IDs tracking progress
  tags: string[]
}

export interface LearningConfig {
  enabled: boolean
  storagePath: string // default: ~/clawd/learning/
  enablePatterns: boolean
  enableGoals: boolean
}

export interface ReviewSummary {
  period: string // e.g., "2024-Q4", "2024-12"
  reflectionCount: number
  mistakes: {
    total: number
    bySeverity: Record<Mistake["severity"], number>
    byStatus: Record<Mistake["status"], number>
    byTag: Record<string, number>
  }
  improvements: {
    total: number
    byTag: Record<string, number>
  }
  patterns: {
    total: number
    positive: number
    negative: number
    active: number
    resolved: number
  }
  topMistakes: Mistake[] // By severity/recency
  topImprovements: Improvement[] // By impact/recency
  goals: {
    total: number
    completed: number
    inProgress: number
    blocked: number
  }
}
