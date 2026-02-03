import { Prose, Section, Container, Box } from "@/components/ds";
import { PageMeta, formatDate } from "@/lib/mdx";
import { Button } from "@/components/ui/button";
import { CopyArticleButton } from "./copy-article-button";
import { ShareButton } from "./share-button";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface MetaProps extends PageMeta {
  className?: string;
  slug?: string;
}

export function Meta({ title, description, date, author, tags, slug }: MetaProps) {
  const hasMeta = date || author || (tags && tags.length > 0);

  return (
    <Section className="border-b border-primary/20">
      <Container>
        <Box className="py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <div className="flex gap-2">
              <CopyArticleButton />
              <ShareButton title={title} slug={slug} />
            </div>
          </div>

          <Prose isSpaced>
            <h1 className="!mb-4">{title}</h1>
            {description && <p className="text-muted-foreground text-lg">{description}</p>}
            {hasMeta && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono pt-4 border-t border-primary/10">
                {date && <time dateTime={date}>{formatDate(date)}</time>}
                {author && <span>{author}</span>}
                {tags && tags.length > 0 && (
                  <div className="flex gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="text-xs uppercase tracking-wider text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Prose>
        </Box>
      </Container>
    </Section>
  );
}
