import { describe, expect, it } from 'vitest'
import { CONTRACT_VERSION } from './index.js'

describe('shared', () => {
  it('exposes a contract version', () => {
    expect(CONTRACT_VERSION).toBe('0')
  })
})
