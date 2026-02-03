"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Nav } from "@/components/ds";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { List, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "/features", anchor: "#features" },
  { label: "Pricing", href: "/pricing", anchor: "#pricing" },
  { label: "Blog", href: "/blog", anchor: "#blog" },
  { label: "Contact", href: "/contact", anchor: "#contact" },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Handle hash navigation on page load
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [isHomePage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string, href: string) => {
    // Contact always goes to /contact page
    if (href === "/contact") {
      return; // Let default link behavior handle it
    }

    if (isHomePage) {
      e.preventDefault();
      const element = document.querySelector(anchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsMobileMenuOpen(false);
        // Update URL without reload
        window.history.pushState(null, "", anchor);
      }
    } else {
      // If not on homepage, navigate to homepage with hash
      e.preventDefault();
      router.push(anchor);
    }
  };

  return (
    <Nav className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-transform duration-300",
      isScrolled ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <Logo className="flex-shrink-0" width={90} height={24} />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href === "/contact" ? "/contact" : (isHomePage ? link.anchor : link.anchor)}
              onClick={(e) => handleNavClick(e, link.anchor, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <span className="text-muted-foreground/40">|</span>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Button size="sm" asChild className="rounded-full px-5 h-9 font-semibold shadow-sm hover:shadow-md transition-all">
            <Link href="#contact" onClick={(e) => handleNavClick(e, "#contact", "/contact")}>Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" weight="bold" />
          ) : (
            <List className="w-5 h-5" weight="bold" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-4 px-2 space-y-4 border-t border-border/40 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href === "/contact" ? "/contact" : (isHomePage ? link.anchor : link.anchor)}
                onClick={(e) => {
                  handleNavClick(e, link.anchor, link.href);
                  setIsMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              Login
            </Link>
            <Button size="sm" asChild className="w-full rounded-full font-semibold">
              <Link href="#contact" onClick={(e) => handleNavClick(e, "#contact", "/contact")}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </Nav>
  );
};
