import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    planejamento: "outline",
    desenvolvimento: "default",
    revisao: "secondary",
    producao: "default",
    arquivado: "outline",
    ideia: "outline",
    em_andamento: "default",
    concluido: "secondary",
    cancelado: "destructive",
  }
  return map[status] ?? "outline"
}

export function priorityBadgeVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    baixa: "secondary",
    media: "default",
    alta: "destructive",
    urgente: "destructive",
  }
  return map[priority] ?? "outline"
}

export function translateStatus(status: string): string {
  const map: Record<string, string> = {
    planejamento: "Planejamento",
    desenvolvimento: "Desenvolvimento",
    revisao: "Revisão",
    producao: "Produção",
    arquivado: "Arquivado",
    ideia: "Ideia",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  }
  return map[status] ?? status
}

export function translatePriority(priority: string): string {
  const map: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  }
  return map[priority] ?? priority
}
