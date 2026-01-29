/**
 * FSRS (Free Spaced Repetition Scheduler)
 * 
 * Optimizes review timing based on Ebbinghaus forgetting curve.
 * Adaptive intervals based on recall difficulty.
 */

import * as fs from "fs"
import * as path from "path"
import type { FSRSItem, FSRSSchedule } from "./types-unified"

export class FSRScheduler {
  private itemsPath: string
  private items: Map<string, FSRSItem>
  private initialIntervals: number[]

  constructor(storagePath: string, config?: { initialIntervals?: number[] }) {
    const fsrsDir = path.join(storagePath, "fsrs")
    this.itemsPath = path.join(fsrsDir, "items.json")
    this.items = new Map()
    this.initialIntervals = config?.initialIntervals || [1, 3, 7, 14, 30, 60, 120, 240, 480]

    this.ensureStorage()
    this.loadItems()
  }

  private ensureStorage() {
    const dir = path.dirname(this.itemsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  private loadItems() {
    if (fs.existsSync(this.itemsPath)) {
      const data = fs.readFileSync(this.itemsPath, "utf-8")
      const itemsArray = JSON.parse(data) as FSRSItem[]

      for (const item of itemsArray) {
        this.items.set(item.id, item)
      }

      console.log(`[FSRS] Loaded ${this.items.size} items`)
    }
  }

  private saveItems() {
    const itemsArray = Array.from(this.items.values())
    fs.writeFileSync(this.itemsPath, JSON.stringify(itemsArray, null, 2), "utf-8")
  }

  /**
   * Create a new FSRS item
   */
  createItem(id: string, ease: number = 5): FSRSItem {
    const now = new Date()

    const item: FSRSItem = {
      id,
      ease,
      intervalDays: [...this.initialIntervals],
      nextReviewDate: this.addDays(now, this.initialIntervals[0]).toISOString(),
      reviewCount: 0
    }

    this.items.set(id, item)
    this.saveItems()

    return item
  }

  /**
   * Schedule reviews for an item
   */
  scheduleReviews(itemId: string): FSRSSchedule[] {
    const item = this.items.get(itemId)

    if (!item) {
      // Create new item
      this.createItem(itemId)
      return this.scheduleReviews(itemId)
    }

    const schedules: FSRSSchedule[] = []
    let currentDate = new Date()

    for (let i = 0; i < item.intervalDays.length; i++) {
      const intervalDays = item.intervalDays[i]
      const nextReviewDate = this.addDays(currentDate, intervalDays)

      schedules.push({
        itemId,
        nextReviewDate: nextReviewDate.toISOString(),
        intervalDays
      })

      currentDate = nextReviewDate
    }

    return schedules
  }

  /**
   * Update ease factor based on recall
   */
  async updateEase(itemId: string, recalled: boolean): Promise<number> {
    const item = this.items.get(itemId)

    if (!item) {
      throw new Error(`Item not found: ${itemId}`)
    }

    let newEase = item.ease

    // If not recalled, increase ease (harder = review more often)
    // If recalled easily, decrease ease (easier = review less often)
    if (!recalled) {
      newEase = Math.min(10, item.ease + 1)
    } else {
      newEase = Math.max(1, item.ease - 1)
    }

    item.ease = newEase
    item.reviewCount++
    item.lastReviewDate = new Date().toISOString()

    // Recalculate next review based on new ease
    const nextInterval = this.calculateNextInterval(item)
    item.nextReviewDate = this.addDays(new Date(), nextInterval).toISOString()

    this.items.set(itemId, item)
    this.saveItems()

    return newEase
  }

  /**
   * Calculate next interval based on ease
   */
  private calculateNextInterval(item: FSRSItem): number {
    // Higher ease = smaller index = smaller intervals
    const easeIndex = Math.min(item.ease - 1, this.initialIntervals.length - 1)
    
    // Apply ease factor to intervals
    const baseInterval = this.initialIntervals[easeIndex]
    const easeFactor = 1 - (item.ease / 20) // Slightly reduce interval as ease increases

    return Math.max(1, Math.floor(baseInterval * easeFactor))
  }

  /**
   * Get items due for review
   */
  getDueItems(): FSRSItem[] {
    const now = new Date()
    const due: FSRSItem[] = []

    for (const item of this.items.values()) {
      const nextReview = new Date(item.nextReviewDate)
      if (nextReview <= now) {
        due.push(item)
      }
    }

    return due
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): FSRSItem | null {
    return this.items.get(itemId) || null
  }

  /**
   * Delete an item
   */
  deleteItem(itemId: string): void {
    this.items.delete(itemId)
    this.saveItems()
  }

  /**
   * Get all items
   */
  getAllItems(): FSRSItem[] {
    return Array.from(this.items.values())
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalItems: number
    itemsDue: number
    avgEase: number
    avgReviewsPerItem: number
    byEase: Record<number, number>
  } {
    const items = Array.from(this.items.values())
    const dueCount = this.getDueItems().length

    const totalEase = items.reduce((sum, item) => sum + item.ease, 0)
    const avgEase = items.length > 0 ? totalEase / items.length : 0

    const totalReviews = items.reduce((sum, item) => sum + item.reviewCount, 0)
    const avgReviewsPerItem = items.length > 0 ? totalReviews / items.length : 0

    const byEase: Record<number, number> = {}
    for (const item of items) {
      byEase[item.ease] = (byEase[item.ease] || 0) + 1
    }

    return {
      totalItems: items.length,
      itemsDue: dueCount,
      avgEase,
      avgReviewsPerItem,
      byEase
    }
  }

  /**
   * Helper: Add days to date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  /**
   * Reset an item (start over)
   */
  resetItem(itemId: string): void {
    const item = this.items.get(itemId)

    if (!item) {
      throw new Error(`Item not found: ${itemId}`)
    }

    // Reset to initial state
    item.ease = 5
    item.intervalDays = [...this.initialIntervals]
    item.nextReviewDate = this.addDays(new Date(), this.initialIntervals[0]).toISOString()
    item.reviewCount = 0
    item.lastReviewDate = undefined

    this.items.set(itemId, item)
    this.saveItems()
  }

  /**
   * Export all items
   */
  exportItems(): FSRSItem[] {
    return Array.from(this.items.values())
  }

  /**
   * Import items (merge with existing)
   */
  importItems(items: FSRSItem[]): void {
    for (const item of items) {
      if (!this.items.has(item.id)) {
        this.items.set(item.id, item)
      }
    }

    this.saveItems()
  }
}
