import { lazy, Suspense } from 'react'

const AdminPage = lazy(() => import('../pages/AdminWorkspace.jsx'))

export default function AdminRoute() {
  return (
    <Suspense fallback={<div role="status" className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Loading admin workspace...</div>}>
      <AdminPage />
    </Suspense>
  )
}