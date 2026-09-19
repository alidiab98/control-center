import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './app.js'

describe('App', () => {
  it('renders the brand', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'control/center' })).toBeInTheDocument()
  })
})
