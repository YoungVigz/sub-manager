"use client";

import { Payment, Subscription } from '@/types'
import { getAuthTokenFromCookie, logout } from '@/utils/auth-functions'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type TabKey = "overview" | "subscriptions" | "payments"

interface DashboardContextType {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void

  subscriptions: Subscription[] | null
  payments: Payment[] | null
  loadingSubs: boolean
  loadingPays: boolean

  refreshData: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const stored = localStorage.getItem('activeTab') as TabKey | null
    
    if (stored === 'overview' || stored === 'subscriptions' || stored === 'payments') {
      return stored
    }

    return 'overview'
  })

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [payments, setPayments]         = useState<Payment[]>([])
  const [loadingSubs, setLoadingSubs]   = useState<boolean>(true)
  const [loadingPays, setLoadingPays]   = useState<boolean>(true)

const refreshData = useCallback(() => {
    const token = getAuthTokenFromCookie()
    const URL = 'http://localhost:8080/api/';

    if (!token) return;

    setLoadingSubs(true) 
    setLoadingPays(true)

    const timestamp = new Date().getTime(); 

    fetch(`${URL}auth/validateToken?token=${token}&t=${timestamp}`, { cache: 'no-store' })
      .then(r => {
        if(!r.ok) logout()
      })
      .catch(console.error)

    fetch(`${URL}subscription?t=${timestamp}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store', 
      next: { revalidate: 0 }
    })
      .then(r => r.json())
      .then((data: Subscription[]) => setSubscriptions(data))
      .catch(console.error)
      .finally(() => setLoadingSubs(false))

    fetch(`${URL}payment?t=${timestamp}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      next: { revalidate: 0 }
    })
      .then(r => r.json())
      .then((data: Payment[]) => setPayments(data))
      .catch(console.error)
      .finally(() => setLoadingPays(false))
  }, [])


  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab)
    }
  }, [activeTab])

  return (
    <DashboardContext.Provider value={{
      activeTab, setActiveTab,
      subscriptions, payments,
      loadingSubs, loadingPays,
      refreshData 
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider")
  }
  
  return context
}