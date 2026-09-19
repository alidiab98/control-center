import {
  agentSessionSchema,
  deploySlotSchema,
  projectSchema,
  queueItemSchema,
  statsSchema,
} from '@control-center/shared'
import type { Project } from '@control-center/shared'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'

/**
 * Read hooks for the home screen and the shell. Every response is parsed with the shared
 * schemas, so a backend that drifts from the contract fails loudly here (CLAUDE.md rule 2).
 */

export function useProjects(): UseQueryResult<Project[]> {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => projectSchema.array().parse(await api.getProjects()),
  })
}

/** The project everything else hangs off. One project for now; a switcher arrives in F5. */
export function useCurrentProject(): UseQueryResult<Project | null> {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => projectSchema.array().parse(await api.getProjects()),
    select: (projects) => projects[0] ?? null,
  })
}

export function useQueue() {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: async () => queueItemSchema.array().parse(await api.getQueue()),
  })
}

export function useAgents() {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: async () => agentSessionSchema.array().parse(await api.getAgents()),
  })
}

export function useStats() {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => statsSchema.parse(await api.getStats()),
  })
}

export function useDeploySlot() {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.deploySlot,
    queryFn: async () => deploySlotSchema.parse(await api.getDeploySlot()),
  })
}
