"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const dummyData = [
  { month: "Jan", Fire: 380, ICE: 0, Police: 0, Ambulance: 0 },
  { month: "Feb", Fire: 0, ICE: 150, Police: 0, Ambulance: 0 },
  { month: "Mar", Fire: 0, ICE: 70, Police: 0, Ambulance: 0 },
  { month: "April", Fire: 0, ICE: 0, Police: 280, Ambulance: 0 },
  { month: "May", Fire: 0, ICE: 280, Police: 380, Ambulance: 0 },
  { month: "June", Fire: 0, ICE: 280, Police: 0, Ambulance: 0 },
  { month: "July", Fire: 0, ICE: 0, Police: 0, Ambulance: 100 },
  { month: "Aug", Fire: 0, ICE: 0, Police: 0, Ambulance: 240 },
  { month: "Sep", Fire: 0, ICE: 0, Police: 380, Ambulance: 0 },
  { month: "Oct", Fire: 0, ICE: 0, Police: 210, Ambulance: 0 },
  { month: "Nov", Fire: 0, ICE: 110, Police: 0, Ambulance: 0 },
  { month: "Dec", Fire: 470, ICE: 0, Police: 0, Ambulance: 0 },
]

const chartColors = {
  Fire: "#1E40AF", // Dark blue
  ICE: "#7DD3FC", // Light blue
  Police: "#3B82F6", // Medium blue
  Ambulance: "#FCD34D", // Yellow/amber
}

interface AlertChartProps {
  loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const activeData = payload.find((p: any) => p.value > 0)
    if (activeData) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm" style={{ color: activeData.color }}>
            {`${activeData.dataKey}: ${activeData.value}`}
          </p>
        </div>
      )
    }
  }
  return null
}

export function AlertChart({ loading }: AlertChartProps) {
  if (loading) {
    return <Skeleton className="h-80 w-full" />
  }

  return (
    <div className="h-80 w-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dummyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            domain={[0, 500]}
            ticks={[0, 100, 200, 300, 400, 500]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            align="right"
            verticalAlign="middle"
            layout="vertical"
            iconType="rect"
            wrapperStyle={{
              paddingLeft: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          />
          <Bar dataKey="Fire" fill={chartColors.Fire} name="Fire" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="ICE" fill={chartColors.ICE} name="ICE" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Police" fill={chartColors.Police} name="Police" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar
            dataKey="Ambulance"
            fill={chartColors.Ambulance}
            name="Ambulance"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
