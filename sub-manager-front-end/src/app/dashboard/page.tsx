'use client'

import { useDashboardContext } from "@/components/dashboard-context"
import Overview from "@/components/overview/Overview"
import Subscriptions from "@/components/subscriptions/Subscriptions"
import Payments from "@/components/payments/Payments"
import { useMemo } from "react"

import "./dashboard.css"

export default function Dashboard() {
  const { activeTab } = useDashboardContext()

  const TABS = {
    overview: Overview,
    subscriptions: Subscriptions,
    payments: Payments,
  }

  const ActiveComponent = useMemo(() => TABS[activeTab], [activeTab])

  return (
    <div className="w-full min-h-full dashboard p-4">
      <ActiveComponent />
    </div>
  )
}