import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataRegion } from './data-region.js'

describe('DataRegion', () => {
  it('announces loading', () => {
    render(
      <DataRegion label="the queue" isPending isError={false}>
        <p>content</p>
      </DataRegion>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading the queue')
  })

  it('shows the error with a retry action', async () => {
    const onRetry = vi.fn()
    render(
      <DataRegion
        label="the queue"
        isPending={false}
        isError
        error={new Error('mock failure: getQueue')}
        onRetry={onRetry}
      >
        <p>content</p>
      </DataRegion>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the queue')
    expect(screen.getByRole('alert')).toHaveTextContent('mock failure: getQueue')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows the empty state instead of children', () => {
    render(
      <DataRegion
        label="the queue"
        isPending={false}
        isError={false}
        isEmpty
        emptyTitle="Nothing needs you"
      >
        <p>content</p>
      </DataRegion>,
    )
    expect(screen.getByText('Nothing needs you')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders children once data is there', () => {
    render(
      <DataRegion label="the queue" isPending={false} isError={false}>
        <p>content</p>
      </DataRegion>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
