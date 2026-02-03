import Link from "next/link";
import { Box, Container, Section } from "@/components/ds";
import { Dithering } from "@paper-design/shaders-react";
import { ArrowRight, CheckCircle2, Cpu, Terminal } from "lucide-react";
import { SWDecor } from "@/components/sw-ui";
import { cn } from "@/lib/utils";
import Image from "next/image";
import LogoLight from "@/public/logo_light-mode.svg";
import LogoDark from "@/public/logo_dark-mode.svg";

const GridPattern = () => {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(circle at center, black, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(circle at center, black, transparent 80%)",
      }}
    />
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20 w-fit animate-[pulseSubtle_2s_ease-in-out_2] motion-reduce:animate-none">
    <span className="relative flex h-1.5 w-1.5">
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
    </span>
    {children}
  </span>
);

const HeroFooter = () => (
  <div className="mt-16 pt-6 border-t border-dashed border-border/40 w-full flex items-center gap-8 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-3 h-3 text-primary" />
      <span>SYSTEM_ACTIVE</span>
    </div>
    <div className="flex items-center gap-2">
      <Cpu className="w-3 h-3 text-primary" />
      <span>UPTIME: 99.9%</span>
    </div>
    <div className="hidden sm:flex ml-auto opacity-50">
      ID: SYS-001
    </div>
  </div>
);

const HeroActions = () => (
  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
    <Link
      href="/contact"
      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 text-sm font-mono font-bold uppercase tracking-widest transition-all duration-300 ease-[var(--ease-weighted)] bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-lg border border-transparent shadow-sm press-effect"
    >
      Get Started
      <ArrowRight className="w-4 h-4" />
    </Link>

    <Link
      href="/docs"
      className="group inline-flex items-center justify-center gap-3 px-8 py-3 text-sm font-mono font-medium uppercase tracking-wider transition-all duration-300 ease-[var(--ease-weighted)] bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 hover:border-border rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background press-effect"
    >
      <Terminal className="w-4 h-4 group-hover:text-primary transition-colors duration-200" />
      <span>Documentation</span>
    </Link>
  </div>
);

const HeroContent = () => (
  <Box className="flex flex-col justify-center bg-background relative group h-full">
    <GridPattern />
    <SWDecor className="absolute top-8 right-8" />

    <div className="relative z-10 flex flex-col items-start gap-6 h-full justify-center">
      <div className="animate-enter animate-enter-stagger-1">
        <Badge>STARTER // V1.0.0</Badge>
      </div>

      <h1 className="sr-only">App</h1>
      <div className="pt-8 md:pt-12 animate-enter animate-enter-stagger-2">
        <Image
          priority
          width={200}
          height={60}
          src={LogoLight}
          alt="App Logo"
          className="block dark:hidden"
        />
        <Image
          priority
          width={200}
          height={60}
          src={LogoDark}
          alt="App Logo"
          className="hidden dark:block"
        />
      </div>

      <p className="text-lg text-muted-foreground font-mono leading-snug max-w-[48ch] py-1 animate-enter animate-enter-stagger-3">
        A modern SaaS starter template built with Next.js, TypeScript, and
        Tailwind CSS. Ship your product faster with authentication,
        database, and UI components ready to go.
      </p>

      <div className="animate-enter animate-enter-stagger-4 w-full sm:w-auto">
        <HeroActions />
      </div>

      <div className="animate-enter animate-enter-stagger-5 w-full">
        <HeroFooter />
      </div>
    </div>
  </Box>
);

const HeroVisual = () => (
  <div className="h-[300px] lg:h-auto overflow-hidden relative bg-black border-l border-primary/20">
    <div className="absolute top-4 right-4 z-10 font-mono text-[9px] text-primary/70 border border-primary/30 px-2 py-1 bg-black/50 backdrop-blur-md flex flex-col gap-1 items-end">
      <span>SHADER_CTX: WEBGL2</span>
      <span>RENDER_SCALE: 1.5</span>
    </div>

    <div className="absolute bottom-8 left-8 z-10 font-mono text-[9px] text-primary/70 flex flex-col gap-0.5">
      <span>X: 22.091</span>
      <span>Y: -04.112</span>
      <span>Z: 00.000</span>
    </div>

    <Dithering
      className="h-full w-full opacity-80 mix-blend-screen"
      colorFront="#ed4b9b"
      colorBack="#000000"
      size={3}
      scale={1.5}
      speed={0.1}
      rotation={0}
      offsetX={0.5}
      offsetY={0.5}
    />

    <div
      className="absolute inset-0 pointer-events-none z-10 opacity-30"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        transform: "perspective(500px) rotateX(10deg) scale(1.5)",
        transformOrigin: "bottom center",
      }}
    />

    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
      <div className="w-[200px] h-[200px] border border-primary/50 rounded-full flex items-center justify-center relative">
        <div className="w-full h-px bg-primary/50 absolute" />
        <div className="h-full w-px bg-primary/50 absolute" />
        <div className="w-[180px] h-[180px] border border-dashed border-primary/30 rounded-full animate-[spin_10s_linear_infinite] motion-reduce:animate-none" />
      </div>
    </div>
  </div>
);

export const Hero = () => {
  return (
    <Section className="border-b border-border/40 relative">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/20" />

      <Container className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border/40 min-h-[500px] bg-background">
        <HeroContent />
        <HeroVisual />
      </Container>
    </Section>
  );
};
