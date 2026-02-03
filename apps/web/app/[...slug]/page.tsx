import { Main, Section, Container, Box, Prose } from "@/components/ds";
import { MDXContent } from "@/components/markdown/mdx-content";
import { Meta } from "@/components/markdown/meta";

import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";

import type { Metadata } from "next";
import type { Post } from ".velite";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post: Post) => ({
    slug: post.slug.split("/"),
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug.join("/");
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const slug = params.slug.join("/");
  const post = getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <Main className="bg-background">
      <Meta
        title={post.title}
        description={post.description}
        date={post.date}
        author={post.author}
        tags={post.tags}
        slug={post.slug}
      />
      <Section>
        <Container>
          <Box className="py-12 sm:py-16 lg:py-20">
            <Prose isArticle isSpaced>
              <MDXContent code={post.body} />
            </Prose>
          </Box>
        </Container>
      </Section>
    </Main>
  );
}
