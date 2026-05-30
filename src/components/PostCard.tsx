import * as React from "react";
import type { CollectionEntry } from "astro:content";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  post: CollectionEntry<"post">;
  /** Pass the resolved image src string (use Astro's getImage or pass src.src) */
  heroSrc?: string;
  heroAlt?: string;
}

export default function PostCard({ post, heroSrc, heroAlt }: Props) {
  const category = post.id.split("/")[0];

  const pubDate = new Date(post.data.pubDate);
  const formattedDate = pubDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <a
      href={`/${post.id}/`}
      className="group no-underline block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <Card className="h-full gap-0 py-0 overflow-hidden border-border transition-all duration-200 group-hover:border-muted-foreground/50 group-hover:shadow-xl">
        {/* Hero image */}
        <div className="w-full aspect-[16/9] overflow-hidden border-b border-border/50">
          {heroSrc ? (
            <img
              src={heroSrc}
              alt={heroAlt ?? ""}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
              <span className="text-muted-foreground/20 font-bold text-2xl uppercase tracking-tighter select-none">
                {category}
              </span>
            </div>
          )}
        </div>

        <CardHeader className="pt-4 pb-2">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-muted-foreground mb-1">
            <time dateTime={pubDate.toISOString()}>{formattedDate}</time>
            <Badge variant="secondary" className="capitalize">
              {category}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
            {post.data.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-0">
          <CardDescription className="line-clamp-2 leading-relaxed text-sm">
            {post.data.description}
          </CardDescription>
        </CardContent>

        <CardFooter className="pt-4 pb-4 mt-auto">
          <span className="text-xs font-semibold text-primary group-hover:underline underline-offset-4">
            Read review →
          </span>
        </CardFooter>
      </Card>
    </a>
  );
}
