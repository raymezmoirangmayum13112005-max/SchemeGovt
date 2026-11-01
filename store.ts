'use client'

import { useSyncExternalStore } from 'react'
import type { CitizenProfile } from './types'

export type AppState = {
  profile: CitizenProfile | null
  saved: string[]
  collectedDocs: Record<string, string[]>
  recent: string[]
}

const STORAGE_KEY = 'schemesathi:v1'
const EMPTY: AppState = { profile: null, saved: [], collectedDocs: {}, recent: [] }

let state: AppState = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    state = EMPTY
  }
}

function setState(updater: (prev: AppState) => AppState) {
  load()
  state = updater(state)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage may be unavailable (private mode); state still works for this session.
  }
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return state
}

function getServerSnapshot(): AppState | null {
  return null
}

/** Returns null until the on-device state has been read on the client. */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const actions = {
  setProfile(profile: CitizenProfile) {
    setState((s) => ({ ...s, profile }))
  },
  toggleSaved(id: string) {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
    }))
  },
  toggleDoc(schemeId: string, docId: string) {
    setState((s) => {
      const current = s.collectedDocs[schemeId] ?? []
      const next = current.includes(docId) ? current.filter((d) => d !== docId) : [...current, docId]
      return { ...s, collectedDocs: { ...s.collectedDocs, [schemeId]: next } }
    })
  },
  markViewed(id: string) {
    setState((s) => {
      if (s.recent[0] === id) return s
      return { ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 6) }
    })
  },
  clearAll() {
    setState(() => EMPTY)
  },
}
