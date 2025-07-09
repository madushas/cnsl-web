import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { BlogPost } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BlogCardProps {
  readonly post: BlogPost;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "announcements":
      return "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400";
    case "tutorials":
      return "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400";
    case "event recaps":
      return "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400";
    case "member stories":
      return "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400";
    default:
      return "bg-secondary/20 text-secondary-foreground border-secondary/30";
  }
};

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Card
      className="group flex flex-col h-full overflow-hidden bg-card hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 pt-0"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      <CardHeader className="p-0">
        <Link
          href={`/blog/${post.slug}`}
          className="relative block h-48 w-full"
          aria-label={`Read article: ${post.title}`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={post.image}
              alt={`${post.title} cover`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs rounded-full px-2 py-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/80" />
              {post.readTime}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-5 flex flex-col gap-4 flex-grow">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn("font-medium", getCategoryColor(post.category))}
          >
            {post.category}
          </Badge>
        </div>

        <CardTitle className="text-xl font-bold line-clamp-2 text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>

        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </CardDescription>

        <div className="flex flex-wrap gap-2">
          {post.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/70 text-foreground"
            >
              #{tag}
            </Badge>
          ))}
          {post.tags?.length > 2 && (
            <Badge
              variant="secondary"
              className="bg-secondary/30 text-muted-foreground"
            >
              +{post.tags.length - 2} more
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between group text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors duration-300"
          asChild
        >
          <Link
            href={`/blog/${post.slug}`}
            aria-label={`Read full article: ${post.title}`}
          >
            <span>Read Article</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

///export const FeaturedBlogCard = ({ post }: BlogCardProps) => {
export function FeaturedBlogCard({ post }: BlogCardProps) {
  return (
    <Card
      className="group flex flex-col h-full w-full overflow-hidden bg-card hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 pt-0"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      <CardHeader className="p-0">
        <Link
          href={`/blog/${post.slug}`}
          className="relative block h-72 w-full"
          aria-label={`Read article: ${post.title}`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={post.image}
              alt={`${post.title} cover`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <Badge className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white shadow-lg border-none z-10">
              Featured
            </Badge>
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs rounded-full px-2 py-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/80" />
              {post.readTime}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-5 flex flex-col gap-4 flex-grow">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn("font-medium", getCategoryColor(post.category))}
          >
            {post.category}
          </Badge>
        </div>

        <CardTitle className="text-xl font-bold line-clamp-2 text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>

        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </CardDescription>

        <div className="flex flex-wrap gap-2">
          {post.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/70 text-foreground"
            >
              #{tag}
            </Badge>
          ))}
          {post.tags?.length > 2 && (
            <Badge
              variant="secondary"
              className="bg-secondary/30 text-muted-foreground"
            >
              +{post.tags.length - 2} more
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span itemProp="author" className="font-medium">
              {post.author}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date} itemProp="datePublished">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>

        {/* Read More Button */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-300"
          asChild
        >
          <Link
            href={`/blog/${post.slug}`}
            aria-label={`Read full article: ${post.title}`}
          >
            <span>Read Article</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
