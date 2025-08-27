import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconPlus, IconFolder, IconUsers, IconCalendar } from "@tabler/icons-react"

export default function ProjectsPage() {
  const projects = [
    {
      name: "Website Redesign",
      description: "Complete overhaul of the company website",
      status: "in-progress",
      team: 5,
      dueDate: "2024-03-15",
      progress: 65,
    },
    {
      name: "Mobile App",
      description: "Native mobile application development",
      status: "planning",
      team: 3,
      dueDate: "2024-04-20",
      progress: 15,
    },
    {
      name: "API Integration",
      description: "Third-party API integration and testing",
      status: "completed",
      team: 2,
      dueDate: "2024-02-28",
      progress: 100,
    },
    {
      name: "Database Migration",
      description: "Migrate to new database infrastructure",
      status: "in-progress",
      team: 4,
      dueDate: "2024-03-30",
      progress: 40,
    },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects in one place</p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconFolder className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      project.status === "completed"
                        ? "default"
                        : project.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                        <span>{project.team} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                        <span>{project.dueDate}</span>
                      </div>
                    </div>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
