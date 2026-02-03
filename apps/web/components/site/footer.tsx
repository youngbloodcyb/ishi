import { Container, Section } from "@/components/ds";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-primary/20 relative overflow-hidden">
      <Section>
        <Container className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-primary/20">
          <div className="flex flex-col gap-3 col-span-1 md:col-span-1 p-6 md:p-8">
            <Link href="/" className="relative h-6 w-24 block">
               <Image
                 src="/logo_light-mode.svg"
                 alt="Logo"
                 fill
                 className="object-contain dark:hidden"
               />
               <Image
                 src="/logo_dark-mode.svg"
                 alt="Logo"
                 fill
                 className="object-contain hidden dark:block"
               />
            </Link>
            <p className="text-sm text-muted-foreground leading-snug max-w-[20ch]">
              A modern SaaS starter template for your next project.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 md:p-8">
            <h4 className="font-mono text-xs uppercase tracking-wider text-primary/70">Product</h4>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Pricing</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 p-6 md:p-8">
            <h4 className="font-mono text-xs uppercase tracking-wider text-primary/70">Company</h4>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/#blog" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Contact</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 p-6 md:p-8">
            <h4 className="font-mono text-xs uppercase tracking-wider text-primary/70">Legal</h4>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Terms</Link></li>
            </ul>
          </div>
        </Container>
      </Section>

      <div className="border-t border-primary/10">
        <Container className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-6 md:px-12 text-xs text-muted-foreground/60 font-mono">
          <p>&copy; {new Date().getFullYear()} Your Company</p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">TWITTER / X</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">GITHUB</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">LINKEDIN</a>
          </div>
        </Container>
      </div>
    </footer>
  );
};
