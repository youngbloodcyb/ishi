"use client";

import { Container, Section } from "@/components/ds";
import { useState } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const DemoSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // Replace with your demo video ID

  return (
    <Section className="border-b border-border/40 py-16">
      <Container className="p-0">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-xl bg-card">
            <button
              type="button"
              className="block relative w-full aspect-video bg-black/5 overflow-hidden cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring m-0 p-0"
              onClick={() => setIsVideoOpen(true)}
              aria-label="Open demo video"
            >
              <Image
                src="/demo-pic.png"
                alt="Demo Video"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium uppercase tracking-wider">
                  Watch Demo
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center pl-1 shadow-lg">
                    <svg
                      className="w-6 h-6 text-black"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </ScrollReveal>
        {isVideoOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsVideoOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Demo video"
          >
            <div
              className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md border border-white/10 transition-colors"
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close demo video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};
