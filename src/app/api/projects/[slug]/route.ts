import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const project = await prisma.project.findFirst({
      where: { slug, userId: session.user.id },
      include: {
        dailyLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
        roadmapItems: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECT_SLUG_GET]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const existing = await prisma.project.findFirst({
      where: { slug, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, status, priority, repo, url, stack, tags } = body

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (repo !== undefined) updateData.repo = repo
    if (url !== undefined) updateData.url = url
    if (stack !== undefined) updateData.stack = stack
    if (tags !== undefined) updateData.tags = tags

    const project = await prisma.project.update({
      where: { id: existing.id },
      data: updateData,
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECT_SLUG_PATCH]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { slug } = await params
    const existing = await prisma.project.findFirst({
      where: { slug, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ message: "Projeto excluído com sucesso" })
  } catch (error) {
    console.error("[PROJECT_SLUG_DELETE]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
