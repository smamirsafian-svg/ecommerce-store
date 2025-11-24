import { type ClassValue } from "clsx"

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ")
}
