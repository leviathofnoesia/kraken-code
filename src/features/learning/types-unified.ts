/**
 * Unified AI Memory System Types
 * 
 * Four-layer architecture:
 * - Layer 1: Experience Store (episodic memory with rewards)
 * - Layer 2: Knowledge Graph (semantic memory with entities)
 * - Layer 3: Pattern Recognition (behavioral memory)
 * - Layer 4: State Machine (behavioral control)
 */

// ============================================================================
// Layer 1: Experience Store
// ============================================================================

export interface Experience {
  id: string
  timestamp: string // ISO 8601
  state: string // State before action
  action: string // Tool/method used
  outcome: "success" | "failure" | "partial"
  reward: number // -1 (bad) to +1 (good)
  confidence: number // 0-1 (how certain we are)
  context: {
    sessionId: string
    tool?: string
    prompt?: string
    userId?: string
  }
  metadata: Record<string, any>
}

export interface ExperienceReplayResult {
  bestAction: string
  expectedReward: number
  confidence: number
  similarExperiences: Experience[]
}

// ============================================================================
// Layer 2: Knowledge Graph
// ============================================================================

export interface KnowledgeNode {
  id: string
  type: "person" | "company" | "project" | "concept" | "skill" | "mistake" | "pattern"
  data: Record<string, any> // Flexible data storage
  relations: {
    relatedTo: string[] // Other nodes this connects to
    conflictsWith: string[] // Contradictory information
    dependsOn: string[] // Prerequisite nodes
  }
  importance: number // 0-10 (how critical this is)
  strength: number // 0-1 (confidence in information)
  lastAccessed: string // ISO 8601
  accessCount: number // How often referenced
  metadata: {
    tags: string[]
    source: "experience" | "manual" | "inference"
    created: string
    updated: string
  }
}

export interface KnowledgeEdge {
  from: string
  to: string
  type: "relates_to" | "causes" | "depends_on" | "conflicts_with"
  weight: number
}

export interface KnowledgeGraph {
  nodes: Record<string, KnowledgeNode>
  edges: KnowledgeEdge[]
  indexes: {
    byType: Record<string, string[]>
    byImportance: string[]
    byTag: Record<string, string[]>
  }
}

// ============================================================================
// Layer 3: Pattern Recognition
// ============================================================================

export interface PatternDetection {
  id: string
  type: "positive" | "negative" | "neutral"
  category: string // "coding", "debugging", "design", "process"
  description: string // Human-readable pattern description
  examples: string[] // Concrete instances where pattern occurred
  frequency: number // How often pattern occurs
  firstSeen: string // ISO 8601
  lastSeen: string // ISO 8601
  confidence: number // 0-1 (how certain we are)
  triggers: string[] // Keywords/situations that trigger pattern
  consequences: string[] // What happens when pattern occurs
  suggestedActions: string[] // What to do (or avoid)
  impact: "low" | "medium" | "high" | "critical"
  status: "active" | "resolved" | "superseded"
}

export interface PatternDetectionResult {
  patterns: PatternDetection[]
  confidence: number // Overall confidence in detection
  suggestedBehavior: string // What AI should do
  contextMatches: {
    similarExperiences: string[]
    relatedPatterns: string[]
  }
}

// ============================================================================
// Layer 4: State Machine
// ============================================================================

export interface StateDefinition {
  name: string
  description: string
  onEnter?: () => void // Action when entering state
  onExit?: () => void // Action when leaving state
  transitions: TransitionRule[]
  metadata: Record<string, any>
}

export interface TransitionRule {
  fromState: string
  toState: string
  condition?: (context: any) => boolean // Predicate for conditional transition
  action?: () => void // Action during transition
  toolMethod?: string // Tool/method to call
  probability?: number // Likelihood (for stochastic FSMs)
}

export interface StateMachine {
  id: string
  name: string
  initialState: string
  states: Record<string, StateDefinition>
  transitions: Record<string, TransitionRule[]>
  currentState: string
  history: StateTransition[]
  metadata: {
    created: string
    version: string
    triggers: string[]
  }
}

export interface StateTransition {
  timestamp: string
  fromState: string
  toState: string
  trigger: string // What caused transition
  context: any
  reward?: number
}

// ============================================================================
// Learning Algorithms
// ============================================================================

export interface FSRSItem {
  id: string
  ease: number // 1 (easy) to 10 (hard)
  intervalDays: number[] // Intervals for reviews
  nextReviewDate: string // ISO 8601
  reviewCount: number
  lastReviewDate?: string // ISO 8601
}

export interface FSRSSchedule {
  itemId: string
  nextReviewDate: string
  intervalDays: number
}

export interface QTable {
  [key: string]: number // "state-action" -> Q-value
}

export interface ReplayBuffer {
  buffer: Experience[]
  maxSize: number
}

// ============================================================================
// Unified Learning Config
// ============================================================================

export interface UnifiedLearningConfig {
  enabled: boolean
  storagePath: string // default: ~/clawd/learning/
  
  // Experience Store
  experienceStore: {
    enabled: boolean
    bufferSize: number
    maxAgeDays: number
  }
  
  // Knowledge Graph
  knowledgeGraph: {
    enabled: boolean
    maxNodes: number
  }
  
  // Pattern Recognition
  patternDetection: {
    enabled: boolean
    minFrequency: number
    minConfidence: number
  }
  
  // State Machine
  stateMachine: {
    enabled: boolean
    initialState: string
  }
  
  // FSRS
  fsrs: {
    enabled: boolean
    initialIntervals: number[] // default: [1, 3, 7, 14, 30, 60, 120, 240, 480]
  }
  
  // Hooks
  hooks: {
    recordOnToolExecute: boolean
    recordOnSessionEnd: boolean
    injectOnSessionStart: boolean
  }
}
