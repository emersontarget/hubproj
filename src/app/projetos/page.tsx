import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Nav from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowUpRight } from "lucide-react"
import { translateStatus, translatePriority, statusBadgeVariant, priorityBadgeVariant } from "@/lib/utils"

async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
}

export default async function ProjetosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const projects = await getProjects(session.user.id)

  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground mt-1">
              {projects.length} {projects.length === 1 ? "projeto" : "projetos"} cadastrado{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/projetos/novo"
            className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 h-8 gap-1.5 px-2.5 bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CardTitle className="mb-2">Nenhum projeto ainda</CardTitle>
              <CardDescription className="mb-6">
                Crie seu primeiro projeto para começar a gerenciar.
              </CardDescription>
              <Link
                href="/projetos/novo"
                className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 h-8 gap-1.5 px-2.5 bg-primary text-primary-foreground hover:bg-primary/80"
              >
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projetos/${project.slug}`}>
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                    {project.description && (
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusBadgeVariant(project.status)}>
                        {translateStatus(project.status)}
                      </Badge>
                      <Badge variant={priorityBadgeVariant(project.priority)}>
                        {translatePriority(project.priority)}
                      </Badge>
                      {project.stack && (
                        <Badge variant="outline">{project.stack}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
