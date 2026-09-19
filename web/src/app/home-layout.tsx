import { Outlet } from 'react-router-dom'
import { HomeTopBar } from './home-top-bar.js'

/** Wraps the home routes with the top bar, which belongs to the shell, not to F1. */
export function HomeLayout() {
  return (
    <>
      <HomeTopBar />
      <Outlet />
    </>
  )
}
