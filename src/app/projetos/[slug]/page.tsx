import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Nav from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Globe,
  Key,
  Copy,
  Check,
  Calendar,
  Layers,
} from "lucide-react"
import {
  translateStatus,
  translatePriority,
  statusBadgeVariant,
  priorityBadgeVariant,
  formatDate,
  formatRelative,
} from "@/lib/utils"
import { ProjectDetailClient } from "./project-detail-client"

async function getProject(slug: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { slug, userId },
    include: {
      dailyLogs: {
        orderBy: { date: "desc" },
        take: 10,
      },
      roadmapItems: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })
  return project
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const project = await getProject(slug, session.user.id)
  if (!project) notFound()

  const tagList = project.tags ? project.tags.split(",").map((t) => t.trim()).filter(Boolean) : []

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/projetos"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Projetos
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-2">{project.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusBadgeVariant(project.status)}>
                    {translateStatus(project.status)}
                  </Badge>
                  <Badge variant={priorityBadgeVariant(project.priority)}>
                    {translatePriority(project.priority)}
                  </Badge>
                  {tagList.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {project.stack && (
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {project.stack}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Criado {formatDate(project.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem]"
                    >
                      <GitBranch className="h-4 w-4" />
                      Repositório
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem]"
                    >
                      <Globe className="h-4 w-4" />
                      Site
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {project.dailyLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum daily log registrado para este projeto.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {project.dailyLogs.map((log) => (
                      <div key={log.id} className="border-l-2 border-primary/20 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {formatDate(log.date)}
                          </Badge>
                          {log.status && (
                            <Badge
                              variant={statusBadgeVariant(log.status)}
                              className="text-xs"
                            >
                              {translateStatus(log.status)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{log.summary}</p>
                        {log.blockers && (
                          <p className="text-sm text-destructive mt-1">
                            <span className="font-medium">Bloqueios:</span> {log.blockers}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle>Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                {project.roadmapItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum item de roadmap para este projeto.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {project.roadmapItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between border rounded-lg p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={statusBadgeVariant(item.status)} className="shrink-0 ml-2">
                          {translateStatus(item.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Key Card */}
            <ProjectDetailClient apiKey={project.apiKey} projectName={project.name} />
          </div>
        </div>
      </main>
    </div>
  )
}
