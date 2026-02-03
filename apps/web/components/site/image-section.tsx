import { Container, Section } from "@/components/ds";
import Image from "next/image";
import { ScrollReveal } from "@/components/site/scroll-reveal";

interface ImageSectionProps {
  src: string;
  alt: string;
}

export const ImageSection = ({ src, alt }: ImageSectionProps) => (
  <Section className="border-b border-border/40 py-16 bg-muted/20">
    <Container>
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-xl bg-card">
          <div className="relative w-full aspect-video overflow-hidden rounded-xl">
            <Image src={src} alt={alt} fill className="object-cover" />
          </div>
        </div>
      </ScrollReveal>
    </Container>
  </Section>
);
