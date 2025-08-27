import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconPlus, IconMail, IconPhone } from "@tabler/icons-react"

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Alice Johnson",
      role: "Product Manager",
      email: "alice@acme.com",
      phone: "+1 (555) 123-4567",
      avatar: "/avatars/alice.jpg",
      status: "online",
      projects: 3,
    },
    {
      name: "Bob Smith",
      role: "Senior Developer",
      email: "bob@acme.com",
      phone: "+1 (555) 234-5678",
      avatar: "/avatars/bob.jpg",
      status: "away",
      projects: 5,
    },
    {
      name: "Carol Davis",
      role: "UX Designer",
      email: "carol@acme.com",
      phone: "+1 (555) 345-6789",
      avatar: "/avatars/carol.jpg",
      status: "online",
      projects: 2,
    },
    {
      name: "David Wilson",
      role: "DevOps Engineer",
      email: "david@acme.com",
      phone: "+1 (555) 456-7890",
      avatar: "/avatars/david.jpg",
      status: "offline",
      projects: 4,
    },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">Manage your team members and their roles</p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      member.status === "online" ? "default" : member.status === "away" ? "secondary" : "outline"
                    }
                  >
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconMail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconPhone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm font-medium">{member.projects} active projects</span>
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
