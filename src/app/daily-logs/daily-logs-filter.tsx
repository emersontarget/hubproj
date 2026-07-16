"use client"

import { useRouter } from "next/navigation"
import { Select } from "@/components/ui/select"

interface DailyLogsFilterProps {
  projects: { slug: string; name: string }[]
  currentProject?: string
}

export default function DailyLogsFilter({
  projects,
  currentProject,
}: DailyLogsFilterProps) {
  const router = useRouter()

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value) {
      router.push(`/daily-logs?project=${value}`)
    } else {
      router.push("/daily-logs")
    }
  }

  const projectOptions = [
    { value: "", label: "Todos os projetos" },
    ...projects.map((p) => ({ value: p.slug, label: p.name })),
  ]

  return (
    <div className="mb-6">
      <Select
        options={projectOptions}
        value={currentProject ?? ""}
        onChange={handleProjectChange}
        className="max-w-xs"
      />
    </div>
  )
}
