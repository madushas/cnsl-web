import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DatabaseEvent } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPastEvent(event: DatabaseEvent): boolean {
  const eventDate = new Date(event.eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}
