/**
 * Layer 1: Experience Store
 * 
 * Records all interactions with outcomes and rewards for replay learning.
 * Append-only JSONL for performance.
 */

import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"
import type { Experience, ExperienceReplayResult, ReplayBuffer } from "./types-unified"

export class ExperienceStore {
  private experiencePath: string
  private buffer: Experience[]
  private maxBufferSize: number
  private maxAgeDays: number

  constructor(storagePath: string, config?: { maxBufferSize?: number; maxAgeDays?: number }) {
    this.experiencePath = path.join(storagePath, "experiences.jsonl")
    this.maxBufferSize = config?.maxBufferSize || 1000
    this.maxAgeDays = config?.maxAgeDays || 90
    this.buffer = []

    this.ensureStorage()
  }

  private ensureStorage() {
    const dir = path.dirname(this.experiencePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (!fs.existsSync(this.experiencePath)) {
      fs.writeFileSync(this.experiencePath, "", "utf-8")
    }
  }

  /**
   * Add an experience to the store (async, buffered)
   */
  async addExperience(experience: Omit<Experience, "id" | "timestamp">): Promise<Experience> {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()

    const fullExperience: Experience = {
      id,
      timestamp,
      ...experience
    }

    // Add to buffer
    this.buffer.push(fullExperience)

    // Flush if buffer is full
    if (this.buffer.length >= 100) {
      await this.flushBuffer()
    }

    return fullExperience
  }

  /**
   * Flush buffered experiences to disk
   */
  async flushBuffer() {
    if (this.buffer.length === 0) return

    const lines = this.buffer.map(exp => JSON.stringify(exp)).join("\n") + "\n"
    fs.appendFileSync(this.experiencePath, lines, "utf-8")

    console.log(`[ExperienceStore] Flushed ${this.buffer.length} experiences`)
    this.buffer = []
  }

  /**
   * Load all experiences from disk (for replay/search)
   */
  async loadExperiences(): Promise<Experience[]> {
    const experiences: Experience[] = []
    const fileStream = fs.createReadStream(this.experiencePath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    for await (const line of rl) {
      if (line.trim()) {
        try {
          const exp = JSON.parse(line) as Experience
          experiences.push(exp)
        } catch (e) {
          console.error(`[ExperienceStore] Failed to parse line: ${line}`)
        }
      }
    }

    // Filter by age
    const now = Date.now()
    const maxAgeMs = this.maxAgeDays * 24 * 60 * 60 * 1000

    return experiences.filter(exp => {
      const expTime = new Date(exp.timestamp).getTime()
      return now - expTime <= maxAgeMs
    })
  }

  /**
   * Find relevant experiences for replay
   */
  async findRelevant(
    currentState: string,
    context: string,
    k: number = 5
  ): Promise<Experience[]> {
    const experiences = await this.loadExperiences()

    // Score experiences by similarity
    const scored = experiences
      .map(exp => ({
        exp,
        score: this.calculateSimilarityScore(exp, currentState, context)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.exp)

    return scored
  }

  /**
   * Get best action from similar experiences (replay)
   */
  async getBestAction(
    currentState: string,
    context: string
  ): Promise<ExperienceReplayResult | null> {
    const experiences = await this.findRelevant(currentState, context, 10)

    if (experiences.length === 0) {
      return null
    }

    // Score and find best action
    const scored = experiences.map(exp => ({
      exp,
      score: this.scoreExperience(exp)
    }))

    scored.sort((a, b) => b.score - a.score)
    const best = scored[0]

    return {
      bestAction: best.exp.action,
      expectedReward: best.exp.reward,
      confidence: best.exp.confidence,
      similarExperiences: scored.slice(0, 3).map(s => s.exp)
    }
  }

  /**
   * Calculate similarity score between experience and current state
   */
  private calculateSimilarityScore(
    exp: Experience,
    currentState: string,
    context: string
  ): number {
    let score = 0

    // State similarity (exact match gets highest score)
    if (exp.state === currentState) {
      score += 2
    } else if (currentState.includes(exp.state) || exp.state.includes(currentState)) {
      score += 1
    }

    // Context similarity (keyword matching)
    const contextLower = context.toLowerCase()
    const expContext = exp.context.prompt || ""
    const expContextLower = expContext.toLowerCase()

    const keywords = this.extractKeywords(contextLower)
    const expKeywords = this.extractKeywords(expContextLower)

    const keywordMatches = keywords.filter(k => expKeywords.includes(k)).length
    score += keywordMatches * 0.5

    // Tool similarity
    if (exp.context.tool && contextLower.includes(exp.context.tool.toLowerCase())) {
      score += 0.5
    }

    return score
  }

  /**
   * Score an experience for replay (reward + confidence + recency)
   */
  private scoreExperience(exp: Experience): number {
    let score = 0

    // Reward score (-1 to +1, multiplied by 2 for emphasis)
    score += exp.reward * 2

    // Confidence score (0 to 1)
    score += exp.confidence * 0.5

    // Recency score (decay over time)
    const ageMs = Date.now() - new Date(exp.timestamp).getTime()
    const ageDays = ageMs / (24 * 60 * 60 * 1000)
    const recencyScore = Math.exp(-ageDays / 30) // 30-day half-life
    score += recencyScore * 0.5

    return score
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/)
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "should",
      "can", "could", "may", "might", "must", "to", "of", "in", "for",
      "on", "at", "by", "with", "from", "as", "into", "through", "during",
      "before", "after", "above", "below", "between", "under", "again"
    ])

    return words
      .filter(w => w.length > 3 && !stopWords.has(w))
      .filter((w, i, arr) => arr.indexOf(w) === i) // Unique
  }

  /**
   * Get replay buffer (recent experiences for RL)
   */
  async getReplayBuffer(size: number = 100): Promise<ReplayBuffer> {
    const experiences = await this.loadExperiences()

    // Sort by recency and take most recent
    const recent = experiences
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, size)

    return {
      buffer: recent,
      maxSize: this.maxBufferSize
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    totalExperiences: number
    avgReward: number
    successRate: number
    recentExperiences: Experience[]
  }> {
    const experiences = await this.loadExperiences()

    if (experiences.length === 0) {
      return {
        totalExperiences: 0,
        avgReward: 0,
        successRate: 0,
        recentExperiences: []
      }
    }

    const avgReward = experiences.reduce((sum, exp) => sum + exp.reward, 0) / experiences.length
    const successCount = experiences.filter(exp => exp.outcome === "success").length
    const successRate = successCount / experiences.length

    const recent = experiences
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    return {
      totalExperiences: experiences.length,
      avgReward,
      successRate,
      recentExperiences: recent
    }
  }

  /**
   * Compact storage (remove old experiences)
   */
  async compact() {
    const experiences = await this.loadExperiences()
    
    // Rewrite file with only recent experiences
    const lines = experiences.map(exp => JSON.stringify(exp)).join("\n")
    fs.writeFileSync(this.experiencePath, lines + "\n", "utf-8")

    console.log(`[ExperienceStore] Compacted: kept ${experiences.length} experiences`)
  }
}
