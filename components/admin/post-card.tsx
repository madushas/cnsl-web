import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconPencil,
  IconTrash,
  IconCalendar,
  IconUser,
  IconFileText,
} from "@tabler/icons-react";
import Image from "next/image";

type PostCardProps = {
  slug: string;
  title: string;
  date?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string[] | string | null;
  excerpt?: string | null;
  image?: string | null;
  onDelete: () => void;
};

export function PostCard({
  slug,
  title,
  date,
  author,
  category,
  tags,
  excerpt,
  image,
  onDelete,
}: PostCardProps) {
  const tagArray = Array.isArray(tags) ? tags : tags ? [tags] : [];

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden bg-linear-to-br from-primary/10 to-primary/5">
        {image ? (
          <Image
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <IconFileText className="size-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Category Badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary">{category}</Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/admin/posts/${slug}/edit`}>
              <IconPencil className="size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {date && (
            <div className="flex items-center gap-1.5">
              <IconCalendar className="size-4" />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
          )}
          {author && (
            <div className="flex items-center gap-1.5">
              <IconUser className="size-4" />
              <span>{author}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tagArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagArray.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tagArray.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tagArray.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end border-t pt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <IconTrash className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
