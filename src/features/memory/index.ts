/**
 * Memory Integration
 *
 * Provides a native memory system for Kraken Code.
 */

export interface MemoryProvider {
  name: string
}

export type MemoryImportance = "low" | "medium" | "high"

export interface MemoryEntryInput {
  summary: string
  content: string
  tags?: string[]
  importance?: MemoryImportance
}

export interface MemoryEntry extends MemoryEntryInput {
  id: string
  createdAt: string
}

const memoryEntries: MemoryEntry[] = []

export class NativeMemory implements MemoryProvider {
  name = "Native"

  async store(_key: string, _value: any): Promise<void> {
    return
  }

  async retrieve(_key: string): Promise<any> {
    return null
  }
}

export const memory = {
  native: new NativeMemory()
}

export async function initializeMemory(): Promise<{ ready: boolean }> {
  return { ready: true }
}

export async function saveMemory(input: MemoryEntryInput): Promise<MemoryEntry> {
  const entry: MemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    tags: input.tags ?? [],
    importance: input.importance ?? "medium",
    summary: input.summary,
    content: input.content,
  }

  memoryEntries.push(entry)
  return entry
}

export async function searchMemories(query: string): Promise<MemoryEntry[]> {
  const normalizedQuery = query.toLowerCase()

  return memoryEntries.filter((entry) => {
    const tags = entry.tags?.join(" ").toLowerCase() ?? ""
    return (
      entry.summary.toLowerCase().includes(normalizedQuery) ||
      entry.content.toLowerCase().includes(normalizedQuery) ||
      tags.includes(normalizedQuery)
    )
  })
}
