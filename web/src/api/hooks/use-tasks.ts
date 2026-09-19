import {
  taskSchema,
  tgMessageSchema,
  timelineEventSchema,
  trackerStatusSchema,
} from '@control-center/shared'
import type { ID, Task } from '@control-center/shared'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { useApi } from '../use-api.js'
import { queryKeys } from '../query-keys.js'
import { useCurrentProject } from './use-home.js'

export function useTasks(projectId: ID | undefined) {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.tasks(projectId ?? 'unknown'),
    queryFn: async () => taskSchema.array().parse(await api.getTasks(projectId ?? '')),
    enabled: projectId !== undefined,
  })
}

/** Tasks of the current project, which is what every screen in this phase means by "tasks". */
export function useProjectTasks() {
  const project = useCurrentProject()
  return useTasks(project.data?.id)
}

export function useTask(taskId: ID | undefined) {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.task(taskId ?? 'unknown'),
    queryFn: async () => taskSchema.parse(await api.getTask(taskId ?? '')),
    enabled: taskId !== undefined,
  })
}

/** Routes address tasks by key ("ST-412"), the contract addresses them by id. */
export function useTaskByKey(key: string | undefined): UseQueryResult<Task | null> {
  const project = useCurrentProject()
  const api = useApi()
  const projectId = project.data?.id

  return useQuery({
    queryKey: queryKeys.taskByKey(projectId ?? 'unknown', key ?? ''),
    queryFn: async () => {
      const tasks = taskSchema.array().parse(await api.getTasks(projectId ?? ''))
      return tasks.find((task) => task.key === key) ?? null
    },
    enabled: projectId !== undefined && key !== undefined,
  })
}

export function useTimeline(taskId: ID | undefined) {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.timeline(taskId ?? 'unknown'),
    queryFn: async () => timelineEventSchema.array().parse(await api.getTimeline(taskId ?? '')),
    enabled: taskId !== undefined,
  })
}

export function useAllowedTransitions(taskId: ID | undefined) {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.allowedTransitions(taskId ?? 'unknown'),
    queryFn: async () =>
      trackerStatusSchema.array().parse(await api.getAllowedTransitions(taskId ?? '')),
    enabled: taskId !== undefined,
  })
}

export function useLinkedMessages(taskId: ID | undefined) {
  const api = useApi()
  return useQuery({
    queryKey: queryKeys.linkedMessages(taskId ?? 'unknown'),
    queryFn: async () => tgMessageSchema.array().parse(await api.getLinkedMessages(taskId ?? '')),
    enabled: taskId !== undefined,
  })
}
