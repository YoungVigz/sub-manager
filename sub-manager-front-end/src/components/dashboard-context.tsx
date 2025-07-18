'use client'

import { createContext, useContext, useState } from 'react'

type TabKey = "overview" | "subscriptions" | "payments"

interface DashboardContextType {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
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
