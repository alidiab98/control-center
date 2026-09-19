import type { Project } from '@control-center/shared'
import { PROJECT_ID } from './ids.js'

export const createProjects = (): Project[] => [
  {
    id: PROJECT_ID,
    name: 'Transcribe',
    repoPath: '~/projects/transcribe',
    trackerQueue: 'ST',
    tgFolderId: 7,
  },
]
