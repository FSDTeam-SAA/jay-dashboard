import type { ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthShell({ title, description, children, footer, className }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.28),transparent_42%),linear-gradient(135deg,#020617_0%,#0f172a_38%,#111827_100%)]" />
      <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

      <Card className={cn("relative z-10 w-full max-w-md border-white/10 bg-white/95 shadow-2xl", className)}>
        <CardHeader className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-slate-950">{title}</CardTitle>
            <CardDescription className="text-sm text-slate-600">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footer ? <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">{footer}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}
