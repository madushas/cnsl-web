"use client"

import React from "react"
import { cn } from "@/lib/utils"

type RevealProps = {
  as?: React.ElementType
  className?: string
  children: React.ReactNode
  delay?: number // ms
}

export function Reveal({ as: Tag = "div", className, children, delay = 0 }: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as any}
      className={cn(
        "reveal transition-all duration-500 ease-out",
        visible && "reveal-visible",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
