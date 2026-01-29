/**
 * Learning Tools Index
 *
 * Exports all learning system tools for integration.
 */

export {
  setExperienceStore,
  getExperienceStore,
  learningExperienceTool
} from './learning-experience'

export {
  setKnowledgeGraph,
  getKnowledgeGraph,
  learningKnowledgeTool
} from './learning-knowledge'

export {
  setPatternDetector,
  getPatternDetector,
  learningPatternTool
} from './learning-pattern'

export {
  setStateMachine,
  getStateMachine,
  learningFsmTool
} from './learning-fsm'

export {
  setLearningStatsSystems,
  learningStatsTool
} from './learning-stats'

/**
 * Initialize all learning tools with their respective systems
 */
export function initializeLearningTools(systems: {
  experienceStore: any
  knowledgeGraph: any
  patternDetector: any
  stateMachine: any
  fsrsScheduler?: any
}) {
  const { experienceStore, knowledgeGraph, patternDetector, stateMachine, fsrsScheduler } = systems

  // Set system instances in each tool module
  const { setExperienceStore } = await import('./learning-experience')
  const { setKnowledgeGraph } = await import('./learning-knowledge')
  const { setPatternDetector } = await import('./learning-pattern')
  const { setStateMachine } = await import('./learning-fsm')
  const { setLearningStatsSystems } = await import('./learning-stats')

  setExperienceStore(experienceStore)
  setKnowledgeGraph(knowledgeGraph)
  setPatternDetector(patternDetector)
  setStateMachine(stateMachine)
  setLearningStatsSystems({ experienceStore, knowledgeGraph, patternDetector, stateMachine, fsrsScheduler })

  console.log("[LearningTools] All learning tools initialized")

  return {
    experienceTool: (await import('./learning-experience')).learningExperienceTool,
    knowledgeTool: (await import('./learning-knowledge')).learningKnowledgeTool,
    patternTool: (await import('./learning-pattern')).learningPatternTool,
    fsmTool: (await import('./learning-fsm')).learningFsmTool,
    statsTool: (await import('./learning-stats')).learningStatsTool
  }
}
