/**
 * Learning & Improvement Framework
 * 
 * A solud framework for structured improvement and learning from mistakes.
 * User-driven, manual. No autonomous agents.
 */

import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import type {
  Reflection,
  Mistake,
  Improvement,
  Pattern,
  Goal,
  LearningConfig,
  ReviewSummary
} from "./types"

const DEFAULT_STORAGE_PATH = path.join(os.homedir(), "clawd", "learning")

export class LearningFramework {
  private config: LearningConfig
  private storagePath: string

  constructor(config?: Partial<LearningConfig>) {
    this.config = {
      enabled: config?.enabled ?? true,
      storagePath: config?.storagePath ?? DEFAULT_STORAGE_PATH,
      enablePatterns: config?.enablePatterns ?? true,
      enableGoals: config?.enableGoals ?? true
    }

    this.storagePath = this.config.storagePath
    this.ensureStructure()
  }

  private ensureStructure() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true })
    }

    const subdirs = [
      "reflections",
      "mistakes",
      "improvements",
      "patterns",
      "goals",
      "reviews"
    ]

    for (const subdir of subdirs) {
      const dirPath = path.join(this.storagePath, subdir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
    }

    console.log(`[LearningFramework] Storage ready at ${this.storagePath}`)
  }

  // ============================================================================
  // Reflections
  // ============================================================================

  async saveReflection(reflection: Omit<Reflection, "id">): Promise<Reflection> {
    const id = `reflection-${Date.now()}`
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16)

    const fullReflection: Reflection = {
      id,
      timestamp,
      ...reflection
    }

    const filePath = path.join(this.storagePath, "reflections", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(fullReflection, null, 2), "utf-8")

    console.log(`[LearningFramework] Saved reflection: ${id}`)

    return fullReflection
  }

  async getReflection(id: string): Promise<Reflection | null> {
    const filePath = path.join(this.storagePath, "reflections", `${id}.json`)
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  }

  async listReflections(filters?: { tags?: string[], limit?: number }): Promise<Reflection[]> {
    const dirPath = path.join(this.storagePath, "reflections")
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = fs.readdirSync(dirPath)
    const reflections: Reflection[] = []

    for (const file of files.sort().reverse()) {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const reflection = JSON.parse(content)
      reflections.push(reflection)
    }

    // Apply filters
    let filtered = reflections

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(r => 
        filters.tags!.some(tag => r.tags.includes(tag))
      )
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  // ============================================================================
  // Mistakes
  // ============================================================================

  async saveMistake(mistake: Omit<Mistake, "id">): Promise<Mistake> {
    const id = `mistake-${Date.now()}`
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16)

    const fullMistake: Mistake = {
      id,
      timestamp,
      status: "open",
      ...mistake
    }

    const filePath = path.join(this.storagePath, "mistakes", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(fullMistake, null, 2), "utf-8")

    console.log(`[LearningFramework] Saved mistake: ${id}`)

    return fullMistake
  }

  async getMistake(id: string): Promise<Mistake | null> {
    const filePath = path.join(this.storagePath, "mistakes", `${id}.json`)
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  }

  async updateMistakeStatus(id: string, status: Mistake["status"]): Promise<void> {
    const mistake = await this.getMistake(id)
    if (!mistake) {
      throw new Error(`Mistake not found: ${id}`)
    }

    mistake.status = status
    const filePath = path.join(this.storagePath, "mistakes", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(mistake, null, 2), "utf-8")

    console.log(`[LearningFramework] Updated mistake ${id} status to ${status}`)
  }

  async listMistakes(filters?: {
    severity?: Mistake["severity"]
    status?: Mistake["status"]
    tags?: string[]
    limit?: number
  }): Promise<Mistake[]> {
    const dirPath = path.join(this.storagePath, "mistakes")
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = fs.readdirSync(dirPath)
    const mistakes: Mistake[] = []

    for (const file of files.sort().reverse()) {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const mistake = JSON.parse(content)
      mistakes.push(mistake)
    }

    // Apply filters
    let filtered = mistakes

    if (filters?.severity) {
      filtered = filtered.filter(m => m.severity === filters.severity)
    }

    if (filters?.status) {
      filtered = filtered.filter(m => m.status === filters.status)
    }

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(m => 
        filters.tags!.some(tag => m.tags.includes(tag))
      )
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  // ============================================================================
  // Improvements
  // ============================================================================

  async saveImprovement(improvement: Omit<Improvement, "id">): Promise<Improvement> {
    const id = `improvement-${Date.now()}`
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16)

    const fullImprovement: Improvement = {
      id,
      timestamp,
      ...improvement
    }

    const filePath = path.join(this.storagePath, "improvements", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(fullImprovement, null, 2), "utf-8")

    console.log(`[LearningFramework] Saved improvement: ${id}`)

    return fullImprovement
  }

  async getImprovement(id: string): Promise<Improvement | null> {
    const filePath = path.join(this.storagePath, "improvements", `${id}.json`)
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  }

  async listImprovements(filters?: {
    tags?: string[]
    limit?: number
  }): Promise<Improvement[]> {
    const dirPath = path.join(this.storagePath, "improvements")
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = fs.readdirSync(dirPath)
    const improvements: Improvement[] = []

    for (const file of files.sort().reverse()) {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const improvement = JSON.parse(content)
      improvements.push(improvement)
    }

    // Apply filters
    let filtered = improvements

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(i => 
        filters.tags!.some(tag => i.tags.includes(tag))
      )
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  // ============================================================================
  // Patterns
  // ============================================================================

  async savePattern(pattern: Omit<Pattern, "id">): Promise<Pattern> {
    const id = `pattern-${Date.now()}`
    const now = new Date().toISOString().split("T")[0]

    const fullPattern: Pattern = {
      id,
      firstSeen: now,
      lastSeen: now,
      frequency: 1,
      status: "active",
      ...pattern
    }

    const filePath = path.join(this.storagePath, "patterns", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(fullPattern, null, 2), "utf-8")

    console.log(`[LearningFramework] Saved pattern: ${id}`)

    return fullPattern
  }

  async updatePattern(
    id: string,
    update: Partial<Omit<Pattern, "id" | "firstSeen" | "frequency">>
  ): Promise<void> {
    const pattern = await this.getPattern(id)
    if (!pattern) {
      throw new Error(`Pattern not found: ${id}`)
    }

    Object.assign(pattern, update, {
      lastSeen: new Date().toISOString().split("T")[0],
      frequency: pattern.frequency + 1
    })

    const filePath = path.join(this.storagePath, "patterns", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(pattern, null, 2), "utf-8")

    console.log(`[LearningFramework] Updated pattern: ${id}`)
  }

  async getPattern(id: string): Promise<Pattern | null> {
    const filePath = path.join(this.storagePath, "patterns", `${id}.json`)
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  }

  async listPatterns(filters?: {
    type?: Pattern["type"]
    status?: Pattern["status"]
    limit?: number
  }): Promise<Pattern[]> {
    const dirPath = path.join(this.storagePath, "patterns")
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = fs.readdirSync(dirPath)
    const patterns: Pattern[] = []

    for (const file of files.sort().reverse()) {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const pattern = JSON.parse(content)
      patterns.push(pattern)
    }

    // Apply filters
    let filtered = patterns

    if (filters?.type) {
      filtered = filtered.filter(p => p.type === filters.type)
    }

    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status)
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  // ============================================================================
  // Goals
  // ============================================================================

  async saveGoal(goal: Omit<Goal, "id">): Promise<Goal> {
    const id = `goal-${Date.now()}`
    const created = new Date().toISOString().split("T")[0]

    const fullGoal: Goal = {
      id,
      created,
      status: "not_started",
      relatedMistakes: [],
      relatedImprovements: [],
      ...goal
    }

    const filePath = path.join(this.storagePath, "goals", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(fullGoal, null, 2), "utf-8")

    console.log(`[LearningFramework] Saved goal: ${id}`)

    return fullGoal
  }

  async updateGoal(id: string, update: Partial<Omit<Goal, "id" | "created">>): Promise<void> {
    const goal = await this.getGoal(id)
    if (!goal) {
      throw new Error(`Goal not found: ${id}`)
    }

    Object.assign(goal, update)

    const filePath = path.join(this.storagePath, "goals", `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(goal, null, 2), "utf-8")

    console.log(`[LearningFramework] Updated goal: ${id}`)
  }

  async getGoal(id: string): Promise<Goal | null> {
    const filePath = path.join(this.storagePath, "goals", `${id}.json`)
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  }

  async listGoals(filters?: {
    status?: Goal["status"]
    tags?: string[]
    limit?: number
  }): Promise<Goal[]> {
    const dirPath = path.join(this.storagePath, "goals")
    if (!fs.existsSync(dirPath)) {
      return []
    }

    const files = fs.readdirSync(dirPath)
    const goals: Goal[] = []

    for (const file of files.sort().reverse()) {
      const filePath = path.join(dirPath, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const goal = JSON.parse(content)
      goals.push(goal)
    }

    // Apply filters
    let filtered = goals

    if (filters?.status) {
      filtered = filtered.filter(g => g.status === filters.status)
    }

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(g => 
        filters.tags!.some(tag => g.tags.includes(tag))
      )
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  // ============================================================================
  // Reviews
  // ============================================================================

  async generateReview(period: string): Promise<ReviewSummary> {
    console.log(`[LearningFramework] Generating review for ${period}...`)

    const reflections = await this.listReflections()
    const mistakes = await this.listMistakes()
    const improvements = await this.listImprovements()
    const patterns = await this.listPatterns()
    const goals = await this.listGoals()

    const summary: ReviewSummary = {
      period,
      reflectionCount: reflections.length,
      mistakes: {
        total: mistakes.length,
        bySeverity: {
          low: mistakes.filter(m => m.severity === "low").length,
          medium: mistakes.filter(m => m.severity === "medium").length,
          high: mistakes.filter(m => m.severity === "high").length,
          critical: mistakes.filter(m => m.severity === "critical").length
        },
        byStatus: {
          open: mistakes.filter(m => m.status === "open").length,
          addressed: mistakes.filter(m => m.status === "addressed").length,
          resolved: mistakes.filter(m => m.status === "resolved").length
        },
        byTag: this.aggregateByTag(mistakes, "tags")
      },
      improvements: {
        total: improvements.length,
        byTag: this.aggregateByTag(improvements, "tags")
      },
      patterns: {
        total: patterns.length,
        positive: patterns.filter(p => p.type === "positive").length,
        negative: patterns.filter(p => p.type === "negative").length,
        active: patterns.filter(p => p.status === "active").length,
        resolved: patterns.filter(p => p.status === "resolved").length
      },
      topMistakes: this.sortBySeverity(mistakes).slice(0, 10),
      topImprovements: improvements.slice(0, 10),
      goals: {
        total: goals.length,
        completed: goals.filter(g => g.status === "completed").length,
        inProgress: goals.filter(g => g.status === "in_progress").length,
        blocked: goals.filter(g => g.status === "blocked").length
      }
    }

    // Save review
    const reviewPath = path.join(this.storagePath, "reviews", `${period}.json`)
    fs.writeFileSync(reviewPath, JSON.stringify(summary, null, 2), "utf-8")

    console.log(`[LearningFramework] Review saved: ${period}`)

    return summary
  }

  // ============================================================================
  // Search
  // ============================================================================

  async search(query: string, scope?: "all" | "reflections" | "mistakes" | "improvements" | "patterns" | "goals"): Promise<{
    reflections: Reflection[]
    mistakes: Mistake[]
    improvements: Improvement[]
    patterns: Pattern[]
    goals: Goal[]
  }> {
    const queryLower = query.toLowerCase()

    const result: any = {
      reflections: [],
      mistakes: [],
      improvements: [],
      patterns: [],
      goals: []
    }

    const searchIn = (items: any[], fields: string[]) => {
      return items.filter(item => 
        fields.some(field => 
          String(item[field]).toLowerCase().includes(queryLower)
        )
      )
    }

    if (scope === "all" || scope === "reflections") {
      const reflections = await this.listReflections()
      result.reflections = searchIn(reflections, ["context", "whatHappened", "thoughts"])
    }

    if (scope === "all" || scope === "mistakes") {
      const mistakes = await this.listMistakes()
      result.mistakes = searchIn(mistakes, ["context", "whatWentWrong", "whyItHappened", "lessons"])
    }

    if (scope === "all" || scope === "improvements") {
      const improvements = await this.listImprovements()
      result.improvements = searchIn(improvements, ["context", "whatChanged", "whyItHelped"])
    }

    if (scope === "all" || scope === "patterns") {
      const patterns = await this.listPatterns()
      result.patterns = searchIn(patterns, ["description", "examples"])
    }

    if (scope === "all" || scope === "goals") {
      const goals = await this.listGoals()
      result.goals = searchIn(goals, ["title", "description"])
    }

    return result
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  async getStats(): Promise<{
    totalReflections: number
    totalMistakes: number
    totalImprovements: number
    totalPatterns: number
    totalGoals: number
    openMistakes: number
    completedGoals: number
    activePatterns: number
  }> {
    const [reflections, mistakes, improvements, patterns, goals] = await Promise.all([
      this.listReflections(),
      this.listMistakes(),
      this.listImprovements(),
      this.listPatterns(),
      this.listGoals()
    ])

    return {
      totalReflections: reflections.length,
      totalMistakes: mistakes.length,
      totalImprovements: improvements.length,
      totalPatterns: patterns.length,
      totalGoals: goals.length,
      openMistakes: mistakes.filter(m => m.status === "open").length,
      completedGoals: goals.filter(g => g.status === "completed").length,
      activePatterns: patterns.filter(p => p.status === "active").length
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private aggregateByTag(items: any[], tagField: string): Record<string, number> {
    const byTag: Record<string, number> = {}

    for (const item of items) {
      const tags = item[tagField] || []
      for (const tag of tags) {
        byTag[tag] = (byTag[tag] || 0) + 1
      }
    }

    return byTag
  }

  private sortBySeverity(mistakes: Mistake[]): Mistake[] {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

    return mistakes.sort((a, b) => 
      severityOrder[a.severity] - severityOrder[b.severity]
    )
  }
}
