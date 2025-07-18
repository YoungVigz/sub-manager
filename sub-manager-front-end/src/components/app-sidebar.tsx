'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Clock, DollarSign, House, LucideIcon } from "lucide-react"
import { useDashboardContext } from "@/components/dashboard-context"

type TabKey = "overview" | "subscriptions" | "payments"

const TABS: Record<TabKey, { label: string; icon: LucideIcon }> = {
  overview: { label: "Overview", icon: House },
  subscriptions: { label: "Subscriptions", icon: DollarSign },
  payments: { label: "Payments", icon: Clock },
}

export function AppSidebar() {
  const { activeTab, setActiveTab } = useDashboardContext()

  return (
    <Sidebar>
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <a href="/">
                            <span className="text-base font-semibold">SubManager</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Dashboard</SidebarGroupLabel>

                <SidebarGroupContent>
                    <SidebarMenu>
                        {(Object.keys(TABS) as TabKey[]).map((key) => {
                            const Icon = TABS[key].icon
                            const isActive = activeTab === key

                            return (
                                <SidebarMenuItem key={key}>
                                    <SidebarMenuButton
                                        onClick={() => setActiveTab(key)}
                                        className={
                                        "w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all " +
                                        (isActive ? "dashboard-nav-item__active" : "")
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{TABS[key].label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}

                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
            <span className="truncate font-medium">test</span>
        </SidebarFooter>
    </Sidebar>
  )
}
