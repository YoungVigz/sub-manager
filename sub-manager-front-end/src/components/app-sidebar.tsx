"use client";

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

import { Clock, DollarSign, House, User, LucideIcon, LogOut } from "lucide-react"
import { useDashboardContext } from "@/components/dashboard-context"
import { useEffect, useState } from "react"
import { getUsernameFromCookie, logout } from "@/utils/auth-functions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"

type TabKey = "overview" | "subscriptions" | "payments"

const TABS: Record<TabKey, { label: string; icon: LucideIcon }> = {
    overview: { label: "Overview", icon: House },
    subscriptions: { label: "Subscriptions", icon: DollarSign },
    payments: { label: "Payments", icon: Clock },
}

export function AppSidebar() {
    const { activeTab, setActiveTab } = useDashboardContext()
    const [ username, setUsername ] = useState<string>("")

    useEffect(() => {
        const name = getUsernameFromCookie()
        if (name) setUsername(name)
    }, [])

    const handleTabClick = (key: TabKey) => {
        setActiveTab(key)
        localStorage.setItem('activeTab', key)
    }

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
                                            onClick={() => handleTabClick(key)}
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="user-button">
                            <User />
                            <span className="truncate font-medium">{username || "_"}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent side="top" align="end" className="min-w-[160px]">
                        <DropdownMenuItem onClick={logout} className="cursor-pointer flex items-center">
                            <LogOut className="mr-2 ml-2 h-4 w-4" />
                            Wyloguj
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
