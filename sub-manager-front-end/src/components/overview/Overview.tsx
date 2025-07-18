"use client"

import { useRef, useEffect } from "react"
import Chart from "chart.js/auto"

export default function Overview() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  let myChart: Chart | null = null

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const data = {
      labels: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec"],
      datasets: [
        {
          label: "Payments overall",
          data: [12.0, 19.0, 8.0, 15.0, 22.0, 13.0],
          backgroundColor: "rgb(93, 214, 44)",
          borderColor: "rgb(93, 214, 44)",
          borderWidth: 1,
        },
      ],
    }

    const config = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }

    if (myChart) {
      myChart.destroy()
    }

    myChart = new Chart(ctx, {
      type: "line",
      data,
      options: config,
    })

    return () => {
      myChart?.destroy()
    }
  }, [])

  return (
    <div className="w-full p-4 rounded-lg">

        <h2 className="text-xl font-semibold mb-4">Overview</h2>

        <div className="w-full h-full flex ">
            <div className="w-2/3 h-full">
                <canvas ref={chartRef} />
            </div>
            <div className="w-1/3 h-full">
                This month: 
            </div>
        </div>
     
    </div>
  )
}
