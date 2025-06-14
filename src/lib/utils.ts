/**
 * Utility functions for the Tasty Cooking website
 */

/**
 * Debounce function to limit how often a function can be called
 * Type-safe implementation that preserves parameter types
 */
export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait = 250
): (...args: T) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: T): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Convert slug to title case
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Safely convert various date formats to ISO string
 */
export function formatDateValue(dateValue: string | Date | unknown): string {
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  if (typeof dateValue === 'string') {
    return dateValue;
  }
  if (dateValue && typeof dateValue === 'object') {
    // Try to convert the object to a Date
    const date = new Date(String(dateValue));
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  // Return empty string for invalid values
  return String(dateValue || '');
}

/**
 * Check if running on client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Extract tags from a slug
 */
export function getTagsFromSlug(slug: string): string[] {
  // Map common ingredients/terms to tags
  const tagMap: Record<string, string[]> = {
    'pancakes': ['breakfast'],
    'smoothie': ['breakfast', 'healthy'],
    'hash': ['breakfast'],
    'chicken': ['meat'],
    'wings': ['meat'],
    'salmon': ['seafood'],
    'beans': ['vegetarian'],
    'soup': ['healthy'],
    'salad': ['healthy', 'vegetable'],
    'tofu': ['vegetarian'],
    'vegan': ['vegan'],
    'kimchi': ['spicy'],
    'cauliflower': ['vegetable', 'healthy'],
    'broccolini': ['vegetable', 'healthy'],
    'brussels': ['vegetable']
  };
  
  // Extract potential tags from slug
  let tags: string[] = [];
  Object.entries(tagMap).forEach(([key, value]) => {
    if (slug.includes(key)) {
      tags = [...tags, ...value];
    }
  });
  
  // Remove duplicates
  return Array.from(new Set(tags));
}