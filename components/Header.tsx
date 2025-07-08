/* filepath: c:\Users\Madusha\Documents\proj\cnsl-new\components\Header.tsx */
'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animations'

const navigation = [
	{ name: 'Events', href: '/events' },
	{ name: 'CNSL Connect', href: '/cnsl-connect' },
	{ name: 'University Outreach', href: '/university-outreach' },
	{ name: 'Blog', href: '/blog' },
	{ name: 'About', href: '/about' },
	{ name: 'Contact', href: '/contact' },
]

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const pathname = usePathname()
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	// Scroll detection
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50)
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	// Close menu on route change
	useEffect(() => {
		setIsMenuOpen(false)
	}, [pathname])

	// Handle click outside to close menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isMenuOpen &&
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isMenuOpen])

	// Handle escape key
	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isMenuOpen) {
				setIsMenuOpen(false)
				buttonRef.current?.focus()
			}
		}

		document.addEventListener('keydown', handleEscapeKey)
		return () => document.removeEventListener('keydown', handleEscapeKey)
	}, [isMenuOpen])

	return (
		<>
			<header
				className={`fixed top-0 w-full z-50 transition-all duration-300 ${
					isScrolled
						? 'bg-background shadow-lg border-b border-border'
						: 'bg-background/95 backdrop-blur-sm'
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<FadeIn delay={100}>
							<Link
								href="/"
								className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1"
							>
								<div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
									<span className="text-white font-bold text-sm">CN</span>
								</div>
								<span className="font-bold text-xl text-foreground group-hover:text-primary transition-all duration-300">
									CNSL
								</span>
							</Link>
						</FadeIn>

						{/* Desktop Navigation */}
						<nav
							className="hidden md:flex space-x-8"
							role="navigation"
							aria-label="Main navigation"
						>
							{navigation.map((item, index) => (
								<FadeIn key={item.name} delay={index * 50 + 200}>
									<Link
										href={item.href}
										className={`relative text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1 ${
											pathname === item.href
												? 'text-primary font-semibold'
												: 'text-foreground hover:text-primary'
										}`}
									>
										{item.name}
										{pathname === item.href && (
											<div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
										)}
									</Link>
								</FadeIn>
							))}
						</nav>

						{/* Mobile menu button */}
						<FadeIn delay={600}>
							<Button
								ref={buttonRef}
								variant="ghost"
								size="sm"
								className="md:hidden text-foreground hover:bg-muted hover:text-primary transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2"
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
								aria-expanded={isMenuOpen}
								aria-controls="mobile-menu"
							>
								{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
							</Button>
						</FadeIn>
					</div>
				</div>
			</header>

			{/* Mobile Navigation Overlay */}
			{isMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Solid backdrop */}
					<div
						className="fixed inset-0 bg-background/80"
						aria-hidden="true"
						onClick={() => setIsMenuOpen(false)}
					/>

					{/* Mobile menu */}
					<nav
						ref={menuRef}
						id="mobile-menu"
						className="fixed top-16 left-0 right-0 bg-card border-b border-border shadow-xl"
						aria-label="Mobile navigation"
					>
						<div className="px-4 py-6 space-y-2">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
										pathname === item.href
											? 'text-primary bg-primary/10 font-semibold border-l-4 border-primary'
											: 'text-foreground hover:text-primary hover:bg-muted'
									}`}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}
						</div>
					</nav>
				</div>
			)}
		</>
	)
}
