import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "secondary"
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-slate-800 text-slate-100",
    secondary: "border-transparent bg-slate-800/50 text-slate-300",
    success: "border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    warning: "border-transparent bg-amber-500/15 text-amber-400 border-amber-500/20",
    destructive: "border-transparent bg-red-500/15 text-red-400 border-red-500/20",
    outline: "text-slate-300 border-slate-700",
  }

  const classes = `${baseStyles} ${variants[variant]} ${className}`

  return (
    <div className={classes} {...props} />
  )
}
