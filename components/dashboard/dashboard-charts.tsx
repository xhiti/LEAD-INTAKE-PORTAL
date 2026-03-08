'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']

interface Props {
  byCategory: Record<string, number>
  byIndustry: Record<string, number>
  byStatus: Record<string, number>
}

export function DashboardCharts({ byCategory, byIndustry, byStatus }: Props) {
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }))
  const industryData = Object.entries(byIndustry).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* By Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Submissions by AI Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 20, left: -10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* By Industry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Submissions by Industry</CardTitle>
        </CardHeader>
        <CardContent>
          {industryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {industryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
