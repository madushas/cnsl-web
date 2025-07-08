import { ReactNode } from 'react'
import { FadeIn, SlideIn } from '@/components/ui/animations'
import { cn } from '@/lib/utils'

interface SectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  backgroundVariant?: 'default' | 'muted' | 'gradient'
  titleSize?: 'default' | 'large'
  animate?: boolean
}

export default function Section({ 
  id, 
  title, 
  description, 
  children,
  className = '',
  backgroundVariant = 'default',
  titleSize = 'default',
  animate = true
}: SectionProps) {
  const sectionClasses = cn(
    'py-16 overflow-hidden',
    {
      'bg-background': backgroundVariant === 'default',
      'bg-muted': backgroundVariant === 'muted', 
      'bg-gradient-to-b from-background to-muted': backgroundVariant === 'gradient',
    },
    className
  )

  const titleClasses = cn(
    'font-bold text-foreground mb-6 tracking-tight',
    {
      'text-4xl': titleSize === 'default',
      'text-5xl md:text-6xl': titleSize === 'large',
    }
  )

  const SectionWrapper = animate ? FadeIn : 'div'
  const TitleWrapper = animate ? SlideIn : 'div'

  return (
    <SectionWrapper>
      <section 
        id={id} 
        className={sectionClasses}
        aria-labelledby={`${id}-title`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TitleWrapper delay={100}>
            <header className="text-center mb-16">
              <h2 id={`${id}-title`} className={titleClasses}>
                {title}
              </h2>
              {description && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {description}
                </p>
              )}
            </header>
          </TitleWrapper>
          {children}
        </div>
      </section>
    </SectionWrapper>
  )
}
