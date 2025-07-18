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


/*

    import { useEffect, useMemo, useState } from "react"
    import Overview from "@/components/overview/Overview"
    import Subscriptions from "@/components/subscriptions/Subscriptions"
    import Payments from "@/components/payments/Payments"
    import { getAuthTokenFromCookie } from "@/utils/auth-functions"
    import { Clock, DollarSign, House, LucideIcon, Icon } from 'lucide-react';


    type TabKey = "overview" | "subscriptions" | "payments"

    const TABS: Record<TabKey, { label: string; Component: React.FC, icon: LucideIcon }> = {
        overview: { label: "Overview", Component: Overview, icon: House },
        subscriptions: { label: "Subscriptions", Component: Subscriptions, icon: DollarSign },
        payments: { label: "Payments", Component: Payments, icon: Clock },
    }

    const [activeTab, setActiveTab] = useState<TabKey>("overview")

    const ActiveComponent = useMemo(
        () => TABS[activeTab].Component,
        [activeTab]
    )

    return (
        <div className="w-full min-h-full dashboard">
            <nav className="dashboard-nav">
                <ul className="dashboard-nav-list flex items-center flex-col">
                    {
                        (Object.keys(TABS) as Array<TabKey>).map((key) => {
                            const IconComponent = TABS[key].icon;
                            return (
                                <li
                                    key={key}
                                    className={
                                    "dashboard-nav-item " +
                                    (key === activeTab ? "dashboard-nav-item__active" : "")
                                    }
                                    onClick={() => setActiveTab(key)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <IconComponent />
                                    <p>{TABS[key].label}</p>
                                </li>
                            );
                        })
                    }
                </ul>
            </nav>
            
            <section className="w-3/4 dashboard-section flex justify-between items-center">
                <ActiveComponent />
            </section>
        </div>
    )


   
*/