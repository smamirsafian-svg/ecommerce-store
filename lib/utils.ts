type ClassValue =
  | string
  | number
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | undefined | null };

/**
 * Merges class names into a single string, filtering out falsy values.
 * Compatible with shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.filter(Boolean).join(" ");
}
