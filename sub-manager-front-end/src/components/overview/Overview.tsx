"use client"

import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useDashboardContext } from "../dashboard-context"
import { useMemo } from "react"
import { generateGreenShades } from "@/utils/get-colors"
import { Status } from "@/types"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--accent-secondary)",
  },
  spend: {
    label: "Spend",
    color: "var(--primary)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--accent-secondary)",
  },
} satisfies ChartConfig

export default function Overview() {
  const { payments, subscriptions } = useDashboardContext()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // 1. DANE DO WYKRESU LINIOWEGO (Historia płatności w tym roku)
  const monthlyData = useMemo(() => {
    if (!payments) return []

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "long" }),
      total: 0,
    }))

    payments.forEach((p) => {
      const date = new Date(p.dateOfPayment)
      // Filtrujemy tylko ten rok.
      // Jeśli chcesz widzieć tylko OPŁACONE na wykresie, dodaj: && p.status === "PAID"
      if (isNaN(date.getTime()) || date.getFullYear() !== currentYear) return

      months[date.getMonth()].total += p.amount
    })

    return months
  }, [payments, currentYear])

  // 2. CURRENT USAGE (Suma płatności w tym miesiącu - opłacone i nieopłacone)
  const currentUsage = useMemo(() => {
    if (!payments) return 0
    
    return payments
      .filter(p => {
        const d = new Date(p.dateOfPayment)
        // Sprawdzamy czy to ten rok i ten miesiąc
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments, currentYear, currentMonth])

  // 3. SPEND THIS YEAR (Tylko opłacone w tym roku)
  const overallYear = useMemo(() => {
    if (!payments) return 0
    return payments
      .filter(p => {
        const d = new Date(p.dateOfPayment)
        // Status PAID (lub enum w zależności jak przychodzi z backendu, zazwyczaj string "PAID")
        return d.getFullYear() === currentYear && String(p.status) === "PAID"
      })
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments, currentYear])

  // 4. TOTAL SPEND ALL TIME (Tylko opłacone)
  const overallAllTime = useMemo(() => {
    if (!payments) return 0
    return payments
        .filter(p => String(p.status) === "PAID")
        .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  return (
    <div className="w-full p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>

      <div className="w-full grid grid-rows-[2fr_1fr] gap-6">
        <div className="w-full flex gap-6">
          {/* Wykres historyczny */}
          <Card className="w-1/2 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Payments History ({currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={monthlyData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="total"
                    type="linear"
                    fill="var(--secondary)"
                    fillOpacity={0.8}
                    stroke="var(--primary)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Wykres kołowy - Udział w kosztach (Tylko AKTYWNE subskrypcje) */}
          <Card className="w-1/2 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Active Subscriptions Cost Share</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="w-full h-full max-h-[250px]"
              >
                {subscriptions && subscriptions.length > 0 ? (
                  (() => {
                    const subsWithMonthlyValue = subscriptions.map((s) => ({
                      name: s.title || "Unknown",
                      value: s.cycle === "YEARLY" ? s.price / 12 : s.price,
                    }))

                    const total = subsWithMonthlyValue.reduce((sum, s) => sum + s.value, 0)
                    const greenShades = generateGreenShades(subsWithMonthlyValue.length)
                    const pieData = subsWithMonthlyValue.map((s, i) => ({
                      ...s,
                      fill: greenShades[i],
                    }))

                    return (
                      <PieChart width={0} height={250} className="max-h-[250px]">
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="60%"
                          outerRadius="90%"
                          strokeWidth={4}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                      {total.toFixed(2)} zł
                                    </tspan>
                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-sm">
                                      total monthly
                                    </tspan>
                                  </text>
                                )
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    )
                  })()
                ) : (
                  <div className="text-muted-foreground text-center py-10">
                    No active subscriptions
                  </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Dolne boxy */}
        <div className="w-full flex gap-6">
          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Active subscriptions:</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {subscriptions?.length}
              </span>
            </CardContent>
          </Card>

          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Current usage:</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {currentUsage.toFixed(2)}zł
              </span>
              <span className="text-sm text-muted-foreground">
                this month
              </span>
            </CardContent>
          </Card>

          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Spend this year</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {overallYear.toFixed(2)}zł
              </span>
              <span className="text-sm text-muted-foreground">
                in {currentYear}
              </span>
            </CardContent>
          </Card>

          <Card className="w-1/4 bg-[var(--sidebar-background)] border-[var(--accent)]">
            <CardHeader>
              <CardTitle>Total spend all time</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {overallAllTime.toFixed(2)}zł
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}