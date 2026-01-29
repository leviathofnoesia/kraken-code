/**
 * Layer 2: Knowledge Graph
 * 
 * Entity-based storage with relationships.
 * Not flat vectors - explicit, inspectable relationships.
 */

import * as fs from "fs"
import * as path from "path"
import type { KnowledgeNode, KnowledgeEdge, KnowledgeGraph } from "./types-unified"

export class KnowledgeGraphStore {
  private nodesPath: string
  private edgesPath: string
  private indexPath: string
  private graph: KnowledgeGraph
  private maxNodes: number

  constructor(storagePath: string, config?: { maxNodes?: number }) {
    const kgDir = path.join(storagePath, "knowledge_graph")
    this.nodesPath = path.join(kgDir, "nodes.json")
    this.edgesPath = path.join(kgDir, "edges.json")
    this.indexPath = path.join(kgDir, "indexes.json")
    this.maxNodes = config?.maxNodes || 10000

    this.graph = {
      nodes: {},
      edges: [],
      indexes: {
        byType: {},
        byImportance: [],
        byTag: {}
      }
    }

    this.ensureStorage()
    this.loadGraph()
  }

  private ensureStorage() {
    const dir = path.dirname(this.nodesPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  private loadGraph() {
    // Load nodes
    if (fs.existsSync(this.nodesPath)) {
      const nodesData = fs.readFileSync(this.nodesPath, "utf-8")
      this.graph.nodes = JSON.parse(nodesData)
    }

    // Load edges
    if (fs.existsSync(this.edgesPath)) {
      const edgesData = fs.readFileSync(this.edgesPath, "utf-8")
      this.graph.edges = JSON.parse(edgesData)
    }

    // Load indexes
    if (fs.existsSync(this.indexPath)) {
      const indexesData = fs.readFileSync(this.indexPath, "utf-8")
      this.graph.indexes = JSON.parse(indexesData)
    }

    console.log(`[KnowledgeGraph] Loaded ${Object.keys(this.graph.nodes).length} nodes, ${this.graph.edges.length} edges`)
  }

  private saveGraph() {
    fs.writeFileSync(this.nodesPath, JSON.stringify(this.graph.nodes, null, 2), "utf-8")
    fs.writeFileSync(this.edgesPath, JSON.stringify(this.graph.edges, null, 2), "utf-8")
    fs.writeFileSync(this.indexPath, JSON.stringify(this.graph.indexes, null, 2), "utf-8")
  }

  /**
   * Add or update a node
   */
  async addNode(
    id: string,
    type: KnowledgeNode["type"],
    data: Record<string, any>,
    source: "experience" | "manual" | "inference" = "manual"
  ): Promise<KnowledgeNode> {
    const now = new Date().toISOString()

    if (this.graph.nodes[id]) {
      // Update existing node
      const existing = this.graph.nodes[id]
      existing.data = { ...existing.data, ...data }
      existing.metadata.updated = now
      existing.lastAccessed = now
      existing.accessCount++
      this.graph.nodes[id] = existing
    } else {
      // Create new node
      const newNode: KnowledgeNode = {
        id,
        type,
        data,
        relations: {
          relatedTo: [],
          conflictsWith: [],
          dependsOn: []
        },
        importance: 5, // Default importance
        strength: 0.8, // Default confidence
        lastAccessed: now,
        accessCount: 0,
        metadata: {
          tags: data.tags || [],
          source,
          created: now,
          updated: now
        }
      }

      this.graph.nodes[id] = newNode
      this.updateIndexes(newNode)
    }

    this.saveGraph()
    return this.graph.nodes[id]
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): KnowledgeNode | null {
    const node = this.graph.nodes[id]
    if (node) {
      node.lastAccessed = new Date().toISOString()
      node.accessCount++
      this.saveGraph()
    }
    return node || null
  }

  /**
   * Add a relationship (edge) between nodes
   */
  async addEdge(
    from: string,
    to: string,
    type: KnowledgeEdge["type"],
    weight: number = 1
  ): Promise<void> {
    // Check if edge already exists
    const existing = this.graph.edges.find(
      e => e.from === from && e.to === to && e.type === type
    )

    if (existing) {
      // Update weight
      existing.weight = weight
    } else {
      // Create new edge
      const newEdge: KnowledgeEdge = { from, to, type, weight }
      this.graph.edges.push(newEdge)

      // Update node relations
      const fromNode = this.graph.nodes[from]
      const toNode = this.graph.nodes[to]

      if (fromNode) {
        switch (type) {
          case "relates_to":
            fromNode.relations.relatedTo.push(to)
            break
          case "conflicts_with":
            fromNode.relations.conflictsWith.push(to)
            break
          case "depends_on":
            fromNode.relations.dependsOn.push(to)
            break
        }
      }

      // Add reverse relationship for bidirectional edges
      if (type === "relates_to" && toNode) {
        toNode.relations.relatedTo.push(from)
      }
    }

    this.saveGraph()
  }

  /**
   * Query nodes by type
   */
  getNodesByType(type: KnowledgeNode["type"]): KnowledgeNode[] {
    const nodeIds = this.graph.indexes.byType[type] || []
    return nodeIds
      .map(id => this.graph.nodes[id])
      .filter(n => n !== undefined)
  }

  /**
   * Query nodes by tag
   */
  getNodesByTag(tag: string): KnowledgeNode[] {
    const nodeIds = this.graph.indexes.byTag[tag] || []
    return nodeIds
      .map(id => this.graph.nodes[id])
      .filter(n => n !== undefined)
  }

  /**
   * Get important nodes (sorted by importance)
   */
  getImportantNodes(limit: number = 10): KnowledgeNode[] {
    const nodeIds = this.graph.indexes.byImportance.slice(0, limit)
    return nodeIds
      .map(id => this.graph.nodes[id])
      .filter(n => n !== undefined)
  }

  /**
   * Get related nodes (neighbors)
   */
  getRelatedNodes(nodeId: string): { node: KnowledgeNode; edge: KnowledgeEdge }[] {
    const related: { node: KnowledgeNode; edge: KnowledgeEdge }[] = []

    for (const edge of this.graph.edges) {
      if (edge.from === nodeId) {
        const node = this.graph.nodes[edge.to]
        if (node) {
          related.push({ node, edge })
        }
      } else if (edge.to === nodeId) {
        const node = this.graph.nodes[edge.from]
        if (node) {
          related.push({ node, edge })
        }
      }
    }

    return related
  }

  /**
   * Find path between nodes (BFS)
   */
  findPath(fromId: string, toId: string): KnowledgeNode[] | null {
    if (!this.graph.nodes[fromId] || !this.graph.nodes[toId]) {
      return null
    }

    if (fromId === toId) {
      return [this.graph.nodes[fromId]]
    }

    const visited = new Set<string>()
    const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }]

    while (queue.length > 0) {
      const { id, path } = queue.shift()!

      if (id === toId) {
        return path.map(p => this.graph.nodes[p]!)
      }

      visited.add(id)

      // Get neighbors
      const neighbors = this.graph.edges
        .filter(e => e.from === id || e.to === id)
        .map(e => e.from === id ? e.to : e.from)

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ id: neighbor, path: [...path, neighbor] })
        }
      }
    }

    return null // No path found
  }

  /**
   * Get relevant context for a query
   */
  async getRelevantContext(query: string): Promise<{
    nodes: KnowledgeNode[]
    relationships: KnowledgeEdge[]
  }> {
    const queryLower = query.toLowerCase()
    const keywords = this.extractKeywords(queryLower)

    const relevantNodes: KnowledgeNode[] = []

    // Search by keyword matching
    for (const [id, node] of Object.entries(this.graph.nodes)) {
      const nodeText = `${node.id} ${JSON.stringify(node.data)}`.toLowerCase()
      const matchCount = keywords.filter(kw => nodeText.includes(kw)).length

      if (matchCount > 0) {
        relevantNodes.push(node)
      }
    }

    // Sort by relevance (importance + match count)
    relevantNodes.sort((a, b) => b.importance - a.importance)

    // Get relationships between relevant nodes
    const relevantNodeIds = new Set(relevantNodes.map(n => n.id))
    const relevantEdges = this.graph.edges.filter(
      e => relevantNodeIds.has(e.from) && relevantNodeIds.has(e.to)
    )

    return {
      nodes: relevantNodes.slice(0, 10),
      relationships: relevantEdges
    }
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    const words = query.split(/\s+/)
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
   * Update indexes for a node
   */
  private updateIndexes(node: KnowledgeNode) {
    // By type
    if (!this.graph.indexes.byType[node.type]) {
      this.graph.indexes.byType[node.type] = []
    }
    this.graph.indexes.byType[node.type].push(node.id)

    // By importance
    this.graph.indexes.byImportance.push(node.id)
    this.graph.indexes.byImportance.sort((a, b) => {
      const aImp = this.graph.nodes[a]?.importance || 0
      const bImp = this.graph.nodes[b]?.importance || 0
      return bImp - aImp
    })

    // By tags
    for (const tag of node.metadata.tags) {
      if (!this.graph.indexes.byTag[tag]) {
        this.graph.indexes.byTag[tag] = []
      }
      this.graph.indexes.byTag[tag].push(node.id)
    }

    // Enforce max nodes
    if (Object.keys(this.graph.nodes).length > this.maxNodes) {
      this.pruneLeastImportant()
    }
  }

  /**
   * Prune least important nodes
   */
  private pruneLeastImportant() {
    const nodeIds = this.graph.indexes.byImportance.slice(this.maxNodes)
    
    for (const id of nodeIds) {
      delete this.graph.nodes[id]
      
      // Remove edges
      this.graph.edges = this.graph.edges.filter(e => e.from !== id && e.to !== id)
    }

    // Update indexes
    this.graph.indexes.byImportance = this.graph.indexes.byImportance.slice(0, this.maxNodes)

    console.log(`[KnowledgeGraph] Pruned ${nodeIds.length} nodes`)
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalNodes: number
    totalEdges: number
    byType: Record<string, number>
    avgImportance: number
    avgStrength: number
  } {
    const byType: Record<string, number> = {}

    for (const node of Object.values(this.graph.nodes)) {
      byType[node.type] = (byType[node.type] || 0) + 1
    }

    const totalImportance = Object.values(this.graph.nodes).reduce((sum, n) => sum + n.importance, 0)
    const totalStrength = Object.values(this.graph.nodes).reduce((sum, n) => sum + n.strength, 0)

    return {
      totalNodes: Object.keys(this.graph.nodes).length,
      totalEdges: this.graph.edges.length,
      byType,
      avgImportance: totalImportance / Object.keys(this.graph.nodes).length || 0,
      avgStrength: totalStrength / Object.keys(this.graph.nodes).length || 0
    }
  }

  /**
   * Export graph to JSON
   */
  exportGraph(): KnowledgeGraph {
    return JSON.parse(JSON.stringify(this.graph))
  }

  /**
   * Search nodes by query
   */
  search(query: string, type?: string): KnowledgeNode[] {
    const queryLower = query.toLowerCase()
    const keywords = this.extractKeywords(queryLower)

    const results: KnowledgeNode[] = []

    for (const node of Object.values(this.graph.nodes)) {
      // Type filter
      if (type && node.type !== type) {
        continue
      }

      // Keyword matching
      const nodeText = `${node.id} ${JSON.stringify(node.data)}`.toLowerCase()
      const matchCount = keywords.filter(kw => nodeText.includes(kw)).length

      if (matchCount > 0) {
        results.push(node)
      }
    }

    // Sort by relevance (importance + access count)
    results.sort((a, b) => {
      const scoreA = a.importance * 10 + a.accessCount
      const scoreB = b.importance * 10 + b.accessCount
      return scoreB - scoreA
    })

    return results
  }

  /**
   * Get all nodes
   */
  getAllNodes(): KnowledgeNode[] {
    return Object.values(this.graph.nodes)
  }

  /**
   * Get all edges
   */
  getAllEdges(): KnowledgeEdge[] {
    return this.graph.edges
  }
}
