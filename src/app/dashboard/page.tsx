import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Nav from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, Activity, FileText, Rocket } from "lucide-react"
import { formatRelative, translateStatus, statusBadgeVariant } from "@/lib/utils"
import Link from "next/link"

async function getDashboardData(userId: string) {
  const [totalProjects, developmentProjects, todayLogs, productionProjects, recentLogs] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: "desenvolvimento" } }),
      prisma.dailyLog.count({
        where: {
          userId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.project.count({ where: { userId, status: "producao" } }),
      prisma.dailyLog.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
        include: {
          project: { select: { name: true, slug: true } },
        },
      }),
    ])

  return { totalProjects, developmentProjects, todayLogs, productionProjects, recentLogs }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const data = await getDashboardData(session.user.id)

  type RecentLog = (typeof data.recentLogs)[number]

  const stats = [
    { label: "Total de Projetos", value: data.totalProjects, icon: FolderKanban, color: "text-blue-500" },
    { label: "Em Desenvolvimento", value: data.developmentProjects, icon: Activity, color: "text-amber-500" },
    { label: "Logs de Hoje", value: data.todayLogs, icon: FileText, color: "text-green-500" },
    { label: "Em Produção", value: data.productionProjects, icon: Rocket, color: "text-purple-500" },
  ]

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {session.user.name?.split(" ")[0] ?? "usuário"}!
          </h1>
          <p className="text-muted-foreground mt-1">Bem-vindo ao ProjKeeper</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Daily Logs Recentes</h2>
          {data.recentLogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum daily log registrado ainda.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.recentLogs.map((log: RecentLog) => (
                <Card key={log.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/projetos/${log.project.slug}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {log.project.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {log.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={log.status ? statusBadgeVariant(log.status) : "outline"}
                        >
                          {log.status ? translateStatus(log.status) : "Registro"}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelative(log.date)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
