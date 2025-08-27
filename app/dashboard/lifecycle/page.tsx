import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function LifecyclePage() {
  const lifecycleStages = [
    { name: "Planning", progress: 100, status: "completed" },
    { name: "Development", progress: 75, status: "in-progress" },
    { name: "Testing", progress: 30, status: "in-progress" },
    { name: "Deployment", progress: 0, status: "pending" },
    { name: "Maintenance", progress: 0, status: "pending" },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lifecycle</h1>
            <p className="text-muted-foreground">Manage your project lifecycle stages and track progress</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lifecycleStages.map((stage) => (
            <Card key={stage.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{stage.name}</CardTitle>
                  <Badge
                    variant={
                      stage.status === "completed"
                        ? "default"
                        : stage.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {stage.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{stage.progress}%</span>
                  </div>
                  <Progress value={stage.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
