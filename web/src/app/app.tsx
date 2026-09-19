import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ApiProvider, createQueryClient } from '@/api/index.js'
import { routes } from './routes.js'

const router = createBrowserRouter(routes)

export function App() {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <RouterProvider router={router} />
      </ApiProvider>
    </QueryClientProvider>
  )
}
