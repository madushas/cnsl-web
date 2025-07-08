import { useState, useEffect, useRef, useCallback } from 'react'

// Enhanced interface with debouncing and better performance options
interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean
  delay?: number // Debounce delay in milliseconds
}

export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {},
) {
  const { 
    threshold = 0.1, 
    root = null, 
    rootMargin = '0px', 
    triggerOnce = false,
    delay = 0
  } = options
  
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<T>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced intersection handler
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set timeout for debouncing if delay is specified
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (entry?.isIntersecting && triggerOnce) {
          setIsIntersecting(true)
        } else {
          setIsIntersecting(entry?.isIntersecting ?? false)
        }
      }, delay)
    } else {
      // Immediate execution if no delay
      if (entry?.isIntersecting && triggerOnce) {
        setIsIntersecting(true)
      } else {
        setIsIntersecting(entry?.isIntersecting ?? false)
      }
    }
  }, [triggerOnce, delay])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Use passive option for better performance
    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      root,
      rootMargin,
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
      // Clear timeout on cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [ref, root, rootMargin, threshold, handleIntersection])

  return { ref, isIntersecting }
}
