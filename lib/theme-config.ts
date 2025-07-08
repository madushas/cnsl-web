/**
 * CNSL Theme Configuration
 * Cloud Native Sri Lanka - Enhanced Theme System
 * 
 * This file extends the base shadcn/ui theme with cloud-native specific
 * design tokens, variants, and component enhancements.
 */

// 🎨 CNSL Brand Colors
export const cnslColors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Base primary
    600: '#2563eb', // CNSL Primary: #0077B6 equivalent
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Secondary Brand Colors  
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd', 
    300: '#7dd3fc',
    400: '#38bdf8', // CNSL Secondary: #00B4D8 equivalent
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Accent Colors
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4', // CNSL Accent: #90E0EF equivalent
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
} as const

// 🛠️ Cloud-Native Technology Colors
export const techColors = {
  kubernetes: '#326ce5',
  docker: '#2496ed', 
  aws: '#ff9900',
  azure: '#0078d4',
  gcp: '#4285f4',
  terraform: '#623ce4',
  ansible: '#ee0000',
  jenkins: '#d33833',
  gitlab: '#fc6d26',
  prometheus: '#e6522c',
  grafana: '#f46800',
  elasticsearch: '#005571',
  redis: '#dc382d',
  postgresql: '#336791',
  mongodb: '#47a248',
  nginx: '#009639',
  apache: '#d22128',
  linux: '#fcc624',
  ubuntu: '#e95420',
  centos: '#262577',
} as const

// 🎨 Design System Tokens
export const designTokens = {
  // Spacing Scale (based on 4px grid)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px', 
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    56: '224px',
    64: '256px',
  },
  
  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '28px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36px'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '1'],
      '6xl': ['60px', '1'],
      '7xl': ['72px', '1'],
      '8xl': ['96px', '1'],
      '9xl': ['128px', '1'],
    },
  },
  
  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '2px',
    default: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },
  
  // Box Shadows
  boxShadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Cloud-Native specific shadows
    glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    'glow-lg': '0 0 40px rgba(59, 130, 246, 0.3)',
    kubernetes: '0 10px 40px rgba(50, 108, 229, 0.15)',
    docker: '0 10px 40px rgba(36, 150, 237, 0.15)',
    cloud: '0 10px 40px rgba(56, 189, 248, 0.15)',
  },
  
  // Animation Durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms', 
      slow: '500ms',
      slower: '750ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

// 🌈 Gradient Presets
export const gradients = {
  // Brand gradients
  primary: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
  secondary: 'linear-gradient(135deg, #00B4D8 0%, #90E0EF 100%)',
  brand: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 50%, #90E0EF 100%)',
  
  // Cloud-Native gradients
  kubernetes: 'linear-gradient(135deg, #326ce5 0%, #0077B6 100%)',
  docker: 'linear-gradient(135deg, #2496ed 0%, #0077B6 100%)',
  cloud: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  devops: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
  
  // Glass morphism
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  'glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
  
  // Status gradients
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
} as const

// 🎭 Component Variants Map
export const componentVariants = {
  button: {
    variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'gradient', 'kubernetes', 'docker', 'cloud', 'devops', 'glass'],
    sizes: ['default', 'sm', 'lg', 'xl', 'icon'],
  },
  
  card: {
    variants: ['default', 'glass', 'gradient', 'cloud', 'kubernetes', 'docker', 'floating', 'terminal'],
    sizes: ['default', 'sm', 'lg'],
  },
  
  badge: {
    variants: ['default', 'secondary', 'destructive', 'outline', 'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'terraform', 'upcoming', 'past', 'featured', 'new', 'glass'],
  },
  
  input: {
    variants: ['default', 'terminal', 'glass', 'cloud', 'kubernetes'],
    sizes: ['default', 'sm', 'lg'],
  },
} as const

// 🎯 Usage Guidelines
export const usageGuidelines = {
  colors: {
    primary: 'Use for main CTAs, navigation active states, and primary brand elements',
    secondary: 'Use for secondary actions, highlights, and complementary elements', 
    accent: 'Use sparingly for special highlights, success states, and accent elements',
  },
  
  gradients: {
    brand: 'Use in hero sections and main brand elements',
    technology: 'Use in technology-specific sections (kubernetes for K8s content, etc.)',
    glass: 'Use for overlay elements and modern UI components',
  },
  
  components: {
    buttons: {
      gradient: 'Use for primary CTAs in hero sections',
      kubernetes: 'Use in Kubernetes-related content and tutorials',
      docker: 'Use in Docker and containerization content',
      glass: 'Use in overlay modals and floating elements',
    },
    
    cards: {
      glass: 'Use for overlay content and modern aesthetic',
      floating: 'Use for interactive cards that need hover effects',
      terminal: 'Use for code examples and technical content',
      cloud: 'Use for cloud-native and infrastructure content',
    },
    
    badges: {
      technology: 'Use technology-specific variants for their respective content',
      status: 'Use upcoming/past for events, featured for highlighted content',
      glass: 'Use in hero sections and overlay content',
    },
  },
} as const

const themeConfig = {
  cnslColors,
  techColors, 
  designTokens,
  gradients,
  componentVariants,
  usageGuidelines,
}

export default themeConfig
