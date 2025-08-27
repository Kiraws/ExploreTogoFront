import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

export default function AnalyticsPage() {
  const metrics = [
    { title: "Total Users", value: "12,345", change: "+12.5%", trend: "up" },
    { title: "Revenue", value: "$45,678", change: "+8.2%", trend: "up" },
    { title: "Conversion Rate", value: "3.24%", change: "-2.1%", trend: "down" },
    { title: "Avg. Session", value: "4m 32s", change: "+5.7%", trend: "up" },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your performance metrics and insights</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="pb-2">
                <CardDescription>{metric.title}</CardDescription>
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>{" "}
                  from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
