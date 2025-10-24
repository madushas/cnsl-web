/**
 * @deprecated This file is deprecated as of Phase 3 (ARCH-03 fix)
 * All validation schemas have been consolidated into lib/validation.ts
 * 
 * This file now only re-exports for backward compatibility.
 * Please import from '@/lib/validation' instead.
 */

// Re-export all validation schemas from the consolidated location
export { EventInput, PostInput, PersonInput } from './validation'

// Note: RSVPInput in validation.ts has different casing - keeping for compatibility
export type { RSVPInput } from './validation'
