import Link from "next/link";
import { formatDate } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PostItemProps {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  className?: string;
  tags?: string[];
}

const PostDate = ({ date }: { date: string }) => {
  return (
    <time dateTime={date} className="text-xs font-medium text-muted-foreground tabular-nums">
      {formatDate(date)}
    </time>
  );
};

const PostTags = ({ tags }: { tags: string[] }) => {
  if (!tags.length) return null;

  return (
    <div className="flex gap-2">
      {tags.map((tag) => (
        <span key={tag} className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40 transition-colors">
          #{tag}
        </span>
      ))}
    </div>
  );
};

export const Item = ({
  slug,
  title,
  date,
  excerpt,
  className,
  tags,
}: PostItemProps) => {
  return (
    <Link
      href={`/${slug}`}
      className={cn(
        "group relative flex flex-col md:flex-row md:items-center justify-between p-6 gap-3 bg-background border border-transparent hover:border-border/40 hover:bg-muted/30 hover:shadow-sm rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
         <div className="flex items-center gap-3">
             <h3 className="font-semibold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                {title}
             </h3>
             {tags && <div className="hidden md:block"><PostTags tags={tags} /></div>}
         </div>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-1 font-normal max-w-prose">
            {excerpt}
          </p>
        )}
        {tags && <div className="md:hidden mt-2"><PostTags tags={tags} /></div>}
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <PostDate date={date} />
        <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200" />
      </div>
    </Link>
  );
};
