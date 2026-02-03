import { Metadata } from "next";
import { Main } from "@/components/ds";
import { ContactSection } from "@/components/site/contact-section";

export const metadata: Metadata = {
  title: "Contact | Request Beta Access",
  description:
    "Get in touch with the OUTR team. Request beta access or ask questions about our GTM outreach automation platform.",
};

export default function ContactPage() {
  return (
    <Main className="bg-background min-h-screen selection:bg-primary/20 selection:text-primary">
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] mix-blend-overlay opacity-20" />
      <ContactSection />
    </Main>
  );
}
