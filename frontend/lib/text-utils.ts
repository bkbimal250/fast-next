/**
 * Utility functions for text formatting
 */

/**
 * Capitalizes the first letter of each word in a string
 * Example: "spa therapist" -> "Spa Therapist"
 * Example: "MASSAGE THERAPIST" -> "Massage Therapist"
 */
export function capitalizeTitle(title: string | null | undefined): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle empty strings
      if (!word) return word;
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Capitalizes the first letter of a string (sentence case)
 * Example: "spa therapist" -> "Spa therapist"
 */
export function capitalizeFirst(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
