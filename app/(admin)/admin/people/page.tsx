"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { IconPlus, IconUsers, IconUserStar } from "@tabler/icons-react";
import { withCSRF } from "@/lib/csrf";
import { toast } from "sonner";
import { PersonInput } from "@/lib/validation";
import { PersonCard } from "@/components/admin/person-card";
import { PersonModal } from "@/components/admin/person-modal";
import { EmptyState } from "@/components/admin/empty-state";

export default function AdminPeoplePage() {
  type Person = {
    id?: string;
    name: string;
    role?: string;
    title?: string;
    company?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    photo?: string;
    category: "organizer" | "advisor";
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizers, setOrganizers] = useState<Person[]>([]);
  const [advisors, setAdvisors] = useState<Person[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  function hasId(person: Person): person is Person & { id: string } {
    return typeof person.id === "string" && person.id.length > 0;
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/people", { cache: "no-store" });
      const data = await res.json();
      setOrganizers(data.organizers || []);
      setAdvisors(data.advisors || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load people");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSavePerson(person: Person) {
    const payload = {
      name: person.name,
      role: person.role || undefined,
      title: person.title || undefined,
      company: person.company || undefined,
      linkedin: person.linkedin || undefined,
      twitter: person.twitter || undefined,
      github: person.github || undefined,
      website: person.website || undefined,
      photo: person.photo || undefined,
      category: person.category,
    };

    const validation = PersonInput.safeParse(payload);
    if (!validation.success) {
      const msg =
        "Validation failed: " +
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
      toast.error(msg);
      throw new Error(msg);
    }

    if (person.id) {
      // Update
      const res = await fetch(`/api/people/${person.id}`, {
        method: "PATCH",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Person updated");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Failed to update person");
        throw new Error(data?.error || "Failed to update person");
      }
    } else {
      // Create
      const res = await fetch("/api/people", {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Person added");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Failed to add person");
        throw new Error(data?.error || "Failed to add person");
      }
    }
  }

  async function handleDeletePerson(id: string) {
    const res = await fetch(`/api/people/${id}`, {
      method: "DELETE",
      headers: withCSRF(),
    });
    if (res.ok) {
      toast.success("Person deleted");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error || "Failed to delete person");
    }
  }

  async function handleToggleCategory(person: Person) {
    const newCategory =
      person.category === "organizer" ? "advisor" : "organizer";
    const res = await fetch(`/api/people/${person.id}`, {
      method: "PATCH",
      headers: withCSRF({ "Content-Type": "application/json" }),
      body: JSON.stringify({ category: newCategory }),
    });
    if (res.ok) {
      toast.success(`Moved to ${newCategory}s`);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error || "Failed to update");
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage organizers and advisors
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPerson(null);
            setModalOpen(true);
          }}
        >
          <IconPlus className="size-4" />
          Add Person
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <Tabs defaultValue="organizers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="organizers" className="gap-2">
              <IconUsers className="size-4" />
              Organizers ({organizers.length})
            </TabsTrigger>
            <TabsTrigger value="advisors" className="gap-2">
              <IconUserStar className="size-4" />
              Advisors ({advisors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizers" className="space-y-6">
            {organizers.length === 0 ? (
              <EmptyState
                icon={<IconUsers className="size-20" />}
                title="No organizers yet"
                description="Add your first organizer to get started"
                action={{
                  label: "Add Organizer",
                  onClick: () => {
                    setEditingPerson({ name: "", category: "organizer" });
                    setModalOpen(true);
                  },
                }}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {organizers.filter(hasId).map((person) => (
                  <PersonCard
                    key={person.id}
                    {...person}
                    onEdit={() => {
                      setEditingPerson(person);
                      setModalOpen(true);
                    }}
                    onDelete={() => {
                      setPersonToDelete(person);
                      setDeleteDialogOpen(true);
                    }}
                    onToggleCategory={() => handleToggleCategory(person)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="advisors" className="space-y-6">
            {advisors.length === 0 ? (
              <EmptyState
                icon={<IconUserStar className="size-20" />}
                title="No advisors yet"
                description="Add your first advisor to get started"
                action={{
                  label: "Add Advisor",
                  onClick: () => {
                    setEditingPerson({ name: "", category: "advisor" });
                    setModalOpen(true);
                  },
                }}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {advisors.filter(hasId).map((person) => (
                  <PersonCard
                    key={person.id}
                    {...person}
                    onEdit={() => {
                      setEditingPerson(person);
                      setModalOpen(true);
                    }}
                    onDelete={() => {
                      setPersonToDelete(person);
                      setDeleteDialogOpen(true);
                    }}
                    onToggleCategory={() => handleToggleCategory(person)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Person Modal */}
      <PersonModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        person={editingPerson}
        onSave={handleSavePerson}
        title={editingPerson?.id ? "Edit Person" : "Add Person"}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete person?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &quot;
              {personToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (personToDelete?.id) {
                  handleDeletePerson(personToDelete.id);
                  setDeleteDialogOpen(false);
                  setPersonToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
