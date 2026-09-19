import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './avatar.js'

describe('Avatar', () => {
  it('shows the initials it is given', () => {
    const { container } = render(<Avatar initials="DT" />)
    expect(container.textContent).toBe('DT')
  })

  it('picks the same colour for the same seed', () => {
    const first = render(<Avatar initials="DT" seed="chat-dev" />).container.firstElementChild
    const second = render(<Avatar initials="XX" seed="chat-dev" />).container.firstElementChild
    expect(first?.className).toBe(second?.className)
  })

  it('is hidden from assistive technology, since the name is shown next to it', () => {
    const { container } = render(<Avatar initials="DT" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
