/**
 * Learning System Hooks
 *
 * Entry point for all learning-related hooks.
 * Integrates four-layer learning architecture with OpenCode.
 */

import type { PluginInput } from "@opencode-ai/plugin"
import type { Hooks } from "@opencode-ai/plugin"
import type { ExperienceStore } from "../../features/learning/experience-store"
import type { KnowledgeGraphStore } from "../../features/learning/knowledge-graph"
import type { PatternDetector } from "../../features/learning/pattern-detection"
import type { StateMachineEngine } from "../../features/learning/state-machine"
import type { FSRScheduler } from "../../features/learning/fsrs-scheduler"
import type { LearningSystemContext } from "../../types/learning-context"

export {
  createExperienceRecorderHook,
  type ExperienceRecorderHookOptions
} from "./experience-recorder-hook"

export {
  createContextInjectorHook,
  type ContextInjectorHookOptions
,24,38c
} from "./context-injector-hook"
,24,38c

,24,38c
export {
,24,38c
  createSynthesisTriggerHook,
,24,38c
  type SynthesisTriggerHookOptions
,24,38c
} from "./synthesis-trigger-hook"
,24,38c

,24,38c
/**
,24,38c
 * Create all learning hooks at once
,24,38c
 *
,24,38c
 * This is the main entry point for integrating learning system
,24,38c
 * into Kraken-Code via hooks.
,24,38c
 */
,24,38c
export function createLearningHooks(
  input: PluginInput,
  context: LearningSystemContext,
  options?: {
    experienceRecorder?: ExperienceRecorderHookOptions
    contextInjector?: ContextInjectorHookOptions
    synthesisTrigger?: SynthesisTriggerHookOptions
  }
): Hooks {
  const config = (input as any).config || {}
  const learningConfig = config.learning || {}

  if (learningConfig.enabled === false) {
    console.log("[LearningHooks] Learning system disabled")
    return {}
  }

  console.log("[LearningHooks] Creating learning hooks...")

  // Create individual hooks
  const experienceRecorderHooks = createExperienceRecorderHook(
    input,
    context,
    options?.experienceRecorder
  )

  const contextInjectorHooks = createContextInjectorHook(
    input,
    context,
    options?.contextInjector
  )

  const synthesisTriggerHooks = createSynthesisTriggerHook(
    input,
    context,
    options?.synthesisTrigger
  )

  // Merge all hooks
  const mergedHooks: Hooks = {}
  Object.assign(mergedHooks, experienceRecorderHooks)
  Object.assign(mergedHooks, contextInjectorHooks)
  Object.assign(mergedHooks, synthesisTriggerHooks)

  console.log(
    `[LearningHooks] Created ${Object.keys(mergedHooks).length} hooks: ` +
    `${Object.keys(mergedHooks).join(", ")}`
  )

  return mergedHooks
}
