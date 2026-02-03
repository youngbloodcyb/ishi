import { Box, Container, Section } from "@/components/ds";
import { Item } from "@/components/posts/item";
import { SectionHeader } from "@/components/site/section-header";
import type { Post } from "#site/content";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const PostsSection = ({ posts }: { posts: Post[] }) => (
  <Section id="blog" className="border-b border-border/40">
    <Container>
      <Box className="py-24">
        <ScrollReveal>
          <SectionHeader label="System Logs" title="Recent Updates" />
        </ScrollReveal>
        {posts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {posts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={index * 100}>
                <Item
                  slug={post.slug}
                  title={post.title}
                  date={post.date}
                  excerpt={post.description}
                  tags={post.tags}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <div className="p-12 text-center text-muted-foreground text-sm border border-border/40 rounded-xl bg-muted/20">
              <p>No posts found.</p>
            </div>
          </ScrollReveal>
        )}
      </Box>
    </Container>
  </Section>
);
