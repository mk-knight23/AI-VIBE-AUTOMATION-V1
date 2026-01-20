import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-white/10 placeholder:text-muted-foreground focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-white/5 flex field-sizing-content min-h-20 w-full rounded-xl border bg-transparent px-4 py-3 text-base shadow-xs transition-all outline-none focus-visible:ring-[4px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
