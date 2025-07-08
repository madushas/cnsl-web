# 🚀 CNSL Website - Cloud Native Sri Lanka

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

The official website for **Cloud Native Sri Lanka (CNSL)** - Sri Lanka's premier community for Cloud Native & DevOps professionals.

## ✨ Features

- 🎨 **Modern Design**: Clean, accessible, and mobile-first design using Tailwind CSS v4
- ⚡ **Performance Optimized**: Built with Next.js 15 for optimal performance and SEO
- 🔧 **TypeScript**: Fully typed for better developer experience and code quality
- ♿ **Accessibility**: WCAG 2.1 AA compliant with proper semantic HTML and ARIA labels
- 📱 **Responsive**: Optimized for all device sizes and screen readers
- 🎭 **Animations**: Smooth, performance-optimized animations with respect for reduced motion preferences
- 🛡️ **Brand Compliance**: Follows CNSL brand guidelines and design system

## 🏗️ Architecture

### Project Structure
```
cnsl-new/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind utilities
│   ├── layout.tsx         # Root layout with SEO configuration
│   └── page.tsx           # Homepage component composition
├── components/            # React components
│   ├── About.tsx          # Community overview section
│   ├── Blog.tsx           # Blog and articles section
│   ├── BlogCard.tsx       # Individual blog post card
│   ├── Contact.tsx        # Contact form and community info
│   ├── Events.tsx         # Events and meetups section
│   ├── FeaturedPost.tsx   # Featured blog post component
│   ├── Footer.tsx         # Site footer with links
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Landing hero section
│   ├── Mentorship.tsx     # CNSL Connect program info
│   └── UniversityOutreach.tsx # University programs
├── hooks/                 # Custom React hooks
│   ├── useAboutAnimations.ts    # About section animations
│   ├── useAnimations.ts         # General animation utilities
│   ├── useBlogAnimations.ts     # Blog section animations
│   ├── useContactAnimations.ts  # Contact form animations
│   ├── useFormValidation.ts     # Form validation logic
│   └── useIntersectionObserver.ts # Intersection observer hook
├── lib/                   # Utility libraries and configuration
│   ├── about-content.ts   # About section content
│   ├── blog-content.ts    # Blog posts and content
│   ├── constants.ts       # App-wide constants and configuration
│   ├── contact-content.ts # Contact section content
│   ├── theme.ts           # Theme configuration
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
└── public/               # Static assets
    └── favicon.ico       # Site favicon
```

### Key Technologies

- **Framework**: Next.js 15.3.5 with App Router
- **Styling**: Tailwind CSS v4 with custom utilities
- **Language**: TypeScript 5.0 with strict mode
- **Icons**: Lucide React for consistent iconography
- **Performance**: Optimized with intersection observers and lazy loading

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cloudnativesl/website.git
   cd website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the website.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # Run TypeScript compiler check
```

## 🎨 Design System

### Brand Colors
- **Primary**: `#1E40AF` - Brand strength, trust, professionalism
- **Accent**: `#3B82F6` - Interactive elements, CTAs
- **Midnight**: `#0F172A` - Backgrounds, dark mode foundation
- **Steel**: `#475569` - Secondary text
- **Background**: `#FFFFFF` - Primary background

### Typography
- **Font**: Inter (Google Fonts) for clean, modern readability
- **Hierarchy**: Consistent sizing scale from 12px to 72px
- **Accessibility**: High contrast ratios and readable line heights

### Components
- **Cards**: Consistent shadows, rounded corners, hover states
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Accessible with proper validation and error states
- **Animations**: Respectful of user preferences with reduced motion support

## 🔧 Development Guidelines

### Code Quality
- **ESLint**: Strict configuration with accessibility rules
- **TypeScript**: Strict mode with proper typing
- **Prettier**: Consistent code formatting
- **Semantic HTML**: Proper use of landmarks and ARIA labels

### Performance
- **Bundle Size**: Optimized component imports and tree shaking
- **Images**: Next.js Image component for lazy loading and optimization
- **Animations**: CSS-based animations with hardware acceleration
- **Intersection Observers**: Efficient scroll-based animations

### Accessibility
- **WCAG 2.1 AA**: Compliant color contrast and keyboard navigation
- **Screen Readers**: Proper semantic structure and alt text
- **Focus Management**: Visible focus indicators and logical tab order
- **Motion**: Respects user's reduced motion preferences

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Community

- **Website**: [https://cnsl.lk](https://cnsl.lk)
- **Twitter**: [@cloudnativesl](https://twitter.com/cloudnativesl)
- **LinkedIn**: [Cloud Native Sri Lanka](https://www.linkedin.com/company/90470053/)
- **Meetup**: [Cloud Native Sri Lanka](https://www.meetup.com/cloud-native-sri-lanka/)

---

**Built with ❤️ by the CNSL Community**
