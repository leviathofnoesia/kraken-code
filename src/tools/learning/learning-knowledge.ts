/**
 * Learning Knowledge Tool
 *
 * Tool for interacting with knowledge graph.
 * Supports adding nodes, creating relationships, and querying graph.
 */

import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import type { KnowledgeGraphStore } from "../../features/learning/knowledge-graph"

export function createKnowledgeTool(knowledgeGraph: KnowledgeGraphStore) {
  return tool({
    description:
      "Manage knowledge graph of entities and relationships. " +
      "Use this tool to store important concepts, their properties, and how they relate to each other.",
    args: {
      action: z.enum(["addNode", "addEdge", "getNode", "search", "list"]).describe(
        "Action to perform: 'addNode', 'addEdge', 'getNode', 'search', 'list'"
      ),
      nodeId: z
        .string()
        .optional()
        .describe("Node ID (for addNode, getNode)"),
      type: z
        .string()
        .optional()
        .describe("Node type: person, concept, tool, pattern, file, api, error (for addNode)"),
      data: z
        .object({})
        .passthrough()
        .optional()
        .describe("Data to store with the node (for addNode)"),
      source: z
        .enum(["experience", "manual", "inference"])
        .optional()
        .describe("Source of the node (for addNode)"),
      fromNodeId: z
        .string()
        .optional()
        .describe("Source node ID (for addEdge)"),
      toNodeId: z
        .string()
        .optional()
        .describe("Target node ID (for addEdge)"),
      edgeType: z
        .enum(["relatedTo", "conflictsWith", "dependsOn"])
        .optional()
        .describe("Relationship type (for addEdge)"),
      weight: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Relationship strength: 0-1 (for addEdge)"),
      query: z
        .string()
        .optional()
        .describe("Query text (for search action)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum results (for search/list, default: 10)"),
      byType: z
        .string()
        .optional()
        .describe("Filter by node type (for list action)")
    },
    async execute(args) {
      const {
        action,
        nodeId,
        type,
        data,
        source,
        fromNodeId,
        toNodeId,
        edgeType,
        weight,
        query,
        limit,
        byType
      } = args

      try {
        switch (action) {
          case "addNode": {
            if (!nodeId || !type) {
              return JSON.stringify({
                success: false,
                error: "Missing required fields: nodeId and type are required"
              }, null, 2)
            }

            const node = await knowledgeGraph.addNode(
              nodeId,
              type as any,
              data || {},
              source || "manual"
            )

            return JSON.stringify({
              success: true,
              message: "Node added successfully",
              node: {
                id: node.id,
                type: node.type,
                importance: node.importance,
                strength: node.strength
              }
            }, null, 2)
          }

          case "addEdge": {
            if (!fromNodeId || !toNodeId || !edgeType) {
              return JSON.stringify({
                success: false,
                error: "Missing required fields: fromNodeId, toNodeId, and edgeType are required"
              }, null, 2)
            }

            await knowledgeGraph.addEdge(
              fromNodeId,
              toNodeId,
              edgeType as any,
              weight || 1
            )

            return JSON.stringify({
              success: true,
              message: "Edge added successfully",
              fromNodeId,
              toNodeId,
              edgeType
            }, null, 2)
          }

          case "getNode": {
            if (!nodeId) {
              return JSON.stringify({
                success: false,
                error: "Missing required field: nodeId"
              }, null, 2)
            }

            const node = knowledgeGraph.getNode(nodeId)

            if (!node) {
              return JSON.stringify({
                success: false,
                error: `Node not found: ${nodeId}`
              }, null, 2)
            }

            return JSON.stringify({
              success: true,
              node: {
                id: node.id,
                type: node.type,
                data: node.data,
                relations: node.relations,
                importance: node.importance,
                strength: node.strength,
                lastAccessed: node.lastAccessed,
                accessCount: node.accessCount,
                metadata: node.metadata
              }
            }, null, 2)
          }

          case "search": {
            if (!query) {
              return JSON.stringify({
                success: false,
                error: "Missing required field: query"
              }, null, 2)
            }

            const results = knowledgeGraph.search(query, byType)
            const limited = results.slice(0, limit || 10)

            return JSON.stringify({
              success: true,
              count: limited.length,
              nodes: limited.map((node: any) => ({
                id: node.id,
                type: node.type,
                importance: node.importance,
                strength: node.strength
              }))
            }, null, 2)
          }

          case "list": {
            const allNodes = knowledgeGraph.getAllNodes()
            let filtered = allNodes

            if (byType) {
              filtered = filtered.filter((n: any) => n.type === byType)
            }

            const limited = filtered.slice(0, limit || 10)

            return JSON.stringify({
              success: true,
              count: limited.length,
              total: filtered.length,
              nodes: limited.map((node: any) => ({
                id: node.id,
                type: node.type,
                importance: node.importance,
                strength: node.strength
              }))
            }, null, 2)
          }

          default:
            return JSON.stringify({
              success: false,
              error: `Unknown action: ${action}. Valid actions: addNode, addEdge, getNode, search, list`
            }, null, 2)
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }, null, 2)
      }
    }
  })
}
