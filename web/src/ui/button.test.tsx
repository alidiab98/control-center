import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button.js'
import { IconButton } from './icon-button.js'

describe('Button', () => {
  it('is keyboard reachable and reports clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Allow once</Button>)

    const button = screen.getByRole('button', { name: 'Allow once' })
    await userEvent.tab()
    expect(button).toHaveFocus()

    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Deny
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Deny' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('defaults to type=button so it never submits a form by accident', () => {
    render(<Button>Send</Button>)
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'button')
  })
})

describe('IconButton', () => {
  it('exposes its accessible name', () => {
    render(<IconButton aria-label="Remove image">x</IconButton>)
    expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument()
  })
})
