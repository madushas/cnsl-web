"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCopy,
  IconStar,
  IconStarFilled,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react";
import TicketTemplateDesigner from "@/components/admin/ticket-template-designer";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admin/empty-state";
import { IconTicket } from "@tabler/icons-react";
import type { TicketTemplate } from "@/lib/ticket-generator";
import Image from "next/image";

export default function TicketTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [designerOpen, setDesignerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TicketTemplate | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<TicketTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ticket-templates", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        throw new Error(data.error || "Failed to load templates");
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(template: TicketTemplate) {
    try {
      const res = await fetch(`/api/admin/ticket-templates/${template.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Template deleted",
          description: `"${template.name}" has been deleted successfully`,
        });
        loadTemplates();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete template");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    }
  }

  async function handleDuplicate(template: TicketTemplate) {
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      isDefault: false,
    };

    try {
      const res = await fetch("/api/admin/ticket-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      if (res.ok) {
        toast({
          title: "Template duplicated",
          description: `Created "${newTemplate.name}"`,
        });
        loadTemplates();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to duplicate template");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to duplicate template",
        variant: "destructive",
      });
    }
  }

  async function handleSetDefault(template: TicketTemplate) {
    try {
      const res = await fetch(`/api/admin/ticket-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        toast({
          title: "Default template set",
          description: `"${template.name}" is now the default template`,
        });
        loadTemplates();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to set default");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to set default",
        variant: "destructive",
      });
    }
  }

  function handleEdit(template: TicketTemplate) {
    setEditingTemplate(template);
    setDesignerOpen(true);
  }

  function handleCreate() {
    setEditingTemplate(null);
    setDesignerOpen(true);
  }

  function handleDesignerClose() {
    setDesignerOpen(false);
    setEditingTemplate(null);
    // Refresh templates after designer closes
    loadTemplates();
  }

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ticket Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design and manage ticket templates for event generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadTemplates}>
            <IconRefresh className="size-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <IconPlus className="size-4" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && !searchQuery && (
        <EmptyState
          icon={<IconTicket className="size-20" />}
          title="No templates yet"
          description="Create your first ticket template to get started"
          action={{
            label: "Create Template",
            onClick: handleCreate,
          }}
        />
      )}

      {/* No Search Results */}
      {!loading && filteredTemplates.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No templates found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && filteredTemplates.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group relative overflow-hidden transition-all hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{template.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {template.isDefault && (
                        <Badge variant="default" className="gap-1">
                          <IconStarFilled className="size-3" />
                          Default
                        </Badge>
                      )}
                      {template.eventId && (
                        <Badge variant="outline">Event-Specific</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Preview */}
                <div className="aspect-9/16 sm:aspect-video relative rounded-lg overflow-hidden bg-linear-to-br from-primary/10 to-primary/5 border">
                  {template.backgroundImage ? (
                    <Image
                      src={template.backgroundImage}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IconTicket className="size-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(template)}
                    >
                      <IconPencil className="size-4" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!template.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSetDefault(template)}
                    >
                      <IconStar className="size-4" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(template)}
                  >
                    <IconCopy className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTemplateToDelete(template);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Designer Dialog */}
      <Dialog
        open={designerOpen}
        onOpenChange={(open: boolean) => {
          if (!open) handleDesignerClose();
        }}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Design your ticket template with custom background, QR code, and
              text overlays
            </DialogDescription>
          </DialogHeader>
          <TicketTemplateDesigner
            initialTemplate={editingTemplate || undefined}
            onSaveAction={async (template) => {
              // Save is handled by the designer itself
              // Add a small delay to let user see the success message
              setTimeout(() => {
                handleDesignerClose();
              }, 2000); // 2 second delay to show success toast
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template &quot;{templateToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (templateToDelete) {
                  handleDelete(templateToDelete);
                  setDeleteDialogOpen(false);
                  setTemplateToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
