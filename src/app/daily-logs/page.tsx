import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Nav from "@/components/nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  translateStatus,
  statusBadgeVariant,
  formatDate,
  formatRelative,
} from "@/lib/utils"
import Link from "next/link"
import DailyLogsFilter from "./daily-logs-filter"

async function getDailyLogs(userId: string, projectSlug?: string) {
  const where: any = { userId }

  if (projectSlug) {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true },
    })
    if (project) {
      where.projectId = project.id
    }
  }

  const [logs, projects] = await Promise.all([
    prisma.dailyLog.findMany({
      where,
      orderBy: { date: "desc" },
      take: 50,
      include: {
        project: { select: { name: true, slug: true } },
      },
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ])

  return { logs, projects }
}

export default async function DailyLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { project } = await searchParams
  const { logs, projects } = await getDailyLogs(session.user.id, project)

  // Group logs by date
  type LogWithProject = Awaited<ReturnType<typeof getDailyLogs>>["logs"][number]
  const groupedLogs: Record<string, LogWithProject[]> = {}
  for (const log of logs) {
    const dateKey = formatDate(log.date)
    if (!groupedLogs[dateKey]) {
      groupedLogs[dateKey] = []
    }
    groupedLogs[dateKey].push(log)
  }

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Daily Logs</h1>
          <p className="text-muted-foreground mt-1">
            Registros diários de atividade dos projetos.
          </p>
        </div>

        <DailyLogsFilter projects={projects} currentProject={project} />

        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Nenhum daily log encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLogs).map(([dateKey, dateLogs]) => (
              <div key={dateKey}>
                <h2 className="text-lg font-semibold mb-4 sticky top-14 bg-background py-2 z-10">
                  {dateKey}
                </h2>
                <div className="space-y-3">
                  {dateLogs.map((log) => (
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
                            <p className="text-sm mt-1">{log.summary}</p>
                            {log.blockers && (
                              <p className="text-xs text-destructive mt-1">
                                <span className="font-medium">Bloqueios:</span> {log.blockers}
                              </p>
                            )}
                            {log.nextSteps && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Próximos passos:</span>{" "}
                                {log.nextSteps}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge
                              variant={
                                log.status ? statusBadgeVariant(log.status) : "outline"
                              }
                            >
                              {log.status ? translateStatus(log.status) : "Registro"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelative(log.date)}
                            </span>
                            {log.commits > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {log.commits} commit{log.commits !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
