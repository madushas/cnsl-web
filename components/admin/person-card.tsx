import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandGithub,
  IconWorld,
  IconPencil,
  IconTrash,
  IconArrowsExchange,
} from "@tabler/icons-react";
type PersonCardProps = {
  id: string;
  name: string;
  role?: string | null;
  title?: string | null;
  company?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
  photo?: string | null;
  category: "organizer" | "advisor";
  onEdit: () => void;
  onDelete: () => void;
  onToggleCategory: () => void;
};

export function PersonCard({
  id,
  name,
  role,
  title,
  company,
  linkedin,
  twitter,
  github,
  website,
  photo,
  category,
  onEdit,
  onDelete,
  onToggleCategory,
}: PersonCardProps) {
  const initials = (id || name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasLinks = linkedin || twitter || github || website;
  const subtitle = [role, title, company].filter(Boolean).join(" • ");

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <div className="p-5 space-y-4">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4">
          <Avatar className="size-16 shrink-0 ring-2 ring-border">
            <AvatarImage src={photo || undefined} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate">
              {name}
            </h3>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        {hasLinks && (
          <div className="flex items-center gap-2">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary hover:bg-primary/5"
              >
                <IconBrandLinkedin className="size-4" />
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary hover:bg-primary/5"
              >
                <IconBrandTwitter className="size-4" />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary hover:bg-primary/5"
              >
                <IconBrandGithub className="size-4" />
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:border-primary hover:bg-primary/5"
              >
                <IconWorld className="size-4" />
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            <IconPencil className="size-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleCategory}
            className="flex-1"
          >
            <IconArrowsExchange className="size-4" />
            {category === "organizer" ? "Make Advisor" : "Make Organizer"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
