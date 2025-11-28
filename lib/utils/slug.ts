/**
 * Slug generation utility
 * Converts text (including Persian/Arabic) to URL-safe slugs
 */

/**
 * Generate a URL-safe slug from a text string
 * Handles Persian, Arabic, and English characters
 * 
 * @param text - The text to convert to slug
 * @returns URL-safe slug string
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Convert to lowercase
  let slug = text.toLowerCase().trim();

  // Replace Persian/Arabic numbers with English numbers
  slug = slug
    .replace(/[۰-۹]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 1584));

  // Remove or replace special characters
  // Keep Persian/Arabic letters, English letters, numbers, spaces, and hyphens
  slug = slug.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\s-]/g, '');

  // Replace multiple spaces with single space
  slug = slug.replace(/\s+/g, ' ');

  // Replace spaces with hyphens
  slug = slug.replace(/\s/g, '-');

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

