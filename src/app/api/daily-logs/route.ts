import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectSlug = searchParams.get("project")

    const where: any = { userId: session.user.id }

    if (projectSlug) {
      const project = await prisma.project.findUnique({
        where: { slug: projectSlug },
        select: { id: true },
      })
      if (project) {
        where.projectId = project.id
      }
    }

    const logs = await prisma.dailyLog.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
      include: {
        project: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("[DAILY_LOGS_GET]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try session auth first
    const session = await auth()
    let userId: string | null = session?.user?.id ?? null
    let projectId: string | null = null

    const body = await request.json()
    const { summary, blockers, nextSteps, source, commits, branch, status, projectSlug } = body

    // If no session, try API key auth
    if (!userId) {
      const apiKey = request.headers.get("X-API-Key")
      if (!apiKey) {
        return NextResponse.json(
          { error: "Não autorizado. Forneça sessão ou X-API-Key" },
          { status: 401 }
        )
      }

      // Find project by API key
      const apiProject = await prisma.project.findUnique({
        where: { apiKey },
        select: { id: true, userId: true },
      })

      if (!apiProject) {
        return NextResponse.json(
          { error: "Chave de API inválida" },
          { status: 401 }
        )
      }

      userId = apiProject.userId
      projectId = apiProject.id
    }

    if (!summary) {
      return NextResponse.json(
        { error: "O campo summary é obrigatório" },
        { status: 400 }
      )
    }

    // If authenticated via session, resolve project
    if (!projectId) {
      if (projectSlug) {
        const project = await prisma.project.findFirst({
          where: { slug: projectSlug, userId },
          select: { id: true },
        })
        if (project) {
          projectId = project.id
        }
      } else {
        // Get first project as default
        const firstProject = await prisma.project.findFirst({
          where: { userId },
          select: { id: true },
        })
        if (firstProject) {
          projectId = firstProject.id
        }
      }
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Nenhum projeto encontrado para associar ao log" },
        { status: 400 }
      )
    }

    const log = await prisma.dailyLog.create({
      data: {
        summary,
        blockers,
        nextSteps,
        source: source ?? "manual",
        commits: commits ?? 0,
        branch,
        status: status ?? null,
        projectId,
        userId,
      },
      include: {
        project: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("[DAILY_LOGS_POST]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
