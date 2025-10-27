"use client";

import Link from "next/link";
import { Search, Menu, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@stackframe/stack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationLinks = [
  { href: "/about", label: "About" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useUser();

  const meSyncedRef = useRef(false);
  useEffect(() => {
    // Lazily sync user record only when a user exists and only once per session
    if (!user || meSyncedRef.current) return;
    meSyncedRef.current = true;
    try {
      if (
        typeof window !== "undefined" &&
        sessionStorage.getItem("meSynced") === "1"
      )
        return;
      fetch("/api/me", { cache: "no-store" }).catch(() => {});
      if (typeof window !== "undefined")
        sessionStorage.setItem("meSynced", "1");
    } catch {}
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 md:gap-3 shrink-0"
        >
          <div className="relative">
            <svg
              className="h-7 w-7 md:h-8 md:w-8 text-blue-500 transition-colors group-hover:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl md:text-2xl font-bold text-primary transition-colors group-hover:text-primary/80">
            CNSL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`relative text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all hover:text-primary hover:after:w-full ${
                pathname === link.href
                  ? "text-primary after:w-full"
                  : "text-foreground/90 after:w-0"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Search */}
          <div
            role="search"
            aria-label="Site search"
            className="relative hidden xl:block"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              aria-label="Search"
              className="w-48 xl:w-64 h-10 pl-10 text-sm"
            />
          </div>

          {/* Search Icon for Mobile/Tablet */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden text-white/90 hover:text-blue-400 hover:bg-surface-subtle"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Account/CTAs - Show login OR user menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden sm:flex items-center gap-2 h-10 hover:bg-surface-subtle"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user.profileImageUrl || undefined}
                      alt={user.displayName || "User"}
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {(user.displayName ||
                        user.primaryEmail ||
                        "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white/90">
                    {user.displayName || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.primaryEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/account">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => user.signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex text-white/90 hover:text-blue-400 hover:bg-surface-subtle transition-all h-10 text-sm"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 h-10 text-sm"
              >
                <Link href="/signup">Register</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/90 hover:text-blue-400 hover:bg-surface-subtle"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-background border-border"
            >
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle className="flex items-center gap-3">
                  <svg
                    className="h-8 w-8 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-xl font-bold text-blue-500">CNSL</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 py-6 max-h-[60vh] overflow-y-auto">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`rounded-lg px-4 py-3 text-base font-medium transition-all hover:bg-surface-subtle ${
                      pathname === link.href
                        ? "text-blue-400"
                        : "text-white/90 hover:text-blue-400"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-border pt-6 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-surface-subtle rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.profileImageUrl || undefined}
                          alt={user.displayName || "User"}
                        />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {(user.displayName ||
                            user.primaryEmail ||
                            "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {user.primaryEmail}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-surface-subtle"
                    >
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Account
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-surface-subtle"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      onClick={() => {
                        user.signOut();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-surface-subtle"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-surface-subtle"
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-surface-subtle"
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
