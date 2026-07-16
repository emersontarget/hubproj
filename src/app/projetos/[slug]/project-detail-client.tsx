"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Copy, Check } from "lucide-react"

export function ProjectDetailClient({
  apiKey,
  projectName,
}: {
  apiKey: string
  projectName: string
}) {
  const [copied, setCopied] = useState(false)

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Key className="h-4 w-4" />
          Chave de API
        </CardTitle>
        <CardDescription>
          Use esta chave para integrar ferramentas externas como hooks do VS Code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono truncate">
            {apiKey}
          </code>
          <Button variant="outline" size="icon" onClick={copyApiKey}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Envie requisições para <code className="text-xs">POST /api/daily-logs</code> com
          header <code className="text-xs">X-API-Key</code>.
        </p>
      </CardContent>
    </Card>
  )
}
