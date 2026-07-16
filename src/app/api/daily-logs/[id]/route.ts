import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const log = await prisma.dailyLog.findFirst({
      where: { id, userId: session.user.id },
      include: {
        project: { select: { name: true, slug: true } },
      },
    })

    if (!log) {
      return NextResponse.json(
        { error: "Daily log não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error("[DAILY_LOG_ID_GET]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.dailyLog.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Daily log não encontrado" },
        { status: 404 }
      )
    }

    await prisma.dailyLog.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Daily log excluído com sucesso" })
  } catch (error) {
    console.error("[DAILY_LOG_ID_DELETE]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
