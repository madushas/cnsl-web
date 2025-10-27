"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type PersonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
  onSave: (person: Person) => Promise<void>;
  title?: string;
};

export function PersonModal({
  open,
  onOpenChange,
  person,
  onSave,
  title = "Add Person",
}: PersonModalProps) {
  const [form, setForm] = useState<Person>({
    name: "",
    category: "organizer",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (person) {
      setForm(person);
    } else {
      setForm({ name: "", category: "organizer" });
    }
  }, [person, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {person
              ? "Update person information"
              : "Add a new person to your team"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as "organizer" | "advisor" })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.role || ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Community Lead"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Engineer"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company || ""}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Acme Inc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              value={form.photo || ""}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-medium">Social Links</h4>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={form.linkedin || ""}
                  onChange={(e) =>
                    setForm({ ...form, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input
                  id="twitter"
                  value={form.twitter || ""}
                  onChange={(e) =>
                    setForm({ ...form, twitter: e.target.value })
                  }
                  placeholder="https://x.com/username"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={form.github || ""}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={form.website || ""}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name || saving}>
            {saving ? "Saving..." : person ? "Update" : "Add Person"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
