/**
 * Multi-Checkpoint System Types
 * 
 * Defines types for the event checkpoint system that tracks:
 * - Entry check-ins
 * - Refreshment distribution
 * - Swag distribution
 */

// Checkpoint type enum (used in database and UI)
export const CheckpointType = {
  ENTRY: 'entry',
  REFRESHMENT: 'refreshment',
  SWAG: 'swag',
} as const

export type CheckpointType = typeof CheckpointType[keyof typeof CheckpointType]

// Scan method enum
export const ScanMethod = {
  QR: 'qr',
  TICKET: 'ticket',
  EMAIL: 'email',
  MANUAL: 'manual',
} as const

export type ScanMethod = typeof ScanMethod[keyof typeof ScanMethod]

// Database schema types (inferred from Drizzle)
export type CheckpointScan = {
  id: string
  rsvpId: string
  eventId: string
  checkpointType: CheckpointType
  scannedAt: Date
  scannedBy: string | null
  scanMethod: ScanMethod | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// Input type for creating a checkpoint scan
export type CheckpointScanInput = {
  rsvpId: string
  eventId: string
  checkpointType: CheckpointType
  scannedBy?: string
  scanMethod?: ScanMethod
  notes?: string
}

// Checkpoint stats for a single event
export type CheckpointStats = {
  eventId: string
  total: number  // Total approved RSVPs
  entry: number
  refreshment: number
  swag: number
  entryPercentage: number
  refreshmentPercentage: number
  swagPercentage: number
}

// Checkpoint status for a single RSVP
export type CheckpointStatus = {
  rsvpId: string
  eventId: string
  hasEntry: boolean
  hasRefreshment: boolean
  hasSwag: boolean
  entryScannedAt: Date | null
  refreshmentScannedAt: Date | null
  swagScannedAt: Date | null
  entryScannedBy: string | null
  refreshmentScannedBy: string | null
  swagScannedBy: string | null
}

// Scan result (returned from API)
export type CheckpointScanResult = {
  success: boolean
  checkpoint: CheckpointType
  rsvpId: string
  attendeeName: string
  alreadyScanned: boolean
  scannedAt: Date
  message: string
}

// Bulk scan input (for manual corrections)
export type BulkCheckpointScanInput = {
  eventId: string
  checkpointType: CheckpointType
  items: Array<{
    rsvpId?: string
    email?: string
    ticketNumber?: string
    scannedBy?: string
    notes?: string
  }>
}

// Scanner mode UI state
export type ScannerMode = {
  checkpointType: CheckpointType
  eventId: string
  eventTitle: string
  stats: CheckpointStats
}

// Checkpoint history entry (for audit log display)
export type CheckpointHistoryEntry = {
  id: string
  checkpointType: CheckpointType
  scannedAt: Date
  scannedBy: string | null
  scanMethod: ScanMethod | null
  notes: string | null
  attendeeName: string
  attendeeEmail: string
}

// UI display helpers
export const CheckpointLabels: Record<CheckpointType, string> = {
  [CheckpointType.ENTRY]: 'Entry Check-in',
  [CheckpointType.REFRESHMENT]: 'Refreshment Distribution',
  [CheckpointType.SWAG]: 'Swag Distribution',
}

export const CheckpointIcons: Record<CheckpointType, string> = {
  [CheckpointType.ENTRY]: '📥',
  [CheckpointType.REFRESHMENT]: '🍕',
  [CheckpointType.SWAG]: '🎁',
}

export const CheckpointColors: Record<CheckpointType, { bg: string; text: string; border: string }> = {
  [CheckpointType.ENTRY]: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
  },
  [CheckpointType.REFRESHMENT]: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    border: 'border-orange-500/20',
  },
  [CheckpointType.SWAG]: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/20',
  },
}

// Validation helpers
export function isValidCheckpointType(value: unknown): value is CheckpointType {
  return typeof value === 'string' && Object.values(CheckpointType).includes(value as CheckpointType)
}

export function isValidScanMethod(value: unknown): value is ScanMethod {
  return typeof value === 'string' && Object.values(ScanMethod).includes(value as ScanMethod)
}

// Helper to determine which checkpoint comes next
export function getNextCheckpoint(currentCheckpoint: CheckpointType): CheckpointType | null {
  switch (currentCheckpoint) {
    case CheckpointType.ENTRY:
      return CheckpointType.REFRESHMENT
    case CheckpointType.REFRESHMENT:
      return CheckpointType.SWAG
    case CheckpointType.SWAG:
      return null // No next checkpoint
    default:
      return null
  }
}

// Helper to check if checkpoint is allowed (must complete in order)
export function canScanCheckpoint(
  checkpointType: CheckpointType,
  status: Pick<CheckpointStatus, 'hasEntry' | 'hasRefreshment' | 'hasSwag'>
): { allowed: boolean; reason?: string } {
  switch (checkpointType) {
    case CheckpointType.ENTRY:
      return { allowed: true }
    
    case CheckpointType.REFRESHMENT:
      if (!status.hasEntry) {
        return { allowed: false, reason: 'Must check in at entry first' }
      }
      return { allowed: true }
    
    case CheckpointType.SWAG:
      if (!status.hasEntry) {
        return { allowed: false, reason: 'Must check in at entry first' }
      }
      // Optional: require refreshment before swag
      // if (!status.hasRefreshment) {
      //   return { allowed: false, reason: 'Must get refreshment first' }
      // }
      return { allowed: true }
    
    default:
      return { allowed: false, reason: 'Invalid checkpoint type' }
  }
}
