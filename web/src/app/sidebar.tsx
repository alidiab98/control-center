import { NavLink, useLocation } from 'react-router-dom'
import { useNavCounters } from '@/api/index.js'
import { Badge, cn } from '@/ui/index.js'
import { DevSlotWidget } from './dev-slot-widget.js'
import { NAV_ITEMS, counterFor } from './nav-items.js'

/** Fixed 208px rail: brand, nav with live counters, dev slot at the bottom. */
export function Sidebar() {
  const counters = useNavCounters()
  const { search } = useLocation()

  return (
    <nav aria-label="Main" className="flex h-screen w-52 shrink-0 flex-col border-r bg-rail">
      <p className="px-4 py-6 font-mono text-sm font-semibold text-text">
        control<span className="text-muted">/</span>center
      </p>

      <ul className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const counter = counterFor(counters, item)
          return (
            <li key={item.path}>
              <NavLink
                to={{ pathname: item.path, search }}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-11 items-center justify-between rounded-control px-3 text-sm',
                    'transition-colors',
                    isActive ? 'bg-panel-2 text-text' : 'text-text-2 hover:bg-panel',
                  )
                }
              >
                <span>{item.label}</span>{' '}
                {counter?.isError === true && (
                  <span className="text-xs text-attention" title="Counter unavailable">
                    !
                  </span>
                )}
                {counter?.value !== undefined && (
                  <Badge count={counter.value} tone={item.tone ?? 'muted'} />
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto p-3">
        <DevSlotWidget />
      </div>
    </nav>
  )
}
