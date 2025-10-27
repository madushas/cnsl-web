"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Speaker = { name: string; title?: string; topic?: string };

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className="absolute left-0 top-0 h-full w-1 cursor-grab rounded-l bg-border"
        {...attributes}
        {...listeners}
      />
      {children}
    </div>
  );
}

export function SpeakersInput({
  value,
  onChange,
  topics,
}: {
  value: Speaker[];
  onChange: (v: Speaker[]) => void;
  topics: string[];
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  function add() {
    onChange([...(value || []), { name: "" }]);
  }

  function removeAt(idx: number) {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  }

  function update(idx: number, patch: Partial<Speaker>) {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(String(active.id).split(":")[1]);
    const newIndex = Number(String(over.id).split(":")[1]);
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div className="rounded-md border border-border bg-white/5 p-2">
      <div className="mb-2 text-sm font-medium text-foreground">Speakers</div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={(value || []).map((_, i) => `sp:${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-3">
            {(value || []).map((sp, idx) => (
              <SortableItem id={`sp:${idx}`} key={`sp:${idx}`}>
                <div className="rounded-md border border-border bg-background p-3 grid gap-2">
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input
                      value={sp.name}
                      onChange={(e) => update(idx, { name: e.target.value })}
                      placeholder="Name"
                    />
                    <Input
                      value={sp.title || ""}
                      onChange={(e) => update(idx, { title: e.target.value })}
                      placeholder="Title"
                    />
                    <Select
                      value={
                        sp.topic && topics.includes(sp.topic)
                          ? sp.topic
                          : (undefined as any)
                      }
                      onValueChange={(v) => update(idx, { topic: v })}
                      disabled={!topics?.length}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue
                          placeholder={
                            topics?.length
                              ? "Assign session"
                              : "Add sessions first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {topics?.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAt(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-2">
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add Speaker
        </Button>
      </div>
    </div>
  );
}
