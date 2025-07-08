'use client'

import Image, { StaticImageData } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { imageConfig, placeholderImages, ImageKey } from '@/lib/image-config'

interface EnhancedImageProps {
  src: string | StaticImageData
  fallback?: ImageKey
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  overlay?: boolean
  overlayOpacity?: number
}

export function EnhancedImage({
  src,
  fallback = 'cloudNative',
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  overlay = false,
  overlayOpacity = 0.3,
  ...props
}: EnhancedImageProps) {
  const [imageSrc, setImageSrc] = useState(src || placeholderImages[fallback])
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setImageSrc(placeholderImages[fallback])
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes || imageConfig.sizes.card}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-all duration-500",
          isLoading && "blur-sm scale-105",
          !isLoading && "blur-0 scale-100"
        )}
        {...props}
      />
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}