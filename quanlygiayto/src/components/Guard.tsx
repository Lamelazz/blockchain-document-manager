import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { currentUser, hasRole, Role } from '@/services/auth'

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const user = currentUser()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ redirect: loc.pathname }} />
  return children
}

export function RequireRole({ role, children }: { role: Role; children: React.ReactElement }) {
  const ok = hasRole(role)
  const loc = useLocation()
  if (!ok) return <Navigate to="/login" replace state={{ redirect: loc.pathname }} />
  return children
}
