import { Container, Section } from "@/components/ds";
import { Activity, Globe, Terminal } from "lucide-react";
import { StatCard } from "@/components/site/card";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const StatsSection = () => (
  <Section className="border-b border-border/40 relative overflow-hidden bg-muted/20">
    <Container>
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40 bg-background/50 rounded-2xl border border-border/40 backdrop-blur-sm overflow-hidden shadow-sm">
          <StatCard
            label="Sys.Status"
            value="OPERATIONAL"
            sub="Sector 7G"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            label="Active Nodes"
            value="2,401"
            sub="Uplink Established"
            icon={<Globe className="w-5 h-5" />}
          />
          <StatCard
            label="Latency"
            value="24ms"
            sub="Sub-space"
            icon={<Terminal className="w-5 h-5" />}
          />
        </div>
      </ScrollReveal>
    </Container>
  </Section>
);
