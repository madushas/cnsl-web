/**
 * CheckpointStatsOverview Component
 * 
 * Displays checkpoint statistics overview for admin event management
 * Compact version for dashboard integration
 */

"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckpointType, CheckpointIcons, CheckpointColors } from '@/lib/types/checkpoint'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CheckpointStatsOverviewProps {
  slug: string
  className?: string
}

interface StatsData {
  total: number
  entry: number
  refreshment: number
  swag: number
  entryPercentage: number
  refreshmentPercentage: number
  swagPercentage: number
}

export function CheckpointStatsOverview({ slug, className }: CheckpointStatsOverviewProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/admin/events/${encodeURIComponent(slug)}/checkpoints/stats`)
        if (!res.ok) throw new Error('Failed to fetch stats')
        
        const data = await res.json()
        const newStats = data.data?.stats
        
        if (newStats) {
          setStats({
            total: newStats.total,
            entry: newStats.entry.count,
            refreshment: newStats.refreshment.count,
            swag: newStats.swag.count,
            entryPercentage: newStats.entry.percentage,
            refreshmentPercentage: newStats.refreshment.percentage,
            swagPercentage: newStats.swag.percentage,
          })
        }
      } catch (err) {
        console.error('[CheckpointStatsOverview] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [slug])

  if (loading && !stats) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading checkpoint stats...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const checkpoints: { type: CheckpointType; count: number; percentage: number }[] = [
    { type: 'entry', count: stats.entry, percentage: stats.entryPercentage },
    { type: 'refreshment', count: stats.refreshment, percentage: stats.refreshmentPercentage },
    { type: 'swag', count: stats.swag, percentage: stats.swagPercentage },
  ]

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Checkpoint Status</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/events/${slug}/scan`}>Scanner</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {/* Total */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          
          {/* Checkpoints */}
          {checkpoints.map((checkpoint) => {
            const colors = CheckpointColors[checkpoint.type]
            
            return (
              <div 
                key={checkpoint.type}
                className={cn(
                  "text-center p-3 rounded-lg transition-colors",
                  colors.bg
                )}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg" role="img">
                    {CheckpointIcons[checkpoint.type]}
                  </span>
                </div>
                <div className={cn("text-2xl font-bold", colors.text)}>
                  {checkpoint.count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {checkpoint.percentage}%
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
