import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs } from './tabs.js'

const items = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'diff', label: 'Diff' },
  { id: 'plan', label: 'Plan' },
]

describe('Tabs', () => {
  it('marks the active tab and reports clicks', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} activeId="terminal" onChange={onChange} label="Task views" />)

    expect(screen.getByRole('tab', { name: 'Terminal' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: 'Diff' }))
    expect(onChange).toHaveBeenCalledWith('diff')
  })

  it('moves with the arrow keys and wraps around', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} activeId="terminal" onChange={onChange} label="Task views" />)

    await userEvent.click(screen.getByRole('tab', { name: 'Terminal' }))
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith('plan')

    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('diff')
  })
})
