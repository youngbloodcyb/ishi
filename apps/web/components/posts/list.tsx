import { Container, Section } from "@/components/ds";
import { Item } from "@/components/posts/item";
import { FileText } from "lucide-react";

import type { Post } from "#site/content";

export const List = ({ posts }: { posts: Post[] }) => {
  return (
    <Section>
      <Container className="border-x border-b border-dashed bg-background">
        <div className="flex items-center gap-2 px-6 py-3 bg-muted/20">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground">System Logs / Recent Updates</h2>
        </div>
        {posts.length > 0
          ? (
            <div className="divide-y divide-dashed">
              {posts.map((post) => (
                <Item
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  date={post.date}
                  excerpt={post.description}
                  tags={post.tags}
                />
              ))}
            </div>
          )
          : <NoPosts />}
      </Container>
    </Section>
  );
};

const NoPosts = () => {
  return (
    <div className="p-12 text-center text-muted-foreground font-mono text-sm">
      <p>
        [NULL] No content found. Initialize posts in{" "}
        <code className="bg-muted px-1.5 py-0.5 text-foreground">
          content/
        </code>
      </p>
    </div>
  );
};
