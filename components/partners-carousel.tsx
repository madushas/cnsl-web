"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useEffect } from "react"
import Image from "next/image"

type PartnerItem = { name: string; category: string; logo?: string }

export function PartnersCarousel({ items }: { items: PartnerItem[] }) {
  const [viewportRef, embla] = useEmblaCarousel({ align: "start", loop: true, dragFree: true })

  useEffect(() => {
    if (!embla) return
    
    let active = true
    const id = window.setInterval(() => {
      if (active && embla) {
        try {
          embla.scrollNext()
        } catch {
          // Embla might be destroyed
        }
      }
    }, 2500)
    
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [embla])

  return (
    <div className="embla">
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex gap-4">
          {items.concat(items).map((p, i) => (
            <div key={`${p.name}-${i}`} className="min-w-[220px] md:min-w-[260px] shrink-0">
              <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-card px-5">
                <div className="flex items-center gap-3">
                  <Image
                    src={p.logo || "/placeholder-logo.svg"}
                    alt={p.name}
                    width={120}
                    height={32}
                    className="h-8 w-auto opacity-90"
                    style={{ filter: "grayscale(100%) brightness(1.15)" }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.category}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
